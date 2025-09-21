# Mean Reversion Project - Simplified Architecture Flow

## Overview

The mean reversion project follows a streamlined, efficient process that transforms user sector selection into professional financial analysis reports through a clear 7-step data flow.

## Basic Data Flow Process

```
User Selects Sector → Perplexity API Collects Data → Data Processing →
Prompt Injection → Gemini API → Report Generation → UI Display
```

## Detailed Step-by-Step Process

### Step 1: User Sector Selection

- User chooses specific market sector (Healthcare, Technology, Finance, etc.)
- Sector selection triggers the data collection pipeline
- UI shows loading state while processing begins

### Step 2: Perplexity API Data Collection

- **Purpose**: Collect comprehensive financial data for selected sector
- **Data Retrieved**:
  - Stock prices and historical performance
  - Financial statements:
    - P/E ratio
    - P/B ratio
    - P/S ratio
    - EPS (Earnings per share)
    - ROE (Return on equity)
    - ROA (Return on assets)
    - Debt-to-equity ratio
  - Market metrics and sector comparisons
  - Company fundamentals and executive information
- **Output**: Raw financial dataset

### Step 3: Data Processing

- **Clean and structure** the raw data from Perplexity
- **Extract key metrics** relevant to mean reversion analysis
- **Identify undervalued opportunities** based on sector comparisons
- **Format data** for optimal AI prompt injection

### Step 4: Processed Data → Prompt Injection

- **Structured prompt creation** using processed financial data
- **Include specific instructions** for mean reversion analysis
- **Add context** about sector trends and market conditions
- **Format for Gemini API** consumption

### Step 5: Prompt → Gemini API

- **Send structured prompt** with financial data to Gemini
- **Request comprehensive analysis** focusing on:
  - Undervalued stock identification
  - Mean reversion opportunities
  - Risk assessment
  - Investment recommendations

### Step 6: Gemini API Writes Report

- **AI generates comprehensive financial report** including:
  - Executive Summary
  - Key Findings (undervalued stocks)
  - Market Analysis
  - Risk Assessment
  - Investment Recommendations
  - Conclusion

### Step 7: App Displays Report in UI

- **Render AI-generated report** in user-friendly format
- **Display key metrics** and undervalued opportunities
- **Show interactive charts** and visual data
- **Provide export options** (PDF, etc.)

## Technical Implementation

### Core Application Class

```javascript
class MeanReversionApp {
  async analyzeSector(selectedSector) {
    try {
      // Step 1: User selects sector (handled by UI)
      console.log(`Analyzing sector: ${selectedSector}`);

      // Step 2: Perplexity API collects data
      const rawData =
        await this.perplexityAPI.collectSectorData(selectedSector);

      // Step 3: Process the data
      const processedData = this.processFinancialData(rawData);

      // Step 4: Inject processed data into prompt
      const prompt = this.createAnalysisPrompt(
        processedData,
        selectedSector
      );

      // Step 5: Send prompt to Gemini API
      const report = await this.geminiAPI.generateReport(prompt);

      // Step 6: Gemini writes comprehensive report
      // (handled by Gemini API response)

      // Step 7: Display report in UI
      this.displayReport(report);

      return report;
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showError(error);
    }
  }

  processFinancialData(rawData) {
    // Clean and structure data for mean reversion analysis
    return {
      stocks: rawData.stocks.map((stock) => ({
        symbol: stock.symbol,
        currentPrice: stock.price,
        peRatio: stock.peRatio,
        roe: stock.roe,
        isUndervalued: this.detectMeanReversion(stock),
      })),
      sectorMetrics: rawData.sectorAverages,
      marketTrends: rawData.trends,
    };
  }

  createAnalysisPrompt(data, sector) {
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

  detectMeanReversion(stock) {
    // Logic to identify mean reversion opportunities
    // Compare current metrics to historical averages
    // Return boolean indicating undervalued status
  }
}
```

## API Integration Details

### Perplexity API Configuration

- **Endpoint**: Financial data collection
- **Parameters**: Sector selection, data depth, timeframe
- **Response**: Comprehensive financial dataset

### Gemini API Configuration

- **Model**: Latest Gemini model for financial analysis
- **Input**: Structured prompt with processed data
- **Output**: Professional financial report

## UI Flow States

1. **Sector Selection**: Dropdown interface for sector choice
2. **Loading**: Progress indicators during API calls and processing
3. **Report Display**: Formatted report with charts and metrics
4. **Export Options**: PDF generation and download functionality

## Key Benefits of This Flow

### Simplicity

- **Clear linear process** from user input to final output
- **No complex branching** or unnecessary complexity
- **Easy to debug and maintain**

### Efficiency

- **Direct API calls** without unnecessary intermediate layers
- **Streamlined data processing** focused on essential metrics
- **Fast response times** due to optimized flow

### Reliability

- **Predictable data flow** makes error handling straightforward
- **Clear separation of concerns** between each step
- **Easy to test** each component independently

### Scalability

- **Modular design** allows for easy component upgrades
- **API-first approach** enables future integrations
- **Clean architecture** supports adding new features

## Data Processing Focus

The data processing step is crucial for mean reversion analysis:

- **Historical comparison**: Compare current prices to historical averages
- **Sector benchmarking**: Identify stocks underperforming sector peers
- **Valuation metrics**: Calculate key financial ratios
- **Trend analysis**: Detect patterns suggesting reversion opportunities

This simplified architecture ensures that the mean reversion project delivers professional financial analysis while maintaining clarity and efficiency in both development and user experience.
