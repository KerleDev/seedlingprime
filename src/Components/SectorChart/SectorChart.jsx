import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './SectorChart.css';
import { useMemo } from 'react';

// Custom tick: highlights the sector mean on the Y axis in red
const CustomYAxisTick = ({ x, y, payload, sectorMean }) => {
  const isHighlighted = payload?.value === Math.round(sectorMean);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill={isHighlighted ? '#ef4444' : '#6b7280'}
        fontSize={13}
        fontWeight={isHighlighted ? 600 : 400}
      >
        ${payload?.value?.toLocaleString?.('en-US') ?? payload?.value}
      </text>
    </g>
  );
};

// Small formatters for nice values
const fmtUSD = (v) =>
  Number.isFinite(v)
    ? `$${Math.round(v).toLocaleString('en-US')}`
    : '—';
const fmt1 = (v) => (Number.isFinite(v) ? Number(v).toFixed(1) : '—');

/**
 * Props:
 * - stockData: [{symbol, name, currentPrice, pe, pb}, ...]
 * - sectorMean: number
 * - sectorPE: number
 * - sectorPB: number
 * - selectedSector: string
 * - displayName?: string (optional nicer name from transform)
 * - avgDeltaPct30d?: number | null  (optional delta for hero chip, e.g., 1.8)
 */
