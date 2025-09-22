import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import SectionCard from '../sectionCard/SectionCard';
import SectorDropdownData from '../SectorDropdown/SectorDropdownData';
import SortDropdown from '../SectorDropdown/SortDropdown';
import SectorChart from '../SectorChart/SectorChart';
import UndervaluedOpportunities from '../Undervalued/UndervaluedOpportunities';
import SectorBreakdownTable from '../SectorBreakdown/SectorBreakdownTable';
import './Dashboard.css';

// Data / utils
import newSectorData from '../../utils/sectorDataNew';
import { shapeSectorsFromReport } from '../../utils/sectorTransform';
import { sectorMetrics } from '../../utils/metrics';
import { askPerplexity } from '../../services/perplexityService';
import {
  saveSectorData,
  loadSectorData,
} from '../../services/perplexityCache';

// Prepare once (pure transform)
const shaped = shapeSectorsFromReport(newSectorData); // { sectors, displayNames, etf }

function Dashboard() {
  // Default to "information_technology" if exists, otherwise first sector key (or empty)
  const defaultKey =
    (shaped?.sectors?.information_technology
      ? 'information_technology'
      : Object.keys(shaped?.sectors || {})[0]) || '';

  const [selectedSector, setSelectedSector] = useState(defaultKey);
  const [sortMode, setSortMode] = useState('asc'); // "asc" | "desc" | "distance" | "symbol"
  const [ppxlLoading, setPpxlLoading] = useState(false);
  const [ppxlError, setPpxlError] = useState('');
  const [ppxlData, setPpxlData] = useState(null); // parsed JSON or raw text

  // Handle sector changes coming from the dropdown
  const handleSectorChange = useCallback((key) => {
    setSelectedSector(key);
  }, []);

  // Derive the table for the chosen sector - use live data if available
  const stockData = useMemo(() => {
    // Priority 1: Use live data if available
    if (ppxlData && typeof ppxlData === 'object' && ppxlData.stocks && Array.isArray(ppxlData.stocks)) {
      return ppxlData.stocks.map(stock => ({
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
        currentPrice: stock.price,
        pe: stock.pe_ratio,
        pb: stock.pb_ratio,
        // Add other fields needed for compatibility
        marketCap: stock.market_cap
      }));
    }

    // Priority 2: Fall back to static data
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
      case 'asc': // price low → high
        return arr.sort(
          (a, b) =>
            (a.currentPrice ?? 0) - (b.currentPrice ?? 0) ||
            a.symbol.localeCompare(b.symbol)
        );
      case 'desc': // price high → low
        return arr.sort(
          (a, b) =>
            (b.currentPrice ?? 0) - (a.currentPrice ?? 0) ||
            a.symbol.localeCompare(b.symbol)
        );
      case 'distance': // distance from mean (closest → farthest)
        return arr.sort((a, b) => {
          const da = Math.abs((a.currentPrice ?? 0) - sectorMean);
          const db = Math.abs((b.currentPrice ?? 0) - sectorMean);
          return da - db || a.symbol.localeCompare(b.symbol);
        });
      case 'symbol': // alphabetical by ticker
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
        // Try cache first (3-hour TTL by default inside loadSectorData)
        const cached = loadSectorData(selectedSector);
        if (!cancelled && cached) {
          setPpxlData(cached);
          setPpxlLoading(false);
          return; // skip API call if cache is valid
        }
        const { json, text } = await askPerplexity(selectedSector);
        if (cancelled) return;
        // Prefer JSON, fallback to text
        const payload = json || text || null;
        setPpxlData(payload);
        // Persist for reuse by screening and other services
        saveSectorData(selectedSector, payload);
        // Also log for debugging
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

  // If there are no sectors at all, render a tiny fallback (defensive)
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
        style={{ display: 'flex', gap: 12, alignItems: 'center' }}
      >
        <SectorDropdownData
          sectors={shaped.sectors}
          selectedSector={selectedSector}
          onSectorChange={handleSectorChange} // or setSelectedSector if the API matches
          label="Choose a sector"
        />
        {/* Live data status (Perplexity) */}
        <div
          style={{ marginRight: 8, fontSize: 12, color: '#6b7280' }}
        >
          {ppxlLoading && <span>Fetching live data…</span>}
          {!ppxlLoading && ppxlError && (
            <span style={{ color: '#ef4444' }}>Live data error</span>
          )}
          {!ppxlLoading && !ppxlError && ppxlData && (
            <span>
              Live data ready
              {typeof ppxlData === 'object' &&
              ppxlData?.sector_etf?.ticker
                ? ` (ETF: ${ppxlData.sector_etf.ticker})`
                : ''}
            </span>
          )}
        </div>
      </div>

      <SectionCard
        title={`${shaped.displayNames[selectedSector]} Sector Undervalued Opportunities`}
      >
        <UndervaluedOpportunities
          sectorKey={selectedSector}
          liveData={ppxlData}
          loading={ppxlLoading}
          error={ppxlError}
        />
      </SectionCard>

      {/* Main grid (do NOT use <main> here because Layout already has one) */}
      <section
        className="dashboard-grid"
        aria-label="Dashboard content"
      >
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
        <SectionCard title="Complete Sector Breakdown">
          <SectorBreakdownTable
            sectorKey={selectedSector}
            liveData={ppxlData}
            loading={ppxlLoading}
            error={ppxlError}
          />
        </SectionCard>
      </section>
    </div>
  );
}

export default Dashboard;
