import { useRef, useState } from "react";
import { seatingAPI } from "../utils/api";
import { Card } from "./Common";

export function SeatingPlanCanvas({
  tables,
  setTables,
  bookings,
  today,
  selectedRestaurantId,
  selectedTable,
  setSelectedTable,
  isAddingTable,
  setIsAddingTable,
  getTableColor,
  getTableIcon,
}) {
  const canvasRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const radius = 60;

  //Dragging function of restaurant layout
  const getTableUniqueId = (table) => table.seatingId || table.tempId;

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

  // Create node on canvas for add table button
  const handleAddTable = () => {
    if (!selectedRestaurantId) {
      alert("Please select a restaurant first");
      return;
    }

    // wait for click on the canvas
    setIsAddingTable(true);
    setSelectedTable(null);
  };

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

    const newX = Math.max(0, Math.min(rect.width - radius, xInCanvas - dragOffset.x));
    const newY = Math.max(0, Math.min(rect.height - radius, yInCanvas - dragOffset.y));

    setTables((prev) =>
      prev.map((t) => (getTableUniqueId(t) === draggingId ? { ...t, x: newX, y: newY } : t))
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

  const handleCanvasMouseDown = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const xInCanvas = e.clientX - rect.left;
    const yInCanvas = e.clientY - rect.top;

    // cursor is roughly in the centre
    const newX = Math.max(0, Math.min(rect.width - radius, xInCanvas - radius / 2));
    const newY = Math.max(0, Math.min(rect.height - radius, yInCanvas - radius / 2));

    // when adding a table, create it at this position
    if (isAddingTable) {
      const tempId = `temp-${Date.now()}`;

      const newTable = {
        restaurantId: selectedRestaurantId || "1",
        seatingId: tempId, // tempid for dragging to work
        x: newX,
        y: newY,
        isAdding: true,
        tableNumber: "",
        tableType: "outdoor",
        pax: 2,
      };

      setTables((prev) => [...prev, newTable]);
      setSelectedTable(newTable);
      return;
    }

    // click on empty canvas clears selection
    setSelectedTable(null);
  };

  const handleTableClick = (table) => {
    if (isAddingTable) alert("Please fill in the new table before changing");
    else {
      setSelectedTable(table);
    }
  };

  return (
    <Card>
      <Card.Header>
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
      </Card.Header>

      <Card.Content>
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
            Time Slot Legend:
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
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {tables.map((table) => {
            const booking = bookings.find((b) => b.tableId === table.seatingId && b.date === today);
            const isSelected = selectedTable?.seatingId === table.seatingId;

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
                    backgroundColor: getTableColor(table.tableType),
                    border: isSelected ? "3px solid var(--text-dark)" : "none",
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
                  <div style={{ fontSize: "16px" }}>{table.tableNumber}</div>
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
      </Card.Content>
    </Card>
  );
}
