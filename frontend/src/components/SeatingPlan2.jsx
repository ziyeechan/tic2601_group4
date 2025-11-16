import { useState, useEffect } from "react";
import { seatingAPI } from "../utils/api";
import { mockTables, mockBookings } from "../mockData";

export function SeatingPlan() {
  const [tables, setTables] = useState();
  const [bookings] = useState(mockBookings);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refresh, setRefresh] = useState(false); // refresh helps prevent website from rendering before data are being fetched
  const today = new Date().toISOString().split("T")[0];
  const GAP = 10;

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

  // Get unassigned bookings for today
  const unassignedBookings = bookings.filter(
    (b) => b.date === today && b.status === "confirmed" && !b.tableId
  );

  const formatTableData = (tables) => {
    const placed = [];

    // Formats + assign a coordinate for each table on the canvas
    const formattedData = tables.map((table) => {
      // set outdoor tables to left side and indoor + vip tables to right side
      let x, y;
      do {
        x = table.tableType == "outdoor" ? rand(10, 430) : rand(440, 440);
        y = rand(10, 330);
      } while (overlaps(x, y, placed));
      placed.push({ x: x, y: y, id: table.seatingId, isAdding: false });
      return { ...table, x, y };
    });
    return formattedData;
  };

  // Endpoint to grab seating plan data
  useEffect(() => {
    seatingAPI.getSeatingPlansByRestaurant(1).then((res) => {
      setTables(formatTableData(res.data.results || res.data));
      setRefresh(true);
    });
  }, [refresh]);

  // Get table status
  const getTableStatus = (table) => {
    const booking = bookings.find(
      (b) => b.tableId === table.id && b.date === today
    );
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
      setRefresh(false);
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
    const newTable = {
      restaurantId: "1",
      x: x,
      y: y,
      isAdding: true,
      isAvailable: true,
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
    await seatingAPI
      .createSeatingPlan(1, selectedTable)
      .then((res) => {
        console.log("success");
      })
      .catch((error) => {
        console.error(error);
      });
    setIsAddingTable(false);
    setRefresh(false);
    setSelectedTable(null);
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
    setRefresh(false);
    setSelectedTable(null);
  };

  // Handle assign booking to table
  const handleAssignBooking = (tableId) => {
    if (selectedBooking) {
      alert(
        `Booking for ${selectedBooking.customerName} assigned to Table ${
          tables.find((t) => t.id === tableId)?.number
        }`
      );
      setShowAssignModal(false);
      setSelectedBooking(null);
    }
  };

  const cancelAddTable = () => {
    let temp = tables.filter((table) => !table.isAdding);
    setTables(temp);
    setIsAddingTable(false);
    setSelectedTable(null);
  };

  return (
    refresh && (
      <div>
        <h2 style={{ marginBottom: "var(--spacing-lg)" }}>
          🪑 Seating Plan Management
        </h2>

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
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => !isAddingTable && handleAddTable()}
                >
                  ➕ Add Table
                </button>
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
                    gap: "var(--spacing-md)",
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
                style={{
                  position: "relative",
                  width: "100%",
                  height: "400px",
                  border: "2px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "#fafafa",
                  overflow: "hidden",
                }}
                onClick={() => console.log("test")}
              >
                {tables.map((table) => {
                  const status = getTableStatus(table);
                  const booking = bookings.find(
                    (b) => b.tableId === table.seatingId && b.date === today
                  );
                  const isSelected =
                    selectedTable?.seatingId === table.seatingId;

                  return (
                    <div
                      key={table.seatingId}
                      onClick={() => handleTableClick(table)}
                      style={{
                        position: "absolute",
                        left: `${table.x}px`,
                        top: `${table.y}px`,
                        cursor: "pointer",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <div
                        style={{
                          minWidth: "fit-content",
                          minHeight: "fit-content",
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: getTableColor(status),
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
                        <div style={{ fontSize: "10px", marginTop: "2px" }}>
                          {getTableIcon(table.tableType)}
                        </div>
                      </div>
                      {booking && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: "11px",
                            backgroundColor: "var(--text-dark)",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {booking.customerName.split(" ")[0]}
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
              <div className="card mb-lg">
                <div className="card-header">
                  <h4 className="card-title">Table Details</h4>
                </div>
                <div className="card-content">
                  <div
                    className="mb-md"
                    style={{
                      paddingBottom: "var(--spacing-md)",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <label
                      htmlFor="tableNumber"
                      className="text-muted"
                      style={{ fontSize: "12px", margin: 0 }}
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
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <label
                      htmlFor="tableType"
                      className="text-muted"
                      style={{ fontSize: "12px", margin: 0 }}
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
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <label
                      htmlFor="pax"
                      className="text-muted"
                      style={{ fontSize: "12px", margin: 0 }}
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

                  {bookings.find(
                    (b) => b.tableId === selectedTable.id && b.date === today
                  ) && (
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
                      <p style={{ fontWeight: "600", margin: 0 }}>
                        {
                          bookings.find(
                            (b) =>
                              b.tableId === selectedTable.id && b.date === today
                          )?.customerName
                        }
                      </p>
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
                          style={{ border: "1px solid var(--border-color)" }}
                          onClick={() => setSelectedTable(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-secondary btn-full"
                          style={{ border: "1px solid var(--border-color)" }}
                          onClick={() =>
                            submitEditTable(selectedTable.seatingId)
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger btn-full"
                          onClick={() =>
                            handleDeleteTable(selectedTable.seatingId)
                          }
                        >
                          🗑️ Delete Table
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Unassigned Bookings */}
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Unassigned Bookings</h4>
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
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg-light)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "white")
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
                          style={{ margin: 0, fontSize: "12px" }}
                        >
                          {booking.time} • {booking.partySize} people
                        </p>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{
                            marginTop: "var(--spacing-xs)",
                            width: "100%",
                          }}
                          onClick={() => {
                            setSelectedBooking(booking);
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
                    style={{ margin: 0, fontSize: "14px" }}
                  >
                    No unassigned bookings for today
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

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
                          t.capacity >= selectedBooking.partySize
                      )
                      .map((table) => (
                        <button
                          key={table.id}
                          className="btn btn-secondary"
                          onClick={() => handleAssignBooking(table.id)}
                          style={{
                            textAlign: "left",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>
                            Table {table.number} {getTableIcon(table.type)}
                          </span>
                          <span
                            className="text-muted"
                            style={{ fontSize: "12px" }}
                          >
                            {table.capacity} seats
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
    )
  );
}
