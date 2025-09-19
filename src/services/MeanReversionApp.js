// src/services/MeanReversionApp.js
import sectorData from '../constants/sectorData';

class MeanReversionApp {
  constructor() {
    // Initialize API clients here
    this.perplexityAPI = {
      collectSectorData: async (sector) => {
        console.log(`Perplexity API: Collecting data for ${sector}`);
        // Simulate API call using data from sectorData
        return new Promise((resolve) =>
          setTimeout(() => {
            const formattedSector = sector
              .toLowerCase()
              .replace(/ /g, '_');
            const data = sectorData.sectors[formattedSector];
            if (data) {
              resolve({
                stocks: Object.entries(data.stocks).map(
                  ([symbol, stockData]) => ({
                    symbol: symbol, // Use the actual symbol from the key
                    ...stockData,
                  })
                ),
                sectorAverages: data.sector_etf, // Use sector_etf for averages
                trends: [],
              });
            } else {
              resolve({ stocks: [], sectorAverages: {}, trends: [] });
            }
          }, 1000)
        );
      },
    };
    this.geminiAPI = {
      generateReport: async (prompt) => {
        console.log(
          'Gemini API: Generating report with prompt:',
          prompt
        );
        // Simulate API call
        return new Promise((resolve) =>
          setTimeout(() => {
            resolve(
              `Generated financial report for prompt: ${prompt}`
            );
          }, 2000)
        );
      },
    };
  }

  async analyzeSector(selectedSector) {
    try {
      console.log(`Analyzing sector: ${selectedSector}`);

      const rawData =
        await this.perplexityAPI.collectSectorData(selectedSector);

      const processedData = this.processFinancialData(rawData);

      const prompt = this.createAnalysisPrompt(
        processedData,
        selectedSector
      );

      const report = await this.geminiAPI.generateReport(prompt);

      this.displayReport(report);

      return report;
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showError(error);
    }
  }

  processFinancialData(rawData) {
    console.log('Processing raw data:', rawData);
    const sectorAverages = rawData.sectorAverages || {};
    const processedStocks = rawData.stocks
      .filter(
        (stock) =>
          stock.price &&
          stock.pe_ratio !== null &&
          stock.pe_ratio !== undefined
      ) // Filter out stocks with missing essential data
      .map((stock) => {
        // Safely extract price, handling price_range if present
        const currentPrice =
          typeof stock.price === 'string' && stock.price.includes('-')
            ? parseFloat(stock.price.split('-')[0]) // Take the lower bound of the range
            : stock.price;

        // Ensure pe_ratio and roe are numbers
        const peRatio = parseFloat(stock.pe_ratio);
        const roe = parseFloat(stock.roe);

        const processedStock = {
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: currentPrice,
          peRatio: !isNaN(peRatio) ? peRatio : null,
          pbRatio: parseFloat(stock.pb_ratio) || null,
          psRatio: parseFloat(stock.ps_ratio) || null,
          eps: parseFloat(stock.eps) || null,
          roe: !isNaN(roe) ? roe : null,
          roa: parseFloat(stock.roa) || null,
          debtToEquity: parseFloat(stock.debt_to_equity) || null,
          // currentRatio: parseFloat(stock.current_ratio) || null,
          // peg: parseFloat(stock.peg) || null,
          // dividendYield: parseFloat(stock.dividend_yield) || null,
          // ma50: parseFloat(stock.ma_50) || null,
          // ma200: parseFloat(stock.ma_200) || null,
          // rsi: parseFloat(stock.rsi) || null,
          // macd: parseFloat(stock.macd) || null,
          // week52Low: parseFloat(stock.week_52_low) || null,
          // week52High: parseFloat(stock.week_52_high) || null,
          // Add other relevant metrics here
        };
        // Identify undervalued opportunities
        processedStock.isUndervalued = this.detectMeanReversion(
          processedStock,
          sectorAverages
        );
        return processedStock;
      });

    return {
      stocks: processedStocks,
      sectorMetrics: sectorAverages,
      marketTrends: rawData.trends,
    };
  }

  createAnalysisPrompt(data, sector) {
    console.log(
      'Creating analysis prompt for data:',
      data,
      'and sector:',
      sector
    );
    return `
    Analyze the following ${sector} sector data for mean reversion opportunities:
    
    Stock Data: ${JSON.stringify(data.stocks)}
    Sector Averages: ${JSON.stringify(data.sectorMetrics)}
    Market Trends: ${JSON.stringify(data.marketTrends)}
    
    Please provide a comprehensive report identifying:
    1. Undervalued stocks showing mean reversion potential
    2. Risk assessment for each opportunity
    3. Investment recommendations
    4. Market outlook for the sector
    `;
  }

  detectMeanReversion(stock, sectorAverages) {
    console.log('Detecting mean reversion for stock:', stock);
    // Basic mean reversion logic:
    // A stock is considered undervalued if its PE ratio is below the sector average
    // AND its current price is below its 200-day moving average (if available).

    const stockPERatio = stock.peRatio;
    const sectorETFPertio = sectorAverages.pe_ratio;
    const currentPrice = stock.currentPrice;
    const ma200 = stock.ma200;

    let isUndervalued = false;

    if (stockPERatio && sectorETFPertio) {
      if (stockPERatio < sectorETFPertio) {
        isUndervalued = true;
      }
    }

    if (isUndervalued && currentPrice && ma200) {
      if (currentPrice < ma200) {
        isUndervalued = true;
      } else {
        isUndervalued = false; // Not undervalued if above MA200, even if PE is low
      }
    } else if (isUndervalued && !ma200) {
      // If MA200 is not available, we rely solely on PE ratio comparison.
      isUndervalued = true;
    } else {
      isUndervalued = false; // Default to false if no clear signal
    }

    return isUndervalued;
  }

  displayReport(report) {
    console.log('Displaying report:', report);
    // This will be handled by the UI component later
  }

  showError(error) {
    console.error('Showing error:', error);
    // This will be handled by the UI component later
  }
}

export default MeanReversionApp;
