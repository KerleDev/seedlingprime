# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SeedlingPrime is a React-based investment dashboard application that provides sector analysis and stock market insights. The app displays financial data across 11 market sectors with 143 stocks total.

### Mean Reversion Analysis Feature

The application is designed to implement a sophisticated mean reversion analysis system that follows a 7-step data flow:

1. **User Sector Selection** - User chooses specific market sector
2. **Perplexity API Data Collection** - Comprehensive financial data gathering
3. **Data Processing** - Clean and structure data for analysis
4. **Prompt Injection** - Create structured prompts with processed data
5. **Gemini API Analysis** - AI-powered financial analysis
6. **Report Generation** - Comprehensive investment reports
7. **UI Display** - User-friendly report presentation

This system identifies undervalued stocks showing mean reversion potential, provides risk assessments, and generates professional investment recommendations.

## Architecture

- **Framework**: React 19.1.1 with Vite 7.1.6 as the build tool
- **Routing**: React Router DOM for client-side navigation
- **Styling**: CSS modules with component-specific stylesheets
- **Data**: Large financial dataset in `src/constants/sectorDataNew.js` containing sector ETF data and individual stock metrics

### Key Components Structure

```
src/
├── App.jsx - Main router with default redirect to /dashboard
├── main.jsx - React root with BrowserRouter wrapper
├── Components/
│   ├── Dashboard/ - Main dashboard page component
│   ├── Topbar/ - Navigation header with logo and auth buttons
│   ├── Sectioncard/ - Reusable card components for dashboard sections
│   ├── SectorDropdown/ - Sector selection dropdown with data integration
│   └── MyAPIComponent.jsx - (untracked file for API integration)
└── constants/
    └── sectorDataNew.js - Comprehensive financial data for 11 sectors
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Key Data Structure

The application centers around `newSectorData` object containing:

- 11 sectors: energy, materials, industrials, utilities, healthcare, financial, consumer_discretionary, consumer_staples, information_technology, communication_services, real_estate
- Each sector includes ETF data and individual stock metrics (P/E ratios, dividend yields, etc.)
- 143 total stocks with varying data completeness (85% complete, 15% partial)

## Component Patterns

- Components follow PascalCase naming convention
- Each component has its own CSS file
- Default exports used throughout
- Functional components with hooks (useState for state management)
- Props passed down for sector selection and data filtering

## ESLint Configuration

- Modern ESLint flat config format
- React hooks and refresh plugins enabled
- Custom rule: unused vars allowed if they start with uppercase letters
- Targets ES2020+ with JSX support

## Development Notes

- Default route redirects to `/dashboard`
- All other routes also redirect to dashboard (single-page app)
- Logo and branding: "Seedling" with distinctive styling
- Ready for API integration via MyAPIComponent
- Financial data includes special cases for acquired companies (Twitter → X, Activision → Microsoft, etc.)
