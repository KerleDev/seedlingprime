// Stock Screening Engine
// Implements fundamental analysis screening based on sector comparison and financial health

class StockScreener {
  constructor() {
    this.cache = new Map();
    this.sectorStats = new Map();
    this.CACHE_TTL = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Main screening function - finds undervalued stocks in a sector
   * @param {Object} criteria - Screening criteria
   * @param {Array} stockData - Array of stock data objects
   * @returns {Array} Sorted array of qualifying stocks with scores
   */
  async screenStocks(criteria, stockData) {
    const cacheKey = this.generateCacheKey(criteria);

    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult && !criteria.forceRefresh) {
      return cachedResult;
    }

    // Calculate sector statistics for comparison
    const sectorStats = this.calculateSectorStatistics(
      stockData,
      criteria.sector
    );

    // Filter stocks based on criteria
    const qualifyingStocks = this.filterStocksByCriteria(
      stockData,
      criteria,
      sectorStats
    );

    // Score and rank the qualifying stocks
    const scoredStocks = this.scoreAndRankStocks(
      qualifyingStocks,
      criteria,
      sectorStats
    );

    // Cache the results
    this.setCache(cacheKey, scoredStocks);

    return scoredStocks;
  }

  /**
   * Calculate sector-wide statistics for comparison
   */
  calculateSectorStatistics(stockData, targetSector) {
    const sectorStocks = stockData.filter(
      (stock) =>
        stock.sector === targetSector && this.isValidStock(stock)
    );

    if (sectorStocks.length === 0) {
      throw new Error(
        `No valid stocks found for sector: ${targetSector}`
      );
    }

    const stats = {
      sector: targetSector,
      stockCount: sectorStocks.length,
      meanPE: this.calculateMean(
        sectorStocks.map((s) => s.peRatio).filter((pe) => pe > 0)
      ),
      meanROE: this.calculateMean(
        sectorStocks.map((s) => s.roe).filter((roe) => roe != null)
      ),
      meanDebtToEquity: this.calculateMean(
        sectorStocks
          .map((s) => s.debtToEquity)
          .filter((de) => de != null)
      ),
      meanPriceToBook: this.calculateMean(
        sectorStocks.map((s) => s.priceToBook).filter((pb) => pb > 0)
      ),
      meanPriceToSales: this.calculateMean(
        sectorStocks.map((s) => s.priceToSales).filter((ps) => ps > 0)
      ),
      meanRevenueGrowth: this.calculateMean(
        sectorStocks
          .map((s) => s.revenueGrowth)
          .filter((rg) => rg != null)
      ),
    };

    // Cache sector stats
    this.sectorStats.set(targetSector, stats);
    return stats;
  }

