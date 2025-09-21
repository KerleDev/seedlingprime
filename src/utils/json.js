// Shared JSON utilities

/**
 * Extract a JSON object from plain text or fenced code blocks.
 * Supports Markdown ```json ... ``` fences and attempts to salvage by
 * trimming non-JSON prefixes/suffixes.
 * @param {string} text
 * @returns {object|null}
 */
export function extractJSON(text) {
  if (!text || typeof text !== 'string') return null;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1] : text;
  try {
    return JSON.parse(candidate);
  } catch {
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      try {
        return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
      } catch (err) {
        console.error('extractJSON: failed to parse trimmed JSON:', err);
      }
    }
    return null;
  }
}
