import { useState, useEffect } from "react";
import { reviewAPI, bookingAPI } from "../utils/api";
import { Card } from "./Common";
import { BookingVerification } from "./BookingVerification";

export function Reviews({ restaurant, onBack, bookingId, existingReview = null }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!existingReview); // Show form immediately if editing
  const [showVerification, setShowVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifiedBookingId, setVerifiedBookingId] = useState(bookingId || null);
  const [isEditing, setIsEditing] = useState(!!existingReview);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const [formData, setFormData] = useState({
    customerName: "",
    rating: 5,
    comment: "",
    isAnonymous: false,
  });

  const [show, setShow] = useState(false);
  const [type, setType] = useState("");
  const [text, setText] = useState("");

  // Initialize form with existing review data if editing
  useEffect(() => {
    if (existingReview && isEditing) {
      setFormData({
        customerName: "",
        rating: existingReview.rating || 5,
        comment: existingReview.comment || "",
        isAnonymous: false,
      });
      setShowForm(true);
    }
  }, [existingReview, isEditing]);

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (restaurant?.restaurantId) {
          const response = await reviewAPI.getReviewsByRestaurant(restaurant.restaurantId);
          // Transform API response to match component state format
          const reviewsArray = response.data.reviewInfo || response.data.data || [];
          const transformedReviews = (Array.isArray(reviewsArray) ? reviewsArray : []).map(
            (review) => ({
              id: review.reviewId,
              reviewId: review.reviewId,
              restaurantId: review.fkRestaurantId,
              customerName: review.booking?.customerName || "Anonymous",
              rating: parseInt(review.rating) || 0,
              comment: review.comment,
              createdAt: review.createdAt,
            })
          );
          setReviews(transformedReviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        // Fall back to empty array on error
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurant?.restaurantId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleToast = (type, message) => {
    setShow(true);
    setType(type);
    setText(message);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!formData.comment.trim()) {
      handleToast("warning", "Please write a comment for your review");
      // alert("Please write a comment for your review");
      return;
    }

    // Only validate name when creating a new review, not when editing
    if (!isEditing && !formData.isAnonymous && !formData.customerName.trim()) {
      handleToast("warning", "Please enter your name or choose to review anonymously");
      // alert("Please enter your name or choose to review anonymously");
      return;
    }

    try {
      setSubmitting(true);

      if (isEditing && existingReview?.reviewId) {
        const updatePayload = {
          rating: formData.rating,
          comment: formData.comment,
        };

        await reviewAPI.updateReview(existingReview.reviewId, updatePayload);

        // Update local state
        setFormData({
          customerName: "",
          rating: 5,
          comment: "",
          isAnonymous: false,
        });
        setShowForm(false);
        setIsEditing(false);
        handleToast("success", "Review updated successfully!");
        // alert("Review updated successfully!");

        // Trigger parent refresh
        if (onBack) {
          onBack();
        }
      } else {
        // Create new review
        const response = await reviewAPI.createReview(
          restaurant.restaurantId,
          verifiedBookingId || null,
          {
            customerName: formData.isAnonymous ? null : formData.customerName,
            rating: formData.rating,
            comment: formData.comment,
          }
        );

        // Add new review to local state (from API response)
        const newReview = {
          id: response.data.data?.reviewId || response.data.reviewId,
          reviewId: response.data.data?.reviewId || response.data.reviewId,
          restaurantId: response.data.data?.fkRestaurantId || restaurant.restaurantId,
          customerName: formData.customerName || "Anonymous",
          rating: parseInt(response.data.data?.rating || formData.rating),
          comment: response.data.data?.comment || formData.comment,
          createdAt: response.data.data?.createdAt || new Date().toISOString(),
        };

        setReviews([newReview, ...reviews]);
        setCurrentPage(1); // Reset to page 1 to show the new review
        setFormData({
          customerName: "",
          rating: 5,
          comment: "",
          isAnonymous: false,
        });
        setShowForm(false);
        handleToast("success", "Review submitted successfully!");
        // alert("Review submitted successfully!");

        // Trigger parent refresh if from MyBookings
        if (onBack && verifiedBookingId) {
          onBack();
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to submit review. Please try again.";

      // Check for duplicate review constraint (409 = Conflict)
      if (error.response?.status === 409) {
        handleToast("danger", errorMsg);
        // alert(errorMsg);
      } else if (error.response?.status === 400 && errorMsg.includes("UNIQUE constraint failed")) {
        handleToast(
          "danger",
          "You have already submitted a review for this booking. Please edit your existing review instead."
        );
        // alert(
        //   "You have already submitted a review for this booking. Please edit your existing review instead."
        // );
      } else {
        handleToast("danger", errorMsg);
        // alert(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const paginatedReviews = reviews.slice(startIndex, endIndex);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (parseInt(r.rating) || 0), 0) / reviews.length).toFixed(1)
      : 0;

  const getRatingColor = (rating) => {
    if (rating >= 4) return "#10b981"; // green
    if (rating >= 3) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}>
        <p>Loading reviews...</p>
      </div>
    );
  }

  // If editing an existing review, only show the form (no need for reviews list)
  if (isEditing && showForm) {
    return (
      <div>
        {/* Inline edit form - no reviews list shown */}
        <form onSubmit={handleSubmitReview}>
          <div className="form-group">
            <label htmlFor="rating">⭐ Rating *</label>
            <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center" }}>
              <select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                style={{ flex: 1 }}
                required
                disabled={submitting}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very Poor</option>
              </select>
              <div style={{ display: "flex", gap: "2px" }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ fontSize: "24px" }}>
                    {i < formData.rating ? "⭐" : "☆"}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">💬 Your Review *</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Share your experience..."
              style={{ minHeight: "120px" }}
              required
              disabled={submitting}
            />
          </div>

          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting ? "⏳ Updating..." : "✓ Update Review"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => {
                // Close the edit form and return to parent (MyBookings)
                if (onBack) {
                  onBack();
                } else {
                  // Fallback: just close the form
                  setShowForm(false);
                  setIsEditing(false);
                }
              }}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--spacing-lg)" }}>
        {/* Reviews List */}
        <div>
          {reviews.length > 0 ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--spacing-md)" }}>
                {paginatedReviews.map((review) => (
                  <Card key={review.id || review.reviewId}>
                    <Card.Content>
                      <div className="flex-between mb-md" style={{ alignItems: "flex-start" }}>
                        <div>
                          <h5 style={{ margin: 0, marginBottom: "var(--spacing-xs)" }}>
                            {review.customerName}
                          </h5>
                          <div
                            style={{
                              display: "flex",
                              gap: "var(--spacing-sm)",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ fontSize: "16px" }}>
                                  {i < review.rating ? "⭐" : "☆"}
                                </span>
                              ))}
                            </div>
                            <span className="text-muted" style={{ fontSize: "12px" }}>
                              {review.rating}.0/5.0
                            </span>
                          </div>
                        </div>
                        <span className="text-muted" style={{ fontSize: "12px" }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p style={{ margin: 0, color: "var(--text-dark)" }}>{review.comment}</p>
                    </Card.Content>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "var(--spacing-sm)",
                    marginTop: "var(--spacing-lg)",
                    padding: "var(--spacing-md)",
                    backgroundColor: "var(--bg-light)",
                    borderRadius: "8px",
                  }}
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ← Previous
                  </button>

                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          style={{
                            padding: "8px 12px",
                            fontSize: "12px",
                            backgroundColor:
                              currentPage === pageNum ? "#0ea5e9" : "var(--bg-secondary)",
                            color: currentPage === pageNum ? "white" : "var(--text-dark)",
                            border:
                              currentPage === pageNum ? "1px solid #0ea5e9" : "1px solid var(--border-color)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* Page Info */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "var(--spacing-md)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                Showing {startIndex + 1} - {Math.min(endIndex, reviews.length)} of {reviews.length} reviews
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No reviews yet</h3>
              <p>Be the first to review this restaurant!</p>
            </div>
          )}
        </div>

        {/* Rating Summary Sidebar */}
        <div>
          {/* Rating Summary Card */}
          <Card className="mb-lg">
            <Card.Header title="Rating Summary" />
            <Card.Content styles={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "700",
                  color: getRatingColor(parseFloat(averageRating)),
                  marginBottom: "var(--spacing-sm)",
                }}
              >
                {averageRating}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "2px",
                  marginBottom: "var(--spacing-md)",
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ fontSize: "20px" }}>
                    {i < Math.round(parseFloat(averageRating)) ? "⭐" : "☆"}
                  </span>
                ))}
              </div>
              <p className="text-muted" style={{ margin: 0, marginBottom: "var(--spacing-md)" }}>
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>

              {/* Review Distribution */}
              <div
                style={{
                  marginTop: "var(--spacing-lg)",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "var(--spacing-md)",
                }}
              >
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter((r) => r.rating === rating).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                  return (
                    <div key={rating} className="mb-md">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontSize: "12px" }}>{rating} ⭐</span>
                        <span style={{ fontSize: "12px", fontWeight: "600" }}>{count}</span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          backgroundColor: "var(--bg-light)",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            backgroundColor: getRatingColor(rating),
                            transition: "width 0.3s",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

          {/* Write Review Button */}
          {!showForm && (
            <button
              className="btn btn-primary btn-full"
              onClick={() => {
                if (verifiedBookingId) {
                  // Already verified, show form
                  setShowForm(true);
                } else {
                  // Need to verify booking first
                  setShowVerification(true);
                }
              }}
              style={{ padding: "12px 24px", fontSize: "16px" }}
            >
              ✏️ Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showForm && (
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
          <Card styles={{ maxWidth: "500px", width: "90%" }}>
            <Card.Header title={`${isEditing ? "✏️ Edit Your Review" : "⭐ Write Your Review"}`} />
            <Card.Content>
              <form onSubmit={handleSubmitReview}>
                {/* Only show name field when creating new review, not when editing */}
                {!isEditing && (
                  <div className="form-group">
                    <label htmlFor="customerName">
                      👤 Your Name {!formData.isAnonymous && "*"}
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required={!formData.isAnonymous}
                      disabled={submitting || formData.isAnonymous}
                    />
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: formData.isAnonymous
                          ? "rgba(168, 85, 247, 0.1)"
                          : "var(--bg-light)",
                        border: formData.isAnonymous
                          ? "2px solid #a855f7"
                          : "1px solid var(--border-color)",
                        transition: "all 0.3s ease",
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        if (!submitting) {
                          setFormData((prev) => ({
                            ...prev,
                            isAnonymous: !prev.isAnonymous,
                            customerName: !prev.isAnonymous ? "" : prev.customerName,
                          }));
                        }
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            backgroundColor: formData.isAnonymous ? "#a855f7" : "var(--bg-light)",
                            border: formData.isAnonymous ? "none" : "2px solid var(--border-color)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s ease",
                            flexShrink: 0,
                          }}
                        >
                          {formData.isAnonymous && (
                            <span style={{ fontSize: "14px", color: "white" }}>✓</span>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "2px" }}>
                            🤫 Post anonymously
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {formData.isAnonymous
                              ? "Your name will not be displayed"
                              : "Your name will be displayed with your review"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="rating">⭐ Rating *</label>
                  <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center" }}>
                    <select
                      id="rating"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      style={{ flex: 1 }}
                      required
                      disabled={submitting}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Very Poor</option>
                    </select>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ fontSize: "24px" }}>
                          {i < formData.rating ? "⭐" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="comment">💬 Your Review *</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder="Share your experience..."
                    style={{ minHeight: "120px" }}
                    required
                    disabled={submitting}
                  />
                </div>

                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                    {submitting
                      ? isEditing
                        ? "⏳ Updating..."
                        : "⏳ Submitting..."
                      : isEditing
                        ? "✓ Update Review"
                        : "✓ Submit Review"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card.Content>
          </Card>
        </div>
      )}

      {/* Booking Verification Modal - Only show if not already verified */}
      {showVerification && !verifiedBookingId && (
        <BookingVerification
          onBookingVerified={(booking) => {
            setVerifiedBookingId(booking.bookingId);
            setShowVerification(false);
            setShowForm(true);
          }}
          onClose={() => setShowVerification(false)}
        />
      )}
    </div>
  );
}
