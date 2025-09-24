import { sendToGemini } from '../api/gemini';
import { askPerplexity } from './perplexityService';
import geminiPrompt from '../prompts/geminiPrompt';
import { extractJSON } from '../utils/json';

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

/**
 * Generate stock investment analysis using Gemini
 * @param {Object} options - Analysis parameters
 * @param {string} options.stockSymbol - Stock ticker symbol
 * @param {Object} options.stockData - Stock financial data
 * @param {Object} options.sectorData - Sector context data
 * @returns {Promise<Object>} Parsed JSON analysis
 */
export async function generateStockAnalysis({ stockSymbol, stockData, sectorData }) {
  const reportPrompt = geminiPrompt({
    stockSymbol,
    stockData,
    sectorJson: sectorData,
    ppxlText: `Analyzing ${stockSymbol} stock`
  });

  const response = await sendToGemini(reportPrompt);
  const rawText = response?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    ?.join('') || '';

  if (!rawText) {
    throw new Error('No response from Gemini API');
  }

  // Use the shared JSON extraction utility
  const analysisData = extractJSON(rawText);

  if (!analysisData) {
    console.error('Failed to parse Gemini response as JSON');
    console.log('Raw response:', rawText);

    // Return a fallback structure
    return {
      introduction: 'Analysis completed but formatting error occurred.',
      recommendation: 'ANALYZING',
      confidence: 'MEDIUM',
      strengths: ['Analysis in progress...'],
      weaknesses: ['Please try generating the report again.'],
      marketPosition: 'Technical error in report generation.'
    };
  }

  // Validate required fields
  const requiredFields = ['introduction', 'recommendation', 'confidence', 'strengths', 'weaknesses', 'marketPosition'];
  for (const field of requiredFields) {
    if (!analysisData[field]) {
      console.warn(`Missing required field: ${field}`);
    }
  }

  return analysisData;
}
