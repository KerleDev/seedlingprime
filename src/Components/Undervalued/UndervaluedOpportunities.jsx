// src/components/Undervalued/UndervaluedOpportunities.jsx
// Shows the top 2 "undervalued" stocks for a sector using MetricCard.
// Refactored to reuse existing services and eliminate code duplication.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UndervaluedOpportunities.css';
import MetricCard from '../Metric Card/Metric Card';
import { runSectorValuationFromCache } from '../../services/cacheAnalysis';
import { loadSectorData } from '../../services/perplexityCache';
import { generateStockAnalysis } from '../../services/geminiService';
import SeedLoader from '../SeedLoader/SeedLoader';
import { normalizeStock } from '../../utils/normalizeStock';
import { validateStock } from '../../utils/validateStock';

// Simple data processing function that leverages existing utils
function processLiveDataForUndervalued(liveData, sectorKey) {
  if (!liveData?.stocks || !Array.isArray(liveData.stocks)) {
    return [];
  }

  const candidates = liveData.stocks
    .map((stock) => {
      // Use existing normalizeStock utility
      const normalized = normalizeStock({
        symbol: stock.symbol,
        sector: sectorKey,
        raw: {
          name: stock.name,
          price: stock.price,
          pe_ratio: stock.pe_ratio,
          pb_ratio: stock.pb_ratio,
          ps_ratio: stock.ps_ratio,
          roe: stock.roe,
          net_income: stock.net_income,
          free_cash_flow_margin: stock.free_cash_flow_margin,
          de_ratio: stock.de_ratio,
          rev_growth: stock.rev_growth,
          net_income_growth: stock.net_income_growth,
        },
      });

      // Use existing validateStock utility
      const validation = validateStock(normalized);
      if (!validation.valid) {
        console.warn(
          `Invalid stock data for ${stock.symbol}:`,
          validation.issues
        );
        return null;
      }

      // Simple undervaluation score (lower P/E is better)
      const pe = normalized.peRatio || 999;
      const pb = normalized.priceToBook || 999;
      const score = pe * 0.7 + pb * 0.3;

      return {
        ticker: normalized.symbol,
        name: normalized.name || normalized.symbol,
        price: normalized.price,
        peRatio: normalized.peRatio,
        fairValue: normalized.price * 1.2, // Simple 20% upside assumption
        upside: 20,
        mos: 10,
        _score: score,
      };
    })
    .filter(Boolean) // Remove invalid stocks
    .sort((a, b) => a._score - b._score); // Sort by score (lower is better)

  return candidates.slice(0, 2);
}

