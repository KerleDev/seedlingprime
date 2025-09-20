# Stock Data Validation Schema

This document defines the validation ranges and rules for stock financial data used in the StockScreener system.

## Financial Metric Ranges

### Valuation Metrics
```javascript
const valuationMetrics = {
  peRatio: { 
    min: 0.01, 
    max: 500,
    description: "Price-to-Earnings ratio",
    notes: "Values ≤ 0 indicate losses or negative earnings"
  },
  priceToBook: { 
    min: 0.01, 
    max: 200,
    description: "Price-to-Book ratio",
    notes: "Low values may indicate undervaluation or distress"
  },
  priceToSales: { 
    min: 0.01, 
    max: 200,
    description: "Price-to-Sales ratio",
    notes: "Revenue-based valuation metric"
  }
};
```

### Financial Health Metrics
```javascript
const healthMetrics = {
  debtToEquity: { 
    min: 0, 
    max: 10,
    description: "Debt-to-Equity ratio",
    notes: "Higher values indicate more leveraged companies"
  },
  roe: { 
    min: -200, 
    max: 500,
    description: "Return on Equity (%)",
    notes: "Negative values indicate losses relative to equity"
  },
  freeCashFlowMargin: { 
    min: -100, 
    max: 100,
    description: "Free Cash Flow Margin (%)",
    notes: "Percentage of revenue converted to free cash flow"
  }
};
```

### Growth Metrics
```javascript
const growthMetrics = {
  revenueGrowth: { 
    min: -100, 
    max: 500,
    description: "Revenue Growth (%)",
    notes: "Year-over-year revenue change"
  },
  netIncomeGrowth: { 
    min: -100, 
    max: 1000,
    description: "Net Income Growth (%)",
    notes: "Year-over-year net income change"
  }
};
```

### Price and Income Metrics
```javascript
const priceIncomeMetrics = {
  price: { 
    min: 0.01, 
    max: 100000,
    description: "Stock Price ($)",
    notes: "Current market price per share"
  },
  netIncome: { 
    min: -1e13, 
    max: 1e14,
    description: "Net Income ($)",
    notes: "Annual net income in dollars"
  }
};
```

## Validation Functions

### Enhanced Stock Validation
```javascript
function isValidStockEnhanced(stock) {
  const validationRules = {
    // Required fields
    symbol: (val) => typeof val === 'string' && val.length > 0,
    sector: (val) => typeof val === 'string' && val.length > 0,
    
    // Price validation
    price: (val) => typeof val === 'number' && val >= 0.01 && val <= 100000,
    
    // Valuation metrics (optional but must be in range if present)
    peRatio: (val) => val === null || val === undefined || 
                     (typeof val === 'number' && val >= 0.01 && val <= 500),
    priceToBook: (val) => val === null || val === undefined || 
                         (typeof val === 'number' && val >= 0.01 && val <= 200),
    priceToSales: (val) => val === null || val === undefined || 
                          (typeof val === 'number' && val >= 0.01 && val <= 200),
    
    // Financial health metrics
    debtToEquity: (val) => val === null || val === undefined || 
                          (typeof val === 'number' && val >= 0 && val <= 10),
    roe: (val) => val === null || val === undefined || 
                 (typeof val === 'number' && val >= -200 && val <= 500),
    freeCashFlowMargin: (val) => val === null || val === undefined || 
                               (typeof val === 'number' && val >= -100 && val <= 100),
    
    // Growth metrics
    revenueGrowth: (val) => val === null || val === undefined || 
                           (typeof val === 'number' && val >= -100 && val <= 500),
    netIncomeGrowth: (val) => val === null || val === undefined || 
                             (typeof val === 'number' && val >= -100 && val <= 1000),
    
    // Income
    netIncome: (val) => val === null || val === undefined || 
                       (typeof val === 'number' && val >= -1e13 && val <= 1e14)
  };
  
  for (const [field, validator] of Object.entries(validationRules)) {
    if (!validator(stock[field])) {
      return false;
    }
  }
  
  return true;
}
```

## Screening Criteria Validation

### Default Screening Thresholds
Based on the StockScreener implementation:

