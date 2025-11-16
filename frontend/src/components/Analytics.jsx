import React, { useEffect, useState, useMemo } from 'react';

export function Analytics({ onCheck }) {
  const API_BASE = 'http://localhost:3000';

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));

  // New state for charts
  const [dailyCount, setDailyCount] = useState([]);           // [{day, count}]
  const [metrics, setMetrics] = useState(null);               // { Total Bookings, Completed..., ... }
  const [heatmap, setHeatmap] = useState(null);               // { matrix, dayLabels, maxCount, ... }
  const [dailyRatings, setDailyRatings] = useState([]);       // [{day, averageRating, reviewCount}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/restaurants`);
        if (!res.ok) return;
        const json = await res.json();
        setRestaurants(Array.isArray(json.restaurants) ? json.restaurants : []);
      } catch (err) {
        // ...silent...
      }
    };
    loadRestaurants();
  }, [API_BASE]);

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));
  const months = [
    { v: '01', n: 'January' }, { v: '02', n: 'February' }, { v: '03', n: 'March' },
    { v: '04', n: 'April' }, { v: '05', n: 'May' }, { v: '06', n: 'June' },
    { v: '07', n: 'July' }, { v: '08', n: 'August' }, { v: '09', n: 'September' },
    { v: '10', n: 'October' }, { v: '11', n: 'November' }, { v: '12', n: 'December' },
  ];

  const handleCheck = async () => {
    const payload = { restaurantId, year, month };
    if (onCheck) onCheck(payload);

    setLoading(true);
    setError('');
    try {
      const qs = `?restaurantId=${restaurantId}&year=${year}&month=${month}`;
      const [dcRes, mRes, hmRes, drRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/bookings/daily-count${qs}`),
        fetch(`${API_BASE}/analytics/bookings/metrics${qs}`),
        fetch(`${API_BASE}/analytics/bookings/heatmap${qs}`),
        fetch(`${API_BASE}/analytics/reviews/daily-avg${qs}`),
      ]);

      if (!dcRes.ok || !mRes.ok || !hmRes.ok || !drRes.ok) {
        throw new Error('One or more requests failed');
      }

      const [dcJson, mJson, hmJson, drJson] = await Promise.all([
        dcRes.json(), mRes.json(), hmRes.json(), drRes.json()
      ]);

      setDailyCount(Array.isArray(dcJson.dailyBookingCount) ? dcJson.dailyBookingCount : []);
      setMetrics(mJson.metrics || null);
      setHeatmap(hmJson.heatmap || null);
      setDailyRatings(Array.isArray(drJson.dailyAverageRating) ? drJson.dailyAverageRating : []);
      console.log('Loaded analytics:',
        { dailyCount: dcJson.dailyBookingCount?.length,
          metrics: mJson.metrics,
          heatmap: hmJson.heatmap,
          dailyRatings: drJson.dailyAverageRating?.length });
    } catch (e) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const canCheck = restaurantId && year && month;

  // ---- Derived values for charts ----
  const totalBookings = Number(metrics?.['Total Bookings'] || 0);
  const completed = Number(metrics?.['Completed Bookings'] || 0);
  const noShow = Number(metrics?.['No Show Bookings'] || 0);
  const cancelled = Number(metrics?.['Cancelled Bookings'] || 0);

  const pct = (num, den) => den > 0 ? (num / den) * 100 : 0;
  const completedPct = useMemo(() => pct(completed, totalBookings), [completed, totalBookings]);
  const noShowPct = useMemo(() => pct(noShow, totalBookings), [noShow, totalBookings]);
  const cancelledPct = useMemo(() => pct(cancelled, totalBookings), [cancelled, totalBookings]);

  // ---- Tiny helpers for SVG charts ----
  const LineChart = ({ data, height = 220, stroke = '#2563eb', yLabel = 'Bookings', tooltipLabel = 'booking', tooltipFormatter }) => {
    const values = data.map(d => d.count);
    const rawMax = Math.max(1, ...values);

    // Adaptive ceiling: pick a "nice" max for clearer ticks
    const niceCeiling = (() => {
      if (yLabel === 'Rating') return 5; // For ratings, cap at 5
      if (rawMax <= 5) return 5;
      if (rawMax <= 10) return 10;
      if (rawMax <= 20) return 20;
      if (rawMax <= 30) return 30;
      if (rawMax <= 50) return 50;
      if (rawMax <= 75) return 75;
      if (rawMax <= 100) return 100;
      // Scale by rounding to next multiple of 50
      return Math.ceil(rawMax / 50) * 50;
    })();

    const w = 600;
    const h = height;
    const margin = { top: 16, right: 16, bottom: 40, left: 56 };
    const innerW = w - margin.left - margin.right;
    const innerH = h - margin.top - margin.bottom;
    const dayCount = data.length;
    const xStep = dayCount > 1 ? innerW / (dayCount - 1) : 0;

    // Always show each day
    const pointsAttr = data.map((d, i) => {
      const x = margin.left + i * xStep;
      const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
      return `${x},${y}`;
    }).join(' ');

    // Build y ticks (max 10 ticks)
    const yTicks = [];
    const approxTicks = Math.min(10, niceCeiling);
    const step = Math.max(1, Math.ceil(niceCeiling / approxTicks));
    for (let v = 0; v <= niceCeiling; v += step) yTicks.push(v);
    if (yTicks[yTicks.length - 1] !== niceCeiling) yTicks.push(niceCeiling);

    const [tip, setTip] = useState(null);
    const handleMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = e.clientX - rect.left - margin.left;
      if (relX < 0 || relX > innerW) return setTip(null);
      const idx = Math.round(relX / xStep);
      const i = Math.min(Math.max(idx, 0), dayCount - 1);
      const d = data[i];
      const x = margin.left + i * xStep;
      const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
      setTip({
        day: d.day,
        count: Number(d.count),
        extra: d.extra, // for review count or any extra data
        x,
        y,
        left: x + 8,
        top: y - 8
      });
    };

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          width={w}
          height={h}
          onMouseMove={handleMove}
          onMouseLeave={() => setTip(null)}
        >
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={h - margin.bottom} stroke="#ccc" />
          <line x1={margin.left} y1={h - margin.bottom} x2={w - margin.right} y2={h - margin.bottom} stroke="#ccc" />
          {yTicks.map(t => {
            const yPos = margin.top + innerH - (t / niceCeiling) * innerH;
            return (
              <g key={t}>
                <line x1={margin.left - 6} x2={margin.left} y1={yPos} y2={yPos} stroke="#666" />
                <text x={margin.left - 10} y={yPos + 4} fontSize="11" textAnchor="end" fill="#555">{t}</text>
                {t !== 0 && t !== niceCeiling && (
                  <line x1={margin.left} x2={w - margin.right} y1={yPos} y2={yPos} stroke="#eee" />
                )}
              </g>
            );
          })}
          {data.map((d, i) => {
            const x = margin.left + i * xStep;
            return (
              <g key={d.day}>
                <line x1={x} x2={x} y1={h - margin.bottom} y2={h - margin.bottom + 6} stroke="#666" />
                <text x={x} y={h - margin.bottom + 18} fontSize="11" textAnchor="middle" fill="#555">{d.day}</text>
              </g>
            );
          })}
          <text x={margin.left + innerW / 2} y={h - 8} fontSize="12" textAnchor="middle" fill="#444">Day of Month</text>
          <text
            x={18}
            y={margin.top + innerH / 2}
            fontSize="12"
            textAnchor="middle"
            fill="#444"
            transform={`rotate(-90,18,${margin.top + innerH / 2})`}
          >{yLabel}</text>
          <polyline fill="none" stroke={stroke} strokeWidth="2" points={pointsAttr} />
          {data.map((d, i) => {
            const x = margin.left + i * xStep;
            const y = margin.top + innerH - (d.count / niceCeiling) * innerH;
            return <circle key={i} cx={x} cy={y} r={3} fill={stroke} />;
          })}
          {tip && <line x1={tip.x} x2={tip.x} y1={margin.top} y2={h - margin.bottom} stroke="#999" strokeDasharray="3 3" />}
        </svg>
        {tip && (
          <div
            style={{
              position: 'absolute', left: tip.left, top: tip.top,
              background: '#fff', border: '1px solid #ddd', padding: '4px 8px',
              fontSize: 12, borderRadius: 4, boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              pointerEvents: 'none', whiteSpace: 'nowrap'
            }}
          >
            {tooltipFormatter
              ? tooltipFormatter(tip)
              : `Day ${tip.day}: ${tip.count} ${pluralize(tip.count, tooltipLabel, tooltipLabel + 's')}`}
          </div>
        )}
      </div>
    );
  };

  const HeatCell = ({ value = 0, max = 1 }) => {
    const ratio = max > 0 ? value / max : 0;
    const bg = `rgba(37,99,235, ${0.08 + ratio * 0.92})`; // blue with intensity
    return <div style={{ background: bg, height: 16, borderRadius: 2 }} title={`${value}`} />;
  };

  // Pluralizer: 0 and 1 -> 'booking', >1 -> 'bookings'
  const pluralize = (n, singular, plural) => (Number(n) <= 1 ? singular : plural);

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>📊 Restaurant Booking Analytics Dashboard </h2>

      {/* Filters */}
      <div className="card" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 'var(--spacing-md)', alignItems: 'end' }}>
          {/* Restaurant */}
          <div>
            <label className="text-muted" style={{ fontSize: 12 }}>Restaurant</label>
            <select className="input" value={restaurantId} onChange={e => setRestaurantId(e.target.value)} style={{ width: '100%' }}>
              <option value="">Select a restaurant</option>
              {restaurants.map(r => (
                <option key={r.id} value={String(r.id)}>{r.restaurantName}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="text-muted" style={{ fontSize: 12 }}>Year</label>
            <select className="input" value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%' }}>
              {years.map(y => (<option key={y} value={y}>{y}</option>))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="text-muted" style={{ fontSize: 12 }}>Month</label>
            <select className="input" value={month} onChange={e => setMonth(e.target.value)} style={{ width: '100%' }}>
              {months.map(m => (<option key={m.v} value={m.v}>{m.n}</option>))}
            </select>
          </div>

          {/* Check Button */}
          <div>
            <button className="btn btn-primary" onClick={handleCheck} disabled={!canCheck || loading}>
              {loading ? 'Loading...' : 'Check'}
            </button>
          </div>
        </div>
        {error ? <div style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div> : null}
      </div>

      {/* Charts 2x2 */}
      {(dailyCount.length || metrics || heatmap || dailyRatings.length) ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          {/* 1) Daily booking count - Line chart */}
          <div className="card">
            <div className="card-header"><h4 className="card-title">Daily Booking Count</h4></div>
            <div className="card-content">
              {dailyCount.length ? (
                <LineChart data={dailyCount} yLabel="Bookings" tooltipLabel="booking" />
              ) : (
                <div className="text-muted">No data</div>
              )}
            </div>
          </div>

          {/* 2) Rates pie: Completed / No-Show / Cancelled */}
          <div className="card">
            <div className="card-header"><h4 className="card-title">Completion / No-Show / Cancellation</h4></div>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 240 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: 160, height: 160, borderRadius: '50%',
                    background: `conic-gradient(#10b981 0 ${completedPct}%,
                                                 #ef4444 ${completedPct}% ${completedPct + noShowPct}%,
                                                 #f59e0b ${completedPct + noShowPct}% 100%)`,
                  }}
                  title={`Completed ${completed} • No-show ${noShow} • Cancelled ${cancelled}`}
                />
                <div style={{ fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 10, height: 10, background: '#10b981', display: 'inline-block', borderRadius: 2 }} />
                    <span>Completed: <b>{completed}</b> ({completedPct.toFixed(2)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 10, height: 10, background: '#ef4444', display: 'inline-block', borderRadius: 2 }} />
                    <span>No-Show: <b>{noShow}</b> ({noShowPct.toFixed(2)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, background: '#f59e0b', display: 'inline-block', borderRadius: 2 }} />
                    <span>Cancelled: <b>{cancelled}</b> ({cancelledPct.toFixed(2)}%)</span>
                  </div>
                  <div className="text-muted" style={{ marginTop: 8 }}>Total bookings: {totalBookings}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3) Hourly heatmap (Mon–Sun x 24) */}
          <div className="card">
            <div className="card-header"><h4 className="card-title">Hourly Activity Heatmap</h4></div>
            <div className="card-content">
              {heatmap?.matrix?.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 8 }}>
                  {/* Labels column */}
                  <div>
                    {(heatmap.dayLabels || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map(lbl => (
                      <div key={lbl} style={{ height: 16, lineHeight: '16px', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{lbl}</div>
                    ))}
                  </div>
                  {/* Heat matrix */}
                  <div style={{ display: 'grid', gridTemplateRows: `repeat(7, 16px)`, rowGap: 6 }}>
                    {heatmap.matrix.map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(24, 1fr)`, columnGap: 4 }}>
                        {row.map((val, j) => (
                          <HeatCell key={j} value={val} max={heatmap.maxCount || 1} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (<div className="text-muted">No data</div>)}
            </div>
          </div>

          {/* 4) Daily average review rating - Line chart */}
          <div className="card">
            <div className="card-header"><h4 className="card-title">Daily Average Review Rating</h4></div>
            <div className="card-content">
              {dailyRatings.length ? (
                <LineChart
                  data={dailyRatings.map(d => ({
                    day: d.day,
                    count: d.averageRating == null ? 0 : Number(d.averageRating),
                    extra: d.reviewCount, // pass review count
                  }))}
                  height={220}
                  stroke="#10b981"
                  yLabel="Rating"
                  tooltipLabel="rating"
                  tooltipFormatter={(tip) => {
                    const reviewWord = pluralize(tip.extra, 'review', 'reviews');
                    return `Day ${tip.day}: ${tip.count} ★ from ${tip.extra} ${reviewWord}`;
                  }}
                />
              ) : (<div className="text-muted">No data</div>)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
