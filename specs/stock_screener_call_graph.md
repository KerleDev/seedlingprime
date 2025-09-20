# StockScreener Class Call Graph

This document shows the method call relationships within the StockScreener class, visualizing how methods interact with each other.

## Main Entry Point

```mermaid
graph TD
    A[screenStocks] --> B[generateCacheKey]
    A --> C[getFromCache]
    A --> D[calculateSectorStatistics]
    A --> E[filterStocksByCriteria]
    A --> F[scoreAndRankStocks]
    A --> G[setCache]
```

## Method Call Hierarchy

### Level 1: Public Interface
- **`screenStocks(criteria, stockData)`** - Main entry point

### Level 2: Core Processing Methods
- **`calculateSectorStatistics(stockData, targetSector)`** - Called by `screenStocks`
- **`filterStocksByCriteria(stockData, criteria, sectorStats)`** - Called by `screenStocks`
- **`scoreAndRankStocks(stocks, criteria, sectorStats)`** - Called by `screenStocks`

### Level 3: Filtering Methods
- **`passesValuationTests(stock, sectorStats, criteria)`** - Called by `filterStocksByCriteria`
- **`passesFinancialHealthTests(stock, criteria)`** - Called by `filterStocksByCriteria`
- **`passesGrowthTests(stock, criteria)`** - Called by `filterStocksByCriteria`
- **`hasRedFlags(stock)`** - Called by `filterStocksByCriteria`

### Level 4: Scoring Methods
- **`calculateCompositeScore(stock, criteria, sectorStats)`** - Called by `scoreAndRankStocks`
- **`getScoreBreakdown(stock, sectorStats)`** - Called by `scoreAndRankStocks`

### Level 5: Individual Score Calculations
- **`calculateValuationScore(stock, sectorStats)`** - Called by `calculateCompositeScore` and `getScoreBreakdown`
- **`calculateHealthScore(stock)`** - Called by `calculateCompositeScore` and `getScoreBreakdown`
- **`calculateGrowthScore(stock, sectorStats)`** - Called by `calculateCompositeScore` and `getScoreBreakdown`
- **`calculateManagementScore(stock, sectorStats)`** - Called by `calculateCompositeScore` and `getScoreBreakdown`

### Level 6: Analysis Methods
- **`identifyRedFlags(stock)`** - Called by `getScoreBreakdown`

### Utility Methods (Called Throughout)
- **`isValidStock(stock)`** - Called by `calculateSectorStatistics` and `filterStocksByCriteria`
- **`calculateMean(values)`** - Called by `calculateSectorStatistics`
- **`generateCacheKey(criteria)`** - Called by `screenStocks`
- **`getFromCache(key)`** - Called by `screenStocks`
- **`setCache(key, data)`** - Called by `screenStocks`

## Detailed Call Graph

```mermaid
graph TD
    %% Main flow
    A[screenStocks] --> B[generateCacheKey]
    A --> C[getFromCache]
    A --> D[calculateSectorStatistics]
    A --> E[filterStocksByCriteria]
    A --> F[scoreAndRankStocks]
    A --> G[setCache]
    
    %% calculateSectorStatistics calls
    D --> H[isValidStock]
    D --> I[calculateMean]
    
    %% filterStocksByCriteria calls
    E --> H
    E --> J[passesValuationTests]
    E --> K[passesFinancialHealthTests]
    E --> L[passesGrowthTests]
    E --> M[hasRedFlags]
    
    %% scoreAndRankStocks calls
    F --> N[calculateCompositeScore]
    F --> O[getScoreBreakdown]
    
    %% calculateCompositeScore calls
    N --> P[calculateValuationScore]
    N --> Q[calculateHealthScore]
    N --> R[calculateGrowthScore]
    N --> S[calculateManagementScore]
    
    %% getScoreBreakdown calls
    O --> P
    O --> Q
    O --> R
    O --> S
    O --> T[identifyRedFlags]
    
    %% Styling
    classDef entryPoint fill:#e1f5fe
    classDef coreMethod fill:#f3e5f5
    classDef filterMethod fill:#e8f5e8
    classDef scoreMethod fill:#fff3e0
    classDef utilityMethod fill:#fafafa
    
    class A entryPoint
    class D,E,F coreMethod
    class J,K,L,M filterMethod
    class N,O,P,Q,R,S,T scoreMethod
    class B,C,G,H,I utilityMethod
```

## Method Dependencies by Category

### **Cache Management**
- `generateCacheKey()` - Standalone utility
- `getFromCache()` - Standalone utility  
- `setCache()` - Standalone utility

### **Data Validation**
- `isValidStock()` - Standalone utility used throughout

### **Statistical Analysis**
- `calculateMean()` - Standalone utility
- `calculateSectorStatistics()` - Uses `isValidStock()` and `calculateMean()`

### **Filtering Pipeline**
```
filterStocksByCriteria()
├── isValidStock()
├── passesValuationTests()
├── passesFinancialHealthTests()
├── passesGrowthTests()
└── hasRedFlags()
```

### **Scoring Pipeline**
```
scoreAndRankStocks()
├── calculateCompositeScore()
│   ├── calculateValuationScore()
│   ├── calculateHealthScore()
│   ├── calculateGrowthScore()
│   └── calculateManagementScore()
└── getScoreBreakdown()
    ├── calculateValuationScore()
    ├── calculateHealthScore()
    ├── calculateGrowthScore()
    ├── calculateManagementScore()
    └── identifyRedFlags()
```

## Execution Flow Summary

1. **Entry**: `screenStocks()` is called with criteria and stock data
2. **Caching**: Check cache using `generateCacheKey()` and `getFromCache()`
3. **Analysis**: Calculate sector statistics using `calculateSectorStatistics()`
4. **Filtering**: Filter stocks through multiple validation methods
5. **Scoring**: Score and rank qualifying stocks using composite scoring
6. **Output**: Cache results and return scored stock list

## Notes

- **Reusable Components**: Scoring methods (`calculateValuationScore`, `calculateHealthScore`, etc.) are called by both `calculateCompositeScore` and `getScoreBreakdown`
- **Validation Layer**: `isValidStock()` is used at multiple points to ensure data quality
- **Caching Strategy**: Cache operations are isolated to three dedicated methods
- **Modular Design**: Each filtering test is in its own method for maintainability
- **Statistical Foundation**: Sector statistics are calculated once and passed through the pipeline