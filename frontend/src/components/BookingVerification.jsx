import { useState } from "react";
import { bookingAPI, reviewAPI } from "../utils/api";

export function BookingVerification({ onBookingVerified, onClose }) {
  const [searchMode, setSearchMode] = useState("email"); // "email" or "code"
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchByEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingAPI.getBookingsByEmail(email.trim());
      const bookings = response.data.bookings || [];

      // Filter for completed bookings only
      const completedBookings = bookings.filter((b) => b.status === "completed");

      if (completedBookings.length === 0) {
        setError(
          "No completed bookings found. You must have a completed booking to leave a review."
        );
        return;
      }

      // Filter bookings - exclude those that already have reviews (unless explicitly allowing re-review)
      const bookingsWithoutReviews = [];
      const bookingsWithReviews = [];

      for (const booking of completedBookings) {
        try {
          const reviewResponse = await reviewAPI.getReviewsByBooking(booking.bookingId);
          console.log(reviewResponse, "reviewResponse");

          const hasReview =
            reviewResponse.data.reviewInfo && reviewResponse.data.reviewInfo.length > 0;

          if (hasReview) {
            bookingsWithReviews.push(booking);
          } else {
            bookingsWithoutReviews.push(booking);
          }
        } catch (err) {
          // If error checking reviews, treat as no review
          bookingsWithoutReviews.push(booking);
        }
      }

      // If user only has bookings they've already reviewed
      if (bookingsWithoutReviews.length === 0 && bookingsWithReviews.length > 0) {
        setError(
          "You have already reviewed this restaurant from your completed bookings. You can only leave one review per booking. However, you can review again if you have other completed bookings at this restaurant."
        );
        return;
      }

      // If only one new booking available, select it automatically
      if (bookingsWithoutReviews.length === 1) {
        onBookingVerified(bookingsWithoutReviews[0]);
        return;
      }

      // If multiple unreviewd bookings, show list for user to choose
      if (bookingsWithoutReviews.length > 1) {
        // For now, just select the first one
        // In a more advanced version, you could show a dropdown to choose
        onBookingVerified(bookingsWithoutReviews[0]);
        return;
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.response?.data?.message || "Failed to fetch your bookings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByCode = async (e) => {
    e.preventDefault();
    if (!confirmationCode.trim()) {
      setError("Please enter your confirmation code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingAPI.getBookingByCode(confirmationCode.trim());
      const booking = response.data.booking;

      if (booking.status !== "completed") {
        setError("You can only leave a review for completed bookings.");
        return;
      }

      // Check if this booking already has a review
      try {
        const reviewResponse = await reviewAPI.getReviewsByBooking(booking.bookingId);
        const hasReview =
          reviewResponse.data.reviewInfo && reviewResponse.data.reviewInfo.length > 0;

        if (hasReview) {
          setError(
            "You have already reviewed this restaurant with this booking. You can only leave one review per booking. If you have other completed bookings at this restaurant, you can review those instead."
          );
          return;
        }
      } catch (err) {
        // If error checking reviews, continue anyway
        console.error("Error checking reviews:", err);
      }

      onBookingVerified(booking);
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError(
        err.response?.data?.message || "Booking not found. Please check your confirmation code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        zIndex: 1500,
      }}
    >
      <div className="card" style={{ maxWidth: "500px", width: "90%" }}>
        <div className="card-header">
          <div className="flex-between" style={{ alignItems: "center" }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              ⭐ Verify Your Booking
            </h3>
            <button
              onClick={onClose}
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
        </div>
        <div className="card-content">
          <p className="text-muted" style={{ marginBottom: "var(--spacing-md)" }}>
            Please verify your booking to leave a review. You must have completed a booking at this
            restaurant.
          </p>

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
              onClick={() => {
                setSearchMode("email");
                setError(null);
              }}
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
              📧 By Email
            </button>
            <button
              className={`tab-button ${searchMode === "code" ? "active" : ""}`}
              onClick={() => {
                setSearchMode("code");
                setError(null);
              }}
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
              🔐 By Code
            </button>
          </div>

          {/* Error Message */}
          {error && <div className="alert alert-error mb-md">{error}</div>}

          {/* Email Search */}
          {searchMode === "email" && (
            <form onSubmit={handleSearchByEmail}>
              <div className="form-group">
                <label htmlFor="verifyEmail">📧 Email Address</label>
                <input
                  id="verifyEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                {isLoading ? "⏳ Verifying..." : "✓ Verify Booking"}
              </button>
            </form>
          )}

          {/* Confirmation Code Search */}
          {searchMode === "code" && (
            <form onSubmit={handleSearchByCode}>
              <div className="form-group">
                <label htmlFor="verifyCode">🔐 Confirmation Code</label>
                <input
                  id="verifyCode"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123XYZ"
                  required
                  disabled={isLoading}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                {isLoading ? "⏳ Verifying..." : "✓ Verify Booking"}
              </button>
            </form>
          )}

          <div className="alert alert-info" style={{ marginTop: "var(--spacing-md)" }}>
            <p style={{ margin: 0, fontSize: "12px" }}>
              💡 Only completed bookings can be reviewed. If you just finished your meal, your
              booking status will be updated shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
