import { sendToGemini } from '../api/gemini';
import { askPerplexity } from './perplexityService';
import geminiPrompt from '../prompts/geminiPrompt';

/**
 * Generate a Gemini markdown report grounded on Perplexity JSON.
 * Falls back to Perplexity raw text if JSON parsing fails.
 * @param {string} sectorInput
 * @returns {Promise<string>} markdown report
 */
export async function generateGeminiReportFromSector(sectorInput) {
  const { text: ppxlText, json: sectorJson } =
    await askPerplexity(sectorInput);

  const reportPrompt = geminiPrompt({ sectorJson, ppxlText });

  const response = await sendToGemini(reportPrompt);
  const md =
    response?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      ?.join('') || '';
  return md;
}

/**
 * Simple passthrough to Gemini for freeform prompts.
 * @param {string} prompt
 * @returns {Promise<string>} markdown text
 */
export async function askGemini(prompt) {
  const response = await sendToGemini(prompt);
  const text =
    response?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      ?.join('') || '';
  return text;
}
