/**
 * Calculate combined investment score that balances screening quality with valuation upside.
 * @param {Object} stock - Stock object with screeningScore and valuation data
 * @param {number} stock.screeningScore - Quality score from screening (0-10 scale)
 * @param {Object} stock.valuation - Valuation analysis results
 * @param {number} stock.valuation.upsidePct - Potential upside percentage
 * @returns {Object} Combined score and components breakdown
 */
export function calculateInvestmentScore(stock) {
  const screeningScore = Number.isFinite(stock.screeningScore) ? stock.screeningScore : 0;  // 0-10 scale
  const upsidePct = stock.valuation?.upsidePct;

  // Handle missing upside data
  if (!Number.isFinite(upsidePct)) {
    return {
      combinedScore: screeningScore, // Fall back to just screening score
      components: {
        screeningScore,
        upsidePct: null,
        normalizedUpside: null,
        fallbackUsed: true
      }
    };
  }

  // Normalize upside percentage to 0-10 scale
  // Upside range assumptions: -50% (terrible) to +100% (excellent)
  // -50% → 0, 0% → 3.33, +50% → 6.67, +100% → 10
  const normalizedUpside = Math.max(0, Math.min(10,
    ((upsidePct + 50) / 150) * 10
  ));

  // Weighted combination:
  // 60% screening quality (fundamental strength)
  // 40% upside potential (valuation opportunity)
  const combinedScore = (screeningScore * 0.6) + (normalizedUpside * 0.4);

  return {
    combinedScore: Math.round(combinedScore * 100) / 100, // Round to 2 decimals
    components: {
      screeningScore,
      upsidePct,
      normalizedUpside: Math.round(normalizedUpside * 100) / 100,
      fallbackUsed: false
    }
  };
}

/**
 * Calculate investment scores for an array of stocks
 * @param {Array} stocks - Array of stock objects
 * @returns {Array} Stocks with added combinedScore and scoreComponents fields
 */
export function calculateInvestmentScores(stocks) {
  return stocks.map(stock => {
    const scoreData = calculateInvestmentScore(stock);
    return {
      ...stock,
      combinedScore: scoreData.combinedScore,
      scoreComponents: scoreData.components
    };
  });
}

/**
 * Get score interpretation for display
 * @param {number} combinedScore - The combined investment score (0-10)
 * @returns {Object} Score interpretation with label and description
 */
export function getScoreInterpretation(combinedScore) {
  if (combinedScore >= 8.0) {
    return {
      label: 'Excellent',
      description: 'Outstanding opportunity with strong fundamentals and attractive valuation',
      color: '#22c55e' // green-500
    };
  } else if (combinedScore >= 6.5) {
    return {
      label: 'Good',
      description: 'Solid investment candidate with good balance of quality and value',
      color: '#84cc16' // lime-500
    };
  } else if (combinedScore >= 5.0) {
    return {
      label: 'Fair',
      description: 'Moderate opportunity, may have some concerns or limited upside',
      color: '#eab308' // yellow-500
    };
  } else if (combinedScore >= 3.0) {
    return {
      label: 'Poor',
      description: 'Below-average opportunity with significant concerns',
      color: '#f97316' // orange-500
    };
  } else {
    return {
      label: 'Avoid',
      description: 'High-risk investment with poor fundamentals and/or valuation',
      color: '#ef4444' // red-500
    };
  }
}