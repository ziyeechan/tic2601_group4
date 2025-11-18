// ----- IMPORTS -----

import React, { useState } from "react";

// ----- HEAT CELL COMPONENT (Internal) -----

// Individual heatmap cell with hover tooltip and percentile-based coloring
function HeatCell({ value = 0, allValues = [], dayLabel = "", hour = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  // Filter out zero values for percentile calculation
  const nonZeroValues = allValues.filter((v) => v > 0).sort((a, b) => a - b);

  // Format hour from 24h to 12h (e.g., 0 → 12AM, 13 → 1PM)
  const formatHour = (h) => {
    if (h === 0) return "12AM";
    if (h < 12) return `${h}AM`;
    if (h === 12) return "12PM";
    return `${h - 12}PM`;
  };

  // Render grey cell for zero/no data
  if (value === 0 || nonZeroValues.length === 0) {
    return (
      <div
        style={{
          background: "#e5e5e5",
          height: 16,
          borderRadius: 2,
          border: "1px solid #d4d4d4",
          cursor: "default",
          transition: "all 0.2s ease",
          position: "relative",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "100%",
              transform: "translateX(-50%)",
              marginBottom: 6,
              background: "#fff",
              border: "1px solid #ddd",
              padding: "4px 8px",
              fontSize: 10,
              borderRadius: 4,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 1000,
            }}
          >
            {dayLabel} {formatHour(hour)} — No bookings
          </div>
        )}
      </div>
    );
  }

  // Calculate percentile thresholds for adaptive color bucketing
  const getPercentile = (arr, p) => {
    const index = Math.ceil(arr.length * p) - 1;
    return arr[Math.max(0, index)];
  };
  const p25 = getPercentile(nonZeroValues, 0.25);
  const p50 = getPercentile(nonZeroValues, 0.5);
  const p75 = getPercentile(nonZeroValues, 0.75);

  // Assign color based on percentile bucket (green → yellow → orange → red)
  const { bg, label } = (() => {
    if (value <= p25) return { bg: "#4ade80", label: "Low" }; // 0-25th
    if (value <= p50) return { bg: "#facc15", label: "Medium" }; // 25-50th
    if (value <= p75) return { bg: "#fb923c", label: "High" }; // 50-75th
    return { bg: "#ef4444", label: "Peak" }; // 75-100th
  })();

  const tooltipText = `${dayLabel} ${formatHour(hour)} — ${value} booking${value === 1 ? "" : "s"} (${label})`;

  return (
    <div
      style={{
        background: bg,
        height: 16,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: isHovered ? "scale(1.3)" : "scale(1)",
        border: isHovered ? "2px solid #333" : "none",
        boxShadow: isHovered ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
        zIndex: isHovered ? 10 : 1,
        position: "relative",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "100%",
            transform: "translateX(-50%)",
            marginBottom: 6,
            background: "#fff",
            border: "1px solid #ddd",
            padding: "4px 8px",
            fontSize: 10,
            borderRadius: 4,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 1000,
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}

// ----- HEATMAP COMPONENT -----

export function AnalyticsHourlyHeatmap({ heatmap }) {
  const matrix = heatmap?.matrix || [];
  const dayLabels = heatmap?.dayLabels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (!matrix.length) {
    return <div className="text-muted">No data</div>;
  }

  // Flatten matrix for percentile calculation across all cells
  const allValues = matrix.flat();

  // Hour markers to display (every 3 hours)
  const hourMarkers = [
    { hour: 0, label: "12AM" },
    { hour: 3, label: "3AM" },
    { hour: 6, label: "6AM" },
    { hour: 9, label: "9AM" },
    { hour: 12, label: "12PM" },
    { hour: 15, label: "3PM" },
    { hour: 18, label: "6PM" },
    { hour: 21, label: "9PM" },
  ];

  return (
    <>
      {/* --- Hour Labels Row --- */}
      <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 8, marginBottom: 4 }}>
        <div /> {/* Empty space for day labels column */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", columnGap: 4 }}>
          {Array.from({ length: 24 }).map((_, hour) => {
            const marker = hourMarkers.find((m) => m.hour === hour);
            return (
              <div
                key={hour}
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  height: 16,
                  lineHeight: "16px",
                }}
              >
                {marker ? marker.label : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Heatmap Grid (7 days x 24 hours) --- */}
      <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 8, marginBottom: 12 }}>
        {/* Day labels (Mon-Sun) */}
        <div>
          {dayLabels.map((lbl) => (
            <div
              key={lbl}
              style={{
                height: 16,
                lineHeight: "16px",
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 6,
              }}
            >
              {lbl}
            </div>
          ))}
        </div>
        {/* Heat cells grid */}
        <div style={{ display: "grid", gridTemplateRows: `repeat(7, 16px)`, rowGap: 6 }}>
          {matrix.map((row, i) => (
            <div
              key={i}
              style={{ display: "grid", gridTemplateColumns: `repeat(24, 1fr)`, columnGap: 4 }}
            >
              {row.map((val, j) => (
                <HeatCell
                  key={j}
                  value={val}
                  allValues={allValues}
                  dayLabel={dayLabels[i]}
                  hour={j}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* --- Legend --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          fontSize: 12,
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: "#e5e5e5",
              border: "1px solid #d4d4d4",
              borderRadius: 2,
            }}
          />
          <span>None</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 16, background: "#4ade80", borderRadius: 2 }} />
          <span>Low</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 16, background: "#facc15", borderRadius: 2 }} />
          <span>Medium</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 16, background: "#fb923c", borderRadius: 2 }} />
          <span>High</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 16, background: "#ef4444", borderRadius: 2 }} />
          <span>Peak</span>
        </div>
      </div>
    </>
  );
}
