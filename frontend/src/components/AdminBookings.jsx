import { useState, useEffect } from "react";
import { bookingAPI, restaurantAPI } from "../utils/api";
import { Card, Toast } from "./Common";

export function AdminBookings({ restaurantId: propRestaurantId }) {
  const [bookings, setBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  // Default to empty string (show all bookings) unless a restaurant is passed as prop
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(propRestaurantId || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingBookings, setUpdatingBookings] = useState(new Set());
  const [isFetching, setIsFetching] = useState(false);

  const [show, setShow] = useState(false);
  const [type, setType] = useState("");
  const [text, setText] = useState("");

  // Load restaurants on mount
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await restaurantAPI.getAllRestaurants();
        const restaurantList = response.data || [];
        setRestaurants(restaurantList);
      } catch (error) {
        console.error("Error loading restaurants:", error);
      }
    };

    loadRestaurants();
  }, []);

  // Fetch bookings on mount and when restaurant selection changes
  useEffect(() => {
    // Always fetch bookings on mount or when selection changes
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurantId]);

  const fetchBookings = async (showLoading = true) => {
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log("Fetch already in progress, skipping...");
      // Don't modify loading state if a fetch is already in progress
      return;
    }

    try {
      setIsFetching(true);
      if (showLoading) {
        setLoading(true);
      }
      console.log("Fetching bookings...", { selectedRestaurantId });

      let response;
      let bookingsData;

      // If "all" is selected or no restaurant is selected, fetch all bookings
      if (!selectedRestaurantId || selectedRestaurantId === "all" || selectedRestaurantId === "") {
        console.log("Fetching all bookings...");
        response = await bookingAPI.getAllBookings();
        console.log("All bookings response:", response);
        console.log("Response data:", response.data);
        // Handle response structure: { totalBookings: X, bookings: [...] }
        if (response.data) {
          if (response.data.bookings && Array.isArray(response.data.bookings)) {
            bookingsData = response.data.bookings;
          } else if (Array.isArray(response.data)) {
            bookingsData = response.data;
          } else {
            bookingsData = [];
          }
        } else {
          bookingsData = [];
        }
      } else {
        // Get restaurant-specific bookings
        console.log("Fetching restaurant bookings for:", selectedRestaurantId);
        response = await bookingAPI.getBookingsByRestaurantId(selectedRestaurantId);
        console.log("Restaurant bookings response:", response);
        // Handle response structure: { bookings: [...] }
        if (response.data) {
          if (response.data.bookings && Array.isArray(response.data.bookings)) {
            bookingsData = response.data.bookings;
          } else if (Array.isArray(response.data)) {
            bookingsData = response.data;
          } else {
            bookingsData = [];
          }
        } else {
          bookingsData = [];
        }
      }

      console.log("Bookings data extracted:", bookingsData.length, "bookings found");
      console.log("First booking sample:", bookingsData[0] || "None");

      // Transform backend data to frontend format
      const transformedBookings = bookingsData.map((booking) => {
        // Handle Sequelize dataValues if present
        const bookingData = booking.dataValues || booking;
        const restaurant =
          bookingData.Restaurant?.dataValues || bookingData.Restaurant || bookingData.restaurant;
        const seatingPlan =
          bookingData.SeatingPlan?.dataValues || bookingData.SeatingPlan || bookingData.seatingPlan;

        // Get restaurant name from the relation or fallback
        const restaurantName =
          restaurant?.restaurantName ||
          restaurants.find((r) => r.restaurantId === bookingData.fkRestaurantId)?.restaurantName ||
          "Unknown Restaurant";

        // Handle date conversion - convert Date objects or ISO strings to Date objects
        let bookingDate = bookingData.date || bookingData.bookingDate;
        if (bookingDate && typeof bookingDate === "string") {
          bookingDate = new Date(bookingDate);
        } else if (bookingDate && !(bookingDate instanceof Date)) {
          bookingDate = new Date(bookingDate);
        }

        // Format date as YYYY-MM-DD for filtering
        const dateString = bookingDate ? bookingDate.toISOString().split("T")[0] : null;

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
          date: bookingDate, // Keep as Date object for display
          dateString: dateString, // String format for filtering
          booking_date: bookingDate,
          time: bookingData.time || bookingData.bookingTime,
          booking_time: bookingData.time || bookingData.bookingTime,
          status: bookingData.status,
          restaurantName: restaurantName,
          restaurant_id: bookingData.fkRestaurantId,
          seating_id: bookingData.fkSeatingId,
          tableNumber: seatingPlan?.tableNumber,
          createdAt: bookingData.createdAt,
        };
      });

      console.log("Transformed bookings:", transformedBookings.length, "bookings");
      setBookings(transformedBookings);
      if (transformedBookings.length === 0) {
        console.log("No bookings found in the response");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.error("Error stack:", error.stack);
      setBookings([]);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch bookings. Please check if the backend server is running.";
      handleToast("danger", errorMessage);
    } finally {
      // Always reset fetching state
      setIsFetching(false);
      // ALWAYS set loading to false in finally block to ensure it's reset
      // regardless of success, error, or showLoading parameter
      setLoading(false);
      console.log("Fetch complete, loading set to false");
    }
  };

  const handleToast = (type, message) => {
    setShow(true);
    setType(type);
    setText(message);
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
    filtered = filtered.filter(
      (b) =>
        b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.confirmation_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (statusFilter !== "all") {
    filtered = filtered.filter((b) => b.status === statusFilter);
  }

  if (dateFilter) {
    // Compare date strings (YYYY-MM-DD format)
    filtered = filtered.filter((b) => {
      const bookingDateStr =
        b.dateString || (b.date ? new Date(b.date).toISOString().split("T")[0] : null);
      return bookingDateStr === dateFilter;
    });
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
      setBookings((prevBookings) =>
        prevBookings.map((booking) => {
          const bookingIdToCheck = booking.id || booking.booking_id;
          return bookingIdToCheck === bookingId ? { ...booking, status: newStatus } : booking;
        })
      );

      // Refresh bookings from server to ensure consistency
      // Don't show loading spinner when refreshing after status update
      await fetchBookings(false);
    } catch (error) {
      console.error("Error updating booking status:", error);
      console.error("Error response:", error.response?.data);

      // Revert optimistic update on error by refreshing
      // Don't show loading spinner when refreshing after error
      await fetchBookings(false);

      const errorMessage =
        error.response?.data?.message || "Failed to update booking status. Please try again.";
      handleToast("danger", errorMessage);
      // alert(errorMessage);
    } finally {
      setUpdatingBookings((prev) => {
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
      <Card className="mb-lg">
        <Card.Header title="Select Restaurant" />
        <Card.Content>
          {" "}
          <div className="form-group" style={{ maxWidth: "400px" }}>
            <label htmlFor="restaurantSelect">🏪 Restaurant</label>
            <select
              id="restaurantSelect"
              value={selectedRestaurantId || "all"}
              onChange={(e) =>
                setSelectedRestaurantId(e.target.value === "all" ? "" : e.target.value)
              }
            >
              <option value="all">📋 All Restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.restaurantId} value={restaurant.restaurantId}>
                  {restaurant.restaurantName}
                </option>
              ))}
            </select>
          </div>
        </Card.Content>
      </Card>

      {/* Filters Card */}
      <Card className="mb-lg">
        <Card.Header title="Filters & Search" />
        <Card.Content>
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
        </Card.Content>
      </Card>

      {/* Bookings Table */}
      {loading && bookings.length === 0 ? (
        <div className="empty-state">
          <h3>Loading bookings...</h3>
        </div>
      ) : filtered.length > 0 ? (
        <Card>
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
                          📅{" "}
                          {booking.date
                            ? booking.date instanceof Date
                              ? booking.date.toLocaleDateString()
                              : new Date(booking.date).toLocaleDateString()
                            : "N/A"}
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
        </Card>
      ) : !loading ? (
        <div className="empty-state">
          <h3>No bookings found</h3>
          <p>
            {bookings.length === 0
              ? "No bookings exist yet. Create bookings through the customer booking form."
              : "Try adjusting your filters to see more results."}
          </p>
        </div>
      ) : null}

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
        <Card>
          <Card.Content styles={{ textAlign: "center" }}>
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
          </Card.Content>
        </Card>

        <Card>
          <Card.Content styles={{ textAlign: "center" }}>
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
          </Card.Content>
        </Card>
        <Card>
          <Card.Content styles={{ textAlign: "center" }}>
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
          </Card.Content>
        </Card>
        <Card>
          <Card.Content styles={{ textAlign: "center" }}>
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
          </Card.Content>
        </Card>
      </div>

      {/* Toast Notification */}
      {show && <Toast show={show} type={type} text={text} onClose={() => setShow(false)} />}
    </div>
  );
}
