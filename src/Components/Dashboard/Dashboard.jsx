import React, { useMemo, useState, useCallback } from "react";
import SectionCard from "../Sectioncard/Sectioncard";
import SectorDropdownData from "../SectorDropdown/SectorDropdownData";
import SortDropdown from "../SectorDropdown/SortDropdown";
import SectorChart from "../SectorChart/SectorChart";
import UndervaluedOpportunities from "../Undervalued/UndervaluedOpportunities";
import SectorBreakdownTable from "../SectorBreakdown/SectorBreakdownTable";

import "./Dashboard.css";

// Data / utils
import newSectorData from "../../utils/sectorDataNew";
import { shapeSectorsFromReport } from "../../utils/sectorTransform";
import { sectorMetrics } from "../../utils/metrics";

// Prepare once (pure transform)
const shaped = shapeSectorsFromReport(newSectorData); // { sectors, displayNames, etf }

function Dashboard() {
  // Default to "technology" if exists, otherwise first sector key (or empty)
  const defaultKey =
    (shaped?.sectors?.technology
      ? "technology"
      : Object.keys(shaped?.sectors || {})[0]) || "";

  const [selectedSector, setSelectedSector] = useState(defaultKey);
  const [sortMode, setSortMode] = useState("asc"); // "asc" | "desc" | "distance" | "symbol"

  // Handle sector changes coming from the dropdown
  const handleSectorChange = useCallback((key) => {
    setSelectedSector(key);
  }, []);

  // Derive the table for the chosen sector
  const stockData = useMemo(
    () => shaped?.sectors?.[selectedSector] || [],
    [selectedSector]
  );

  // Compute metrics (mean price, avg P/E, avg P/B)
  const { sectorMean, sectorPE, sectorPB } = useMemo(
    () => sectorMetrics(stockData),
    [stockData]
  );

  // Sorted data for the chart based on current sort mode
  const sortedStockData = useMemo(() => {
    const arr = [...stockData];
    switch (sortMode) {
      case "asc": // price low → high
        return arr.sort(
          (a, b) =>
            (a.currentPrice ?? 0) - (b.currentPrice ?? 0) ||
            a.symbol.localeCompare(b.symbol)
        );
      case "desc": // price high → low
        return arr.sort(
          (a, b) =>
            (b.currentPrice ?? 0) - (a.currentPrice ?? 0) ||
            a.symbol.localeCompare(b.symbol)
        );
      case "distance": // distance from mean (closest → farthest)
        return arr.sort((a, b) => {
          const da = Math.abs((a.currentPrice ?? 0) - sectorMean);
          const db = Math.abs((b.currentPrice ?? 0) - sectorMean);
          return da - db || a.symbol.localeCompare(b.symbol);
        });
      case "symbol": // alphabetical by ticker
        return arr.sort((a, b) => a.symbol.localeCompare(b.symbol));
      default:
        return arr;
    }
  }, [stockData, sectorMean, sortMode]);

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
          Analyze undervalued opportunities with advanced AI-powered insights
        </h2>
      </header>

      {/* Top controls */}
      <div
        className="page-controls"
        style={{ display: "flex", gap: 12, alignItems: "center" }}
      >
        <SectorDropdownData
          sectors={shaped.sectors}
          selectedSector={selectedSector}
          onSectorChange={handleSectorChange} // or setSelectedSector if the API matches
          label="Choose a sector"
        />
      </div>

      <SectionCard
        title={`${shaped.displayNames[selectedSector]} Sector Undervalued Opportunities`}
      >
        <UndervaluedOpportunities sectorKey={selectedSector} />
      </SectionCard>

      {/* Main grid (do NOT use <main> here because Layout already has one) */}
      <section className="dashboard-grid" aria-label="Dashboard content">
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
          <SectorBreakdownTable sectorKey={selectedSector} />
        </SectionCard>
      </section>
    </div>
  );
}

export default Dashboard;
