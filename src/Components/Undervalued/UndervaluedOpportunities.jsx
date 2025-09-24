// src/components/Undervalued/UndervaluedOpportunities.jsx
// Shows the top 2 “undervalued” stocks for a sector using MetricCard.

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UndervaluedOpportunities.css';
import { uoUtils } from '../../utils/uoUtilsAdapter';
import MetricCard from '../Metric Card/Metric Card';
import { runSectorValuationFromCache } from '../../services/cacheAnalysis';
import { generateStockAnalysis } from '../../services/geminiService';
import SeedLoader from '../SeedLoader/SeedLoader';

// local formatters (MetricCard also formats its items)
// const money = (n) =>
//   Number.isFinite(n)
//     ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
//     : '—';
// const ratio = (n) => (Number.isFinite(n) ? n.toFixed(2) : '—');
// const pctSmart = (n) => {
//   if (!Number.isFinite(n)) return '—';
//   return n <= 1 ? `${(n * 100).toFixed(1)}%` : `${n.toFixed(1)}%`;
// };

// Composite score for “undervalued” (lower is better). Tune weights as you like.
function computeUndervaluationScore(m) {
  if (!m) return Number.POSITIVE_INFINITY;
  const safe = (v, def = NaN) => (Number.isFinite(v) ? v : def);

  // Adapter normalizes ROE/CFM/Growth to FRACTIONS (0.12 = 12%)
  const pe = safe(m.peRatio, 50); // lower better
  const pb = safe(m.pbRatio, 5);
  const ps = safe(m.psRatio, 10);
  const de = safe(m.deRatio, 2);
  const roe = safe(m.roe, 0); // higher better (fraction)
  const cfm = safe(m.cashFlowMargin, 0);
  const rev = safe(m.revenueGrowth, 0);
  const nig = safe(m.netIncomeGrowth, 0);

  const wPE = 0.3,
    wPB = 0.18,
    wPS = 0.14,
    wDE = 0.08,
    wROE = 0.14,
    wCFM = 0.06,
    wRev = 0.05,
    wNI = 0.05;
  const cap = (x, c) => (Number.isFinite(x) ? Math.min(x, c) : 0);

  return (
    wPE * pe +
    wPB * pb +
    wPS * ps +
    wDE * de +
    wROE * (1 - cap(roe, 0.4)) +
    wCFM * (1 - cap(cfm, 0.3)) +
    wRev * (1 - cap(rev, 0.25)) +
    wNI * (1 - cap(nig, 0.25))
  );
}

