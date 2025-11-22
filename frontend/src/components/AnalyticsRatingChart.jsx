// ----- IMPORTS -----

import React, { useState } from "react";

// ----- HELPERS -----

// Pluralize helper (0 or 1 → singular, >1 → plural)
const pluralize = (n, singular, plural) => (Number(n) <= 1 ? singular : plural);

// ----- LINE CHART COMPONENT (Internal) -----

// Generic line chart for rating data (0-5 scale)
const LineChart = ({
  data,
  height = 220,
  stroke = "#10b981",
  yLabel = "Rating",
  tooltipFormatter,
}) => {
  // Preserve nulls (do not coerce to 0)
  const ratedValues = data.filter((d) => d.count != null).map((d) => d.count);
  const hasAnyRatings = ratedValues.length > 0;
  const niceCeiling = 5;
  const w = 600,
    h = height;
  const margin = { top: 16, right: 16, bottom: 40, left: 56 };
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;
  const dayCount = data.length;
  const xStep = dayCount > 1 ? innerW / (dayCount - 1) : 0;
  const yTicks = [0, 1, 2, 3, 4, 5];
  const [tip, setTip] = useState(null);

  // Build segmented polylines (skip null gaps)
  const segments = [];
  let current = [];
  data.forEach((d, i) => {
    if (d.count != null) {
      const x = margin.left + i * xStep;
      const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
      current.push(`${x},${y}`);
    } else if (current.length) {
      segments.push(current);
      current = [];
    }
  });
  if (current.length) segments.push(current);

  // Collect rated indices (days with a non-null rating)
  const ratedIndices = [];
  data.forEach((d, i) => { if (d.count != null) ratedIndices.push(i); });

  // Build dashed segments bridging gaps (non-consecutive rated days)
  const dashedSegments = [];
  ratedIndices.forEach((idx, j) => {
    if (j === 0) return;
    const prevIdx = ratedIndices[j - 1];
    if (idx - prevIdx > 1) {
      const prevX = margin.left + prevIdx * xStep;
      const prevY = margin.top + innerH - (data[prevIdx].count / niceCeiling) * innerH;
      const currX = margin.left + idx * xStep;
      const currY = margin.top + innerH - (data[idx].count / niceCeiling) * innerH;
      dashedSegments.push({ x1: prevX, y1: prevY, x2: currX, y2: currY });
    }
  });

  // Handle mouse movement for tooltip positioning
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - margin.left;
    if (relX < 0 || relX > innerW) return setTip(null);
    const idx = Math.round(relX / xStep);
    const i = Math.min(Math.max(idx, 0), dayCount - 1);
    const d = data[i];
    const x = margin.left + i * xStep;
    const y =
      d.count != null
        ? margin.top + innerH - (d.count / niceCeiling) * innerH
        : margin.top + innerH; // position baseline for empty day
    setTip({ day: d.day, count: d.count, extra: d.extra, x, y, left: x + 8, top: y - 8 });
  };

  if (!hasAnyRatings) {
    return <div className="text-muted" style={{ fontSize: 12 }}>No reviews this month</div>;
  }

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg width={w} height={h} onMouseMove={handleMove} onMouseLeave={() => setTip(null)}>
        {/* Axes */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={h - margin.bottom} stroke="#ccc" />
        <line x1={margin.left} y1={h - margin.bottom} x2={w - margin.right} y2={h - margin.bottom} stroke="#ccc" />
        {/* Y ticks */}
        {yTicks.map((t) => {
          const yPos = margin.top + innerH - (t / niceCeiling) * innerH;
          return (
            <g key={t}>
              <line x1={margin.left - 6} x2={margin.left} y1={yPos} y2={yPos} stroke="#666" />
              <text x={margin.left - 10} y={yPos + 4} fontSize="11" textAnchor="end" fill="#555">{t}</text>
              {t !== 0 && t !== niceCeiling && <line x1={margin.left} x2={w - margin.right} y1={yPos} y2={yPos} stroke="#eee" />}
            </g>
          );
        })}
        {/* X ticks */}
        {data.map((d, i) => {
          const x = margin.left + i * xStep;
          return (
            <g key={d.day}>
              <line x1={x} x2={x} y1={h - margin.bottom} y2={h - margin.bottom + 6} stroke="#666" />
              <text x={x} y={h - margin.bottom + 18} fontSize="11" textAnchor="middle" fill="#555">{d.day}</text>
            </g>
          );
        })}
        {/* Labels */}
        <text x={margin.left + innerW / 2} y={h - 8} fontSize="12" textAnchor="middle" fill="#444">Day of Month</text>
        <text x={18} y={margin.top + innerH / 2} fontSize="12" textAnchor="middle" fill="#444"
              transform={`rotate(-90,18,${margin.top + innerH / 2})`}>Rating</text>
        {/* Solid polylines for contiguous rated segments */}
        {segments.map((seg, i) => seg.length > 1 ? (
          <polyline key={i} fill="none" stroke={stroke} strokeWidth="2" points={seg.join(' ')} />
        ) : null)}
        {/* Dashed lines bridging gaps */}
        {dashedSegments.map((s, i) => (
          <line
            key={`gap-${i}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke={stroke}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity={0.7}
          />
        ))}
        {/* Circles only for rated days */}
        {data.map((d, i) => {
          if (d.count == null) return null;
          const x = margin.left + i * xStep;
            const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
          return <circle key={i} cx={x} cy={y} r={3} fill={stroke} />;
        })}
        {/* Hover guide */}
        {tip && <line x1={tip.x} x2={tip.x} y1={margin.top} y2={h - margin.bottom} stroke="#999" strokeDasharray="3 3" />}
      </svg>
      {/* Tooltip */}
      {tip && (
        <div style={{
          position: "absolute", left: tip.left, top: tip.top,
          background: "#fff", border: "1px solid #ddd", padding: "4px 8px",
          fontSize: 12, borderRadius: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          pointerEvents: "none", whiteSpace: "nowrap"
        }}>
          {tip.count == null
            ? `Day ${tip.day}: No reviews`
            : (typeof tooltipFormatter === "function"
                ? tooltipFormatter(tip)
                : `Day ${tip.day}: ${tip.count} ★`)}
        </div>
      )}
    </div>
  );
};

// ----- RATING CHART COMPONENT -----
export function AnalyticsRatingChart({ data }) {
  return data?.length ? (
    <LineChart
      data={data.map((d) => ({
        day: d.day,
        count: d.averageRating == null ? null : Number(d.averageRating), // preserve null
        extra: d.reviewCount
      }))}
      tooltipFormatter={(tip) => {
        if (tip.count == null) return `Day ${tip.day}: No reviews`;
        const reviewWord = pluralize(tip.extra, "review", "reviews");
        return `Day ${tip.day}: ${tip.count} ★ from ${tip.extra} ${reviewWord}`;
      }}
    />
  ) : (
    <div className="text-muted">No data</div>
  );
}
