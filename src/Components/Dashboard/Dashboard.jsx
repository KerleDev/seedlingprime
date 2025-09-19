// src/pages/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import TopBar from '../Topbar/Topbar';
import SectionCard from '../Sectioncard/Sectioncard';
import SectorDropdownData from '../SectorDropdown/SectorDropdownData';
import './Dashboard.css';

function Dashboard() {
  const [selectedSector, setSelectedSector] = useState('technology'); // default

  return (
    <div className="page">
      <header className="page-header">
        <TopBar />
        <div className="page-hero">
          <h1 className="page-title">Your Investment Dashboard</h1>
          <h2 className="page-subtitle">
            Analyze undervalued opportunities with advanced AI-powered
            insights
          </h2>
        </div>
      </header>

      <div className="page-controls">
        <SectorDropdownData
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
          label="Choose a sector"
        />
      </div>

      <main
        className="dashboard-grid"
        role="main"
      >
        <SectionCard title="Sector Overview">...</SectionCard>
        <SectionCard title="Undervalued Opportunities">
          ...
        </SectionCard>
        <SectionCard title="Complete Sector Breakdown">
          ...
        </SectionCard>
      </main>
    </div>
  );
}

export default Dashboard;
