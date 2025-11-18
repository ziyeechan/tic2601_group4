import { useState, useEffect } from "react";
import { bookingAPI, restaurantAPI } from "../utils/api";

export function AdminBookings({ restaurantId: propRestaurantId }) {
  const [bookings, setBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(propRestaurantId || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingBookings, setUpdatingBookings] = useState(new Set());

  // Load restaurants on mount
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await restaurantAPI.getAllRestaurants();
        const restaurantList = response.data || [];
        setRestaurants(restaurantList);

        // If no restaurant selected yet, select the first one
        if (!selectedRestaurantId && restaurantList.length > 0) {
          setSelectedRestaurantId(restaurantList[0].restaurantId);
        }
      } catch (error) {
        console.error("Error loading restaurants:", error);
      }
    };

    loadRestaurants();
  }, []);

  // Fetch bookings when restaurant changes
  useEffect(() => {
    if (selectedRestaurantId) {
      fetchBookings();
    }
  }, [selectedRestaurantId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Get restaurant-specific bookings
      const response =
        selectedRestaurantId && selectedRestaurantId > 0
          ? await bookingAPI.getBookingsByRestaurantId(selectedRestaurantId)
          : { data: { bookings: [] } };
      const bookingsData = response.data.bookings || [];

      // Get the selected restaurant's name from the restaurants list
      const selectedRestaurant = restaurants.find(
        (r) => r.restaurantId === parseInt(selectedRestaurantId)
      );
      const restaurantName = selectedRestaurant?.restaurantName || "Unknown Restaurant";

      // Transform backend data to frontend format
      const transformedBookings = bookingsData.map((booking) => {
        // Handle Sequelize dataValues if present
        const bookingData = booking.dataValues || booking;
        const seatingPlan = bookingData.SeatingPlan?.dataValues || bookingData.SeatingPlan;

        return {
          id: bookingData.bookingId,
          booking_id: bookingData.bookingId,
          confirmation_code: bookingData.confirmationCode,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          partySize: bookingData.partySize,
          party_size: bookingData.partySize,
          specialRequests: bookingData.specialRequests,
          date: bookingData.date || bookingData.bookingDate,
          booking_date: bookingData.date || bookingData.bookingDate,
          time: bookingData.time || bookingData.bookingTime,
          booking_time: bookingData.time || bookingData.bookingTime,
          status: bookingData.status,
          restaurantName: restaurantName,
          restaurant_id: bookingData.fkRestaurantId,
          seating_id: bookingData.fkSeatingId,
          tableNumber: seatingPlan?.tableNumber,
          createdAt: bookingData.createdAt
        };
      });
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      console.error("Error details:", error.response?.data || error.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      confirmed: "status-confirmed",
      pending: "status-pending",
      completed: "status-completed",
      cancelled: "status-cancelled",
      no_show: "status-no_show",
      seated: "status-seated",
    };
    return statusClasses[status] || "";
  };

  // Filter bookings
  let filtered = bookings;

  if (searchTerm) {
    filtered = filtered.filter(b =>
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (statusFilter !== "all") {
    filtered = filtered.filter((b) => b.status === statusFilter);
  }

  if (dateFilter) {
    filtered = filtered.filter(b => b.date === dateFilter);
  }

  // Handle status updates
  const updateBookingStatus = async (bookingId, newStatus) => {
    // Prevent duplicate updates
    if (updatingBookings.has(bookingId)) {
      console.log("Update already in progress for booking:", bookingId);
      return;
    }

    try {
      setUpdatingBookings((prev) => new Set(prev).add(bookingId));
      console.log("Updating booking:", bookingId, "to status:", newStatus);

      const response = await bookingAPI.updateBookingStatus(bookingId, newStatus);
      console.log("Update response:", response.data);

      // Optimistically update the local state for immediate UI feedback
      setBookings(prevBookings => 
        prevBookings.map(booking => {
          const bookingIdToCheck = booking.id || booking.booking_id;
          return bookingIdToCheck === bookingId ? { ...booking, status: newStatus } : booking;
        })
      );
      
      // Refresh bookings from server to ensure consistency
      await fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      console.error("Error response:", error.response?.data);

      // Revert optimistic update on error by refreshing
      await fetchBookings();

      const errorMessage =
        error.response?.data?.message || "Failed to update booking status. Please try again.";
      alert(errorMessage);
    } finally {
      setUpdatingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const getActionButtons = (booking) => {
    // Use booking_id as fallback if id is not available
    const bookingId = booking.id || booking.booking_id;
    
    if (!bookingId) {
      console.error("Booking ID not found for booking:", booking);
      return (
        <span className="text-muted" style={{ fontSize: "12px" }}>
          Invalid booking
        </span>
      );
    }

    const isUpdating = updatingBookings.has(bookingId);
    const buttonProps = {
      disabled: isUpdating,
      style: isUpdating ? { opacity: 0.6, cursor: "not-allowed" } : {},
    };

    switch (booking.status) {
      case "pending":
        return (
          <>
            <button
              {...buttonProps}
              className="btn btn-success btn-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateBookingStatus(bookingId, "confirmed");
              }}
            >
              {isUpdating ? "⏳" : "✓"} Confirm
            </button>
            <button
              {...buttonProps}
              className="btn btn-danger btn-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateBookingStatus(bookingId, "cancelled");
              }}
            >
              {isUpdating ? "⏳" : "✕"} Reject
            </button>
          </>
        );
      case "confirmed":
        return (
          <>
            <button
              {...buttonProps}
              className="btn btn-primary btn-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateBookingStatus(bookingId, "seated");
              }}
            >
              {isUpdating ? "⏳" : "👤"} Seat
            </button>
            <button
              {...buttonProps}
              className="btn btn-danger btn-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateBookingStatus(bookingId, "no_show");
              }}
            >
              {isUpdating ? "⏳" : "✕"} No Show
            </button>
          </>
        );
      case "seated":
        return (
          <button
            {...buttonProps}
            className="btn btn-success btn-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateBookingStatus(bookingId, "completed");
            }}
          >
            {isUpdating ? "⏳" : "✓"} Complete
          </button>
        );
      default:
        return (
          <span className="text-muted" style={{ fontSize: "12px" }}>
            No actions available
          </span>
        );
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "var(--spacing-lg)" }}>📋 Bookings Management</h2>

      {/* Restaurant Selector Card */}
      <div className="card mb-lg">
        <div className="card-header">
          <h4 className="card-title">Select Restaurant</h4>
        </div>
        <div className="card-content">
          <div className="form-group" style={{ maxWidth: "400px" }}>
            <label htmlFor="restaurantSelect">🏪 Restaurant</label>
            <select
              id="restaurantSelect"
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
            >
              <option value="">-- Select a restaurant --</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.restaurantId} value={restaurant.restaurantId}>
                  {restaurant.restaurantName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card mb-lg">
        <div className="card-header">
          <h4 className="card-title">Filters & Search</h4>
        </div>
        <div className="card-content">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--spacing-md)",
            }}
            className="admin-filters"
          >
            {/* Search */}
            <div className="form-group">
              <label htmlFor="search">🔍 Search</label>
              <input
                id="search"
                type="text"
                placeholder="Name, email, or restaurant"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="form-group">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="seated">Seated</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="form-group">
              <label htmlFor="dateFilter">📅 Date</label>
              <input
                id="dateFilter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="empty-state">
          <h3>Loading bookings...</h3>
        </div>
      ) : filtered.length > 0 ? (
        <div className="card">
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Date & Time</th>
                  <th>Party Size</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div>
                        <p style={{ fontWeight: "600", margin: 0 }}>{booking.customerName}</p>
                      </div>
                    </td>
                    <td>{booking.restaurantName}</td>
                    <td>
                      <div>
                        <p style={{ margin: 0 }}>
                          📅 {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--text-muted)",
                            fontSize: "12px",
                          }}
                        >
                          ⏰ {booking.time || booking.booking_time || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td>👥 {booking.partySize}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px" }}>
                        <p style={{ margin: 0, marginBottom: "4px" }}>📞 {booking.customerPhone}</p>
                        <p style={{ margin: 0, color: "var(--text-muted)" }}>
                          📧 {booking.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--spacing-xs)",
                          flexWrap: "wrap",
                        }}
                      >
                        {getActionButtons(booking)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No bookings found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--spacing-md)",
          marginTop: "var(--spacing-lg)",
        }}
        className="stats-cards"
      >
        <div className="card">
          <div className="card-content" style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--primary)",
              }}
            >
              {bookings.filter((b) => b.status === "confirmed").length}
            </div>
            <p className="text-muted" style={{ margin: 0 }}>
              Confirmed
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-content" style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--warning)",
              }}
            >
              {bookings.filter((b) => b.status === "pending").length}
            </div>
            <p className="text-muted" style={{ margin: 0 }}>
              Pending
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-content" style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--success)",
              }}
            >
              {bookings.filter((b) => b.status === "completed").length}
            </div>
            <p className="text-muted" style={{ margin: 0 }}>
              Completed
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-content" style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--danger)",
              }}
            >
              {bookings.filter((b) => b.status === "no_show").length}
            </div>
            <p className="text-muted" style={{ margin: 0 }}>
              No Shows
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
