import { useState, useEffect, useRef } from "react";
import { seatingAPI, restaurantAPI, bookingAPI } from "../utils/api";

import { SeatingPlanTimeSlots } from "./SeatingPlanTimeslots";
import { SeatingPlanCanvas } from "./SeatingPlanCanvas";
import { SeatingPlanUnassignedBookings } from "./SeatingPlanUnassignedBookings";
import { SeatingPlanTableDetail } from "./SeatingPlanTableDetail";

export function SeatingPlan() {
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");

  const [selectedTable, setSelectedTable] = useState(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [isLoadingTables, setIsLoadingTables] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [timeSlots, setTimeSlots] = useState([]);
  const [slotOverrides, setSlotOverrides] = useState({});
  const DINING_DURATION_MIN = 90;

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  };

  const minutesToTimeString = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Generate 30min slots from opening to closing
  const generateTimeSlots = (openStr, closeStr, intervalMin = 30) => {
    const open = parseTimeToMinutes(openStr);
    const close = parseTimeToMinutes(closeStr);
    if (open == null || close == null || open >= close) return [];

    const slots = [];
    for (let t = open; t < close; t += intervalMin) {
      slots.push({
        start: minutesToTimeString(t),
        end: minutesToTimeString(Math.min(t + intervalMin, close)),
        startMinutes: t,
      });
    }
    return slots;
  };

  //Check if a given booking overlaps with any other booking on this table (same day)
  const doesOverlapWithExistingBooking = (booking, table) => {
    if (!table) return false;

    const bookingStart = parseTimeToMinutes(booking.time);
    if (bookingStart == null) return false;

    const bookingEnd = bookingStart + DINING_DURATION_MIN; // 90 mins

    return bookings.some((b) => {
      // Ignore itself
      if (b.id === booking.id) return false;
      if (b.status !== "confirmed") return false;
      if (!isSameTableToday(b, table)) return false;

      const otherStart = parseTimeToMinutes(b.time);
      if (otherStart == null) return false;

      const otherEnd = otherStart + DINING_DURATION_MIN;

      // check time range overlap
      return Math.max(bookingStart, otherStart) < Math.min(bookingEnd, otherEnd);
    });
  };

  useEffect(() => {
    restaurantAPI
      .getAllRestaurants()
      .then((res) => {
        const data = res.data.results || res.data;
        setRestaurants(data || []);
      })
      .catch((err) => console.error("Failed to fetch restaurants", err));

    bookingAPI
      .getAllBookings()
      .then((res) => {
        let list = [];

        // Try a few common shapes
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.results)) {
          list = res.data.results;
        } else if (Array.isArray(res.data.bookings)) {
          list = res.data.bookings;
        } else {
          console.error("Unexpected bookings response shape:", res.data);
          setBookings([]);
          return;
        }

        const normalized = list.map((b) => ({
          id: b.bookingId || b.id,
          customerName: b.customerName,
          partySize: b.partySize,
          status: b.status,
          date: b.bookingDate,
          time: b.bookingTime,
          restaurantId: b.fkRestaurantId,
          tableId: b.fkSeatingId,
        }));

        setBookings(normalized);
      })
      .catch((err) => {
        console.error("Failed to fetch bookings", err);
      });
  }, []);

  //SEATING PLAN USE EFFECT
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const fetchTables = async () => {
      setIsLoadingTables(true);
      try {
        const res = await seatingAPI.getSeatingPlansByRestaurant(selectedRestaurantId);
        const data = res.data.results || res.data || [];
        setTables(data);
      } catch (err) {
        console.error("Failed to fetch seating plans", err);
        setTables([]);
      } finally {
        setIsLoadingTables(false);
      }
    };

    fetchTables();
  }, [selectedRestaurantId]);

  //TIME SLOTS USE EFFECT
  useEffect(() => {
    if (!selectedRestaurantId) {
      setTimeSlots([]);
      return;
    }

    const restaurant = restaurants.find(
      (r) => String(r.restaurantId || r.id) === String(selectedRestaurantId)
    );

    if (!restaurant) {
      setTimeSlots([]);
      return;
    }

    // Adjust these field names to match your DB
    const openingTime = restaurant.openingTime || restaurant.openTime || "17:00";
    const closingTime = restaurant.closingTime || restaurant.closeTime || "22:00";

    const slots = generateTimeSlots(openingTime, closingTime, 30);
    setTimeSlots(slots);
  }, [selectedRestaurantId, restaurants]);

  // Change restaurant viewing
  const handleRestaurantChange = (e) => {
    const newId = e.target.value;
    setSelectedRestaurantId(newId);
    setSelectedTable(null);
    setIsAddingTable(false);
  };

  // Get table icon
  const getTableIcon = (type) => {
    switch (type) {
      case "indoor":
        return "🏠";
      case "outdoor":
        return "🏖️";
      case "vip":
        return "🏛️";
      default:
        return "◉";
    }
  };

  // Get table color
  const getTableColor = (type) => {
    switch (type) {
      case "indoor":
        return "#60a5fa"; // blue
      case "outdoor":
        return "#22c55e"; // green
      case "vip":
        return "#a855f7"; // purple
      default:
        return "#9ca3af"; // gray
    }
  };



  // Handle assign booking to table
  const handleAssignBooking = async (tableId) => {
    if (!selectedBooking) return;

    const table = tables.find((t) => Number(t.seatingId) === Number(tableId));

    if (!table) {
      alert("Table not found.");
      return;
    }

    // prevent overlapping bookings on this table
    if (doesOverlapWithExistingBooking(selectedBooking, table)) {
      alert(
        "This table already has a booking that overlaps with this time (90 minutes window). Please choose another table."
      );
      return;
    }

    try {
      // Update in DB
      await bookingAPI.updateBooking(selectedBooking.id, {
        fkSeatingId: tableId,
      });

      // Update local state so UI reflects the change immediately
      setBookings((prev) => prev.map((b) => (b.id === selectedBooking.id ? { ...b, tableId } : b)));

      // Close modal and clear selection
      setShowAssignModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Failed to assign booking to table", err);
      alert("Failed to assign table. Check console/server logs.");
    }
  };

  const isSameTableToday = (b, table) => b.date === today && b.tableId != null && Number(b.tableId) === Number(table.seatingId);

  return (
    <div>
      <h2 style={{ marginBottom: "var(--spacing-lg)" }}>🪑 Seating Plan Management</h2>

      {/* Restaurant selector */}
      <div
        style={{
          marginBottom: "var(--spacing-lg)",
          display: "flex",
          gap: "var(--spacing-md)",
          alignItems: "center",
        }}
      >
        <label htmlFor="restaurant-select" style={{ fontWeight: 600, fontSize: "14px" }}>
          Restaurant:
        </label>
        <select
          id="restaurant-select"
          value={selectedRestaurantId}
          onChange={handleRestaurantChange}
          style={{ minWidth: "250px" }}
        >
          <option value="">Select a restaurant...</option>
          {restaurants.map((r) => (
            <option key={r.restaurantId || r.id} value={r.restaurantId || r.id}>
              {r.restaurantName || r.name}
            </option>
          ))}
        </select>
      </div>

      {/* If no restaurant chosen yet */}
      {!selectedRestaurantId && (
        <p className="text-muted" style={{ fontSize: "14px" }}>
          Please select a restaurant to view its seating layout.
        </p>
      )}

      {/* Show layout only AFTER restaurant is selected */}
      {selectedRestaurantId &&
        (isLoadingTables ? (
          <p className="text-muted" style={{ fontSize: "14px" }}>
            Loading seating plan...
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr",
              gap: "var(--spacing-lg)",
            }}
            className="seating-container"
          >
            {/* Layout Section */}
            <SeatingPlanCanvas
              tables={tables}
              setTables={setTables}
              bookings={bookings}
              today={today}
              selectedRestaurantId={selectedRestaurantId}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              isAddingTable={isAddingTable}
              setIsAddingTable={setIsAddingTable}
              getTableColor={getTableColor}
              getTableIcon={getTableIcon}
            />

            {/* Right Sidebar */}
            <div>
              {/* Selected Table Details */}
              {selectedTable && (
                <>
                  {/* Table Details*/}
                    <SeatingPlanTableDetail
                      selectedTable={selectedTable}
                      setSelectedTable={setSelectedTable}
                      isAddingTable={isAddingTable}
                      setIsAddingTable={setIsAddingTable}
                      tables={tables}
                      setTables={setTables}
                      bookings={bookings}
                      setBookings={setBookings}
                      selectedRestaurantId={selectedRestaurantId}
                      isSameTableToday={isSameTableToday}
                      setSelectedBooking={setSelectedBooking}
                      setShowAssignModal={setShowAssignModal}
                    />
                  {/* Time Slots Card */}
                    <SeatingPlanTimeSlots
                      selectedTable={selectedTable}
                      timeSlots={timeSlots}
                      bookings={bookings}
                      slotOverrides={slotOverrides}
                      setSlotOverrides={setSlotOverrides}
                      selectedRestaurantId={selectedRestaurantId}
                      today={today}
                      parseTimeToMinutes={parseTimeToMinutes}
                      isSameTableToday={isSameTableToday}
                      DINING_DURATION_MIN={DINING_DURATION_MIN}
                    />
                </>
              )}

              {/* Unassigned Bookings */}
              <SeatingPlanUnassignedBookings
                bookings={bookings}
                today={today}
                selectedRestaurantId={selectedRestaurantId}
                onSelectBooking={(booking) => {
                  setSelectedBooking(booking);
                  setShowAssignModal(true);
                }}
              />
            </div>
          </div>
        ))}

      {/* Assign Modal */}
      {showAssignModal && selectedBooking && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ maxWidth: "400px", width: "90%" }}>
            <div className="card-header">
              <h4 className="card-title">Assign Table</h4>
            </div>
            <div className="card-content">
              <p className="mb-md">
                Assign a table for <strong>{selectedBooking.customerName}</strong> (
                {selectedBooking.partySize} people)?
              </p>
              <div className="form-group mb-lg">
                <label>Available Tables:</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  {tables
                    .filter(
                      (t) =>
                        t.pax >= selectedBooking.partySize &&
                        Number(t.seatingId) !== Number(selectedBooking.tableId) &&
                        !doesOverlapWithExistingBooking(selectedBooking, t)
                    )
                    .map((table) => (
                      <button
                        key={table.seatingId}
                        className="btn btn-secondary"
                        onClick={() => handleAssignBooking(table.seatingId)}
                        style={{
                          textAlign: "left",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          Table {table.tableNumber} {getTableIcon(table.tableType)}
                        </span>
                        <span className="text-muted" style={{ fontSize: "12px" }}>
                          {table.pax} seats
                        </span>
                      </button>
                    ))}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-full"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedBooking(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
