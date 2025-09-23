// src/components/Undervalued/UndervaluedOpportunities.jsx
// Shows the top 2 “undervalued” stocks for a sector using MetricCard.

import React, { useEffect, useMemo, useState } from 'react';
import './UndervaluedOpportunities.css';
import { uoUtils } from '../../utils/uoUtilsAdapter';
import MetricCard from '../Metric Card/Metric Card';
import { runSectorValuationFromCache } from '../../services/cacheAnalysis';

// local formatters (MetricCard also formats its items)
// const money = (n) =>
//   Number.isFinite(n)
//     ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
//     : '—';
// const ratio = (n) => (Number.isFinite(n) ? n.toFixed(2) : '—');
// const pctSmart = (n) => {
//   if (!Number.isFinite(n)) return '—';
//   return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
// };

// Composite score for “undervalued” (lower is better). Tune weights as you like.
function computeUndervaluationScore(m) {
  if (!m) return Number.POSITIVE_INFINITY;
  const safe = (v, def = NaN) => (Number.isFinite(v) ? v : def);

  // Adapter normalizes ROE/CFM/Growth to FRACTIONS (0.12 = 12%)
  const pe = safe(m.peRatio, 50); // lower better
  const pb = safe(m.pbRatio, 5);
  const ps = safe(m.psRatio, 10);
  const de = safe(m.deRatio, 2);
  const roe = safe(m.roe, 0); // higher better (fraction)
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
}

