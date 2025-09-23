import { sendToPerplexity } from '../api/perplexity';
import ppxlPrompt from '../prompts/perplexityPrompt.js';
import { extractJSON } from '../utils/json';

/**
 * Call Perplexity with the sector prompt and return both the raw text and parsed JSON (if any).
 * @param {string} sectorKeyOrQuery
 * @returns {Promise<{ text: string, json: any | null, raw: any }>}
 */
export async function askPerplexity(sectorKeyOrQuery) {
  const data = await sendToPerplexity(ppxlPrompt(sectorKeyOrQuery), {
    system: 'You are a financial analyst.',
    temperature: 0.1,
    return_citations: true,
    search_recency_filter: 'month',
  });
  const text = data?.choices?.[0]?.message?.content ?? '';
  const json = extractJSON(text);
  return { text, json, raw: data };
}
