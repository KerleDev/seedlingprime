// src/components/SectorDropdown/SectorDropdownData.jsx
import { useMemo } from "react";
import SectorDropdown from "./SectorDropdown";
import newSectorData from "../../utils/sectorData"
function buildSectorsMap(data) {
  const sectorsObj = data?.sectors ?? {};
  const out = {};

  for (const [key, val] of Object.entries(sectorsObj)) {
    if (!val || typeof val !== "object") continue;
    if (!("sector_name" in val)) continue;

    // Use the human-readable sector_name instead of the raw key
    const prettyKey = val.sector_name
      .replace(/ Sector$/i, "")        // strip trailing "Sector"
      .replace(/_/g, " ")              // replace underscores with spaces
      .trim();

    const tickers = Object.keys(val.stocks ?? {});
    out[prettyKey.toLowerCase()] = tickers; // keep lowercase for consistency
  }

  return out;
}

export default function SectorDropdownData({
  selectedSector,
  onSectorChange,
  label,
}) {
  const SECTORS = useMemo(() => buildSectorsMap(newSectorData), []);

  return (
    <SectorDropdown
      sectors={SECTORS}
      selectedSector={selectedSector}
      onChange={onSectorChange}
      label={label}
    />
  );
}

export { buildSectorsMap };
