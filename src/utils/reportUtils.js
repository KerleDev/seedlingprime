// Utility functions for handling report data across components

// Default fallback data structure
export const getDefaultReportData = (symbol = 'UNKNOWN') => ({
  symbol,
  companyName: 'Apple Inc.',
  currentPrice: 150.25,
  marketCap: '2.45T',
  peRatio: 25.4,
  sector: 'Technology',
  introduction: 'Loading company overview...',
  recommendation: 'ANALYZING',
  confidence: 'PENDING',
  targetPrice: 0,
  strengths: [
    'Analysis in progress...',
    'Please wait for AI analysis...',
    'Content loading...',
  ],
  weaknesses: [
    'Analysis in progress...',
    'Please wait for AI analysis...',
    'Content loading...',
  ],
  marketPosition: 'AI analysis in progress...',
  ratios: {
    peRatio: 0,
    pbRatio: 0,
    psRatio: 0,
    deRatio: 0,
    roe: 0,
    netIncome: 0,
    freeCashFlowMargin: 0,
    revenueGrowth: 0,
    netIncomeGrowth: 0,
  },
});

// Get base data from localStorage
export const getStorageData = () => {
  try {
    const stored = localStorage.getItem('reportData');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse localStorage reportData:', error);
    return null;
  }
};

// Get Gemini data from localStorage
export const getGeminiData = (geminiDataProp = null) => {
  if (geminiDataProp) return geminiDataProp;

  try {
    const stored = localStorage.getItem('geminiData');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse localStorage geminiData:', error);
    return null;
  }
};

// Merge all data sources with proper priority
export const getMergedReportData = (symbol, stockDataProp = null, geminiDataProp = null) => {
  // Get data from various sources
  const defaultData = getDefaultReportData(symbol);
  const storageData = getStorageData();
  const currentGeminiData = getGeminiData(geminiDataProp);

  // Merge data sources: defaultData -> storageData -> stockDataProp (priority order)
  const baseData = { ...defaultData, ...storageData, ...stockDataProp };

  // Apply Gemini-generated content with highest priority
  const finalData = {
    ...baseData,
    ...(currentGeminiData?.introduction && {
      introduction: currentGeminiData.introduction,
    }),
    ...(currentGeminiData?.recommendation && {
      recommendation: currentGeminiData.recommendation,
    }),
    ...(currentGeminiData?.confidence && {
      confidence: currentGeminiData.confidence,
    }),
    ...(currentGeminiData?.strengths && {
      strengths: currentGeminiData.strengths,
    }),
    ...(currentGeminiData?.weaknesses && {
      weaknesses: currentGeminiData.weaknesses,
    }),
    ...(currentGeminiData?.marketPosition && {
      marketPosition: currentGeminiData.marketPosition,
    }),
  };

  return finalData;
};

// Formatting utility functions
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value))
    return '0%';
  return `${parseFloat(value).toFixed(1)}%`;
};

export const getRecommendationColor = (recommendation) => {
  switch (recommendation?.toUpperCase()) {
    case 'LONG':
      return '#65A30D';
    case 'SHORT':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};