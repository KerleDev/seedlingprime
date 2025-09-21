// src/components/SectorDropdown/SectorDropdownData.jsx
import { useMemo } from 'react';
import SectorDropdown from './SectorDropdown';
import newSectorData from '../../utils/sectorDataNew';
function buildSectorsMap(data) {
  const sectorsObj = data?.sectors ?? {};
  const out = {};

  for (const [key, val] of Object.entries(sectorsObj)) {
    if (!val || typeof val !== 'object') continue;
    if (!('sector_name' in val)) continue;
    const tickers = Object.keys(val.stocks ?? {});
    // IMPORTANT: Keep RAW sector key so selection maps to shaped.sectors
    out[key] = tickers;
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