export default function UndervaluedOpportunities({
  sectorKey,
  liveData = null,
  loading: parentLoading = false,
  error: parentError = '',
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);

  // Function to generate AI report (unchanged logic)
  const handleGenerateReport = async (stock) => {
    try {
      console.log('Generating AI Report for:', stock.ticker);
      setReportLoading(true);
      setCurrentStock(stock);

      // Show loading indicator on button
      const originalButton = document.querySelector(
        `[data-ticker="${stock.ticker}"]`
      );
      if (originalButton) {
        originalButton.textContent = 'Generating...';
        originalButton.disabled = true;
      }

      // Create comprehensive stock data object
      const stockData = {
        symbol: stock.ticker,
        name: stock.name,
        sector: sectorKey,
        currentPrice: stock.price,
        fairValue: stock.fairValue,
        targetPrice: stock.fairValue,
        peRatio: stock.peRatio,
        pbRatio: 0,
        psRatio: 0,
        deRatio: 0,
        roe: 0,
        netIncome: 0,
        freeCashFlowMargin: 0,
        revenueGrowth: 0,
        netIncomeGrowth: 0,
        ratios: {
          peRatio: stock.peRatio || 0,
          pbRatio: 0,
          psRatio: 0,
          deRatio: 0,
          roe: 0,
          netIncome: 0,
          freeCashFlowMargin: 0,
          revenueGrowth: 0,
          netIncomeGrowth: 0,
        },
      };

      // Try to enhance with live data if available
      if (liveData?.stocks) {
        const liveStock = liveData.stocks.find(
          (s) => s.symbol === stock.ticker
        );
        if (liveStock) {
          Object.assign(stockData, {
            pbRatio: liveStock.pb_ratio || 0,
            psRatio: liveStock.ps_ratio || 0,
            deRatio: liveStock.de_ratio || 0,
            roe: liveStock.roe || 0,
            netIncome: liveStock.net_income || 0,
            freeCashFlowMargin: liveStock.free_cash_flow_margin || 0,
            revenueGrowth: liveStock.rev_growth || 0,
            netIncomeGrowth: liveStock.net_income_growth || 0,
          });

          Object.assign(stockData.ratios, {
            pbRatio: liveStock.pb_ratio || 0,
            psRatio: liveStock.ps_ratio || 0,
            deRatio: liveStock.de_ratio || 0,
            roe: liveStock.roe || 0,
            netIncome: liveStock.net_income || 0,
            freeCashFlowMargin: liveStock.free_cash_flow_margin || 0,
            revenueGrowth: liveStock.rev_growth || 0,
            netIncomeGrowth: liveStock.net_income_growth || 0,
          });
        }
      }

      // Get sector data for context
      const sectorData = {
        sectorKey,
        sectorName: sectorKey
          .replace('_', ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        stocks: candidates.map((c) => ({
          symbol: c.ticker,
          name: c.name,
          price: c.price,
          peRatio: c.peRatio,
        })),
      };

      console.log('Calling Gemini API...');

      // Call Gemini service
      const geminiAnalysis = await generateStockAnalysis({
        stockSymbol: stock.ticker,
        stockData,
        sectorData,
      });

      console.log('Gemini analysis received:', geminiAnalysis);

      // Create enhanced stock data for the report
      const enhancedStockData = {
        ...stockData,
        targetPrice:
          stockData.fairValue ||
          stockData.targetPrice ||
          stockData.currentPrice * 1.2,
        upside: stock.upside,
        mos: stock.mos,
        valuation: {
          blendedFairPrice: stockData.fairValue,
          upsidePct: stock.upside,
          marginOfSafety: stock.mos,
        },
        ratios: {
          peRatio: stockData.ratios.peRatio || 0,
          pbRatio: stockData.ratios.pbRatio || 0,
          psRatio: stockData.ratios.psRatio || 0,
          deRatio: stockData.ratios.deRatio || 0,
          roe: stockData.ratios.roe || 0,
          netIncome: stockData.ratios.netIncome || 0,
          freeCashFlowMargin:
            stockData.ratios.freeCashFlowMargin || 0,
          revenueGrowth: stockData.ratios.revenueGrowth || 0,
          netIncomeGrowth: stockData.ratios.netIncomeGrowth || 0,
        },
      };

      console.log(
        'Enhanced stock data being saved:',
        enhancedStockData
      );
      console.log('Stock object with upside/mos:', stock);

      // Store both base data and Gemini analysis in localStorage
      const reportData = {
        ...enhancedStockData,
        geminiAnalysis,
      };
      localStorage.setItem('reportData', JSON.stringify(reportData));

      // Store Gemini data separately for easy access
      localStorage.setItem(
        'geminiData',
        JSON.stringify(geminiAnalysis)
      );

      console.log('Report data saved to localStorage');
      console.log(`Navigating to report page for ${stock.ticker}...`);

      // Navigate to the report page with stock symbol
      navigate(`/report/${stock.ticker}`);
    } catch (error) {
      console.error('Failed to generate AI report:', error);

      let errorMessage = 'Failed to generate AI report. ';
      if (error.message.includes('API key')) {
        errorMessage +=
          'Please check your Gemini API key configuration.';
      } else if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        errorMessage +=
          'Please check your internet connection and try again.';
      } else {
        errorMessage += 'Please try again later.';
      }

      alert(`${errorMessage}`);
    } finally {
      // Hide SeedLoader
      setReportLoading(false);
      setCurrentStock(null);

      // Reset button state
      const originalButton = document.querySelector(
        `[data-ticker="${stock.ticker}"]`
      );
      if (originalButton) {
        originalButton.textContent = 'Generate AI Report';
        originalButton.disabled = false;
      }
    }
  };

  // Simplified useEffect - single clean data flow
  useEffect(() => {
    let cancelled = false;

    async function loadUndervaluedCandidates() {
      try {
        setLoading(true);
        setError('');
        setDataSource('');

        if (parentError) {
          setError(parentError);
          setLoading(false);
          return;
        }

        if (parentLoading) {
          setLoading(true);
          return;
        }

        // Priority 1: localStorage - use loadSectorData(sectorKey)
        try {
          const localStorageData = loadSectorData(sectorKey);
          if (localStorageData?.stocks && typeof localStorageData.stocks === 'object') {
            const processedCandidates = processLiveDataForUndervalued(
              { stocks: Object.values(localStorageData.stocks) },
              sectorKey
            );

            if (!cancelled && processedCandidates.length > 0) {
              console.log(
                'Using localStorage data, candidates:',
                processedCandidates
              );
              setCandidates(processedCandidates);
              setDataSource('localStorage');
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn(
            'localStorage not available:',
            e?.message || e
          );
        }

        // Priority 2: Cached valuation fallback - only if localStorage is null/undefined
        try {
          const valuation =
            await runSectorValuationFromCache(sectorKey);
          if (valuation?.results && valuation.results.length > 0) {
            const mappedCandidates = valuation.results
              .slice(0, 2)
              .map((result) => ({
                ticker: result.symbol,
                name: result.name || result.symbol,
                price: result.price,
                peRatio: result.peRatio,
                fairValue:
                  result.valuation?.blendedFairPrice ||
                  result.price * 1.2,
                upside: result.valuation?.upsidePct || 20,
                mos: result.valuation?.marginOfSafety || 10,
              }));

            if (!cancelled) {
              console.log(
                'Using cached valuation fallback, candidates:',
                mappedCandidates
              );
              setCandidates(mappedCandidates);
              setDataSource('cached_valuation');
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn(
            'Cached valuation not available:',
            e?.message || e
          );
        }

        // Fallback: No viable data source
        if (!cancelled) {
          setError(
            'No undervalued opportunities data available for this sector.'
          );
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Error loading undervalued candidates:', e);
          setError(
            e?.message || 'Failed to load undervalued opportunities'
          );
          setLoading(false);
        }
      }
    }

    if (sectorKey) {
      loadUndervaluedCandidates();
    }

    return () => {
      cancelled = true;
    };
  }, [sectorKey, liveData, parentLoading, parentError]);

  // Render logic (unchanged)
  const content = (() => {
    if (loading) {
      return (
        <div className="uval-skeleton">
          <div className="uval-skel-card" />
          <div className="uval-skel-card" />
        </div>
      );
    }

    if (error) return <p className="uval-error">{error}</p>;

    if (!candidates.length) {
      return (
        <p className="uval-empty">
          No undervalued opportunities found for this sector.
        </p>
      );
    }

    return (
      <div className="uval-cards">
        {candidates.map((stock) => (
          <MetricCard
            key={stock.ticker}
            ticker={stock.ticker}
            name={stock.name}
            price={stock.price}
            fairValue={stock.fairValue}
            upside={stock.upside}
            mos={stock.mos}
            peRatio={stock.peRatio}
            ctaLabel="Generate AI Report"
            onCta={() => handleGenerateReport(stock)}
            ctaProps={{ 'data-ticker': stock.ticker }}
          />
        ))}
      </div>
    );
  })();

  return (
    <>
      <section
        className="uval-section"
        aria-label="Undervalued Opportunities"
      >
        {content}
        {dataSource && (
          <div
            className="uval-debug"
            style={{
              fontSize: '12px',
              opacity: 0.7,
              marginTop: '8px',
            }}
          >
            Data source: {dataSource} | Found: {candidates.length}{' '}
            candidates
          </div>
        )}
      </section>

      {/* SeedLoader overlay during report generation */}
      <SeedLoader
        visible={reportLoading}
        headline={
          currentStock
            ? `Generating AI Report for ${currentStock.ticker}...`
            : 'Generating AI Report...'
        }
        sublines={[
          'Analyzing financial data and market metrics',
          'Processing AI analysis with Gemini',
          'Generating comprehensive investment insights',
          'Building your personalized report',
        ]}
      />
    </>
  );
}
