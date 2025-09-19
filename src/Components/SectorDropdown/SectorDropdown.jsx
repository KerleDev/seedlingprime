import { useEffect, useRef, useState } from "react";
import "./SectorDropdown.css";

export default function SectorDropdown({
  sectors,                 // { technology: [...], finance: [...], ... }
  selectedSector,          // "technology"
  onChange,                // (sector: string) => void
  label = "Select sector", // for a11y
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const sectorKeys = Object.keys(sectors ?? {});
  const pretty = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // close on click outside
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // simple keyboard support inside menu
  const [focusIdx, setFocusIdx] = useState(
    Math.max(0, sectorKeys.indexOf(selectedSector))
  );
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => (i + 1) % sectorKeys.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => (i - 1 + sectorKeys.length) % sectorKeys.length);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const chosen = sectorKeys[focusIdx];
        onChange?.(chosen);
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, focusIdx, sectorKeys, onChange]);

  const count = sectors[selectedSector]?.length ?? 0;

  return (
    <section className="sector-selection">
      <div className="dropdown-container">
        <button
          ref={btnRef}
          type="button"
          className="dropdown-trigger"
          aria-label={label}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="sector-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sector-label">{pretty(selectedSector)}</span>
          <span className="stock-count">({count} leading stocks)</span>
          <svg
            className={`dropdown-arrow ${open ? "open" : ""}`}
            width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"
          >
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>

        {open && (
          <div
            ref={menuRef}
            id="sector-menu"
            role="listbox"
            className="dropdown-menu"
            aria-activedescendant={`option-${sectorKeys[focusIdx]}`}
          >
            {sectorKeys.map((sector, idx) => {
              const active = selectedSector === sector;
              const c = sectors[sector]?.length ?? 0;
              return (
                <button
                  key={sector}
                  id={`option-${sector}`}
                  role="option"
                  aria-selected={active}
                  className={`dropdown-item ${active ? "active" : ""} ${idx === focusIdx ? "focused" : ""}`}
                  onMouseEnter={() => setFocusIdx(idx)}
                  onClick={() => { onChange?.(sector); setOpen(false); btnRef.current?.focus(); }}
                >
                  <span className="sector-label">{pretty(sector)}</span>
                  <span className="stock-count">({c} stocks)</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
