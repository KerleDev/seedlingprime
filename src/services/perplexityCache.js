// Simple localStorage-based cache for Perplexity sector data
// Keys are namespaced as ppxl:sector:<sectorKey>
// Each entry: { data: any, savedAt: number }

const NS = 'ppxl:sector:';
const DEFAULT_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

function keyFor(sectorKey) {
  return `${NS}${sectorKey}`;
}

export function saveSectorData(sectorKey, data) {
  try {
    const payload = { data, savedAt: Date.now() };
    localStorage.setItem(keyFor(sectorKey), JSON.stringify(payload));
  } catch (e) {
    console.warn('perplexityCache.saveSectorData failed:', e);
  }
}

export function loadSectorData(
  sectorKey,
  { ttlMs = DEFAULT_TTL_MS } = {}
) {
  try {
    const raw = localStorage.getItem(keyFor(sectorKey));
    if (!raw) return null;
    const { data, savedAt } = JSON.parse(raw);
    if (typeof savedAt === 'number' && Date.now() - savedAt > ttlMs) {
      // expired
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.warn('perplexityCache.loadSectorData failed:', e);
    return null;
  }
}

export function clearSectorData(sectorKey) {
  try {
    localStorage.removeItem(keyFor(sectorKey));
  } catch {}
}

export function listCachedSectors() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(NS)) out.push(k.slice(NS.length));
  }
  return out;
}
