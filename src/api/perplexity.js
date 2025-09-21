import axios from 'axios';

const URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Send a prompt to Perplexity's chat completions API using axios.
 * @param {string} prompt - The user prompt/content.
 * @param {Object} [options]
 * @param {string} [options.model='sonar-pro'] - Model to use.
 * @param {string} [options.system] - Optional system message.
 * @param {number} [options.temperature] - Optional temperature.
 * @param {number} [options.top_p] - Optional top_p.
 * @param {boolean} [options.return_citations] - If true, return source citations.
 * @param {string} [options.search_recency_filter] - e.g., 'month', 'week', 'day'.
 * @returns {Promise<any>} Response data from Perplexity.
 */
export async function sendToPerplexity(
  prompt,
  { model = 'sonar-pro', system, temperature, top_p, return_citations, search_recency_filter } = {}
) {
  const headers = {
    Authorization:
      'Bearer ' + import.meta.env.VITE_PERPLEXITY_API_KEY,
    'Content-Type': 'application/json',
  };

  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model,
    messages,
    ...(temperature != null ? { temperature } : {}),
    ...(top_p != null ? { top_p } : {}),
    ...(return_citations != null ? { return_citations } : {}),
    ...(search_recency_filter ? { search_recency_filter } : {}),
  };

  const response = await axios.post(URL, payload, { headers });
  return response.data;
}