```javascript
const defaultScreeningCriteria = {
  // Financial Health (from passesFinancialHealthTests)
  maxDebtToEquity: 1.5,        // Must be ≤ max range (10)
  minROE: 10,                  // Must be ≥ min range (-200)
  minFreeCashFlowMargin: 5,    // Must be ≥ min range (-100)
  
  // Growth (from passesGrowthTests)
  minRevenueGrowth: 0,         // Must be ≥ min range (-100)
  
  // Valuation (from passesValuationTests)
  maxPEMultiplier: 0.85,       // Applied to sector average
  maxPBMultiplier: 0.90,       // Applied to sector average
  maxPSMultiplier: 0.90,       // Applied to sector average
  
  // Red Flags (from hasRedFlags)
  minPrice: 5,                 // Penny stock filter
  maxDebtToEquityRedFlag: 3,   // Excessive debt filter
  minRevenueGrowthRedFlag: -10 // Declining revenue filter
};
```

## Data Quality Checks

### Range Validation Warnings
```javascript
function validateDataQuality(stock) {
  const warnings = [];
  
  // Extreme valuation ratios
  if (stock.peRatio > 100) warnings.push('Very high P/E ratio');
  if (stock.priceToBook > 50) warnings.push('Very high P/B ratio');
  if (stock.priceToSales > 50) warnings.push('Very high P/S ratio');
  
  // Financial stress indicators
  if (stock.debtToEquity > 5) warnings.push('Very high debt-to-equity');
  if (stock.roe < -50) warnings.push('Very poor ROE');
  if (stock.freeCashFlowMargin < -50) warnings.push('Very poor cash flow');
  
  // Growth anomalies
  if (stock.revenueGrowth > 200) warnings.push('Unusually high revenue growth');
  if (stock.netIncomeGrowth > 500) warnings.push('Unusually high income growth');
  if (stock.revenueGrowth < -50) warnings.push('Severe revenue decline');
  
  return warnings;
}
```

## Integration with StockScreener

### Updated isValidStock Method
```javascript
isValidStock(stock) {
  // Basic existence checks
  if (!stock || !stock.symbol || !stock.sector) return false;
  
  // Price validation
  if (typeof stock.price !== 'number' || stock.price < 0.01 || stock.price > 100000) {
    return false;
  }
  
  // Validate ranges for metrics that are used in screening
  const metricsToValidate = [
    { field: 'peRatio', min: 0.01, max: 500 },
    { field: 'priceToBook', min: 0.01, max: 200 },
    { field: 'priceToSales', min: 0.01, max: 200 },
    { field: 'debtToEquity', min: 0, max: 10 },
    { field: 'roe', min: -200, max: 500 },
    { field: 'freeCashFlowMargin', min: -100, max: 100 },
    { field: 'revenueGrowth', min: -100, max: 500 },
    { field: 'netIncomeGrowth', min: -100, max: 1000 },
    { field: 'netIncome', min: -1e13, max: 1e14 }
  ];
  
  for (const { field, min, max } of metricsToValidate) {
    const value = stock[field];
    if (value !== null && value !== undefined) {
      if (typeof value !== 'number' || value < min || value > max) {
        return false;
      }
    }
  }
  
  return true;
}
```

## Common Data Issues and Handling

### Missing Data Strategy
- **Null/Undefined Values**: Allowed for optional metrics, excluded from calculations
- **Zero Values**: 
  - `peRatio = 0`: Treated as invalid (company has no earnings)
  - `price = 0`: Invalid stock
  - `debtToEquity = 0`: Valid (debt-free company)

### Extreme Values
- **Very High P/E (>100)**: Often indicates speculation or temporary earnings depression
- **Negative ROE**: Company is destroying shareholder value
- **High Debt-to-Equity (>5)**: Highly leveraged, risky company
- **Extreme Growth (>200%)**: May indicate data errors or exceptional circumstances

### Data Source Considerations
- Ensure data is from the same time period (quarterly/annual consistency)
- Verify currency consistency for international stocks
- Handle stock splits and dividend adjustments in price data
- Account for different fiscal year ends in growth calculations

## Usage Example

```javascript
// Validate stock data before screening
const stockData = [/* array of stock objects */];
const validStocks = stockData.filter(stock => {
  const isValid = isValidStockEnhanced(stock);
  if (!isValid) {
    console.warn(`Invalid stock data for ${stock.symbol}`);
  }
  const warnings = validateDataQuality(stock);
  if (warnings.length > 0) {
    console.warn(`Data quality warnings for ${stock.symbol}:`, warnings);
  }
  return isValid;
});

// Proceed with screening
const screener = new StockScreener();
const results = await screener.screenStocks(criteria, validStocks);
```