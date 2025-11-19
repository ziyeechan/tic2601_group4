import React from "react";

export function SeatingPlanTimeSlots({
	selectedTable,
	timeSlots,
	bookings,
	slotOverrides,
	setSlotOverrides,
	selectedRestaurantId,
	today,
    parseTimeToMinutes,
    isSameTableToday, 
	DINING_DURATION_MIN = 90,
}) {
    if (!selectedTable) return null;
    
    // Key to store overrides per restaurant, table and slot
    const getSlotKey = (slot, table) => `${selectedRestaurantId}-${table?.seatingId || "restaurant"}-${slot.start}`;
    
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
            return Math.max(slotStart, bookingStart) < Math.min(slotEnd, bookingEnd);
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
    
    return (
        <div className="card mb-lg">
            <div className="card-header">
                <h4 className="card-title">Today's Time Slots</h4>
            </div>
            <div className="card-content">
                {timeSlots.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: "14px", margin: 0 }}>
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
                            const booking = findBookingForSlotAndTable(slot, selectedTable);
                            const status = getSlotStatus(slot, selectedTable);
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
                                tooltipLines.push(`Note: ${override.comment}`);
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
                                        cursor: status === "occupied" ? "not-allowed" : "pointer",
                                    }}
                                    onClick={() => handleToggleSlot(slot, selectedTable)}
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
                                                    background: "rgba(0,0,0,0.2)",
                                                    border: "none",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditComment(slot, selectedTable);
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
                                                {booking.customerName.split(" ")[0]}
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
                    • Dining duration is 90 minutes (3 slots).
                    <br />• Click an <strong>available</strong> slot to mark it unavailable,
                    click again to reset.
                    <br />
                    • 📝 Add a note for why a slot is unavailable.
                    <br />• Hover any slot to see booking details.
                </p>
            </div>
        </div>
    );
}