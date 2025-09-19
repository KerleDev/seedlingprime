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
} from "recharts";
import "./SectorChart.css";

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
        fill={isHighlighted ? "#ef4444" : "#6b7280"}
        fontSize={13}
        fontWeight={isHighlighted ? 600 : 400}
      >
        ${payload?.value}
      </text>
    </g>
  );
};

/**
 * Props:
 * - stockData: [{symbol, name, currentPrice, pe, pb}, ...]
 * - sectorMean: number
 * - sectorPE: number
 * - sectorPB: number
 * - selectedSector: string
 * - displayName?: string (optional nicer name from transform)
 */
export default function SectorChart({
  stockData = [],
  sectorMean = 0,
  sectorPE = 0,
  sectorPB = 0,
  selectedSector = "",
  displayName,
}) {
  const sectorDisplayName =
    displayName ||
    (selectedSector
      ? selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1)
      : "Sector");

  // build safe ticks including sector mean
  const ticks = (() => {
    if (!stockData.length) return [];
    const prices = stockData.map((s) => Number(s.currentPrice ?? 0));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = min === max ? 10 : Math.round((max - min) * 0.1);
    const lo = min - pad;
    const hi = max + pad;
    const step = (hi - lo) / 5;
    const regular = [...Array(6)].map((_, i) => Math.round(lo + step * i));
    const all = [...regular, Math.round(sectorMean)].sort((a, b) => a - b);
    return [...new Set(all)];
  })();

  return (
    <section className="chart-section">
      <div className="chart-header">
       <h2 className="chart-title">{sectorDisplayName} Sector Overview</h2>
        <div className="chart-stats">
          <div className="chart-stat">
            <span className="chart-stat-label">Sector Mean</span>
            <span className="chart-stat-value">${sectorMean}</span>
          </div>
          <div className="chart-stat">
            <span className="chart-stat-label">Sector P/E</span>
            <span className="chart-stat-value">{sectorPE}</span>
          </div>
          <div className="chart-stat">
            <span className="chart-stat-label">Sector P/B</span>
            <span className="chart-stat-value">{sectorPB}</span>
          </div>
          <div className="chart-stat">
            <span className="chart-stat-label">Total Stocks</span>
            <span className="chart-stat-value">{stockData.length}</span>
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={450}>
          <BarChart
            data={stockData}
            margin={{ top: 40, right: 40, left: 40, bottom: 60 }}
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
                <CustomYAxisTick {...props} sectorMean={sectorMean} />
              )}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, "Stock Price"]}
              labelFormatter={(label) => {
                const stock = stockData.find((s) => s.symbol === label);
                return stock ? `${stock.name} (${label})` : label;
              }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                fontSize: "14px",
                fontWeight: "500",
              }}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="rect"
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            />
            <ReferenceLine
              y={sectorMean}
              stroke="#ef4444"
              strokeDasharray="8 8"
              strokeWidth={2}
            />
            <Bar
              dataKey="currentPrice"
              name="Stock Price ($)"
              radius={[0, 0, 0, 0]}
              stroke="none"
            >
              {stockData.map((entry, index) => {
                const price = Number(entry.currentPrice ?? 0);
                const below = price < sectorMean;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={below ? "#65A30D" : "#181743"}
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
