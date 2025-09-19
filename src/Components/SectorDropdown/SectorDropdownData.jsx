import SectorDropdown from "./SectorDropdown";

// centralize sectors data here (can later be fetched/derived)
const SECTORS = {
  technology: ["MSFT", "AAPL", "NVDA"],
  finance: ["JPM", "BAC", "C"],
  healthcare: ["PFE", "JNJ", "ABBV", "MRK"],
  energy: ["XOM", "CVX"],
};

export default function SectorDropdownData({ selectedSector, onSectorChange, label }) {
  return (
    <SectorDropdown
      sectors={SECTORS}
      selectedSector={selectedSector}
      onChange={onSectorChange}
      label={label}
    />
  );
}

// (optional) export for others if needed
export { SECTORS };
