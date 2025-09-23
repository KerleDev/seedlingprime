import React from "react";
import "./Metric Card.css"


const money = (n) => (Number.isFinite(n) ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—");
const ratio = (n) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const pctSmart = (n) => {
if (!Number.isFinite(n)) return "—";
return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
};

const pctAlready = (n) => {
if (!Number.isFinite(n)) return "—";
return `${n.toFixed(1)}%`;
};
const toPctNumber = (n) => (Number.isFinite(n) ? (n <= 1 ? n * 100 : n) : 0);


function MetricItem({ label, value, type = "ratio", colorize = false }) {
const raw = Number.isFinite(value) ? value : NaN;
// For pct_already, the value is already in percentage format, so use it directly for color logic
const colorValue = type === "pct_already" ? raw : toPctNumber(raw);
const sign = colorize && Number.isFinite(colorValue) ? (colorValue > 0 ? "pos" : colorValue < 0 ? "neg" : "flat") : "";
const text = type === "money" ? money(value) :
             type === "pct" ? pctSmart(value) :
             type === "pct_already" ? pctAlready(value) :
             ratio(value);
return (
<div className={`mc-metric ${sign}`}>
<span className="mc-metric-label">{label}</span>
<span className="mc-metric-value">{text}</span>
</div>
);
}


export default function MetricCard({
ticker,
name,
price,
metrics = [], // array of { label, value, type?: 'ratio'|'pct'|'money', colorize?: boolean }
ctaLabel = "Generate AI Report",
onCta,
ctaDisabled = true,
}) {
return (
<article className="mc-card" aria-label={`${name || ticker} metric card`}>
<header className="mc-head">
<div className="mc-left">
<div className="mc-ticker">{ticker}</div>
{name && <div className="mc-subname">{name}</div>}
</div>
<div className="mc-right">
<div className="mc-price-label">Price</div>
<div className="mc-price-val">{money(price)}</div>
</div>
</header>


<div className="mc-grid">
{metrics.map((m, i) => (
<MetricItem key={`${m.label}-${i}`} {...m} />
))}
</div>


<button className="mc-cta" type="button" onClick={onCta} disabled={ctaDisabled}>
{ctaLabel}
</button>
</article>
);
}