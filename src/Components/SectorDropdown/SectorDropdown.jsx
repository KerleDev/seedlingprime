import { useEffect, useRef, useState } from "react";
import "./SectorDropdown.css";

export default function SectorDropdown({
  sectors = {},             // { technology: [...], finance: [...], ... }
  selectedSector,           // "technology"
  onChange,                 // (sector: string) => void
  label = "Select sector",  // for a11y
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef({});

  const sectorKeys = Object.keys(sectors);


  useEffect(() => {
    if (!sectorKeys.length) return;
    const isValid = selectedSector && sectorKeys.includes(selectedSector);
    if (!isValid) {
      const first = sectorKeys[0];
      onChange?.(first);
    }
  }, [selectedSector, sectorKeys, onChange]);

  const currentSector =
    (selectedSector && sectorKeys.includes(selectedSector) && selectedSector) ||
    sectorKeys[0] ||
    "";

  const pretty = (s) => {
    if (!s) return "Choose sector";
    // Replace underscores with spaces and title-case each word
    return s
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // close on click outside
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // keyboard support
  const [focusIdx, setFocusIdx] = useState(
    Math.max(0, sectorKeys.indexOf(currentSector))
  );

  useEffect(() => {
    if (!open || !sectorKeys.length) return;
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

  useEffect(() => {
    if (open && sectorKeys[focusIdx]) {
      const el = itemRefs.current[sectorKeys[focusIdx]];
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open, focusIdx, sectorKeys]);

  const count = sectors[currentSector]?.length ?? 0;

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
          disabled={!sectorKeys.length}
        >
          <span className="sector-label">{pretty(currentSector)}</span>
          {sectorKeys.length > 0 && (
            <span className="stock-count">({count} stocks)</span>
          )}
          <svg
            className={`dropdown-arrow ${open ? "open" : ""}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>

        {open && sectorKeys.length > 0 && (
          <div
            ref={menuRef}
            id="sector-menu"
            role="listbox"
            className="dropdown-menu"
            aria-activedescendant={`option-${sectorKeys[focusIdx]}`}
          >
            {sectorKeys.map((sector, idx) => {
              const active = currentSector === sector;
              const c = sectors[sector]?.length ?? 0;
              return (
                <button
                  key={sector}
                  id={`option-${sector}`}
                  role="option"
                  aria-selected={active}
                  className={`dropdown-item ${active ? "active" : ""} ${
                    idx === focusIdx ? "focused" : ""
                  }`}
                  ref={(el) => (itemRefs.current[sector] = el)}
                  onMouseEnter={() => setFocusIdx(idx)}
                  onClick={() => {
                    onChange?.(sector);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
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
