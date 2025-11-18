import { useState, useEffect, useRef } from "react";
import { seatingAPI, restaurantAPI, bookingAPI } from "../utils/api";

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
  const GAP = 10;

  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const [timeSlots, setTimeSlots] = useState([]);
  const [slotOverrides, setSlotOverrides] = useState({}); 
  const DINING_DURATION_MIN = 90;

  // For canvas, randomizes the nodes being placed
  const rand = (offset, bound) => {
    return Math.round(offset + Math.random() * bound);
  };

  // Checks if the nodes overlap with one another
  const overlaps = (x, y, placed) => {
    for (const p of placed) {
      const dx = x - p.x;
      const dy = y - p.y;
      const dist2 = dx * dx + dy * dy;
      const minDist = x + GAP * x + GAP + (y + GAP * y + GAP);
      if (dist2 < minDist) return true;
    }
    return false;
  };

    // ---- Time helpers ----
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

    // Key to store overrides per restaurant, table and slot
    const getSlotKey = (slot, table) =>
      `${selectedRestaurantId}-${table?.seatingId || "restaurant"}-${
        slot.start
    }`;
  
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

    // Given a slot and table, find booking that overlaps this 30min window
    const findBookingForSlotAndTable = (slot, table) => {
      if (!table) return null;

      const slotStart = slot.startMinutes;
      const slotEnd = slotStart + 30;

      return (
        bookings.find((b) => {
          if (b.status !== "confirmed") return false;
          if (!isSameTableToday(b, table)) return false;

          const bookingStart = parseTimeToMinutes(b.time);
          if (bookingStart == null) return false;

          const bookingEnd = bookingStart + DINING_DURATION_MIN; // 90min

          // ranges overlap?
          return (
            Math.max(slotStart, bookingStart) < Math.min(slotEnd, bookingEnd)
          );
        }) || null
      );
    };

    // Base status for slot: occupied / unavailable (override) / available
    const getSlotStatus = (slot, table) => {
      const booking = findBookingForSlotAndTable(slot, table);
      if (booking) return "occupied";

      const key = getSlotKey(slot, table);
      const override = slotOverrides[key];
      if (override?.status === "unavailable") return "unavailable";

      return "available";
    };

    const handleToggleSlot = (slot, table) => {
      const status = getSlotStatus(slot, table);
      if (status === "occupied") return; // cannot toggle occupied slots

      const key = getSlotKey(slot, table);

      setSlotOverrides((prev) => {
        const existing = prev[key];
        // If currently unavailable, toggle back to available (remove override)
        if (existing?.status === "unavailable") {
          const { [key]: _, ...rest } = prev;
          return rest;
        }
        // Otherwise mark as unavailable (comment can be added/edited separately)
        return {
          ...prev,
          [key]: { status: "unavailable", comment: existing?.comment || "" },
        };
      });
    };

    const handleEditComment = (slot, table) => {
      const key = getSlotKey(slot, table);
      const existing = slotOverrides[key];

      const nextComment = window.prompt(
        "Reason this time slot is unavailable:",
        existing?.comment || ""
      );
      if (nextComment === null) return; // cancelled

      setSlotOverrides((prev) => ({
        ...prev,
        [key]: {
          status: "unavailable",
          comment: nextComment.trim(),
        },
      }));
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
      const res = await seatingAPI.getSeatingPlansByRestaurant(
        selectedRestaurantId
      );
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
      (r) =>
        String(r.restaurantId || r.id) === String(selectedRestaurantId)
    );

    if (!restaurant) {
      setTimeSlots([]);
      return;
    }

    // Adjust these field names to match your DB
    const openingTime =
      restaurant.openingTime || restaurant.openTime || "17:00";
    const closingTime =
      restaurant.closingTime || restaurant.closeTime || "22:00";

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

  // Get unassigned bookings for today
  const unassignedBookings = bookings.filter(
    (b) =>
      b.date === today &&
      b.status === "confirmed" &&
      !b.tableId &&
      (!selectedRestaurantId || b.restaurantId === Number(selectedRestaurantId))
  );

  //Dragging function of restaurant layout
  const getTableUniqueId = (table) => table.seatingId || table.tempId;

  //Start dragging a table
  const handleTableMouseDown = (e, table) => {
    e.stopPropagation();
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const xInCanvas = e.clientX - rect.left;
    const yInCanvas = e.clientY - rect.top;

    setDraggingId(getTableUniqueId(table));
    setDragOffset({
      x: xInCanvas - table.x,
      y: yInCanvas - table.y,
    });
  };

  //While dragging, update the table coordinates
  const handleCanvasMouseMove = (e) => {
    if (!draggingId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const xInCanvas = e.clientX - rect.left;
    const yInCanvas = e.clientY - rect.top;

    const radius = 60; // circle size (match your width/height)
    const newX = Math.max(0, Math.min(rect.width - radius, xInCanvas - dragOffset.x));
    const newY = Math.max(0, Math.min(rect.height - radius, yInCanvas - dragOffset.y));

    setTables((prev) =>
      prev.map((t) =>
        getTableUniqueId(t) === draggingId
          ? { ...t, x: newX, y: newY }
          : t
      )
    );

    //also move selectedTable if it's the one we’re dragging
    setSelectedTable((prev) => {
      if (!prev) return prev;
      if (getTableUniqueId(prev) !== draggingId) return prev;
      return { ...prev, x: newX, y: newY };
    });
  };

  //Stop dragging
  const handleCanvasMouseUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };

  const handleSaveLayout = async () => {
    try {
      await Promise.all(
        tables
          .filter((t) => !String(t.seatingId).startsWith("temp-")) // ignore unsaved new tables
          .map((t) =>
            seatingAPI.updateSeatingPlan(t.seatingId, {
              tableNumber: t.tableNumber,
              tableType: t.tableType,
              pax: t.pax,
              isAvailable: t.isAvailable,
              x: t.x,
              y: t.y,
            })
          )
      );

      alert("Layout saved");
    } catch (err) {
      console.error("Failed to save layout", err);
      alert("Failed to save layout");
    }
  };

  // Modify table status
  const isSameTableToday = (b, table) =>
  b.date === today &&
  b.tableId != null &&
  Number(b.tableId) === Number(table.seatingId);
  
  const getTableStatus = (table) => {
    const booking = bookings.find((b) => isSameTableToday(b, table));

    if (booking && booking.status === "confirmed") return "occupied";
    if (!table.isAvailable) return "unavailable";
    return "available";
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
  const getTableColor = (status) => {
    switch (status) {
      case "occupied":
        return "#ef4444"; // red
      case "unavailable":
        return "#f59e0b"; // yellow
      default:
        return "#10b981"; // green
    }
  };

  // Handle delete table
  const handleDeleteTable = async (tableId) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      await seatingAPI
        .deleteSeatingPlan(tableId)
        .then((results) => console.log("sucess"))
        .catch((error) => console.error(error));
      if (selectedTable?.seatingId === tableId) {
        setSelectedTable(null);
      }
    }
  };

  // Create node on canvas for add table button
  const handleAddTable = () => {
    setIsAddingTable(true);
    let x, y;
    do {
      x = rand(10, 880);
      y = rand(10, 330);
    } while (overlaps(x, y, tables));

    const tempId = `temp-${Date.now()}`;

    const newTable = {
      restaurantId: selectedRestaurantId || "1",
      seatingId: tempId,          // temporary id so dragging works
      x: x,
      y: y,
      isAdding: true,
      isAvailable: true,
      tableNumber: "",
      tableType: "outdoor",
      pax: 2,
    };

    setSelectedTable(newTable);
    setTables([...tables, newTable]);
  };

  // Populate fields when form is being filled
  const handleTableForm = (e) => {
    const { name, value } = e.target;
    setSelectedTable((prev) => ({
      ...prev,
      [name]: name === "pax" ? parseInt(value) : value,
    }));
  };

  const handleTableClick = (table) => {
    if (isAddingTable) alert("Please fill in the new table before changing");
    else {
      setSelectedTable(table);
    }
  };

  // Submit table data when add table form is submitted
  const submitAddTable = async () => {
    if (!selectedRestaurantId) {
      alert("Please select a restaurant first");
      return;
    }

    // remove temp seatingId and isAdding flag
    const { seatingId, isAdding, ...payload } = selectedTable;

    try {
      await seatingAPI.createSeatingPlan(selectedRestaurantId, payload);
      console.log("success");
      setIsAddingTable(false);
      setSelectedTable(null);

      // re-fetch tables so you get the real seatingId from DB
      const res = await seatingAPI.getSeatingPlansByRestaurant(
        selectedRestaurantId
      );
      const data = res.data.results || res.data || [];
      setTables(data);
    } catch (error) {
      console.error("Failed to create seating plan", error);
      alert("Failed to create table. Check console/server logs.");
    }
  };

  // Submit table data when edit table form is submitted
  const submitEditTable = async (tableId) => {
    await seatingAPI
      .updateSeatingPlan(tableId, selectedTable)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
    setSelectedTable(null);
  };

  // Handle assign booking to table
  const handleAssignBooking = async (tableId) => {
    if (!selectedBooking) return;

    const table = tables.find(
      (t) => Number(t.seatingId) === Number(tableId)
    );

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
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, tableId } : b
        )
      );

      // Close modal and clear selection
      setShowAssignModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Failed to assign booking to table", err);
      alert("Failed to assign table. Check console/server logs.");
    }
  };
  

  // Unassigns booking from table
  const handleUnassignBooking = async () => {
    if (!currentBooking) return;

    try {
      // Update DB
      await bookingAPI.updateBooking(currentBooking.id, {
        fkSeatingId: null,
      });

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === currentBooking.id ? { ...b, tableId: null } : b
        )
      );

      alert("Booking unassigned from table.");
    } catch (err) {
      console.error("Failed to unassign booking from table", err);
      alert("Failed to unassign booking. Check console/server logs.");
    }
  };

  // Find the confirmed booking for this table
  const currentBooking = selectedTable && bookings.find((b) => b.status === "confirmed" && isSameTableToday(b, selectedTable));


  const cancelAddTable = () => {
    let temp = tables.filter((table) => !table.isAdding);
    setTables(temp);
    setIsAddingTable(false);
    setSelectedTable(null);
  };


  return (
    <div>
      <h2 style={{ marginBottom: "var(--spacing-lg)" }}>
        🪑 Seating Plan Management
      </h2>

      {/* Restaurant selector */}
      <div
        style={{
          marginBottom: "var(--spacing-lg)",
          display: "flex",
          gap: "var(--spacing-md)",
          alignItems: "center",
        }}
      >
        <label
          htmlFor="restaurant-select"
          style={{ fontWeight: 600, fontSize: "14px" }}
        >
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
            <option
              key={r.restaurantId || r.id}
              value={r.restaurantId || r.id}
            >
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
            <div className="card">
              <div className="card-header">
                <div className="flex-between">
                  <h4 className="card-title">Restaurant Layout</h4>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleSaveLayout}
                      disabled={!tables.length}
                    >
                      💾 Save Layout
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => !isAddingTable && handleAddTable()}
                    >
                      ➕ Add Table
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-content">
                {/* Legend */}
                <div
                  style={{
                    marginBottom: "var(--spacing-lg)",
                    padding: "var(--spacing-md)",
                    backgroundColor: "var(--bg-light)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "600",
                      marginBottom: "var(--spacing-sm)",
                    }}
                  >
                    Legend:
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      "gap": "var(--spacing-md)",
                      fontSize: "14px",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "#10b981",
                          marginRight: "8px",
                          verticalAlign: "middle",
                        }}
                      ></span>
                      Available
                    </div>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          marginRight: "8px",
                          verticalAlign: "middle",
                        }}
                      ></span>
                      Occupied
                    </div>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "#f59e0b",
                          marginRight: "8px",
                          verticalAlign: "middle",
                        }}
                      ></span>
                      Unavailable
                    </div>
                  </div>
                </div>

                {/* Canvas Area */}
              <div
                ref={canvasRef}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "400px",
                    border: "2px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#fafafa",
                    overflow: "hidden",
                  }}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                >
                  {tables.map((table) => {
                    const status = getTableStatus(table);
                    const booking = bookings.find(
                      (b) =>
                        b.tableId === table.seatingId &&
                        b.date === today
                    );
                    const isSelected =
                      selectedTable?.seatingId === table.seatingId;

                    return (
                      <div
                        key={table.seatingId}
                        onMouseDown={(e) => handleTableMouseDown(e, table)}
                        onClick={() => handleTableClick(table)}
                        style={{
                          position: "absolute",
                          left: `${table.x}px`,
                          top: `${table.y}px`,
                          cursor: "grab",
                          transform: isSelected ? "scale(1.1)" : "scale(1)",
                          transition: draggingId === getTableUniqueId(table) ? "none" : "transform 0.2s",
                        }}
                      >
                        <div
                          style={{
                            minWidth: "fit-content",
                            minHeight: "fit-content",
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            backgroundColor:
                              getTableColor(status),
                            border: isSelected
                              ? "3px solid var(--text-dark)"
                              : "none",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "600",
                            boxShadow: "var(--shadow-md)",
                            fontSize: "24px",
                          }}
                          title={
                            booking
                              ? `${booking.customerName} - Party of ${booking.partySize}`
                              : "Click to select"
                          }
                        >
                          <div style={{ fontSize: "16px" }}>
                            {table.tableNumber}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              marginTop: "2px",
                            }}
                          >
                            {getTableIcon(table.tableType)}
                          </div>
                        </div>
                        {booking && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-20px",
                              left: "50%",
                              transform:
                                "translateX(-50%)",
                              fontSize: "11px",
                              backgroundColor:
                                "var(--text-dark)",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {
                              booking.customerName.split(
                                " "
                              )[0]
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div>
              {/* Selected Table Details */}
              {selectedTable && (
                <>
                  {/* Table Details*/}
                <div className="card mb-lg">
                  <div className="card-header">
                    <h4 className="card-title">Table Details</h4>
                  </div>
                  <div className="card-content">
                    <div
                      className="mb-md"
                      style={{
                        paddingBottom: "var(--spacing-md)",
                        borderBottom:
                          "1px solid var(--border-color)",
                      }}
                    >
                      <label
                        htmlFor="tableNumber"
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                        }}
                      >
                        Table Number *
                      </label>
                      <input
                        id="tableNumber"
                        type="text"
                        name="tableNumber"
                        value={selectedTable?.tableNumber}
                        onChange={handleTableForm}
                        placeholder="Enter table number"
                        required
                      />
                    </div>
                    <div
                      className="mb-md"
                      style={{
                        paddingBottom: "var(--spacing-md)",
                        borderBottom:
                          "1px solid var(--border-color)",
                      }}
                    >
                      <label
                        htmlFor="tableType"
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                        }}
                      >
                        Type *
                      </label>
                      <select
                        id="tableType"
                        name="tableType"
                        value={selectedTable?.tableType}
                        onChange={handleTableForm}
                        required
                      >
                        <option value="outdoor">Outdoor</option>
                        <option value="indoor">Indoor</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>
                    <div
                      className="mb-md"
                      style={{
                        paddingBottom: "var(--spacing-md)",
                        borderBottom:
                          "1px solid var(--border-color)",
                      }}
                    >
                      <label
                        htmlFor="pax"
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                        }}
                      >
                        Capacity *
                      </label>
                      <input
                        id="pax"
                        type="number"
                        name="pax"
                        value={selectedTable?.pax}
                        onChange={handleTableForm}
                        placeholder="Enter pax"
                        required
                      />
                    </div>

                    {currentBooking && (
                      <div
                        className="mb-md"
                        style={{
                          paddingBottom: "var(--spacing-md)",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <p
                          className="text-muted"
                          style={{ fontSize: "12px", margin: 0 }}
                        >
                          Current Booking
                        </p>
                        <p
                          style={{
                            fontWeight: "600",
                            margin: "4px 0 4px",
                          }}
                        >
                          {currentBooking.customerName} • {currentBooking.time} •{" "}
                          {currentBooking.partySize} pax
                        </p>

                        {/* Move booking to another table */}
                        <button
                          className="btn btn-primary btn-full"
                          style={{ marginBottom: "var(--spacing-xs)" }}
                          onClick={() => {
                            setSelectedBooking(currentBooking);
                            setShowAssignModal(true);
                          }}
                        >
                          Move Booking to Another Table
                        </button>

                        {/* Unassign booking from this table */}
                        <button
                          className="btn btn-secondary btn-full"
                          onClick={handleUnassignBooking}
                        >
                          Unassign Booking (Free Table)
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-sm)",
                      }}
                    >
                      {isAddingTable ? (
                        <>
                          <button
                            className="btn btn-success btn-full"
                            onClick={() => submitAddTable()}
                          >
                            ➕ Add Table
                          </button>
                          <button
                            className="btn btn-secondary btn-full"
                            onClick={() => cancelAddTable()}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-secondary btn-full"
                            style={{
                              border: "1px solid var(--border-color)",
                            }}
                            onClick={() =>
                              setSelectedTable(null)
                            }
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-secondary btn-full"
                            style={{
                              border: "1px solid var(--border-color)",
                            }}
                            onClick={() =>
                              submitEditTable(
                                selectedTable.seatingId
                              )
                            }
                          >
                            ✏️ Edit
                            </button>
                          <button
                            className="btn btn-danger btn-full"
                            onClick={() =>
                              handleDeleteTable(
                                selectedTable.seatingId
                              )
                            }
                          >
                            🗑️ Delete Table
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  </div>
                  {/* Time Slots Card */}
                  <div className="card mb-lg">
                    <div className="card-header">
                      <h4 className="card-title">Today's Time Slots</h4>
                    </div>
                    <div className="card-content">
                      {timeSlots.length === 0 ? (
                        <p
                          className="text-muted"
                          style={{ fontSize: "14px", margin: 0 }}
                        >
                          No opening hours configured for this restaurant.
                        </p>
                      ) : (
                        <div
                          style={{
                            maxHeight: "260px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          {timeSlots.map((slot) => {
                            const booking = findBookingForSlotAndTable(
                              slot,
                              selectedTable
                            );
                            const status = getSlotStatus(
                              slot,
                              selectedTable
                            );
                            const key = getSlotKey(slot, selectedTable);
                            const override = slotOverrides[key];

                            const bgColor =
                              status === "occupied"
                                ? "#ef4444"
                                : status === "unavailable"
                                ? "#f59e0b"
                                : "#10b981";

                            const tooltipLines = [
                              `${slot.start} – ${slot.end}`,
                              `Status: ${status}`,
                            ];
                            if (booking) {
                              tooltipLines.push(
                                `Booking: ${booking.customerName} (${booking.partySize}) at ${booking.time}`
                              );
                            }
                            if (override?.comment) {
                              tooltipLines.push(
                                `Note: ${override.comment}`
                              );
                            }

                            return (
                              <div
                                key={key}
                                title={tooltipLines.join("\n")}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  backgroundColor: bgColor,
                                  color: "white",
                                  cursor:
                                    status === "occupied"
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                                onClick={() =>
                                  handleToggleSlot(
                                    slot,
                                    selectedTable
                                  )
                                }
                              >
                                <span
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                  }}
                                >
                                  {slot.start} – {slot.end}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  {status === "unavailable" && (
                                    <button
                                      type="button"
                                      className="btn btn-secondary btn-xs"
                                      style={{
                                        padding: "2px 4px",
                                        fontSize: "11px",
                                        background:
                                          "rgba(0,0,0,0.2)",
                                        border: "none",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditComment(
                                          slot,
                                          selectedTable
                                        );
                                      }}
                                    >
                                      📝 Note
                                    </button>
                                  )}
                                  {booking && (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                      }}
                                    >
                                      {
                                        booking.customerName.split(
                                          " "
                                        )[0]
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <p
                        className="text-muted"
                        style={{
                          marginTop: "8px",
                          fontSize: "11px",
                        }}
                      >
                        • Dining duration is 90 minutes (3 slots).<br />
                        • Click an <strong>available</strong> slot to mark it
                        unavailable, click again to reset.<br />
                        • 📝 Add a note for why a slot is unavailable.<br />
                        • Hover any slot to see booking details.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Unassigned Bookings */}
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">
                    Unassigned Bookings
                  </h4>
                </div>
                <div className="card-content">
                  {unassignedBookings.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-sm)",
                      }}
                    >
                      {unassignedBookings.map((booking) => (
                        <div
                          key={booking.id}
                          style={{
                            padding: "var(--spacing-sm)",
                            border: "1px solid var(--border-color)",
                            borderRadius:
                              "var(--radius-md)",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--bg-light)")
                          }
                          onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "white")
                          }
                        >
                          <p
                            style={{
                              fontWeight: "600",
                              margin: 0,
                              fontSize: "14px",
                            }}
                          >
                            {booking.customerName}
                          </p>
                          <p
                            className="text-muted"
                            style={{
                              margin: 0,
                              fontSize: "12px",
                            }}
                          >
                            {booking.time} •{" "}
                            {booking.partySize} people
                          </p>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{
                              marginTop:
                                "var(--spacing-xs)",
                              width: "100%",
                            }}
                            onClick={() => {
                              setSelectedBooking(
                                booking
                              );
                              setShowAssignModal(true);
                            }}
                          >
                            Assign Table
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="text-muted"
                      style={{
                        margin: 0,
                        fontSize: "14px",
                      }}
                    >
                      No unassigned bookings for today
                    </p>
                  )}
                </div>
              </div>
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
          <div
            className="card"
            style={{ maxWidth: "400px", width: "90%" }}
          >
            <div className="card-header">
              <h4 className="card-title">Assign Table</h4>
            </div>
            <div className="card-content">
              <p className="mb-md">
                Assign a table for{" "}
                <strong>{selectedBooking.customerName}</strong> (
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
                        t.isAvailable &&
                        t.pax >= selectedBooking.partySize &&
                        Number(t.seatingId) !== Number(selectedBooking.tableId) &&
                        !doesOverlapWithExistingBooking(selectedBooking, t)
                    )
                    .map((table) => (
                      <button
                        key={table.seatingId}
                        className="btn btn-secondary"
                        onClick={() =>
                          handleAssignBooking(
                            table.seatingId
                          )
                        }
                        style={{
                          textAlign: "left",
                          justifyContent:
                            "space-between",
                        }}
                      >
                        <span>
                          Table {table.tableNumber}{" "}
                          {getTableIcon(
                            table.tableType
                          )}
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
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
