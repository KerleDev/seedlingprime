// src/pages/Dashboard/Dashboard.jsx
import React, { useMemo, useState } from "react";
import TopBar from "../Topbar/Topbar";
import SectionCard from "../Sectioncard/Sectioncard";
import SectorDropdownData from "../SectorDropdown/SectorDropdownData";
import SortDropdown from "../SectorDropdown/SortDropdown";
import Footer from "../Footer/Footer";
import "./Dashboard.css";

// Data / utils
import newSectorData from "../../utils/sectorData"; 
import { shapeSectorsFromReport } from "../../utils/sectorTransform";
import { sectorMetrics } from "../../utils/metrics";
import SectorChart from "../SectorChart/SectorChart";

// Prepare once (pure transform)
const shaped = shapeSectorsFromReport(newSectorData); // { sectors, displayNames, etf }

function Dashboard() {
  // default to first available sector if "technology" isn't in data
  const defaultKey =
    (shaped.sectors.technology ? "technology" : Object.keys(shaped.sectors)[0]) || "";

  const [selectedSector, setSelectedSector] = useState(defaultKey);

  // --- NEW: sorting state (user-facing control) ---
  const [sortMode, setSortMode] = useState("asc"); // "asc" | "desc" | "distance" | "symbol"

  // Derive the table for the chosen sector
  const stockData = useMemo(
    () => shaped.sectors[selectedSector] || [],
    [selectedSector]
  );

  // Compute metrics
  const { sectorMean, sectorPE, sectorPB } = useMemo(
    () => sectorMetrics(stockData),
    [stockData]
  );

  // --- NEW: sorted data for the chart ---
  const sortedStockData = useMemo(() => {
    const arr = [...stockData]; // don't mutate original
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

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-hero">
          <h1 className="page-title">Your Investment Dashboard</h1>
          <h2 className="page-subtitle">
            Analyze undervalued opportunities with advanced AI-powered insights
          </h2>
        </div>
      </header>

      {/* Top controls */}
      <div className="page-controls" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <SectorDropdownData
          sectors={shaped.sectors}
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
          label="Choose a sector"
        />
      </div>

      <main className="dashboard-grid" role="main">
        {/* Hide SectionCard header here (we show the chart's internal header) */}
        <SectionCard
          title={`${shaped.displayNames[selectedSector]} Sector Overview`}
          hideHeader
        >
          <div className="card-row">
            <div className="card-col full">
              <SectorChart
                stockData={sortedStockData}      // ← use sorted data
                sectorMean={sectorMean}
                sectorPE={sectorPE}
                sectorPB={sectorPB}
                selectedSector={selectedSector}
                displayName={shaped.displayNames[selectedSector]}
              /></div></div>
              <div className="chart-footer">
              <SortDropdown
                value={sortMode}
                onChange={setSortMode}
                label="Sort by"
              />
            </div>
              </SectionCard>
              
        <SectionCard title="Undervalued Opportunities">
          {/* ... */}
        </SectionCard>

        <SectionCard title="Complete Sector Breakdown">
          {/* ... */}
        </SectionCard>
      </main>
    </div>
  );
}

export default Dashboard;
