import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import SectionCard from '../Sectioncard/Sectioncard'; // keep your existing casing if that's your folder/file
import SectorDropdownData from '../SectorDropdown/SectorDropdownData';
import SortDropdown from '../SectorDropdown/SortDropdown';
import SectorChart from '../SectorChart/SectorChart';
import UndervaluedOpportunities from '../Undervalued/UndervaluedOpportunities';
import SectorBreakdownTable from '../SectorBreakdown/SectorBreakdownTable';
import SeedLoader from '../SeedLoader/SeedLoader';
import './Dashboard.css';

// Data / utils

// import newSectorData from '../../constants/sectorDataNew';
import simplifiedSectorData from '../../constants/simplifiedSectorData';
import { shapeSectorsFromReport } from '../../utils/sectorTransform';
import { sectorMetrics } from '../../utils/metrics';
import { askPerplexity } from '../../services/perplexityService';
import {
  saveSectorData,
  loadSectorData,
} from '../../services/perplexityCache';

// Prepare once (pure transform)
const shaped = shapeSectorsFromReport(simplifiedSectorData); // { sectors, displayNames, etf }

function Dashboard() {
  const defaultKey =
    (shaped?.sectors?.information_technology
      ? 'information_technology'
      : Object.keys(shaped?.sectors || {})[0]) || '';

  const [selectedSector, setSelectedSector] = useState(defaultKey);
  const [sortMode, setSortMode] = useState('asc'); // "asc" | "desc" | "distance" | "symbol"
  const [ppxlLoading, setPpxlLoading] = useState(false);
  const [ppxlError, setPpxlError] = useState('');
  const [ppxlData, setPpxlData] = useState(null); // parsed JSON or raw text

  const handleSectorChange = useCallback((key) => {
    setSelectedSector(key);
  }, []);

  // Derive the table for the chosen sector - use live data if available
  const stockData = useMemo(() => {
    if (
      ppxlData &&
      typeof ppxlData === 'object' &&
      ppxlData.stocks &&
      Array.isArray(ppxlData.stocks)
    ) {
      return ppxlData.stocks.map((stock) => ({
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
        currentPrice: stock.price,
        pe: stock.pe_ratio,
        pb: stock.pb_ratio,
        marketCap: stock.market_cap,
      }));
    }
    return shaped?.sectors?.[selectedSector] || [];
  }, [selectedSector, ppxlData]);

  // Compute metrics (mean price, avg P/E, avg P/B)
  const { sectorMean, sectorPE, sectorPB } = useMemo(
    () => sectorMetrics(stockData),
    [stockData]
  );

  // Sorted data for the chart based on current sort mode
  const sortedStockData = useMemo(() => {
    const arr = [...stockData];
    switch (sortMode) {
      case 'asc':
        return arr.sort(
          (a, b) =>
            (a.currentPrice ?? 0) - (b.currentPrice ?? 0) ||
            a.symbol.localeCompare(b.symbol)
        );
      case 'desc':
        return arr.sort(
          (a, b) =>
            (b.currentPrice ?? 0) - (a.currentPrice ?? 0) ||
            a.symbol.localeCompare(b.symbol)
        );
      case 'distance':
        return arr.sort((a, b) => {
          const da = Math.abs((a.currentPrice ?? 0) - sectorMean);
          const db = Math.abs((b.currentPrice ?? 0) - sectorMean);
          return da - db || a.symbol.localeCompare(b.symbol);
        });
      case 'symbol':
        return arr.sort((a, b) => a.symbol.localeCompare(b.symbol));
      default:
        return arr;
    }
  }, [stockData, sectorMean, sortMode]);

  // Fetch Perplexity data whenever the selected sector changes
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setPpxlLoading(true);
        setPpxlError('');
        setPpxlData(null);

        // Try cache first
        const cached = loadSectorData(selectedSector);
        if (!cancelled && cached) {
          setPpxlData(cached);
          setPpxlLoading(false);
          return;
        }

        const { json, text } = await askPerplexity(selectedSector);
        if (cancelled) return;

        const payload = json || text || null;
        setPpxlData(payload);
        saveSectorData(selectedSector, payload);
        console.log(
          'Perplexity data for sector:',
          selectedSector,
          json || text
        );
      } catch (e) {
        if (cancelled) return;
        console.error('Perplexity fetch failed:', e);
        setPpxlError(e?.message || 'Failed to fetch Perplexity data');
      } finally {
        if (!cancelled) setPpxlLoading(false);
      }
    }
    if (selectedSector) run();
    return () => {
      cancelled = true;
    };
  }, [selectedSector]);

  // No sector fallback
  if (!defaultKey) {
    return (
      <div className="dashboard">
        <header className="page-hero">
          <h1 className="page-title">Your Investment Dashboard</h1>
          <h2 className="page-subtitle">No sector data available.</h2>
        </header>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Hero */}
      <header className="page-hero">
        <h1 className="page-title">Your Investment Dashboard</h1>
        <h2 className="page-subtitle">
          Analyze undervalued opportunities with advanced AI-powered
          insights
        </h2>
      </header>

      {/* Top controls */}
      <div
        className="page-controls"
        style={{ gap: 12, alignItems: 'center' }}
      >
        <SectorDropdownData
          sectors={shaped.sectors}
          selectedSector={selectedSector}
          onSectorChange={handleSectorChange}
          label="Choose a sector"
        />
        {/* Live data status (Perplexity) */}
        <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
          {ppxlLoading && (
            <div>
              <span className="api-status">Fetching live data…</span>
            </div>
          )}
          {!ppxlLoading && ppxlError && (
            <span
              className="api-status"
              style={{ color: '#ef4444' }}
            >
              Live data error
            </span>
          )}
          {!ppxlLoading && !ppxlError && ppxlData && (
            <span className="api-status">
              Live data ready
              {typeof ppxlData === 'object' &&
              ppxlData?.sector_etf?.ticker
                ? ` (ETF: ${ppxlData.sector_etf.ticker})`
                : ''}
            </span>
          )}
        </div>
      </div>

      {/* Main grid */}
      <section
        className="dashboard-grid"
        aria-label="Dashboard content"
      >
        <SectionCard
          title={`${shaped.displayNames[selectedSector]} Sector Undervalued Opportunities`}
          className="section-card--extra-pad"
        >
          <UndervaluedOpportunities
            sectorKey={selectedSector}
            liveData={ppxlData}
            loading={ppxlLoading}
            error={ppxlError}
          />
        </SectionCard>
        {/* Sector Overview card: chart + sort control */}
        <SectionCard
          title={`${shaped.displayNames[selectedSector]} Sector Overview`}
          hideHeader
        >
          <div className="card-row">
            <div className="card-col full">
              <SectorChart
                stockData={sortedStockData}
                sectorMean={sectorMean}
                sectorPE={sectorPE}
                sectorPB={sectorPB}
                selectedSector={selectedSector}
                displayName={shaped.displayNames[selectedSector]}
                liveData={ppxlData}
                loading={ppxlLoading}
                error={ppxlError}
              />
            </div>
          </div>

          <div className="chart-footer">
            <SortDropdown
              value={sortMode}
              onChange={setSortMode}
              label="Sort by"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Complete Sector Breakdown"
          className="section-card--extra-pad"
        >
          <SectorBreakdownTable
            sectorKey={selectedSector}
            liveData={ppxlData}
            loading={ppxlLoading}
            error={ppxlError}
          />
        </SectionCard>
      </section>

      {/* Loader overlay (fixed, covers the page) */}
      <SeedLoader
        visible={ppxlLoading}
        headline={`Growing Insights for ${shaped.displayNames[selectedSector]} Sector...`}
        sublines={[
          'Asking Perplexity AI to reconcile filings & news',
          'Spotting miss-pricing as the market moves',
          'Re-ranking by risk/reward, catalysts & liquidity',
          'Scanning companies for undervaluation signals',
          'Cross-checking balance sheets and cash flows',
          'Ranking opportunities by risk',
          'Highlighting catalysts that can unlock value',
          'Filtering for liquidity and tradability',
        ]}
      />
    </div>
  );
}

export default Dashboard;
