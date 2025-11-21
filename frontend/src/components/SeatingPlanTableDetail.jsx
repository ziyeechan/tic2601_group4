import { seatingAPI, bookingAPI } from "../utils/api";
import { Card } from "./Common";

export function SeatingPlanTableDetail({
  selectedTable,
  setSelectedTable,
  isAddingTable,
  setIsAddingTable,
  tables,
  setTables,
  bookings,
  setBookings,
  selectedRestaurantId,
  isSameTableToday,
  setSelectedBooking,
  setShowAssignModal,
}) {
  if (!selectedTable) return null;

  // Populate fields when form is being filled
  const handleTableForm = (e) => {
    const { name, value } = e.target;
    setSelectedTable((prev) => ({
      ...prev,
      [name]: name === "pax" ? parseInt(value) : value,
    }));
  };

  // Find the all confirmed bookings for this table
  const tableBookingsToday = selectedTable
    ? bookings.filter((b) => b.status === "confirmed" && isSameTableToday(b, selectedTable))
    : [];

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
      const res = await seatingAPI.getSeatingPlansByRestaurant(selectedRestaurantId);
      const data = res.data.results || res.data || [];
      setTables(data);
    } catch (error) {
      console.error("Failed to create seating plan", error);
      alert("Failed to create table. Check console/server logs.");
    }
  };

  // Submit table data when edit table form is submitted
  const submitEditTable = async () => {
    if (!selectedTable) return;

    let tableId = selectedTable.seatingId ?? selectedTable.id;

    //error: if tableId still object
    if (typeof tableId === "object" && tableId !== null) {
      tableId = tableId.seatingId ?? tableId.id;
    }

    if (!tableId) {
      console.error("No valid tableId for update", { selectedTable });
      alert("Cannot update table: missing seatingId.");
      return;
    }

    // Only send the fields your backend expects
    const payload = {
      tableNumber: selectedTable.tableNumber,
      tableType: selectedTable.tableType,
      pax: selectedTable.pax,
      x: selectedTable.x,
      y: selectedTable.y,
    };

    try {
      console.log("Updating seating plan", tableId, payload);
      const res = await seatingAPI.updateSeatingPlan(tableId, payload);
      console.log("Updated seating plan:", res.data || res);

      // Update local state so the UI reflects the edit
      setTables((prev) =>
        prev.map((t) => (Number(t.seatingId) === Number(tableId) ? { ...t, ...payload } : t))
      );

      setSelectedTable(null);
    } catch (error) {
      console.error("Failed to update seating plan", error);
      alert("Failed to edit table. Check console/server logs.");
    }
  };

  const cancelAddTable = () => {
    let temp = tables.filter((table) => !table.isAdding);
    setTables(temp);
    setIsAddingTable(false);
    setSelectedTable(null);
  };

  // Handle delete table
  const handleDeleteTable = async () => {
    let tableId = selectedTable.seatingId ?? selectedTable.id;

    const table = tables.find((t) => String(t.seatingId) === String(tableId));
    if (!table) return;

    const isTemp = String(table.seatingId).startsWith("temp-");

    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }

    //delete from db
    if (!isTemp) {
      try {
        await seatingAPI.deleteSeatingPlan(tableId);
        console.log("Deleted seating plan", tableId);
      } catch (error) {
        console.error("Failed to delete seating plan", error);
        alert("Failed to delete table. Check console/server logs.");
        return;
      }

      //remove from local state, should not appear on canvas
      setTables((prev) => prev.filter((t) => String(t.seatingId) !== String(tableId)));

      //clear selected table
      if (selectedTable && String(selectedTable.seatingId) === String(tableId)) {
        setSelectedTable(null);
      }
    }
  };

  // Unassigns booking from table
  const handleUnassignBooking = async (booking) => {
    if (!booking) return;

    try {
      // Update DB
      await bookingAPI.updateBooking(booking.id, {
        fkSeatingId: null,
      });

      // Update local state
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, tableId: null } : b)));

      alert("Booking unassigned from table.");
    } catch (err) {
      console.error("Failed to unassign booking from table", err);
      alert("Failed to unassign booking. Check console/server logs.");
    }
  };

  const handleMoveBooking = (booking) => {
    setSelectedBooking(booking);
    setShowAssignModal(true);
  };

  const handleClearSelection = () => {
    setSelectedTable(null);
  };

  return (
    <Card className="mb-lg">
      <Card.Header title="Table Details" />
      <Card.Content>
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
            borderBottom: "1px solid var(--border-color)",
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
            borderBottom: "1px solid var(--border-color)",
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

        {tableBookingsToday.length > 0 && (
          <div
            className="mb-md"
            style={{
              paddingBottom: "var(--spacing-md)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <p className="text-muted" style={{ fontSize: "12px", margin: 0 }}>
              Bookings for this table (today)
            </p>

            {tableBookingsToday.map((booking) => (
              <div
                key={booking.id}
                style={{
                  marginTop: "6px",
                  padding: "4px 0",
                  borderBottom: "1px dashed var(--border-color)",
                }}
              >
                <p
                  style={{
                    fontWeight: "600",
                    margin: "2px 0",
                    fontSize: "13px",
                  }}
                >
                  {booking.customerName} • {booking.time} • {booking.partySize} pax
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "2px",
                  }}
                >
                  {/* Move this booking to another table */}
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleMoveBooking(booking)}
                  >
                    Move to Another Table
                  </button>

                  {/* Unassign this booking from this table */}
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleUnassignBooking(booking)}
                  >
                    Unassign
                  </button>
                </div>
              </div>
            ))}
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
              <button className="btn btn-success btn-full" onClick={() => submitAddTable()}>
                ➕ Add Table
              </button>
              <button className="btn btn-secondary btn-full" onClick={() => cancelAddTable()}>
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
                onClick={handleClearSelection}
              >
                Cancel
              </button>
              <button
                className="btn btn-secondary btn-full"
                style={{
                  border: "1px solid var(--border-color)",
                }}
                onClick={submitEditTable}
              >
                ✏️ Edit
              </button>
              <button className="btn btn-danger btn-full" onClick={handleDeleteTable}>
                🗑️ Delete Table
              </button>
            </>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}
