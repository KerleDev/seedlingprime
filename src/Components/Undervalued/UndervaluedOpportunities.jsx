// src/components/Undervalued/UndervaluedOpportunities.jsx
// Shows the top 2 “undervalued” stocks for a sector using MetricCard.

import React, { useEffect, useMemo, useState } from "react";
import "./UndervaluedOpportunities.css";
import { uoUtils } from "../../utils/uoUtilsAdapter";
import MetricCard from "../Metric Card/Metric Card"

// local formatters (MetricCard also formats its items)
const money = (n) =>
  Number.isFinite(n) ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—";
const ratio = (n) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const pctSmart = (n) => {
  if (!Number.isFinite(n)) return "—";
  return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
};

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

  const wPE = 0.30, wPB = 0.18, wPS = 0.14, wDE = 0.08, wROE = 0.14, wCFM = 0.06, wRev = 0.05, wNI = 0.05;
  const cap = (x, c) => (Number.isFinite(x) ? Math.min(x, c) : 0);

  return (
    wPE * pe +
    wPB * pb +
    wPS * ps +
    wDE * de +
    wROE * (1 - cap(roe, 0.40)) +
    wCFM * (1 - cap(cfm, 0.30)) +
    wRev * (1 - cap(rev, 0.25)) +
    wNI  * (1 - cap(nig, 0.25))
  );
}

export default function UndervaluedOpportunities({ sectorKey, utils = uoUtils }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // 1) get tickers for the sector
        const tickers = await Promise.resolve(utils.getStocksBySector(sectorKey));

        // 2) enrich with names + metrics
        const enriched = await Promise.all(
          tickers.map(async (t) => {
            const metrics = await Promise.resolve(utils.getStockMetrics(t));
            const name = utils.getStockName(t);
            return { ticker: t, name, metrics };
          })
        );

        // 3) score and take best 2
        const scored = enriched
          .map((s) => ({ ...s, _score: computeUndervaluationScore(s.metrics) }))
          .sort((a, b) => a._score - b._score);

        if (!cancelled) setCandidates(scored.slice(0, 2));
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load opportunities");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sectorKey, utils]);

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
    if (!candidates.length) return <p className="uval-empty">No candidates found for this sector.</p>;

    return (
      <div className="uval-cards">
        {candidates.map((s) => {
          const m = s.metrics;
          const metrics = [
            { label: "P/E Ratio", value: m.peRatio },
            { label: "P/B Ratio", value: m.pbRatio },
            { label: "P/S Ratio", value: m.psRatio },
            { label: "ROE",       value: m.roe, type: "pct" },
            { label: "CashFlowM", value: m.cashFlowMargin, type: "pct" },
            { label: "D/E",       value: m.deRatio },
            { label: "RevenueG",  value: m.revenueGrowth, type: "pct" },
            { label: "NIG",       value: m.netIncomeGrowth, type: "pct" },
            { label: "Change",    value: m.change, type: "pct", colorize: true },
          ];

          return (
            <MetricCard
              key={s.ticker}
              ticker={s.ticker}
              name={s.name}
              price={m.price}
              metrics={metrics}
              ctaDisabled={true}
              ctaLabel="Generate AI Report"
            />
          );
        })}
      </div>
    );
  }, [loading, error, candidates]);

  return (
    <section className="uval-section" aria-labelledby="uval-title">
      <div className="uval-header">
        <h2 id="uval-title" className="uval-section-title">Undervalued Opportunities</h2>
        <span className="uval-section-sub">Top 2 in sector · {sectorKey}</span>
      </div>
      {content}
    </section>
  );
}