export default function SectorChart({
  stockData = [],
  sectorMean = 0,
  sectorPE = 0,
  sectorPB = 0,
  selectedSector = '',
  displayName,
  avgDeltaPct30d = null, // optional; shows a green/red chip if provided
  liveData = null,
  loading: _loading = false,
  error: _error = '',
}) {
  const sectorDisplayName =
    displayName ||
    (selectedSector
      ? selectedSector.charAt(0).toUpperCase() +
        selectedSector.slice(1)
      : 'Sector');

  // Enhanced metrics from live data
  const enhancedMetrics = useMemo(() => {
    if (
      !liveData ||
      !liveData.stocks ||
      !Array.isArray(liveData.stocks)
    ) {
      return {
        liveStockCount: 0,
        liveSectorMean: sectorMean,
        liveSectorPE: sectorPE,
        liveSectorPB: sectorPB,
      };
    }

    const liveStocks = liveData.stocks.filter(
      (stock) =>
        stock && typeof stock.price === 'number' && stock.price > 0
    );

    if (liveStocks.length === 0) {
      return {
        liveStockCount: 0,
        liveSectorMean: sectorMean,
        liveSectorPE: sectorPE,
        liveSectorPB: sectorPB,
      };
    }

    const liveMean =
      liveStocks.reduce((sum, stock) => sum + stock.price, 0) /
      liveStocks.length;

    const validPE = liveStocks.filter(
      (s) => s.pe_ratio && s.pe_ratio > 0
    );
    const livePE =
      validPE.length > 0
        ? validPE.reduce((sum, s) => sum + s.pe_ratio, 0) /
          validPE.length
        : sectorPE;

    const validPB = liveStocks.filter(
      (s) => s.pb_ratio && s.pb_ratio > 0
    );
    const livePB =
      validPB.length > 0
        ? validPB.reduce((sum, s) => sum + s.pb_ratio, 0) /
          validPB.length
        : sectorPB;

    return {
      liveStockCount: liveStocks.length,
      liveSectorMean: liveMean,
      liveSectorPE: livePE,
      liveSectorPB: livePB,
    };
  }, [liveData, sectorMean, sectorPE, sectorPB]);

  // Use live data metrics if available, otherwise fall back to static data
  const displayMean =
    enhancedMetrics.liveStockCount > 0
      ? enhancedMetrics.liveSectorMean
      : sectorMean;
  const displayPE =
    enhancedMetrics.liveStockCount > 0
      ? enhancedMetrics.liveSectorPE
      : sectorPE;
  const displayPB =
    enhancedMetrics.liveStockCount > 0
      ? enhancedMetrics.liveSectorPB
      : sectorPB;
  const displayStockCount =
    enhancedMetrics.liveStockCount > 0
      ? enhancedMetrics.liveStockCount
      : (stockData?.length ?? 0);

  // Build safe ticks including sector mean
  const ticks = (() => {
    if (!stockData.length) return [];
    const prices = stockData.map((s) => Number(s.currentPrice ?? 0));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = min === max ? 10 : Math.round((max - min) * 0.1);
    const lo = min - pad;
    const hi = max + pad;
    const step = (hi - lo) / 5;
    const regular = [...Array(6)].map((_, i) =>
      Math.round(lo + step * i)
    );
    const all = [...regular, Math.round(displayMean)].sort(
      (a, b) => a - b
    );
    return [...new Set(all)];
  })();

  // Optional delta chip state
  const showDelta =
    Number.isFinite(avgDeltaPct30d) && avgDeltaPct30d !== 0;
  const deltaClass =
    avgDeltaPct30d > 0
      ? 'stat-delta up'
      : avgDeltaPct30d < 0
        ? 'stat-delta down'
        : 'stat-delta';

  return (
    <section className="chart-section">
      {/* Centered header ABOVE the band */}
      <div className="chart-header">
        <h2 className="chart-title">
          {sectorDisplayName} Sector Overview
        </h2>
      </div>

      {/* === V6: HERO + TRIO KPI BAND === */}
      <div className="chart-topband">
        <div className="kpi-grid">
          {/* HERO: Avg Price */}
          <div
            className="big"
            role="group"
            aria-label="Average price"
          >
            <div className="stat-label">
              Avg Price {enhancedMetrics.liveStockCount > 0 && <span style={{fontSize: '10px', color: '#10b981'}}>●LIVE</span>}
            </div>
            <div className="stat-value">{fmtUSD(displayMean)}</div>
            {showDelta && (
              <div className={deltaClass}>
                {Math.abs(avgDeltaPct30d).toFixed(1)}% vs 30d
              </div>
            )}
          </div>

          {/* TRIO */}
          <div
            className="small"
            role="group"
            aria-label="Sector P/E"
          >
            <div className="stat-label">
              Sector P/E {enhancedMetrics.liveStockCount > 0 && <span style={{fontSize: '10px', color: '#10b981'}}>●LIVE</span>}
            </div>
            <div className="stat-value">{fmt1(displayPE)}</div>
          </div>

          <div
            className="small"
            role="group"
            aria-label="Sector P/B"
          >
            <div className="stat-label">
              Sector P/B {enhancedMetrics.liveStockCount > 0 && <span style={{fontSize: '10px', color: '#10b981'}}>●LIVE</span>}
            </div>
            <div className="stat-value">{fmt1(displayPB)}</div>
          </div>

          <div
            className="small"
            role="group"
            aria-label="Total stocks"
          >
            <div className="stat-label">
              Total Stocks {enhancedMetrics.liveStockCount > 0 && <span style={{fontSize: '10px', color: '#10b981'}}>●LIVE</span>}
            </div>
            <div className="stat-value">{displayStockCount}</div>
          </div>
        </div>
      </div>
      {/* === /V6 band === */}

      <div className="chart-wrapper">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={stockData}
            margin={{ top: 40, right: 40, left: 40, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="1 1"
              stroke="#e5e7eb"
              horizontal
              vertical={false}
            />
            <XAxis
              dataKey="symbol"
              fontSize={13}
              fontWeight={500}
              color="#6b7280"
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={60}
              ticks={ticks}
              tick={(props) => (
                <CustomYAxisTick
                  {...props}
                  sectorMean={displayMean}
                />
              )}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, 'Stock Price']}
              labelFormatter={(label) => {
                const stock = stockData.find(
                  (s) => s.symbol === label
                );
                return stock ? `${stock.name} (${label})` : label;
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '500',
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="none"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            />
            <ReferenceLine
              y={displayMean}
              stroke="#ef4444"
              strokeDasharray="8 8"
              strokeWidth={2}
            />
            <Bar
              dataKey="currentPrice"
              name="Stock Price ($)"
              radius={[10, 10, 2, 2]}
              stroke="none"
            >
              {stockData.map((entry, index) => {
                const price = Number(entry.currentPrice ?? 0);
                const below = price < displayMean;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={below ? '#65A30D' : '#181743'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
