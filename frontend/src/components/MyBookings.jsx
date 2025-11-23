import { useState, useEffect } from "react";
import { bookingAPI } from "../utils/api";
import { generateTimeSlots } from "../utils/timeSlotUtils";
import { Reviews } from "./Reviews";
import { Card } from "./Common";
export function MyBookings({ autoFillEmail = "", highlightConfirmationCode = "" }) {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [customerEmail, setCustomerEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState(autoFillEmail || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [searchMode, setSearchMode] = useState("email"); // "email" or "code"
  const [searchCode, setSearchCode] = useState("");
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [bookingReviews, setBookingReviews] = useState({}); // Map bookingId -> review

  // Auto-search if email is provided
  useEffect(() => {
    if (autoFillEmail && !customerEmail) {
      // Trigger search with the provided email
      handleSearchBookings({ preventDefault: () => {} }, autoFillEmail);
    }
  }, [autoFillEmail]);

  const today = new Date().toISOString().split("T")[0];

  const upcomingBookings = bookings.filter(
    (b) => (b.status === "confirmed" || b.status === "pending") && b.bookingDate >= today
  );

  const pastBookings = bookings.filter(
    (b) =>
      b.status === "completed" ||
      b.status === "cancelled" ||
      b.status === "no_show" ||
      b.bookingDate < today
  );

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

  // Build reviews map from bookings data
  const buildReviewsMap = (bookingsData) => {
    const reviewsMap = {};
    bookingsData.forEach((booking) => {
      if (booking.review) {
        reviewsMap[booking.bookingId] = booking.review;
      }
    });
    return reviewsMap;
  };

  // Refresh bookings data from API
  const refreshBookingsData = async (email) => {
    try {
      const response = await bookingAPI.getBookingsByEmail(email, true);
      const bookingsData = response.data.bookings || [];
      setBookings(bookingsData);
      setBookingReviews(buildReviewsMap(bookingsData));
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    }
  };

  // Fetch bookings by customer email
  const handleSearchBookings = async (e, emailParam = null) => {
    e.preventDefault();

    const emailToSearch = emailParam || searchEmail;

    if (!emailToSearch.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await bookingAPI.getBookingsByEmail(emailToSearch, true);
      const bookingsData = response.data.bookings || [];
      setBookings(bookingsData);
      setCustomerEmail(emailToSearch);
      setBookingReviews(buildReviewsMap(bookingsData));

      if (bookingsData.length === 0) {
        setMessage({
          type: "info",
          text: "No bookings found for this email address",
        });
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 404) {
        setMessage({
          type: "info",
          text: "No bookings found for this email address",
        });
      } else {
        const errorMessage = error.response?.data?.message || "Failed to load bookings. Please try again.";
        setMessage({
          type: "error",
          text: errorMessage,
        });
      }
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingAPI.deleteBooking(bookingId);
        setMessage({
          type: "success",
          text: "Booking cancelled successfully",
        });
        // Refresh bookings after cancellation
        if (customerEmail) {
          await refreshBookingsData(customerEmail);
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to cancel booking. Please try again.";
        setMessage({
          type: "error",
          text: errorMessage,
        });
      }
    }
  };

  const handleEdit = (booking) => {
    setEditingBookingId(booking.bookingId);
    setEditFormData({
      date: booking.bookingDate,
      time: booking.bookingTime,
      partySize: booking.partySize,
      specialRequests: booking.specialRequests || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBookingId) return;

    try {
      await bookingAPI.updateBooking(editingBookingId, {
        bookingDate: editFormData.date,
        bookingTime: editFormData.time,
        partySize: editFormData.partySize,
        specialRequests: editFormData.specialRequests,
      });

      setMessage({
        type: "success",
        text: "Booking updated successfully",
      });

      setEditingBookingId(null);

      // Refresh bookings
      if (customerEmail) {
        await refreshBookingsData(customerEmail);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      const errorMessage = error.response?.data?.message || "Failed to update booking.";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingBookingId(null);
    setEditFormData({});
  };

  // Fetch booking by confirmation code
  const handleSearchByCode = async (e) => {
    e.preventDefault();

    if (!searchCode.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a confirmation code",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await bookingAPI.getBookingByCode(searchCode.trim(), true);
      const booking = response.data.booking;
      setBookings([booking]); // Wrap in array for consistent display
      setCustomerEmail(booking.customerEmail);
      setActiveTab("upcoming"); // Show in upcoming tab by default
      setBookingReviews(buildReviewsMap([booking]));
    } catch (error) {
      console.error("Error fetching booking:", error);
      if (error.response?.status === 404) {
        setMessage({
          type: "info",
          text: "No booking found with this confirmation code",
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to load booking. Please try again.",
        });
      }
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <div>
      <h2 style={{ marginBottom: "var(--spacing-lg)" }}>📅 My Bookings</h2>

      {/* Search Form */}
      <Card className="mb-lg">
        <Card.Header title="Find Your Bookings" />
        <Card.Content>
          {/* Search Mode Tabs */}
          <div
            style={{
              display: "flex",
              gap: "var(--spacing-md)",
              marginBottom: "var(--spacing-md)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <button
              className={`tab-button ${searchMode === "email" ? "active" : ""}`}
              onClick={() => setSearchMode("email")}
              style={{
                border: "none",
                background: "none",
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: searchMode === "email" ? "2px solid var(--primary)" : "none",
                color: searchMode === "email" ? "var(--primary)" : "var(--text-muted)",
                fontWeight: searchMode === "email" ? "600" : "normal",
              }}
            >
              📧 Search by Email
            </button>
            <button
              className={`tab-button ${searchMode === "code" ? "active" : ""}`}
              onClick={() => setSearchMode("code")}
              style={{
                border: "none",
                background: "none",
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: searchMode === "code" ? "2px solid var(--primary)" : "none",
                color: searchMode === "code" ? "var(--primary)" : "var(--text-muted)",
                fontWeight: searchMode === "code" ? "600" : "normal",
              }}
            >
              🔐 Search by Confirmation Code
            </button>
          </div>

          {/* Email Search Form */}
          {searchMode === "email" && (
            <form
              onSubmit={handleSearchBookings}
              style={{
                display: "flex",
                gap: "var(--spacing-md)",
                alignItems: "flex-end",
              }}
            >
              <div style={{ flex: 1 }}>
                <label htmlFor="searchEmail">📧 Your Email Address</label>
                <input
                  id="searchEmail"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter your email to view bookings"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "⏳ Loading..." : "🔍 Search"}
              </button>
            </form>
          )}

          {/* Confirmation Code Search Form */}
          {searchMode === "code" && (
            <form
              onSubmit={handleSearchByCode}
              style={{
                display: "flex",
                gap: "var(--spacing-md)",
                alignItems: "flex-end",
              }}
            >
              <div style={{ flex: 1 }}>
                <label htmlFor="searchCode">🔐 Confirmation Code</label>
                <input
                  id="searchCode"
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="Enter your confirmation code (e.g., ABC123XYZ)"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "⏳ Loading..." : "🔍 Search"}
              </button>
            </form>
          )}
        </Card.Content>
      </Card>

      {/* Messages */}
      {message && <div className={`alert alert-${message.type} mb-lg`}>{message.text}</div>}

      {/* Tabs */}
      <div className="tabs mb-lg">
        <button
          className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
          style={{ border: "none", background: "none" }}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          className={`tab-button ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
          style={{ border: "none", background: "none" }}
        >
          Past Bookings ({pastBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {displayBookings.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--spacing-md)",
          }}
        >
          {displayBookings.map((booking) => (
            <Card key={booking.bookingId}>
              <Card.Content>
                <div className="flex-between mb-md" style={{ alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: 0, marginBottom: "var(--spacing-sm)" }}>
                      {booking.Restaurant?.restaurantName || "Restaurant"}
                    </h4>
                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div
                    className="text-muted"
                    style={{
                      fontSize: "12px",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      backgroundColor:
                        booking.confirmationCode === highlightConfirmationCode
                          ? "rgba(16, 185, 129, 0.2)"
                          : "transparent",
                      border:
                        booking.confirmationCode === highlightConfirmationCode
                          ? "2px solid rgb(16, 185, 129)"
                          : "none",
                    }}
                  >
                    Confirmation:{" "}
                    <strong
                      style={{
                        color:
                          booking.confirmationCode === highlightConfirmationCode
                            ? "rgb(16, 185, 129)"
                            : "inherit",
                      }}
                    >
                      {booking.confirmationCode}
                    </strong>
                  </div>
                </div>

                {/* Booking Details */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "var(--spacing-md)",
                    marginBottom: "var(--spacing-md)",
                  }}
                >
                  <div>
                    <span className="text-muted" style={{ fontSize: "12px", display: "block" }}>
                      📅 Date & Time
                    </span>
                    <p style={{ fontWeight: "600", margin: 0 }}>
                      {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: "12px", display: "block" }}>
                      👥 Party Size
                    </span>
                    <p style={{ fontWeight: "600", margin: 0 }}>
                      {booking.partySize} {booking.partySize === 1 ? "person" : "people"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: "12px", display: "block" }}>
                      📞 Phone
                    </span>
                    <p style={{ fontWeight: "600", margin: 0 }}>{booking.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: "12px", display: "block" }}>
                      📧 Email
                    </span>
                    <p style={{ fontWeight: "600", margin: 0 }}>{booking.customerEmail}</p>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div
                    className="mb-md"
                    style={{
                      paddingTop: "var(--spacing-md)",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <span className="text-muted" style={{ fontSize: "12px", display: "block" }}>
                      💬 Special Requests
                    </span>
                    <p style={{ margin: 0 }}>{booking.specialRequests}</p>
                  </div>
                )}

                {/* Existing Review Display (if review exists) */}
                {activeTab === "past" && bookingReviews[booking.bookingId] && (
                  <div
                    className="mb-md"
                    style={{
                      paddingTop: "var(--spacing-md)",
                      borderTop: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-light)",
                      padding: "var(--spacing-md)",
                      borderRadius: "var(--radius-md)",
                      marginTop: "var(--spacing-md)",
                    }}
                  >
                    <div className="flex-between mb-md" style={{ alignItems: "flex-start" }}>
                      <h5 style={{ margin: 0, marginBottom: "var(--spacing-sm)" }}>
                        ⭐ Your Review
                      </h5>
                      <span className="text-muted" style={{ fontSize: "12px" }}>
                        {new Date(bookingReviews[booking.bookingId].createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "2px", marginBottom: "var(--spacing-sm)" }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ fontSize: "16px" }}>
                          {i < bookingReviews[booking.bookingId].rating ? "⭐" : "☆"}
                        </span>
                      ))}
                      <span className="text-muted" style={{ fontSize: "12px", marginLeft: "8px" }}>
                        {bookingReviews[booking.bookingId].rating}.0/5.0
                      </span>
                    </div>

                    <p style={{ margin: 0, color: "var(--text-dark)" }}>
                      {bookingReviews[booking.bookingId].comment}
                    </p>
                  </div>
                )}

                {/* Booking Date */}
                {booking.createdAt && (
                  <div
                    className="text-muted"
                    style={{
                      fontSize: "12px",
                      paddingTop: "var(--spacing-md)",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                )}
              </Card.Content>

              {/* Edit Form - Shows when editing */}
              {editingBookingId === booking.bookingId && (
                <div
                  style={{
                    backgroundColor: "var(--bg-light)",
                    padding: "var(--spacing-md)",
                    borderTop: "1px solid var(--border-color)",
                  }}
                >
                  <h5 style={{ margin: 0, marginBottom: "var(--spacing-md)" }}>Edit Booking</h5>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "var(--spacing-md)",
                      marginBottom: "var(--spacing-md)",
                    }}
                  >
                    <div>
                      <label htmlFor={`edit-date-${booking.bookingId}`}>📅 Date</label>
                      <input
                        id={`edit-date-${booking.bookingId}`}
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label htmlFor={`edit-time-${booking.bookingId}`}>🕐 Time</label>
                      <select
                        id={`edit-time-${booking.bookingId}`}
                        value={editFormData.time}
                        onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                      >
                        <option value="">Select a time</option>
                        {generateTimeSlots(
                          booking.restaurant?.openingTime || "11:00",
                          booking.restaurant?.closingTime || "22:00"
                        ).map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`edit-party-size-${booking.bookingId}`}>👥 Party Size</label>
                      <select
                        id={`edit-party-size-${booking.bookingId}`}
                        value={editFormData.partySize}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            partySize: parseInt(e.target.value),
                          })
                        }
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((size) => (
                          <option key={size} value={size}>
                            {size} {size === 1 ? "person" : "people"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "var(--spacing-md)" }}>
                    <label htmlFor={`edit-requests-${booking.bookingId}`}>
                      💬 Special Requests
                    </label>
                    <textarea
                      id={`edit-requests-${booking.bookingId}`}
                      value={editFormData.specialRequests}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          specialRequests: e.target.value,
                        })
                      }
                      placeholder="Any special requests?"
                      style={{ minHeight: "80px" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveEdit}
                      style={{ flex: 1 }}
                    >
                      ✓ Save Changes
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      style={{ flex: 1 }}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              )}
              {editingBookingId !== booking.bookingId && (
                <Card.Footer styles={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  {/* Upcoming bookings - Edit and Cancel */}
                  {activeTab === "upcoming" && (
                    <>
                      <button className="btn btn-secondary" onClick={() => handleEdit(booking)}>
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancel(booking.bookingId)}
                      >
                        ✕ Cancel
                      </button>
                    </>
                  )}

                  {/* Past bookings - Allow review if not cancelled/no_show */}
                  {activeTab === "past" &&
                    booking.status !== "cancelled" &&
                    booking.status !== "no_show" && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setReviewingBooking(booking)}
                        style={{ flex: 1 }}
                      >
                        {bookingReviews[booking.bookingId] ? "✏️ Edit Review" : "⭐ Write a Review"}
                      </button>
                    )}

                  {/* Cancelled or no-show bookings - no review option */}
                  {activeTab === "past" &&
                    (booking.status === "cancelled" || booking.status === "no_show") && (
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {booking.status === "cancelled"
                          ? "❌ This booking was cancelled"
                          : "⏭️ You didn't show up for this booking"}
                      </div>
                    )}
                </Card.Footer>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: "var(--spacing-xl)" }}>
          <h3>No bookings found</h3>
          <p>
            {activeTab === "upcoming"
              ? "You don't have any upcoming bookings yet. Start exploring restaurants!"
              : "You don't have any past bookings."}
          </p>
        </div>
      )}

      {/* Review Modal - Option 1: From Completed Bookings */}
      {reviewingBooking && (
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
            zIndex: 2000,
            overflow: "auto",
          }}
        >
          <Card styles={{ maxWidth: "800px", width: "90%", maxHeight: "90vh", overflow: "auto" }}>
            <Card.Header>
              <div className="flex-between" style={{ alignItems: "center" }}>
                <h3 className="card-title" style={{ margin: 0 }}>
                  ⭐ Review: {reviewingBooking.Restaurant?.restaurantName || "Restaurant"}
                </h3>
                <button
                  onClick={() => setReviewingBooking(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  ✕
                </button>
              </div>
            </Card.Header>
            <Card.Content>
              <div
                style={{
                  marginBottom: "var(--spacing-md)",
                  paddingBottom: "var(--spacing-md)",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <p className="text-muted" style={{ margin: 0, fontSize: "14px" }}>
                  Booking Date: {new Date(reviewingBooking.bookingDate).toLocaleDateString()} at{" "}
                  {reviewingBooking.bookingTime}
                </p>
              </div>
              <Reviews
                restaurant={{
                  restaurantId:
                    reviewingBooking.fkRestaurantId || reviewingBooking.Restaurant?.restaurantId,
                  restaurantName: reviewingBooking.Restaurant?.restaurantName,
                }}
                bookingId={reviewingBooking.bookingId}
                existingReview={bookingReviews[reviewingBooking.bookingId] || null}
                onBack={() => {
                  setReviewingBooking(null);
                  // Refresh bookings with updated review data
                  if (customerEmail) {
                    refreshBookingsData(customerEmail);
                  }
                }}
              />
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
}