export default function UndervaluedOpportunities({
  sectorKey,
  liveData = null,
  loading: parentLoading = false,
  error: parentError = '',
  utils = uoUtils,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);

  // Function to generate AI report
  const handleGenerateReport = async (stock) => {
    try {
      console.log('Generating AI Report for:', stock.ticker);
      console.log('Available liveData:', liveData);

      // Show SeedLoader
      setReportLoading(true);
      setCurrentStock(stock);

      // Show loading indicator on button
      const originalButton = document.querySelector(`[data-ticker="${stock.ticker}"]`);
      if (originalButton) {
        originalButton.textContent = 'Generating...';
        originalButton.disabled = true;
      }

      // Prepare comprehensive stock data for Gemini
      const stockData = {
        symbol: stock.ticker,
        companyName: stock.name,
        currentPrice: stock.price,
        fairValue: stock.fairValue,
        upside: stock.upside,
        marginOfSafety: stock.mos,
        peRatio: stock.peRatio,
        // Additional ratios from live data if available
        pbRatio: 0,
        psRatio: 0,
        deRatio: 0,
        roe: 0,
        netIncome: 0,
        freeCashFlowMargin: 0,
        revenueGrowth: 0,
        netIncomeGrowth: 0,
        targetPrice: stock.fairValue, // Use fair value as target price
        ratios: {
          peRatio: stock.peRatio,
          pbRatio: 0,
          psRatio: 0,
          deRatio: 0,
          roe: 0,
          netIncome: 0,
          freeCashFlowMargin: 0,
          revenueGrowth: 0,
          netIncomeGrowth: 0,
        }
      };

      // Try to get additional metrics from live data
      if (liveData?.stocks) {
        const liveStock = liveData.stocks.find(s => s.symbol === stock.ticker);
        console.log('Found liveStock for', stock.ticker, ':', liveStock);

        if (liveStock) {
          // Convert percentage strings to numbers if needed
          const parseRatio = (val) => {
            if (typeof val === 'string') {
              return parseFloat(val.replace('%', '')) || 0;
            }
            return val || 0;
          };

          stockData.pbRatio = parseRatio(liveStock.pb_ratio);
          stockData.psRatio = parseRatio(liveStock.ps_ratio);
          stockData.deRatio = parseRatio(liveStock.de_ratio);
          stockData.roe = parseRatio(liveStock.roe);
          stockData.netIncome = parseRatio(liveStock.net_income);
          stockData.freeCashFlowMargin = parseRatio(liveStock.free_cash_flow_margin);
          stockData.revenueGrowth = parseRatio(liveStock.rev_growth);
          stockData.netIncomeGrowth = parseRatio(liveStock.net_income_growth);

          // Update ratios object too
          stockData.ratios = {
            peRatio: parseRatio(stock.peRatio),
            pbRatio: parseRatio(liveStock.pb_ratio),
            psRatio: parseRatio(liveStock.ps_ratio),
            deRatio: parseRatio(liveStock.de_ratio),
            roe: parseRatio(liveStock.roe),
            netIncome: parseRatio(liveStock.net_income),
            freeCashFlowMargin: parseRatio(liveStock.free_cash_flow_margin),
            revenueGrowth: parseRatio(liveStock.rev_growth),
            netIncomeGrowth: parseRatio(liveStock.net_income_growth),
          };

          console.log('Updated stockData with ratios:', stockData.ratios);
        } else {
          console.log('No liveStock found for', stock.ticker);
        }
      } else {
        console.log('No liveData.stocks available');
        // For CSCO testing - add hardcoded values when no live data
        if (stock.ticker === 'CSCO') {
          console.log('Using hardcoded CSCO data');
          stockData.ratios = {
            peRatio: 14.9,
            pbRatio: 4.7,
            psRatio: 3.7,
            deRatio: 0.2,
            roe: 29.2,
            netIncome: 12000000000,
            freeCashFlowMargin: 28.3,
            revenueGrowth: 2.9,
            netIncomeGrowth: 3.1,
          };
        }
      }

      // Get sector data for context
      const sectorData = {
        sectorKey,
        sectorName: sectorKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        stocks: candidates.map(c => ({
          symbol: c.ticker,
          name: c.name,
          price: c.price,
          peRatio: c.peRatio
        }))
      };

      console.log('Calling Gemini API...');

      // Call Gemini API
      const geminiAnalysis = await generateStockAnalysis({
        stockSymbol: stock.ticker,
        stockData,
        sectorData
      });

      console.log('Gemini analysis received:', geminiAnalysis);

      // Extract and map financial data properly
      const enhancedStockData = {
        ...stockData,
        // Use calculated target price or fair value
        targetPrice: stockData.fairValue || stockData.targetPrice || (stockData.currentPrice * 1.2),
        // Include upside and margin of safety from the stock object
        upside: stock.upside,
        mos: stock.mos,
        marginOfSafety: stock.mos, // Alternative field name
        fairValue: stock.fairValue,
        // Ensure market cap and sector are formatted properly
        marketCap: stockData.marketCap || '$2.45T',
        sector: stockData.sector || 'Technology',
        // Use the ratios we built earlier with live data
        ratios: {
          ...stockData.ratios,
          // Ensure all values are numeric and properly formatted
          peRatio: stockData.ratios.peRatio || stockData.peRatio || 0,
          pbRatio: stockData.ratios.pbRatio || 0,
          psRatio: stockData.ratios.psRatio || 0,
          deRatio: stockData.ratios.deRatio || 0,
          roe: stockData.ratios.roe || 0,
          netIncome: stockData.ratios.netIncome || 0,
          freeCashFlowMargin: stockData.ratios.freeCashFlowMargin || 0,
          revenueGrowth: stockData.ratios.revenueGrowth || 0,
          netIncomeGrowth: stockData.ratios.netIncomeGrowth || 0,
        }
      };

      console.log('Enhanced stock data being saved:', enhancedStockData);
      console.log('Stock object with upside/mos:', stock);

      // Store both base data and Gemini analysis in localStorage
      const reportData = {
        ...enhancedStockData,
        geminiAnalysis
      };
      localStorage.setItem('reportData', JSON.stringify(reportData));

      // Store Gemini data separately for easy access
      localStorage.setItem('geminiData', JSON.stringify(geminiAnalysis));

      console.log('Report data saved to localStorage');
      console.log(`Navigating to report page for ${stock.ticker}...`);

      // Navigate to the report page with stock symbol
      navigate(`/report/${stock.ticker}`);

    } catch (error) {
      console.error('Failed to generate AI report:', error);

      let errorMessage = 'Failed to generate AI report. ';
      if (error.message.includes('API key')) {
        errorMessage += 'Please check your Gemini API key configuration.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else {
        errorMessage += 'Please try again later.';
      }

      alert(`❌ ${errorMessage}`);
    } finally {
      // Hide SeedLoader
      setReportLoading(false);
      setCurrentStock(null);

      // Reset button state
      const originalButton = document.querySelector(`[data-ticker="${stock.ticker}"]`);
      if (originalButton) {
        originalButton.textContent = 'Generate AI Report';
        originalButton.disabled = false;
      }
    }
  };

  const extractMetrics = (stock, source = 'fallback') => {
    if (source === 'valuation') {
      const v = stock.valuation || {};
      return {
        fairValue: v.blendedFairPrice,
        upside: v.upsidePct,
        mos: v.marginOfSafety,
        peRatio: stock.peRatio,
      };
    }

    if (source === 'live') {
      // For live data, we need to calculate fair value and upside
      // Using a simple P/E based valuation as fallback
      const currentPrice = stock.price || 0;
      const pe = stock.pe_ratio || 15;
      const sectorAvgPE = 18; // default sector average
      const fairValue = currentPrice * (sectorAvgPE / pe);
      const upside =
        ((fairValue - currentPrice) / currentPrice) * 100;
      const mos = Math.max(0, upside - 20); // 20% margin of safety threshold

      return {
        fairValue: fairValue,
        upside: upside,
        mos: mos,
        peRatio: pe,
      };
    }

    // fallback
    const m = stock.metrics || stock;
    const currentPrice = stock.price || m.currentPrice || 0;
    const pe = m.peRatio || 15;
    const sectorAvgPE = 18;
    const fairValue = currentPrice * (sectorAvgPE / pe);
    const upside = ((fairValue - currentPrice) / currentPrice) * 100;
    const mos = Math.max(0, upside - 20);

    return {
      fairValue: fairValue,
      upside: upside,
      mos: mos,
      peRatio: pe,
    };
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
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

        // Try data sources in priority order

        // Priority 1: Valuation analysis (cached Perplexity results)
        try {
          const valuation =
            await runSectorValuationFromCache(sectorKey);
          if (
            valuation?.results &&
            Array.isArray(valuation.results) &&
            valuation.results.length > 0
          ) {
            const mapped = valuation.results.map((r) => {
              const name = utils.getStockName(r.symbol);
              let liveStock = null;
              if (liveData?.stocks) {
                liveStock = liveData.stocks.find(
                  (s) => s.symbol === r.symbol
                );
              }

              const mergedStock = {
                ...r,
                peRatio: liveStock?.pe_ratio ?? r.peRatio,
                priceToBook: liveStock?.pb_ratio ?? r.priceToBook,
                priceToSales: liveStock?.ps_ratio ?? r.priceToSales,
                roe: liveStock?.roe ?? r.roe,
                freeCashFlowMargin:
                  liveStock?.free_cash_flow_margin ??
                  r.freeCashFlowMargin,
                debtToEquity: liveStock?.de_ratio ?? r.debtToEquity,
                revenueGrowth:
                  liveStock?.rev_growth ?? r.revenueGrowth,
                netIncomeGrowth:
                  liveStock?.net_income_growth ?? r.netIncomeGrowth,
              };

              const metrics = extractMetrics(
                mergedStock,
                'valuation'
              );
              return {
                ticker: r.symbol,
                name,
                price: liveStock?.price ?? r.price,
                ...metrics,
              };
            });

            if (!cancelled) {
              setCandidates(mapped.slice(0, 2));
              setDataSource('valuation');
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn(
            'Valuation analysis not available:',
            e?.message || e
          );
        }

        // Priority 2: Live data only
        if (liveData?.stocks && Array.isArray(liveData.stocks)) {
          try {
            const enriched = liveData.stocks.map((stock) => {
              const name =
                stock.name ||
                utils.getStockName(stock.symbol) ||
                stock.symbol;
              const metricObj = {
                peRatio: stock.pe_ratio,
                pbRatio: stock.pb_ratio,
                psRatio: stock.ps_ratio,
                roe: stock.roe,
                cashFlowMargin: stock.free_cash_flow_margin,
                deRatio: stock.de_ratio,
                revenueGrowth: stock.rev_growth,
                netIncomeGrowth: stock.net_income_growth,
                price: stock.price,
                change: 0,
              };

              const metrics = extractMetrics(stock, 'live');
              return {
                ticker: stock.symbol,
                name,
                price: stock.price,
                ...metrics,
                _score: computeUndervaluationScore(metricObj),
              };
            });

            const sorted = enriched.sort(
              (a, b) => a._score - b._score
            );
            if (!cancelled) {
              setCandidates(sorted.slice(0, 2));
              setDataSource('live');
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to process live data:', e);
          }
        }

        // Priority 3: Fallback to adapter
        const tickers = await Promise.resolve(
          utils.getStocksBySector(sectorKey)
        );
        const enriched = await Promise.all(
          tickers.map(async (t) => {
            const metrics = await Promise.resolve(
              utils.getStockMetrics(t)
            );
            const name = utils.getStockName(t);
            return { ticker: t, name, metrics };
          })
        );

        const scored = enriched
          .map((s) => {
            const metrics = extractMetrics(s, 'fallback');
            return {
              ...s,
              ...metrics,
              _score: computeUndervaluationScore(s.metrics),
            };
          })
          .sort((a, b) => a._score - b._score);

        if (!cancelled) {
          setCandidates(scored.slice(0, 2));
          setDataSource('fallback');
        }
      } catch (e) {
        if (!cancelled)
          setError(e?.message || 'Failed to load opportunities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sectorKey, liveData, parentLoading, parentError, utils]);

  const content = useMemo(() => {
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
          No candidates found for this sector.
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
  }, [loading, error, candidates, handleGenerateReport]);

  return (
    <>
      <section
        className="uval-section"
        aria-label="Undervalued Opportunities"
      >
        {content}
      </section>

      {/* SeedLoader overlay during report generation */}
      <SeedLoader
        visible={reportLoading}
        headline={currentStock ? `Generating AI Report for ${currentStock.ticker}...` : "Generating AI Report..."}
        sublines={[
          "Analyzing financial data and market metrics",
          "Processing AI analysis with Gemini",
          "Generating comprehensive investment insights",
          "Building your personalized report",
        ]}
      />
    </>
  );
}
