// ----- IMPORTS -----

import React, { useEffect, useMemo, useState } from "react";
import { AnalyticsTrendChart } from "./AnalyticsTrendChart";
import { AnalyticsOutcomePie } from "./AnalyticsOutcomePie";
import { AnalyticsHourlyHeatmap } from "./AnalyticsHourlyHeatmap";
import { AnalyticsRatingChart } from "./AnalyticsRatingChart";
import { Card } from "./Common";

// ----- MAIN COMPONENT -----

export function Analytics({ onCheck }) {
  const API_BASE = "http://localhost:3000";

  // --- Filter State ---
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));

  // --- Chart Data State ---
  const [dailyCount, setDailyCount] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [dailyRatings, setDailyRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- UX State (track user interaction flow) ---
  const [hasChecked, setHasChecked] = useState(false);
  const [filtersChanged, setFiltersChanged] = useState(false);

  // ----- DATA FETCHING -----

  // Load available restaurants on mount
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/restaurants`);
        if (!res.ok) return;
        const json = await res.json();
        setRestaurants(Array.isArray(json.restaurants) ? json.restaurants : []);
      } catch {
        // silent fail - dropdown will be empty
      }
    };
    loadRestaurants();
  }, [API_BASE]);

  // ----- CONSTANTS -----

  const years = Array.from({ length: 3 }, (_, i) => String(new Date().getFullYear() - i));
  const months = [
    { v: "01", n: "January" },
    { v: "02", n: "February" },
    { v: "03", n: "March" },
    { v: "04", n: "April" },
    { v: "05", n: "May" },
    { v: "06", n: "June" },
    { v: "07", n: "July" },
    { v: "08", n: "August" },
    { v: "09", n: "September" },
    { v: "10", n: "October" },
    { v: "11", n: "November" },
    { v: "12", n: "December" },
  ];

  // ----- EVENT HANDLERS -----

  // Fetch analytics data when user clicks "Check"
  const handleCheck = async () => {
    const payload = { restaurantId, year, month };
    if (onCheck) onCheck(payload);

    setHasChecked(true);
    setFiltersChanged(false);

    setLoading(true);
    setError("");
    try {
      const qs = `?restaurantId=${restaurantId}&year=${year}&month=${month}`;

      // Fetch all analytics endpoints in parallel
      const [dcRes, mRes, hmRes, drRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/bookings/daily-count${qs}`),
        fetch(`${API_BASE}/analytics/bookings/metrics${qs}`),
        fetch(`${API_BASE}/analytics/bookings/heatmap${qs}`),
        fetch(`${API_BASE}/analytics/reviews/daily-avg${qs}`),
      ]);

      if (!dcRes.ok || !mRes.ok || !hmRes.ok || !drRes.ok) {
        throw new Error("One or more requests failed");
      }

      const [dcJson, mJson, hmJson, drJson] = await Promise.all([
        dcRes.json(),
        mRes.json(),
        hmRes.json(),
        drRes.json(),
      ]);

      // Update state with fetched data
      setDailyCount(Array.isArray(dcJson.dailyBookingCount) ? dcJson.dailyBookingCount : []);
      setMetrics(mJson.metrics || null);
      setHeatmap(hmJson.heatmap || null);
      setDailyRatings(Array.isArray(drJson.dailyAverageRating) ? drJson.dailyAverageRating : []);
    } catch (e) {
      setError(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // ----- DERIVED STATE -----

  const canCheck = restaurantId && year && month;

  // Extract booking metrics
  const totalBookings = Number(metrics?.["Total Bookings"] || 0);
  const completed = Number(metrics?.["Completed Bookings"] || 0);
  const noShow = Number(metrics?.["No Show Bookings"] || 0);
  const cancelled = Number(metrics?.["Cancelled Bookings"] || 0);

  // Calculate percentages for pie chart
  const pct = (num, den) => (den > 0 ? (num / den) * 100 : 0);
  const completedPct = useMemo(() => pct(completed, totalBookings), [completed, totalBookings]);
  const noShowPct = useMemo(() => pct(noShow, totalBookings), [noShow, totalBookings]);
  const cancelledPct = useMemo(() => pct(cancelled, totalBookings), [cancelled, totalBookings]);

  // Get selected filter labels for display
  const selectedRestaurant = restaurants.find((r) => String(r.id) === restaurantId);
  const selectedMonthName = months.find((m) => m.v === month)?.n || month;

  // Determine if we have any meaningful data to show charts
  const hasData =
    (dailyCount.length > 0 && dailyCount.some((d) => d.count > 0)) ||
    totalBookings > 0 ||
    heatmap?.matrix?.some((row) => row.some((val) => val > 0)) ||
    (dailyRatings.length > 0 && dailyRatings.some((d) => d.reviewCount > 0));

  // ----- RENDER -----

  return (
    <div>
      <h2 style={{ marginBottom: "var(--spacing-lg)" }}>
        📊 Restaurant Booking Analytics Dashboard{" "}
      </h2>

      {/* --- Filters Panel --- */}
      <Card styles={{ padding: "var(--spacing-md)", marginBottom: "var(--spacing-lg)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "var(--spacing-md)",
            alignItems: "end",
          }}
        >
          {/* Restaurant */}
          <div>
            <label className="text-muted" style={{ fontSize: 12 }}>
              Restaurant
            </label>
            <select
              className="input"
              value={restaurantId}
              onChange={(e) => {
                setRestaurantId(e.target.value);
                if (hasChecked) setFiltersChanged(true);
              }}
              style={{ width: "100%" }}
            >
              <option value="">Select a restaurant</option>
              {restaurants.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.restaurantName}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="text-muted" style={{ fontSize: 12 }}>
              Year
            </label>
            <select
              className="input"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                if (hasChecked) setFiltersChanged(true);
              }}
              style={{ width: "100%" }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="text-muted" style={{ fontSize: 12 }}>
              Month
            </label>
            <select
              className="input"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                if (hasChecked) setFiltersChanged(true);
              }}
              style={{ width: "100%" }}
            >
              {months.map((m) => (
                <option key={m.v} value={m.v}>
                  {m.n}
                </option>
              ))}
            </select>
          </div>

          {/* Check Button */}
          <div>
            <button
              className="btn btn-primary"
              onClick={handleCheck}
              disabled={!canCheck || loading}
            >
              {loading ? "Loading..." : "Check"}
            </button>
          </div>
        </div>
        {error ? <div style={{ color: "var(--danger)", marginTop: 8 }}>{error}</div> : null}
      </Card>

      {/* --- Message States --- */}

      {/* Initial state: prompt user to select filters */}
      {!hasChecked && (
        <Card styles={{ padding: "var(--spacing-lg)", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Select a restaurant, year, and month, then click <strong>"Check"</strong> to generate
            details.
          </p>
        </Card>
      )}

      {/* Filters changed: remind user to click Check again */}
      {hasChecked && filtersChanged && (
        <Card
          styles={{
            padding: "var(--spacing-lg)",
            textAlign: "center",
            background: "#fffbeb",
            border: "1px solid #fbbf24",
          }}
        >
          <p style={{ color: "#92400e", margin: 0 }}>
            Filters updated. Click <strong>"Check"</strong> to refresh charts.
          </p>
        </Card>
      )}

      {/* No data found: show helpful message */}
      {hasChecked && !filtersChanged && !loading && !hasData && (
        <Card styles={{ padding: "var(--spacing-lg)", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>
            No booking found for{" "}
            <strong>{selectedRestaurant?.restaurantName || "this restaurant"}</strong> in{" "}
            <strong>
              {selectedMonthName} {year}
            </strong>
            .
          </p>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>
            Try selecting a different restaurant or period.
          </p>
        </Card>
      )}

      {/* --- Charts Grid (2x2) --- */}
      {hasChecked && !filtersChanged && hasData ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
          {/* Daily booking trend line chart */}
          <Card>
            <Card.Header title="Daily Booking Trend" />
            <Card.Content>
              <AnalyticsTrendChart data={dailyCount} />
            </Card.Content>
          </Card>

          {/* Booking outcomes pie chart */}
          <Card>
            <Card.Header title="Booking Outcomes Breakdown" />
            <Card.Content
              styles={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minHeight: 240,
              }}
            >
              <AnalyticsOutcomePie
                completed={completed}
                noShow={noShow}
                cancelled={cancelled}
                totalBookings={totalBookings}
                completedPct={completedPct}
                noShowPct={noShowPct}
                cancelledPct={cancelledPct}
              />
            </Card.Content>
          </Card>

          {/* Hourly activity heatmap (weekday x hour) */}
          <Card>
            <Card.Header title="Hourly Booking Activity Heatmap" />
            <Card.Content>
              <AnalyticsHourlyHeatmap heatmap={heatmap} />
            </Card.Content>
          </Card>

          {/* Daily average rating line chart */}
          <Card>
            <Card.Header title="Daily Average Rating" />
            <Card.Content>
              <AnalyticsRatingChart data={dailyRatings} />
            </Card.Content>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
