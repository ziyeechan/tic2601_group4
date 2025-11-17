// ----- IMPORTS -----

import React, { useState } from 'react';

// ----- HELPERS -----

// Pluralize helper (0 or 1 → singular, >1 → plural)
const pluralize = (n, singular, plural) => (Number(n) <= 1 ? singular : plural);

// ----- LINE CHART COMPONENT (Internal) -----

// Generic line chart for rating data (0-5 scale)
const LineChart = ({ data, height = 220, stroke = '#10b981', yLabel = 'Rating', tooltipFormatter }) => {
  const values = data.map(d => d.count);
  const rawMax = Math.max(1, ...values);
  const niceCeiling = 5; // ratings capped at 5 stars
  const w = 600, h = height;
  const margin = { top: 16, right: 16, bottom: 40, left: 56 };
  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;
  const dayCount = data.length;
  const xStep = dayCount > 1 ? innerW / (dayCount - 1) : 0;

  // Build polyline points for line chart
  const pointsAttr = data.map((d, i) => {
    const x = margin.left + i * xStep;
    const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
    return `${x},${y}`;
  }).join(' ');

  // Fixed y-axis ticks for ratings (0-5)
  const yTicks = [0, 1, 2, 3, 4, 5];

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

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg width={w} height={h} onMouseMove={handleMove} onMouseLeave={() => setTip(null)}>
        {/* Y-axis */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={h - margin.bottom} stroke="#ccc" />
        {/* X-axis */}
        <line x1={margin.left} y1={h - margin.bottom} x2={w - margin.right} y2={h - margin.bottom} stroke="#ccc" />
        
        {/* Y-axis ticks and gridlines */}
        {yTicks.map(t => {
          const yPos = margin.top + innerH - (t / niceCeiling) * innerH;
          return (
            <g key={t}>
              <line x1={margin.left - 6} x2={margin.left} y1={yPos} y2={yPos} stroke="#666" />
              <text x={margin.left - 10} y={yPos + 4} fontSize="11" textAnchor="end" fill="#555">{t}</text>
              {t !== 0 && t !== niceCeiling && <line x1={margin.left} x2={w - margin.right} y1={yPos} y2={yPos} stroke="#eee" />}
            </g>
          );
        })}

        {/* X-axis ticks (day numbers) */}
        {data.map((d, i) => {
          const x = margin.left + i * xStep;
          return (
            <g key={d.day}>
              <line x1={x} x2={x} y1={h - margin.bottom} y2={h - margin.bottom + 6} stroke="#666" />
              <text x={x} y={h - margin.bottom + 18} fontSize="11" textAnchor="middle" fill="#555">{d.day}</text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={margin.left + innerW / 2} y={h - 8} fontSize="12" textAnchor="middle" fill="#444">Day of Month</text>
        <text x={18} y={margin.top + innerH / 2} fontSize="12" textAnchor="middle" fill="#444" transform={`rotate(-90,18,${margin.top + innerH / 2})`}>Rating</text>
        
        {/* Line and data points */}
        <polyline fill="none" stroke={stroke} strokeWidth="2" points={pointsAttr} />
        {data.map((d, i) => {
          const x = margin.left + i * xStep;
          const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
          return <circle key={i} cx={x} cy={y} r={3} fill={stroke} />;
        })}

        {/* Vertical guide line on hover */}
        {tip && <line x1={tip.x} x2={tip.x} y1={margin.top} y2={h - margin.bottom} stroke="#999" strokeDasharray="3 3" />}
      </svg>

      {/* Tooltip */}
      {tip && (
        <div style={{ position: 'absolute', left: tip.left, top: tip.top, background: '#fff', border: '1px solid #ddd', padding: '4px 8px', fontSize: 12, borderRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {typeof tooltipFormatter === 'function'
            ? tooltipFormatter(tip)
            : `Day ${tip.day}: ${tip.count} rating`}
        </div>
      )}
    </div>
  );
};

// ----- RATING CHART COMPONENT -----

export function AnalyticsRatingChart({ data }) {
  return data?.length ? (
    <LineChart
      // Map review data to chart format (averageRating → count, reviewCount → extra)
      data={data.map(d => ({ 
        day: d.day, 
        count: d.averageRating == null ? 0 : Number(d.averageRating), 
        extra: d.reviewCount 
      }))}
      // Custom tooltip: "Day 15: 4.5 ★ from 3 reviews"
      tooltipFormatter={(tip) => {
        const reviewWord = pluralize(tip.extra, 'review', 'reviews');
        return `Day ${tip.day}: ${tip.count} ★ from ${tip.extra} ${reviewWord}`;
      }}
    />
  ) : (
    <div className="text-muted">No data</div>
  );
}