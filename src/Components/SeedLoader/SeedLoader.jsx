import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, useAnimation } from "framer-motion";
import "./SeedLoader.css";

export default function SeedLoader({
  visible = true,
  headline = "Growing undervalued ideas…",
  sublines = [
    "Asking Perplexity AI to reconcile filings & news",
    "Spotting miss-pricing as the market moves",
    "Re-ranking by risk/reward, catalysts & liquidity",
    "Scanning companies for undervaluation signals",
    "Cross-checking balance sheets and cash flows",
    "Ranking opportunities by risk",
    "Highlighting catalysts that can unlock value",
    "Filtering for liquidity and tradability",
  ],
  backdrop = true,
  onCancel,
}) {
  const shouldReduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const phrases = useMemo(
    () => (sublines?.length ? sublines : ["Loading…"]),
    [sublines]
  );

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 2400);
    return () => clearInterval(t);
  }, [visible, phrases.length]);

  useEffect(() => {
    if (!visible) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seed-loader-heading"
      aria-describedby="seed-loader-subline"
      className={"seedloader-overlay " + (backdrop ? "with-backdrop" : "")}
    >
      <div className="seedloader-container">
        <div className="seedloader-card">
          <div className="seedloader-glow" aria-hidden />
          <div className="seedloader-content">
            <div className="seedloader-header">
              <div className="seedloader-texts">
                <h2 id="seed-loader-heading" className="seedloader-headline">
                  {headline}
                </h2>
                <RotatingSubline
                  id="seed-loader-subline"
                  phrases={phrases}
                  idx={idx}
                />
              </div>

              <PlantAnimation reduced={shouldReduce} />
            </div>

            <ProgressBar reduced={shouldReduce} />

            <div className="seedloader-footer">
              <p className="seedloader-tip">
                Fresh results will plant themselves into your dashboard
                automatically.<br/> Need them faster? Upgrade to Pro!
              </p>
              {onCancel && (
                <button onClick={onCancel} className="seedloader-cancel">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RotatingSubline({ id, phrases, idx }) {
  return (
    <div className="seedloader-subline-wrapper">
      <motion.p
        key={idx}
        id={id}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="seedloader-subline"
      >
        {phrases[idx]}
      </motion.p>
    </div>
  );
}

function ProgressBar({ reduced }) {
  if (reduced) {
    return (
      <div className="seedloader-progress">
        <div className="seedloader-progress-bar pulse" />
      </div>
    );
  }
  return (
    <div className="seedloader-progress">
      <div className="seedloader-progress-bar gradient" />
    </div>
  );
}

/* ============================
   Plant Animation (sequenced)
   ============================ */
function PlantAnimation({ reduced }) {
  const D = 10.0; // overall timeline reference (seconds)

  // SVG geometry
  const cx = 56; // center x
  const groundY = 72; // ground shadow y
  const seedY = 60; // resting seed center y

  // Motion controllers (step-by-step sequencing)
  const shadow = useAnimation();
  const seed = useAnimation();
  const seedHi = useAnimation();
  const plant = useAnimation(); // group sway

  // Stems
  const stem1 = useAnimation();
  const stem2 = useAnimation();
  const stem3 = useAnimation();

  // Leaves (base, mid, top)
  const baseL = useAnimation();
  const baseR = useAnimation();
  const midL = useAnimation();
  const midR = useAnimation();
  const topL = useAnimation();
  const topR = useAnimation();
  const apex = useAnimation();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;

    async function run() {
      // 1) Set initial states (nothing sprouted)
      shadow.set({ opacity: 0.1, scaleX: 0.85 });
      seed.set({ y: -140, opacity: 1, scaleX: 1, scaleY: 1 });
      seedHi.set({ y: -140, opacity: 0.28 });

      stem1.set({ pathLength: 0, opacity: 0 });
      stem2.set({ pathLength: 0, opacity: 0 });
      stem3.set({ pathLength: 0, opacity: 0 });

      baseL.set({ opacity: 0, scale: 0.9 });
      baseR.set({ opacity: 0, scale: 0.9 });
      midL.set({ opacity: 0, scale: 0.92 });
      midR.set({ opacity: 0, scale: 0.92 });
      topL.set({ opacity: 0, scale: 0.94 });
      topR.set({ opacity: 0, scale: 0.94 });
      apex.set({ opacity: 0, scale: 0.9 });

      plant.set({ rotate: 0 });

      // 2) FAST FALL (2x speed), bounce, settle
      await Promise.all([
        seed.start({ y: 0, transition: { duration: 0.55, ease: "easeOut" } }),
        seedHi.start({ y: 0, transition: { duration: 0.55, ease: "easeOut" } }),
        shadow.start({
          scaleX: 1.05,
          opacity: 0.2,
          transition: { duration: 0.55, ease: "easeOut" },
        }),
      ]);
      if (cancelled) return;

      // quick bounce
      await Promise.all([
        seed.start({
          y: -6,
          scaleX: 1.06,
          scaleY: 0.9,
          transition: { duration: 0.1, ease: "easeOut" },
        }),
        seedHi.start({ y: -6, transition: { duration: 0.1, ease: "easeOut" } }),
        shadow.start({
          scaleX: 1.12,
          opacity: 0.24,
          transition: { duration: 0.1, ease: "easeOut" },
        }),
      ]);
      if (cancelled) return;

      // settle
      await Promise.all([
        seed.start({
          y: 0,
          scaleX: 1,
          scaleY: 1,
          transition: { duration: 0.12, ease: "easeOut" },
        }),
        seedHi.start({ y: 0, transition: { duration: 0.12, ease: "easeOut" } }),
        shadow.start({
          scaleX: 0.98,
          opacity: 0.18,
          transition: { duration: 0.12, ease: "easeOut" },
        }),
      ]);
      if (cancelled) return;

      // 3) SPROUT SEQUENCE (only after seed settled)
      await stem1.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeInOut" },
      });
      if (cancelled) return;

      await Promise.all([
        baseL.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.35, ease: "easeOut" },
        }),
        baseR.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.35, ease: "easeOut" },
        }),
      ]);
      if (cancelled) return;

      await stem2.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.55, ease: "easeInOut" },
      });
      if (cancelled) return;

      await Promise.all([
        midL.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.35, ease: "easeOut" },
        }),
        midR.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.35, ease: "easeOut" },
        }),
      ]);
      if (cancelled) return;

      await stem3.start({
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeInOut" },
      });
      if (cancelled) return;

      await Promise.all([
        topL.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.3, ease: "easeOut" },
        }),
        topR.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.3, ease: "easeOut" },
        }),
        apex.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.3, ease: "easeOut" },
        }),
      ]);
      if (cancelled) return;

      // 4) Seed disappears
      await Promise.all([
        seed.start({ opacity: 0, transition: { duration: 0.5 } }),
        seedHi.start({ opacity: 0, transition: { duration: 0.5 } }),
      ]);

      if (cancelled) return;

      // 5) Long gentle sway (runs indefinitely)
      plant.start({
        rotate: [-3.6, 3.6, -3.6],
        transition: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
      });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [
    reduced,
    shadow,
    seed,
    seedHi,
    stem1,
    stem2,
    stem3,
    baseL,
    baseR,
    midL,
    midR,
    topL,
    topR,
    apex,
    plant,
  ]);

  // Reduced motion: static plant
  if (reduced) {
    return (
      <div className="seedloader-plant" aria-hidden>
        <svg width="112" height="96" viewBox="0 0 112 96" fill="none">
          <ellipse
            cx={cx}
            cy={groundY}
            rx="32"
            ry="11"
            fill="#000"
            opacity="0.12"
          />
          <ellipse
            cx={cx}
            cy={seedY}
            rx="6.5"
            ry="8.5"
            fill="#92400E"
            transform={`rotate(-15 ${cx} ${seedY})`}
          />
          <path
            d={`M${cx} ${seedY - 4} C${cx} ${seedY - 12}, ${cx} ${
              seedY - 18
            }, ${cx} ${seedY - 24}`}
            stroke="#065F46"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M${cx} ${seedY - 14} C${cx - 12} ${seedY - 18}, ${cx - 16} ${
              seedY - 24
            }, ${cx - 18} ${seedY - 30} C${cx - 8} ${seedY - 28}, ${cx - 3} ${
              seedY - 24
            }, ${cx} ${seedY - 14} Z`}
            fill="#059669"
          />
          <path
            d={`M${cx} ${seedY - 14} C${cx + 12} ${seedY - 18}, ${cx + 16} ${
              seedY - 24
            }, ${cx + 18} ${seedY - 30} C${cx + 8} ${seedY - 28}, ${cx + 3} ${
              seedY - 24
            }, ${cx} ${seedY - 14} Z`}
            fill="#10B981"
          />
          <path
            d={`M${cx} ${seedY - 24} C${cx} ${seedY - 28}, ${cx} ${
              seedY - 32
            }, ${cx} ${seedY - 36}`}
            stroke="#065F46"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M${cx} ${seedY - 26} C${cx - 10} ${seedY - 30}, ${cx - 13} ${
              seedY - 36
            }, ${cx - 14} ${seedY - 40} C${cx - 6} ${seedY - 38}, ${cx - 2} ${
              seedY - 34
            }, ${cx} ${seedY - 26} Z`}
            fill="#34D399"
          />
          <path
            d={`M${cx} ${seedY - 26} C${cx + 10} ${seedY - 30}, ${cx + 13} ${
              seedY - 36
            }, ${cx + 14} ${seedY - 40} C${cx + 6} ${seedY - 38}, ${cx + 2} ${
              seedY - 34
            }, ${cx} ${seedY - 26} Z`}
            fill="#6EE7B7"
          />
          <path
            d={`M${cx} ${seedY - 36} C${cx} ${seedY - 40}, ${cx} ${
              seedY - 44
            }, ${cx} ${seedY - 48}`}
            stroke="#065F46"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M${cx} ${seedY - 38} C${cx - 9} ${seedY - 42}, ${cx - 11} ${
              seedY - 47
            }, ${cx - 12} ${seedY - 50} C${cx - 5} ${seedY - 49}, ${cx - 2} ${
              seedY - 45
            }, ${cx} ${seedY - 38} Z`}
            fill="#A7F3D0"
          />
          <path
            d={`M${cx} ${seedY - 38} C${cx + 9} ${seedY - 42}, ${cx + 11} ${
              seedY - 47
            }, ${cx + 12} ${seedY - 50} C${cx + 5} ${seedY - 49}, ${cx + 2} ${
              seedY - 45
            }, ${cx} ${seedY - 38} Z`}
            fill="#86EFAC"
          />
          <ellipse cx={cx} cy={seedY - 52} rx="3" ry="5" fill="#BBF7D0" />
        </svg>
      </div>
    );
  }

  // Animated SVG (controlled by the sequence above)
  return (
    <div className="seedloader-plant" aria-hidden>
      <svg
        width="112"
        height="96"
        viewBox="0 0 112 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <motion.ellipse
          animate={shadow}
          cx={cx}
          cy={groundY}
          rx="32"
          ry="11"
          fill="#000"
          opacity="0.12"
        />

        {/* Seed + highlight */}
        <motion.ellipse
          animate={seed}
          cx={cx}
          cy={seedY}
          rx="6.5"
          ry="8.5"
          fill="#92400E"
          transform={`rotate(-15 ${cx} ${seedY})`}
        />
        <motion.ellipse
          animate={seedHi}
          cx={cx - 1.5}
          cy={seedY - 3}
          rx="1.2"
          ry="1.8"
          fill="#fff"
          opacity="0.28"
        />

        {/* Plant group (sways later) */}
        <motion.g
          animate={plant}
          style={{ transformOrigin: `${cx}px ${seedY - 4}px` }}
        >
          {/* Stems */}
          <motion.path
            animate={stem1}
            d={`M${cx} ${seedY - 4} C${cx} ${seedY - 12}, ${cx} ${
              seedY - 18
            }, ${cx} ${seedY - 24}`}
            stroke="#065F46"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <motion.path
            animate={stem2}
            d={`M${cx} ${seedY - 24} C${cx} ${seedY - 28}, ${cx} ${
              seedY - 32
            }, ${cx} ${seedY - 36}`}
            stroke="#065F46"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <motion.path
            animate={stem3}
            d={`M${cx} ${seedY - 36} C${cx} ${seedY - 40}, ${cx} ${
              seedY - 44
            }, ${cx} ${seedY - 48}`}
            stroke="#065F46"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Leaves: base, mid, top, apex */}
          <motion.path
            animate={baseL}
            d={`M${cx} ${seedY - 14}
               C${cx - 12} ${seedY - 18}, ${cx - 16} ${seedY - 24}, ${
              cx - 18
            } ${seedY - 30}
               C${cx - 8} ${seedY - 28}, ${cx - 3} ${seedY - 24}, ${cx} ${
              seedY - 14
            } Z`}
            fill="#059669"
            style={{ transformOrigin: `${cx}px ${seedY - 14}px` }}
          />
          <motion.path
            animate={baseR}
            d={`M${cx} ${seedY - 14}
               C${cx + 12} ${seedY - 18}, ${cx + 16} ${seedY - 24}, ${
              cx + 18
            } ${seedY - 30}
               C${cx + 8} ${seedY - 28}, ${cx + 3} ${seedY - 24}, ${cx} ${
              seedY - 14
            } Z`}
            fill="#10B981"
            style={{ transformOrigin: `${cx}px ${seedY - 14}px` }}
          />

          <motion.path
            animate={midL}
            d={`M${cx} ${seedY - 26}
               C${cx - 10} ${seedY - 30}, ${cx - 13} ${seedY - 36}, ${
              cx - 14
            } ${seedY - 40}
               C${cx - 6} ${seedY - 38}, ${cx - 2} ${seedY - 34}, ${cx} ${
              seedY - 26
            } Z`}
            fill="#34D399"
            style={{ transformOrigin: `${cx}px ${seedY - 26}px` }}
          />
          <motion.path
            animate={midR}
            d={`M${cx} ${seedY - 26}
               C${cx + 10} ${seedY - 30}, ${cx + 13} ${seedY - 36}, ${
              cx + 14
            } ${seedY - 40}
               C${cx + 6} ${seedY - 38}, ${cx + 2} ${seedY - 34}, ${cx} ${
              seedY - 26
            } Z`}
            fill="#6EE7B7"
            style={{ transformOrigin: `${cx}px ${seedY - 26}px` }}
          />

          <motion.path
            animate={topL}
            d={`M${cx} ${seedY - 38}
               C${cx - 9} ${seedY - 42}, ${cx - 11} ${seedY - 47}, ${cx - 12} ${
              seedY - 50
            }
               C${cx - 5} ${seedY - 49}, ${cx - 2} ${seedY - 45}, ${cx} ${
              seedY - 38
            } Z`}
            fill="#A7F3D0"
            style={{ transformOrigin: `${cx}px ${seedY - 38}px` }}
          />
          <motion.path
            animate={topR}
            d={`M${cx} ${seedY - 38}
               C${cx + 9} ${seedY - 42}, ${cx + 11} ${seedY - 47}, ${cx + 12} ${
              seedY - 50
            }
               C${cx + 5} ${seedY - 49}, ${cx + 2} ${seedY - 45}, ${cx} ${
              seedY - 38
            } Z`}
            fill="#86EFAC"
            style={{ transformOrigin: `${cx}px ${seedY - 38}px` }}
          />

          <motion.ellipse
            animate={apex}
            cx={cx}
            cy={seedY - 52}
            rx="3"
            ry="5"
            fill="#BBF7D0"
            style={{ transformOrigin: `${cx}px ${seedY - 52}px` }}
          />
        </motion.g>
      </svg>
    </div>
  );
}
