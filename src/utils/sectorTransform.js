// /src/utils/sectorTransform.js
function parsePriceLike(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const m = v.match(/^\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*$/);
    if (m) {
      const a = parseFloat(m[1]);
      const b = parseFloat(m[2]);
      return (a + b) / 2;
    }
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

export function shapeSectorsFromReport(report) {
  const byKey = report?.sectors || {};
  const sectors = {};
  const displayNames = {};
  const etf = {};

  for (const key of Object.keys(byKey)) {
    const node = byKey[key];
    if (!node || !node.stocks) continue; // skip non-sector buckets

    // pretty display name
    displayNames[key] =
      node.sector_name?.replace(/ Sector$/, "") ||
      key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    etf[key] = node.sector_etf ?? null;

    const rows = Object.entries(node.stocks).map(([symbol, s]) => ({
      symbol,
      name: s?.name ?? symbol,
      currentPrice: parsePriceLike(s?.price ?? s?.price_range ?? null),
      pe: s?.pe_ratio ?? null,
      pb: s?.pb_ratio ?? null,
    }));

    sectors[key] = rows.filter((r) => typeof r.currentPrice === "number");
  }

  return { sectors, displayNames, etf };
}
