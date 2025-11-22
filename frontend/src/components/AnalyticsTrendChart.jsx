// ----- IMPORTS -----

import React, { useState } from "react";

// ----- HELPERS -----

// Pluralize helper (0 or 1 → singular, >1 → plural)
const pluralize = (n, singular, plural) => (Number(n) <= 1 ? singular : plural);

// ----- LINE CHART COMPONENT (Internal) -----

// Generic line chart for booking count data with adaptive Y-axis scaling
const LineChart = ({
  data,
  height = 220,
  stroke = "#2563eb",
  yLabel = "Bookings",
  tooltipLabel = "booking",
  tooltipFormatter,
  year,
  month,
}) => {
  const values = data.map((d) => d.count);
  const rawMax = values.length ? Math.max(...values) : 0;

  // New adaptive ceiling: next multiple of 5 (min 5)
  const niceCeiling = (() => {
    if (rawMax <= 5) return 5;
    return Math.ceil(rawMax / 5) * 5;
  })();

  const w = 600,
    h = height;
  const margin = { top: 16, right: 16, bottom: 40, left: 56 };
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;
  const dayCount = data.length;
  const xStep = dayCount > 1 ? innerW / (dayCount - 1) : 0;

  // Build polyline
  const pointsAttr = data
    .map((d, i) => {
      const x = margin.left + i * xStep;
      const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
      return `${x},${y}`;
    })
    .join(" ");

  // Y-axis ticks every 5
  const yTicks = [];
  for (let v = 0; v <= niceCeiling; v += 5) yTicks.push(v);

  // Tooltip state
  const [tip, setTip] = useState(null);

  // Handle mouse movement for tooltip positioning
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - margin.left;
    if (relX < 0 || relX > innerW) return setTip(null);
    const idx = Math.round(relX / xStep);
    const i = Math.min(Math.max(idx, 0), dayCount - 1);
    const d = data[i];
    const x = margin.left + i * xStep;
    const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
    setTip({ day: d.day, count: Number(d.count), extra: d.extra, x, y, left: x + 8, top: y - 8 });
  };

  // Helper: get weekday short label (Mon, Tue, ...)
  const getWeekday = (dayNum) => {
    if (!year || !month) return "";
    const dt = new Date(Number(year), Number(month) - 1, dayNum);
    return dt.toLocaleDateString(undefined, { weekday: "short" }); // e.g. 'Mon'
  };

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg width={w} height={h} onMouseMove={handleMove} onMouseLeave={() => setTip(null)}>
        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={h - margin.bottom}
          stroke="#ccc"
        />
        {/* X-axis */}
        <line
          x1={margin.left}
          y1={h - margin.bottom}
          x2={w - margin.right}
          y2={h - margin.bottom}
          stroke="#ccc"
        />

        {/* Y ticks */}
        {yTicks.map((t) => {
          const yPos = margin.top + innerH - (t / niceCeiling) * innerH;
          return (
            <g key={t}>
              <line x1={margin.left - 6} x2={margin.left} y1={yPos} y2={yPos} stroke="#666" />
              <text x={margin.left - 10} y={yPos + 4} fontSize="11" textAnchor="end" fill="#555">
                {t}
              </text>
              {t !== 0 && t !== niceCeiling && (
                <line x1={margin.left} x2={w - margin.right} y1={yPos} y2={yPos} stroke="#eee" />
              )}
            </g>
          );
        })}

        {/* X ticks */}
        {data.map((d, i) => {
          const x = margin.left + i * xStep;
          const weekday = getWeekday(d.day);
          return (
            <g key={d.day}>
              <line x1={x} x2={x} y1={h - margin.bottom} y2={h - margin.bottom + 6} stroke="#666" />
              <text x={x} y={h - margin.bottom + 18} fontSize="11" textAnchor="middle" fill="#555">
                {d.day}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={margin.left + innerW / 2} y={h - 8} fontSize="12" textAnchor="middle" fill="#444">
          Day of Month
        </text>
        <text
          x={18}
          y={margin.top + innerH / 2}
          fontSize="12"
          textAnchor="middle"
          fill="#444"
          transform={`rotate(-90,18,${margin.top + innerH / 2})`}
        >
          {yLabel}
        </text>

        {/* Line + points */}
        <polyline fill="none" stroke={stroke} strokeWidth="2" points={pointsAttr} />
        {data.map((d, i) => {
          const x = margin.left + i * xStep;
          const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
          return <circle key={i} cx={x} cy={y} r={3} fill={stroke} />;
        })}

        {tip && (
          <line
            x1={tip.x}
            x2={tip.x}
            y1={margin.top}
            y2={h - margin.bottom}
            stroke="#999"
            strokeDasharray="3 3"
          />
        )}
      </svg>
      {/* Tooltip */}
      {tip && (
        <div
          style={{
            position: "absolute",
            left: tip.left,
            top: tip.top,
            background: "#fff",
            border: "1px solid #ddd",
            padding: "4px 8px",
            fontSize: 12,
            borderRadius: 4,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {`Day ${tip.day} (${getWeekday(tip.day)}): ${tip.count} ${pluralize(tip.count, "booking", "bookings")}`}
        </div>
      )}
    </div>
  );
};

// ----- TREND CHART COMPONENT -----

export function AnalyticsTrendChart({ data, year, month }) {
  return data?.length ? (
    <LineChart data={data} yLabel="Bookings" tooltipLabel="booking" year={year} month={month} />
  ) : (
    <div className="text-muted">No data</div>
  );
}
