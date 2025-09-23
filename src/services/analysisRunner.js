// Orchestrates: normalization -> screening -> valuation -> prompt building -> (Gemini)

import StockScreenerModule from './screening';
import * as dataPipeline from './dataPipeline';
const StockScreener =
  StockScreenerModule?.default || StockScreenerModule;
import { valueTopUndervalued } from './valuation';

/**
 * Runs the full analysis for a sector and returns results and (optionally) a Gemini report.
 * @param {{
 *   sector: string;
 *   criteria?: any;
 *   dataset: object; // sectorDataNew structure
 *   generateReport?: (prompt: string) => Promise<string>; // optional Gemini adapter
 * }} params
 */
export default async function runAnalysis({
  sector,
  criteria = {},
  dataset,
  generateReport,
}) {
  if (!sector) throw new Error('sector is required');
  if (!dataset) throw new Error('dataset is required');

  // Step 1: Normalize & filter
  const { sectorStocks, allStocks, issues } =
    dataPipeline.prepareDataForAnalysis(dataset, sector);

  // Step 2: Screen
  const screener = new StockScreener();
  const screeningResults = await screener.screenStocks(
    { sector, ...criteria },
    allStocks // pass all so sector statistics are correct
  );

  // Step 3: Build prompt from top N results in sector
  const topInSector = screeningResults
    .filter((s) => s.sector === sector)
    .slice(0, 25);

  // Step 3b: Valuation – compute fair value and upside for top two undervalued
  const valuationSummary = valueTopUndervalued(topInSector, sector);

  const prompt = dataPipeline.buildPrompt(
    { stocks: topInSector },
    sector
  );

  // Step 4: Optional Gemini report
  let report = null;
  if (typeof generateReport === 'function') {
    report = await generateReport(prompt);
  }

  return {
    sector,
    issues, // validation issues by symbol
    topResults: topInSector,
    valuation: valuationSummary, // { sector, sectorStats, results: [top two] }
    prompt,
    report,
  };
}

/**
 * Convenience: run only normalization + screening + valuation for a sector.
 */
export async function runValuation({
  sector,
  criteria = {},
  dataset,
}) {
  if (!sector) throw new Error('sector is required');
  if (!dataset) throw new Error('dataset is required');
  const { allStocks } = dataPipeline.prepareDataForAnalysis(
    dataset,
    sector
  );
  const screener = new StockScreener();
  const screeningResults = await screener.screenStocks(
    { sector, ...criteria },
    allStocks
  );
  const topInSector = screeningResults
    .filter((s) => s.sector === sector)
    .slice(0, 25);
  return valueTopUndervalued(topInSector, sector);
}