export default function UndervaluedOpportunities({
  sectorKey,
  liveData = null,
  loading: parentLoading = false,
  error: parentError = '',
  utils = uoUtils,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [dataSource, setDataSource] = useState('');

  const formatMetrics = (stock, source = 'fallback') => {
    if (source === 'valuation') {
      const v = stock.valuation || {};
      return [
        { label: 'Fair Value', value: v.blendedFairPrice, type: 'money' },
        { label: 'Upside', value: v.upsidePct, type: 'pct_already', colorize: true },
        { label: 'MoS', value: v.marginOfSafety, type: 'pct_already', colorize: true },
        { label: 'P/E', value: stock.peRatio },
        { label: 'P/B', value: stock.priceToBook },
        { label: 'P/S', value: stock.priceToSales },
        { label: 'ROE', value: stock.roe, type: 'pct' },
        { label: 'FCF M', value: stock.freeCashFlowMargin, type: 'pct' },
        { label: 'D/E', value: stock.debtToEquity },
        { label: 'RevG', value: stock.revenueGrowth, type: 'pct' },
        { label: 'NIG', value: stock.netIncomeGrowth, type: 'pct' },
      ];
    }

    if (source === 'live') {
      return [
        { label: 'P/E Ratio', value: stock.pe_ratio },
        { label: 'P/B Ratio', value: stock.pb_ratio },
        { label: 'P/S Ratio', value: stock.ps_ratio },
        { label: 'ROE', value: stock.roe, type: 'pct' },
        { label: 'FCF M', value: stock.free_cash_flow_margin, type: 'pct' },
        { label: 'D/E', value: stock.de_ratio },
        { label: 'RevG', value: stock.rev_growth, type: 'pct' },
        { label: 'NIG', value: stock.net_income_growth, type: 'pct' },
        { label: 'Change', value: 0, type: 'pct', colorize: true },
      ];
    }

    // fallback
    const m = stock.metrics || stock;
    return [
      { label: 'P/E Ratio', value: m.peRatio },
      { label: 'P/B Ratio', value: m.pbRatio },
      { label: 'P/S Ratio', value: m.psRatio },
      { label: 'ROE', value: m.roe, type: 'pct' },
      { label: 'CashFlowM', value: m.cashFlowMargin, type: 'pct' },
      { label: 'D/E', value: m.deRatio },
      { label: 'RevenueG', value: m.revenueGrowth, type: 'pct' },
      { label: 'NIG', value: m.netIncomeGrowth, type: 'pct' },
      { label: 'Change', value: m.change, type: 'pct', colorize: true },
    ];
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        setDataSource('');

        if (parentError) {
          setError(parentError);
          setLoading(false);
          return;
        }

        if (parentLoading) {
          setLoading(true);
          return;
        }

        // Try data sources in priority order

        // Priority 1: Valuation analysis (cached Perplexity results)
        try {
          const valuation = await runSectorValuationFromCache(sectorKey);
          if (valuation?.results && Array.isArray(valuation.results) && valuation.results.length > 0) {
            const mapped = valuation.results.map((r) => {
              const name = utils.getStockName(r.symbol);
              let liveStock = null;
              if (liveData?.stocks) {
                liveStock = liveData.stocks.find(s => s.symbol === r.symbol);
              }

              const mergedStock = {
                ...r,
                peRatio: liveStock?.pe_ratio ?? r.peRatio,
                priceToBook: liveStock?.pb_ratio ?? r.priceToBook,
                priceToSales: liveStock?.ps_ratio ?? r.priceToSales,
                roe: liveStock?.roe ?? r.roe,
                freeCashFlowMargin: liveStock?.free_cash_flow_margin ?? r.freeCashFlowMargin,
                debtToEquity: liveStock?.de_ratio ?? r.debtToEquity,
                revenueGrowth: liveStock?.rev_growth ?? r.revenueGrowth,
                netIncomeGrowth: liveStock?.net_income_growth ?? r.netIncomeGrowth,
              };

              return {
                ticker: r.symbol,
                name,
                price: liveStock?.price ?? r.price,
                metrics: formatMetrics(mergedStock, 'valuation'),
              };
            });

            if (!cancelled) {
              setCandidates(mapped);
              setDataSource('valuation');
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Valuation analysis not available:', e?.message || e);
        }

        // Priority 2: Live data only
        if (liveData?.stocks && Array.isArray(liveData.stocks)) {
          try {
            const enriched = liveData.stocks.map((stock) => {
              const name = stock.name || utils.getStockName(stock.symbol) || stock.symbol;
              const metricObj = {
                peRatio: stock.pe_ratio,
                pbRatio: stock.pb_ratio,
                psRatio: stock.ps_ratio,
                roe: stock.roe,
                cashFlowMargin: stock.free_cash_flow_margin,
                deRatio: stock.de_ratio,
                revenueGrowth: stock.rev_growth,
                netIncomeGrowth: stock.net_income_growth,
                price: stock.price,
                change: 0,
              };

              return {
                ticker: stock.symbol,
                name,
                metrics: formatMetrics(stock, 'live'),
                price: stock.price,
                _score: computeUndervaluationScore(metricObj),
              };
            });

            const sorted = enriched.sort((a, b) => a._score - b._score);
            if (!cancelled) {
              setCandidates(sorted.slice(0, 2));
              setDataSource('live');
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to process live data:', e);
          }
        }

        // Priority 3: Fallback to adapter
        const tickers = await Promise.resolve(utils.getStocksBySector(sectorKey));
        const enriched = await Promise.all(
          tickers.map(async (t) => {
            const metrics = await Promise.resolve(utils.getStockMetrics(t));
            const name = utils.getStockName(t);
            return { ticker: t, name, metrics };
          })
        );

        const scored = enriched
          .map((s) => ({
            ...s,
            metrics: formatMetrics(s, 'fallback'),
            _score: computeUndervaluationScore(s.metrics),
          }))
          .sort((a, b) => a._score - b._score);

        if (!cancelled) {
          setCandidates(scored.slice(0, 2));
          setDataSource('fallback');
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load opportunities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sectorKey, liveData, parentLoading, parentError, utils]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="uval-skeleton">
          <div className="uval-skel-card" />
          <div className="uval-skel-card" />
        </div>
      );
    }

    if (error) return <p className="uval-error">{error}</p>;

    if (!candidates.length) {
      return (
        <p className="uval-empty">
          No candidates found for this sector.
        </p>
      );
    }

    return (
      <div className="uval-cards">
        {candidates.map((stock) => (
          <MetricCard
            key={stock.ticker}
            ticker={stock.ticker}
            name={stock.name}
            price={stock.price}
            metrics={stock.metrics}
            ctaDisabled={true}
            ctaLabel="Generate AI Report"
          />
        ))}
      </div>
    );
  }, [loading, error, candidates]);

  return (
    <section
      className="uval-section"
      aria-label="Undervalued Opportunities"
    >
      {content}
    </section>
  );
}
