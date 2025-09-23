// Presents all stocks in the selected sector in a compact, readable table.
// Columns: SYMBOL, Company, Price, Market Cap, P/E, P/B, ROE, CashFlowM, D/E,
//          RevenueG, NetIncome, NIG, Change
//
// Includes:
// - Click-to-sort headers (safe null handling; strings vs numbers)
// - Highlights top-2 undervalued rows with .emph (style in CSS)

import React, { useEffect, useMemo, useState } from 'react';
import './SectorBreakdownTable.css';
import { uoUtils } from '../../utils/uoUtilsAdapter';
import sectorDataNew from '../../constants/sectorDataNew';

const money = (n) =>
  Number.isFinite(n)
    ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : 'N/A';

const pctSmart = (n) => {
  if (!Number.isFinite(n)) return '—';
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
};

const fmtChangeClass = (n) =>
  Number.isFinite(n) ? (n > 0 ? 'pos' : n < 0 ? 'neg' : 'flat') : '';

const abbrCap = (v) => {
  if (!Number.isFinite(v)) return 'N/A';
  const abs = Math.abs(v);
  if (abs >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
};

const fmtNum = (n, d = 2) =>
  Number.isFinite(n) ? Number(n).toFixed(d) : '—';

// --- Undervaluation score (lower = better)
const computeUndervaluationScore = (m) => {
  if (!m) return Number.POSITIVE_INFINITY;
  const safe = (v, d = NaN) => (Number.isFinite(v) ? v : d);

  const pe = safe(m.peRatio, 50); // lower better
  const pb = safe(m.pbRatio, 5);
  const ps = safe(m.psRatio, 10);
  const de = safe(m.deRatio, 2);

  const roe = safe(m.roe, 0); // higher better
  const cfm = safe(m.cashFlowMargin, 0);
  const rev = safe(m.revenueGrowth, 0);
  const nig = safe(m.netIncomeGrowth, 0);

  const wPE = 0.3,
    wPB = 0.18,
    wPS = 0.14,
    wDE = 0.08,
    wROE = 0.14,
    wCFM = 0.06,
    wRev = 0.05,
    wNI = 0.05;

  const cap = (x, c) => (Number.isFinite(x) ? Math.min(x, c) : 0);

  return (
    wPE * pe +
    wPB * pb +
    wPS * ps +
    wDE * de +
    wROE * (1 - cap(roe, 0.4)) +
    wCFM * (1 - cap(cfm, 0.3)) +
    wRev * (1 - cap(rev, 0.25)) +
    wNI * (1 - cap(nig, 0.25))
  );
};

export default function SectorBreakdownTable({
  sectorKey,
  liveData = null,
  loading: parentLoading = false,
  error: parentError = '',
  utils = uoUtils,
}) {
  const [rows, setRows] = useState([]);
  const [top2Set, setTop2Set] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // sortConfig: which field + direction
  const [sortConfig, setSortConfig] = useState({
    key: 'price',
    direction: 'asc',
  });

  useEffect(() => {
    setSortConfig({ key: 'price', direction: 'asc' });
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError('');

        // If parent has an error, use it
        if (parentError) {
          setError(parentError);
          setLoading(false);
          return;
        }

        // If parent is still loading, wait
        if (parentLoading) {
          setLoading(true);
          return;
        }

        // Priority 1: Use live data directly if available
        if (
          liveData &&
          typeof liveData === 'object' &&
          liveData.stocks
        ) {
          try {
            const liveStocks = Array.isArray(liveData.stocks)
              ? liveData.stocks
              : [];
            const enriched = liveStocks.map((stock) => {
              const metrics = {
                peRatio: stock.pe_ratio,
                pbRatio: stock.pb_ratio,
                psRatio: stock.ps_ratio,
                roe: stock.roe,
                cashFlowMargin: stock.free_cash_flow_margin,
                deRatio: stock.de_ratio,
                revenueGrowth: stock.rev_growth,
                netIncomeGrowth: stock.net_income_growth,
              };

              return {
                symbol: stock.symbol,
                company: stock.name || stock.symbol,
                price: stock.price,
                marketCap: stock.market_cap,
                pe: stock.pe_ratio,
                pb: stock.pb_ratio,
                roe: stock.roe,
                cfm: stock.free_cash_flow_margin,
                de: stock.de_ratio,
                revG: stock.rev_growth,
                netIncome: stock.net_income,
                nig: stock.net_income_growth,
                change: 0, // Default, as this isn't in live data
                _score: computeUndervaluationScore(metrics),
                _isLive: true, // Flag to indicate live data
              };
            });

            // pick top-2 by score
            const top2 = [...enriched]
              .sort((a, b) => a._score - b._score)
              .slice(0, 2)
              .map((r) => r.symbol);

            if (!cancelled) {
              setRows(enriched);
              setTop2Set(new Set(top2));
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to process live data:', e);
          }
        }

        // Priority 2: Fallback to static data
        const tickers = await Promise.resolve(
          utils.getStocksBySector(sectorKey)
        );

        const enriched = await Promise.all(
          tickers.map(async (t) => {
            const m = await Promise.resolve(utils.getStockMetrics(t));
            const name = utils.getStockName(t);
            const raw =
              sectorDataNew?.sectors?.[sectorKey]?.stocks?.[t] || {};

            // Prefer raw.market_cap; else use market_cap_billions * 1e9 if present
            const marketCap =
              raw?.market_cap ??
              (Number.isFinite(raw?.market_cap_billions)
                ? raw.market_cap_billions * 1e9
                : null);

            return {
              symbol: t,
              company: name || t,
              price: m?.price ?? null,
              marketCap,
              pe: m?.peRatio ?? null,
              pb: m?.pbRatio ?? null,
              roe: m?.roe ?? null,
              cfm: m?.cashFlowMargin ?? null,
              de: m?.deRatio ?? null,
              revG: m?.revenueGrowth ?? null,
              netIncome: raw?.net_income ?? null,
              nig: m?.netIncomeGrowth ?? null,
              change: m?.change ?? null,
              _score: computeUndervaluationScore(m),
              _isLive: false,
            };
          })
        );

        // pick top-2 by score
        const top2 = [...enriched]
          .sort((a, b) => a._score - b._score)
          .slice(0, 2)
          .map((r) => r.symbol);

        if (!cancelled) {
          setRows(enriched);
          setTop2Set(new Set(top2));
        }
      } catch (e) {
        if (!cancelled)
          setError(e?.message || 'Failed to load sector table');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sectorKey, liveData, parentLoading, parentError, utils]);

  // robust sorter (keeps nulls at end; works for strings & numbers)
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows;

    const sorted = [...rows].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Null/undefined always to the end (independent of direction here)
      const aNull = valA == null;
      const bNull = valB == null;
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;

      // Strings vs numbers
      const aStr = typeof valA === 'string';
      const bStr = typeof valB === 'string';
      if (aStr || bStr) {
        return String(valA).localeCompare(String(valB));
      }

      // Numeric compare (cast to Number to avoid NaN pitfalls)
      const nA = Number(valA);
      const nB = Number(valB);
      if (Number.isNaN(nA) && Number.isNaN(nB)) return 0;
      if (Number.isNaN(nA)) return 1;
      if (Number.isNaN(nB)) return -1;
      return nA - nB;
    });

    if (sortConfig.direction === 'desc') sorted.reverse();
    return sorted;
  }, [rows, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const body = useMemo(() => {
    if (loading) {
      return (
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr
              key={i}
              className="sbt-skel-row"
            >
              {Array.from({ length: 13 }).map((__, j) => (
                <td key={j}>
                  <div className="sbt-skel" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }
    if (error) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={13}
              className="sbt-error"
            >
              {error}
            </td>
          </tr>
        </tbody>
      );
    }
    if (!rows.length) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={13}
              className="sbt-empty"
            >
              No stocks found for this sector.
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {sortedRows.map((r) => (
          <tr
            key={r.symbol}
            className={top2Set.has(r.symbol) ? 'emph' : ''}
          >
            <td className="sym">{r.symbol}</td>
            <td className="company">{r.company}</td>
            <td className="num">{money(r.price)}</td>
            <td className="num">{abbrCap(r.marketCap)}</td>
            <td className="num">{fmtNum(r.pe, 1)}</td>
            <td className="num">{fmtNum(r.pb, 2)}</td>
            <td className="num">{pctSmart(r.roe)}</td>
            <td className="num">{pctSmart(r.cfm)}</td>
            <td className="num">{fmtNum(r.de, 2)}</td>
            <td className="num">{pctSmart(r.revG)}</td>
            <td className="num">{abbrCap(r.netIncome)}</td>
            <td className="num">{pctSmart(r.nig)}</td>
            <td className={`num ${fmtChangeClass(r.change)}`}>
              {pctSmart(r.change)}
            </td>
          </tr>
        ))}
      </tbody>
    );
  }, [sortedRows, loading, error, top2Set]);

  const arrowFor = (key) =>
    sortConfig.key === key
      ? sortConfig.direction === 'asc'
        ? ' ▲'
        : ' ▼'
      : '';

  // Check if we're using live data
  const usingLiveData = rows.length > 0 && rows[0]._isLive;

  return (
    <div className="sbt-wrap">
      {usingLiveData && (
        <div
          style={{
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #10b981',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#047857',
            fontWeight: '500',
          }}
        >
          ●LIVE DATA: Showing real-time financial metrics from
          Perplexity API
        </div>
      )}
      <table className="sbt-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('symbol')}>
              SYMBOL{arrowFor('symbol')}
            </th>
            <th onClick={() => handleSort('company')}>
              COMPANY{arrowFor('company')}
            </th>
            <th onClick={() => handleSort('price')}>
              PRICE{arrowFor('price')}
            </th>
            <th onClick={() => handleSort('marketCap')}>
              MARKET CAP{arrowFor('marketCap')}
            </th>
            <th onClick={() => handleSort('pe')}>
              P/E RATIO{arrowFor('pe')}
            </th>
            <th onClick={() => handleSort('pb')}>
              P/B RATIO{arrowFor('pb')}
            </th>
            <th onClick={() => handleSort('roe')}>
              ROE{arrowFor('roe')}
            </th>
            <th onClick={() => handleSort('cfm')}>
              CashFlowM{arrowFor('cfm')}
            </th>
            <th onClick={() => handleSort('de')}>
              D/E{arrowFor('de')}
            </th>
            <th onClick={() => handleSort('revG')}>
              RevenueG{arrowFor('revG')}
            </th>
            <th onClick={() => handleSort('netIncome')}>
              NetIncome{arrowFor('netIncome')}
            </th>
            <th onClick={() => handleSort('nig')}>
              NIG{arrowFor('nig')}
            </th>
            <th onClick={() => handleSort('change')}>
              CHANGE{arrowFor('change')}
            </th>
          </tr>
        </thead>
        {body}
      </table>
    </div>
  );
}
