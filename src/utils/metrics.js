export function mean(arr) {
  if (!arr?.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function sectorMetrics(stocks = []) {
  const prices = stocks.map((s) => Number(s.currentPrice ?? 0));
  const pes = stocks.map((s) => Number(s.pe ?? 0)).filter((v) => v > 0);
  const pbs = stocks.map((s) => Number(s.pb ?? 0)).filter((v) => v > 0);

  return {
    sectorMean: Math.round(mean(prices)) || 0,
    sectorPE: pes.length ? Number(mean(pes).toFixed(1)) : 0,
    sectorPB: pbs.length ? Number(mean(pbs).toFixed(1)) : 0,
  };
}
