# Undervalued Stock Screening Criteria

This document outlines the comprehensive criteria used by the Seedling Analytics stock screening engine to identify undervalued investment opportunities.

## Overview

The screening engine implements a fundamental analysis approach that compares stocks against sector averages and applies multiple layers of financial health, valuation, and growth filters to identify undervalued opportunities.

## Primary Screening Methodology

### 1. Sector-Based Comparison

- Stocks are evaluated **relative to their sector peers**, not absolute thresholds
- Sector statistics calculated include: mean P/E, ROE, debt-to-equity, price-to-book, price-to-sales, and revenue growth
- This approach ensures fair comparison within industry context

### 2. Multi-Layer Filtering System

The screening process applies four sequential filters:

1. **Valuation Tests** - Must be cheaper than sector average
2. **Financial Health Tests** - Must meet minimum financial stability criteria
3. **Growth Tests** - Must show positive growth trends
4. **Red Flag Detection** - Must avoid critical risk factors

## Detailed Screening Criteria

### Valuation Requirements (Must Pass ALL)

#### Price-to-Earnings (P/E) Ratio

- **Requirement**: Must be ≤ 85% of sector average P/E
- **Logic**: Stock must trade at a 15% discount to sector peers
- **Exception**: Stocks with negative P/E are filtered separately

#### Price-to-Book (P/B) Ratio

- **Requirement**: Must be ≤ 90% of sector average P/B
- **Logic**: Stock must trade at a 10% discount to book value vs. peers
- **Significance**: Indicates potential asset undervaluation

#### Price-to-Sales (P/S) Ratio

- **Requirement**: Must be ≤ 90% of sector average P/S
- **Logic**: Revenue multiple must be discounted vs. competitors
- **Benefit**: Useful for evaluating companies with temporary profit issues

### Financial Health Requirements (Must Pass ALL)

#### Return on Equity (ROE)

- **Minimum**: 10% (default)
- **Sector Variations**:
  - Technology: 15%
  - Healthcare: 12%
  - Finance: 10%
  - Utilities: 8%
- **Logic**: Demonstrates management effectiveness and profitability

#### Debt-to-Equity Ratio

- **Maximum**: 1.5 (default)
- **Finance Sector**: 2.0 (banks have different capital structures)
- **Logic**: Ensures manageable debt levels and financial stability

#### Free Cash Flow Margin

- **Minimum**: 5%
- **Logic**: Positive cash generation indicates operational efficiency
- **Calculation**: Free cash flow as percentage of revenue

#### Net Income (Optional Filter)

- **Requirement**: Must be positive if `requirePositiveNetIncome` is enabled
- **Logic**: Ensures current profitability, not just asset value

### Growth Requirements

#### Revenue Growth

- **Minimum**: 0% (default)
- **Sector Variations**:
  - Technology: 10%
  - Healthcare: 5%
  - Utilities: 0% (stable sectors)
- **Logic**: Company must be growing, not shrinking

#### Net Income Growth (Optional)

- **Applied**: Only when specified in criteria
- **Logic**: Profit growth indicates improving business fundamentals

### Red Flag Disqualifiers (Any ONE Disqualifies)

#### Penny Stock Filter

- **Threshold**: Price < $5
- **Reason**: High volatility and manipulation risk

#### Excessive Debt

- **Threshold**: Debt-to-equity > 3.0
- **Reason**: Bankruptcy risk and financial distress

#### Consistent Losses

- **Conditions**: Negative net income AND net income growth < -10%
- **Reason**: Deteriorating business with no turnaround signs

#### Severe Revenue Decline

- **Threshold**: Revenue growth < -10%
- **Reason**: Fundamental business deterioration

## Composite Scoring System

After filtering, qualifying stocks receive a weighted composite score (0-10 scale):

### Scoring Weights

- **Valuation**: 40% - How cheap vs. sector peers
- **Financial Health**: 30% - Balance sheet strength and profitability
- **Growth**: 20% - Revenue and profit growth trends
- **Management Efficiency**: 10% - ROE and operational metrics

### Valuation Score (0-10)

- **P/E Advantage**: Up to 3 points for trading below sector average
- **P/B Advantage**: Up to 2 points for book value discount
- **Base Score**: 5 (neutral if at sector average)

### Financial Health Score (0-10)