  /**
   * Filter stocks based on fundamental criteria
   */
  filterStocksByCriteria(stockData, criteria, sectorStats) {
    return stockData.filter((stock) => {
      // Basic validation
      if (
        !this.isValidStock(stock) ||
        stock.sector !== criteria.sector
      ) {
        return false;
      }

      // Price-based filters (must be below sector average)
      if (!this.passesValuationTests(stock, sectorStats, criteria)) {
        return false;
      }

      // Financial health filters
      if (!this.passesFinancialHealthTests(stock, criteria)) {
        return false;
      }

      // Growth filters
      if (!this.passesGrowthTests(stock, criteria)) {
        return false;
      }

      // Red flag filters
      if (this.hasRedFlags(stock)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if stock passes valuation tests (below sector averages)
   */
  passesValuationTests(stock, sectorStats, criteria) {
    const peThreshold =
      sectorStats.meanPE * (criteria.maxPEMultiplier || 0.85); // 15% below average
    const pbThreshold =
      sectorStats.meanPriceToBook * (criteria.maxPBMultiplier || 0.9); // 10% below average
    const psThreshold =
      sectorStats.meanPriceToSales *
      (criteria.maxPSMultiplier || 0.9); // 10% below average

    // P/E ratio check
    if (stock.peRatio > 0 && stock.peRatio > peThreshold) {
      return false;
    }

    // Price-to-Book check
    if (stock.priceToBook > 0 && stock.priceToBook > pbThreshold) {
      return false;
    }

    // Price-to-Sales check
    if (stock.priceToSales > 0 && stock.priceToSales > psThreshold) {
      return false;
    }

    return true;
  }

  /**
   * Check financial health criteria
   */
  passesFinancialHealthTests(stock, criteria) {
    // Debt-to-equity check
    if (stock.debtToEquity > (criteria.maxDebtToEquity || 1.5)) {
      return false;
    }

    // Return on Equity check
    if (stock.roe < (criteria.minROE || 10)) {
      return false;
    }

    // Free cash flow margin check
    if (
      stock.freeCashFlowMargin < (criteria.minFreeCashFlowMargin || 5)
    ) {
      return false;
    }

    // Positive net income
    if (criteria.requirePositiveNetIncome && stock.netIncome <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Check growth criteria
   */
  passesGrowthTests(stock, criteria) {
    // Revenue growth check
    if (stock.revenueGrowth < (criteria.minRevenueGrowth || 0)) {
      return false;
    }

    // Net income growth check
    if (
      criteria.minNetIncomeGrowth &&
      stock.netIncomeGrowth < criteria.minNetIncomeGrowth
    ) {
      return false;
    }

    return true;
  }

  /**
   * Check for red flags that disqualify stocks
   */
  hasRedFlags(stock) {
    // Penny stock filter
    if (stock.price < 5) {
      return true;
    }

    // Massive debt
    if (stock.debtToEquity > 3) {
      return true;
    }

    // Consistent losses
    if (stock.netIncome < 0 && stock.netIncomeGrowth < -10) {
      return true;
    }

    // Severely declining revenue
    if (stock.revenueGrowth < -10) {
      return true;
    }

    return false;
  }

  /**
   * Score and rank stocks based on multiple factors
   */
  scoreAndRankStocks(stocks, criteria, sectorStats) {
    const scoredStocks = stocks.map((stock) => {
      const score = this.calculateCompositeScore(
        stock,
        criteria,
        sectorStats
      );
      return {
        ...stock,
        screeningScore: score,
        scoringBreakdown: this.getScoreBreakdown(stock, sectorStats),
      };
    });

    // Sort by score descending
    return scoredStocks.sort(
      (a, b) => b.screeningScore - a.screeningScore
    );
  }

  /**
   * Calculate composite score based on weighted factors
   */
  calculateCompositeScore(stock, criteria, sectorStats) {
    const weights = {
      valuation: 0.4, // 40% - How cheap vs competitors
      health: 0.3, // 30% - Financial health
      growth: 0.2, // 20% - Growth trends
      management: 0.1, // 10% - Management efficiency (ROE proxy)
    };

    const valuationScore = this.calculateValuationScore(
      stock,
      sectorStats
    );
    const healthScore = this.calculateHealthScore(stock);
    const growthScore = this.calculateGrowthScore(stock, sectorStats);
    const managementScore = this.calculateManagementScore(
      stock,
      sectorStats
    );

    const compositeScore =
      valuationScore * weights.valuation +
      healthScore * weights.health +
      growthScore * weights.growth +
      managementScore * weights.management;

    return Math.round(compositeScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate valuation score (0-10, higher is better/cheaper)
   */
  calculateValuationScore(stock, sectorStats) {
    let score = 5; // Start with neutral

    // P/E ratio scoring (lower is better)
    if (stock.peRatio > 0 && sectorStats.meanPE > 0) {
      const peRatio = stock.peRatio / sectorStats.meanPE;
      score += (1 - peRatio) * 3; // Max 3 points for being cheap
    }

    // Price-to-Book scoring
    if (stock.priceToBook > 0 && sectorStats.meanPriceToBook > 0) {
      const pbRatio = stock.priceToBook / sectorStats.meanPriceToBook;
      score += (1 - pbRatio) * 2; // Max 2 points
    }

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Calculate financial health score (0-10)
   */
  calculateHealthScore(stock) {
    let score = 0;

    // ROE scoring
    if (stock.roe >= 15) score += 3;
    else if (stock.roe >= 10) score += 2;
    else if (stock.roe >= 5) score += 1;

    // Debt management
    if (stock.debtToEquity < 0.5) score += 2;
    else if (stock.debtToEquity < 1.0) score += 1.5;
    else if (stock.debtToEquity < 1.5) score += 1;

    // Cash flow
    if (stock.freeCashFlowMargin >= 15) score += 2;
    else if (stock.freeCashFlowMargin >= 10) score += 1.5;
    else if (stock.freeCashFlowMargin >= 5) score += 1;

    // Profitability
    if (stock.netIncome > 0) score += 1;

    // Current ratio (if available)
    if (stock.currentRatio && stock.currentRatio >= 2) score += 1;
    else if (stock.currentRatio && stock.currentRatio >= 1.5)
      score += 0.5;

    return Math.min(10, score);
  }

  /**
   * Calculate growth score (0-10)
   */
  calculateGrowthScore(stock, sectorStats) {
    let score = 5; // Neutral start

    // Revenue growth
    if (stock.revenueGrowth >= 20) score += 2;
    else if (stock.revenueGrowth >= 10) score += 1.5;
    else if (stock.revenueGrowth >= 5) score += 1;
    else if (stock.revenueGrowth >= 0) score += 0.5;
    else score -= 1;

    // Net income growth
    if (stock.netIncomeGrowth >= 20) score += 2;
    else if (stock.netIncomeGrowth >= 10) score += 1;
    else if (stock.netIncomeGrowth >= 0) score += 0.5;
    else score -= 1;

    // Compare to sector average
    if (stock.revenueGrowth > sectorStats.meanRevenueGrowth)
      score += 1;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Calculate management efficiency score (0-10)
   */
  calculateManagementScore(stock, sectorStats) {
    let score = 5;

    // ROE vs sector
    if (stock.roe > sectorStats.meanROE * 1.2) score += 2;
    else if (stock.roe > sectorStats.meanROE) score += 1;

    // Asset turnover (if available)
    if (stock.assetTurnover && stock.assetTurnover > 1) score += 1;

    // Operating margin trends
    if (stock.operatingMargin >= 20) score += 1;
    else if (stock.operatingMargin >= 15) score += 0.5;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Get detailed score breakdown for transparency
   */
  getScoreBreakdown(stock, sectorStats) {
    return {
      valuation: this.calculateValuationScore(stock, sectorStats),
      health: this.calculateHealthScore(stock),
      growth: this.calculateGrowthScore(stock, sectorStats),
      management: this.calculateManagementScore(stock, sectorStats),
      redFlags: this.identifyRedFlags(stock),
    };
  }

  /**
   * Identify specific red flags for a stock
   */
  identifyRedFlags(stock) {
    const flags = [];

    if (stock.price < 5) flags.push('Penny stock');
    if (stock.debtToEquity > 3) flags.push('Excessive debt');
    if (stock.netIncome < 0) flags.push('Unprofitable');
    if (stock.revenueGrowth < -10) flags.push('Declining revenue');
    if (stock.peRatio > 50 && stock.peRatio > 0)
      flags.push('Very high P/E');

    return flags;
  }

  /**
   * Utility functions
   */
  isValidStock(stock) {
    return (
      stock &&
      stock.symbol &&
      stock.sector &&
      typeof stock.price === 'number' &&
      stock.price > 0
    );
  }

  calculateMean(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  generateCacheKey(criteria) {
    const keyObject = {
      sector: criteria.sector,
      minROE: criteria.minROE,
      maxPEMultiplier: criteria.maxPEMultiplier,
      minRevenueGrowth: criteria.minRevenueGrowth,
      timestamp: Math.floor(Date.now() / this.CACHE_TTL), // Changes every 15 minutes
    };
    return `screening_${JSON.stringify(keyObject)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get sector-specific screening recommendations
   */
  getSectorSpecificCriteria(sector) {
    const sectorDefaults = {
      Technology: {
        minROE: 15,
        maxPEMultiplier: 0.8, // More aggressive for tech
        minRevenueGrowth: 10,
        focusMetrics: ['peRatio', 'revenueGrowth', 'roe'],
      },
      Healthcare: {
        minROE: 12,
        maxPEMultiplier: 0.85,
        minRevenueGrowth: 5,
        focusMetrics: ['peRatio', 'roe', 'debtToEquity'],
      },
      Finance: {
        minROE: 10,
        maxDebtToEquity: 2.0, // Different for banks
        maxPBMultiplier: 0.9,
        focusMetrics: ['priceToBook', 'roe', 'netIncomeGrowth'],
      },
      Utilities: {
        minROE: 8,
        maxPEMultiplier: 0.9,
        minRevenueGrowth: 0, // Lower growth expectations
        focusMetrics: ['dividendYield', 'debtToEquity', 'roe'],
      },
    };

    return (
      sectorDefaults[sector] || {
        minROE: 10,
        maxPEMultiplier: 0.85,
        minRevenueGrowth: 3,
      }
    );
  }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StockScreener;
} else if (typeof window !== 'undefined') {
  window.StockScreener = StockScreener;
}

// Example usage:
/*
const screener = new StockScreener();

const criteria = {
  sector: 'Technology',
  minROE: 15,
  maxPEMultiplier: 0.85,
  minRevenueGrowth: 5,
  maxDebtToEquity: 1.5,
  requirePositiveNetIncome: true
};

const stockData = [
  {
    symbol: 'AAPL',
    sector: 'Technology',
    price: 175.50,
    peRatio: 28.5,
    roe: 26.4,
    debtToEquity: 1.73,
    priceToBook: 39.4,
    priceToSales: 7.6,
    revenueGrowth: 8.1,
    netIncomeGrowth: 11.2,
    freeCashFlowMargin: 26.3,
    netIncome: 94680000000
  }
  // ... more stocks
];

screener.screenStocks(criteria, stockData)
  .then(results => {
    console.log('Top screening results:', results.slice(0, 10));
  });
*/
