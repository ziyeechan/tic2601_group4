export function SeatingPlanCanvas({
  tables,
  bookings,
  getTableIcon,
  selectedTable,
  setSelectedTable,
  isAddingTable
}) {
  const today = new Date().toISOString().split("T")[0];
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

  const getTableStatus = (table) => {
    const booking = bookings.find(
      (b) => b.tableId === table.id && b.date === today
    );
    if (booking && booking.status === "confirmed") return "occupied";
    if (!table.isAvailable) return "unavailable";
    return "available";
  };

  const handleTableClick = (table) => {
    if (isAddingTable) alert("Please fill in the new table before changing");
    else {
      setSelectedTable(table);
    }
  };

  return (
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
    >
      {tables.map((table) => {
        const status = getTableStatus(table);
        const booking = bookings.find(
          (b) => b.tableId === table.seatingId && b.date === today
        );
        const isSelected = selectedTable?.seatingId === table.seatingId;

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
  );
}