- **ROE Performance**: 1-3 points based on profitability levels
- **Debt Management**: 1-2 points for conservative debt levels
- **Cash Flow**: 1-2 points for strong free cash flow margins
- **Current Profitability**: 1 point for positive net income
- **Liquidity**: 0.5-1 point for strong current ratio

### Growth Score (0-10)

- **Revenue Growth**: 0.5-2 points based on growth rate
- **Net Income Growth**: 0.5-2 points for profit expansion
- **Sector Comparison**: 1 point for above-average growth
- **Base Score**: 5 (neutral starting point)

### Management Efficiency Score (0-10)

- **ROE vs Sector**: 1-2 points for outperforming sector ROE
- **Asset Utilization**: 1 point for efficient asset turnover
- **Operating Margins**: 0.5-1 point for strong operational efficiency

<!-- ## Sector-Specific Customizations
**not applicable for now**

### Technology Stocks
- **Focus**: High growth expectations, premium valuation tolerance
- **Key Metrics**: P/E ratio, revenue growth, ROE
- **Stricter ROE**: 15% minimum (vs 10% default)

### Healthcare Stocks
- **Focus**: Stable profitability, moderate growth
- **Key Metrics**: P/E ratio, ROE, debt management
- **Balanced Approach**: 12% ROE, 5% revenue growth

### Financial Stocks
- **Focus**: Book value, ROE, capital management
- **Key Metrics**: Price-to-book, ROE, net income growth
- **Higher Debt Tolerance**: 2.0 debt-to-equity (vs 1.5 default)

### Utility Stocks
- **Focus**: Dividend sustainability, stable operations
- **Key Metrics**: Dividend yield, debt-to-equity, ROE
- **Lower Growth Expectations**: 0% revenue growth, 8% ROE -->

## Practical Application

### Screening Process

1. **Input**: Stock universe and sector selection
2. **Filter**: Apply valuation, health, growth, and red flag tests
3. **Score**: Calculate weighted composite scores for survivors
4. **Rank**: Sort by score (highest = most attractive)
5. **Output**: Ranked list with detailed score breakdowns

### Score Interpretation

- **8.0+**: Exceptional value opportunity
- **6.0-7.9**: Strong undervaluation candidate
- **4.0-5.9**: Moderate value potential
- **<4.0**: Limited value attraction

### Risk Considerations

- Screening identifies **potential** value, not guaranteed returns
- Further due diligence required on business fundamentals
- Market conditions and timing affect actual performance
- Diversification across multiple opportunities recommended

## Data Requirements

### Required Stock Data Fields

- Basic: symbol, sector, price
- Valuation: peRatio, priceToBook, priceToSales
- Profitability: roe, netIncome, freeCashFlowMargin
- Growth: revenueGrowth, netIncomeGrowth
- Leverage: debtToEquity
- Optional: currentRatio, assetTurnover, operatingMargin

### Data Quality Standards

- Numerical fields must be valid numbers
- Growth rates should be percentages or decimals
- Ratios should exclude negative/zero denominators where applicable
- Recent data preferred (quarterly updates recommended)

## Implementation Notes

### Caching Strategy

- Results cached for 15 minutes to improve performance
- Cache keys include screening criteria and timestamp
- Sector statistics cached separately for reuse

### Performance Optimization

- Batch processing for large stock universes
- Parallel calculation of scoring components
- Memory-efficient data structures for large datasets

This screening methodology provides a systematic, quantitative approach to identifying undervalued investment opportunities while maintaining appropriate risk controls and sector-specific considerations.

### Example Stock Object Structure

```javascript
const stockData = {
  // Required basic fields
  symbol: 'AAPL',
  sector: 'Technology',
  price: 175.5,

  // Required valuation metrics
  peRatio: 28.5,
  priceToBook: 39.4,
  priceToSales: 7.6,

  // Required profitability metrics
  roe: 26.4,
  netIncome: 94680000000,
  freeCashFlowMargin: 26.3,

  // Required leverage metric
  debtToEquity: 1.73,

  // Required growth metrics
  revenueGrowth: 8.1,
  netIncomeGrowth: 11.2,

  // Optional enhancement metrics
  currentRatio: 1.2,
  assetTurnover: 1.1,
  operatingMargin: 30.5,
};
```
