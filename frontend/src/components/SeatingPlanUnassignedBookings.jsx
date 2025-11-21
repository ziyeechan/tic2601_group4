import { Card } from "./Common";

export function SeatingPlanUnassignedBookings({
  bookings,
  today,
  selectedRestaurantId,
  onSelectBooking,
}) {
  // Get unassigned bookings for today
  const unassignedBookings = bookings.filter(
    (b) =>
      b.date === today &&
      b.status === "confirmed" &&
      !b.tableId &&
      (!selectedRestaurantId || b.restaurantId === Number(selectedRestaurantId))
  );

  return (
    <Card>
      <Card.Header title="Unassigned Bookings" />
      <Card.Content>
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
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-light)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
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
                  {booking.time} • {booking.partySize} people
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{
                    marginTop: "var(--spacing-xs)",
                    width: "100%",
                  }}
                  onClick={() => {
                    onSelectBooking(booking);
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
      </Card.Content>
    </Card>
  );
}
