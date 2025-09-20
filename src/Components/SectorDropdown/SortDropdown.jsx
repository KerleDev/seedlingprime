import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./SortDropdown.css";

const OPTIONS = [
  { value: "asc",      label: "Price ↑" },
  { value: "desc",     label: "Price ↓" },
  { value: "distance", label: "Distance from mean" },
  { value: "symbol",   label: "Symbol (A→Z)" },
];

export default function SortDropdown({ value, onChange, label = "Sort by" }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom"); // "bottom" | "top"
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const current = OPTIONS.find(o => o.value === value) || OPTIONS[0];

  // סגירה בלחיצה בחוץ
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!btnRef.current || !menuRef.current) return;
      if (
        !btnRef.current.contains(e.target) &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // קביעת כיוון פתיחה אוטומטי (למעלה/למטה)
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuHeight = 220; // אומדן סביר; ה־CSS גם מגביל max-height
    setPlacement(spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? "bottom" : "top");
  }, [open]);

  // עדכון במצב resize/scroll
  useEffect(() => {
    if (!open) return;
    const onRecalc = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 220;
      setPlacement(spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? "bottom" : "top");
    };
    window.addEventListener("resize", onRecalc);
    window.addEventListener("scroll", onRecalc, true);
    return () => {
      window.removeEventListener("resize", onRecalc);
      window.removeEventListener("scroll", onRecalc, true);
    };
  }, [open]);

  return (
    <div className="sortdd-root" data-open={open ? "true" : "false"}>
      <span className="sortdd-label">{label}</span>

      <button
        ref={btnRef}
        type="button"
        className="sortdd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="sortdd-menu"
        onClick={() => setOpen(v => !v)}
      >
        <span className="sortdd-trigger-text">{current.label}</span>
        <svg className={`sortdd-arrow ${open ? "open" : ""}`} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          id="sortdd-menu"
          role="listbox"
          className={`sortdd-menu sortdd-menu--${placement}`}
        >
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={`sortdd-item ${value === opt.value ? "active" : ""}`}
              onClick={() => {
                onChange?.(opt.value);
                setOpen(false);
                btnRef.current?.focus();
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
