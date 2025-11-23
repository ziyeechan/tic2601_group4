import { Card } from "./Common";

export function RestaurantCard({ restaurant, onViewDetails, onBookNow, isAdmin, onViewChange }) {
  // Helper function to render star rating visually
  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push("⭐");
      } else if (i === fullStars && hasHalfStar) {
        stars.push("⭐");
      } else {
        stars.push("☆");
      }
    }
    return stars.join("");
  };

  // Helper function to get dietary type emoji
  const getDietaryTypeEmoji = (type) => {
    const emojiMap = {
      halal: "🕌",
      vegan: "🌱",
      vegetarian: "🥗",
      gluten_free: "🌾",
      kosher: "🕎",
    };
    return emojiMap[type?.toLowerCase()] || "🍽️";
  };

  // Extract review summary from backend response
  const reviewSummary = restaurant.reviewSummary || {
    averageRating: restaurant.averageRating || 0,
    totalReviews: restaurant.reviewCount || 0,
  };

  // Get dietary types from menus
  const dietaryTypes = restaurant.dietaryTypes || [];

  return (
    <Card styles={{ overflow: "hidden" }}>
      {/* Image Container with Badge Overlay */}
      <div className="aspect-video image-container" style={{ position: "relative" }}>
        <img
          src={restaurant.image || restaurant.imageUrl}
          alt={restaurant.restaurantName}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML =
              '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-light);color:var(--text-muted);">No Image Available</div>';
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        />

        {/* Promotion Badge Overlay */}
        {restaurant.hasActivePromotion && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            🏷️ Special Offer
          </div>
        )}
      </div>

      <Card.Content>
        {/* Title */}
        <div className="flex-between mb-md" style={{ alignItems: "flex-start" }}>
          <h3 style={{ margin: "0", flex: 1, fontSize: "18px" }}>{restaurant.restaurantName}</h3>
        </div>

        {/* Visual Star Rating */}
        <div className="mb-md">
          <div style={{ fontSize: "18px", letterSpacing: "0.5px" }}>
            {renderStarRating(reviewSummary.averageRating)}
          </div>
          <div className="flex gap-sm" style={{ alignItems: "center", marginTop: "4px" }}>
            <span style={{ fontWeight: "600", fontSize: "14px" }}>
              {reviewSummary.averageRating > 0
                ? reviewSummary.averageRating.toFixed(1)
                : "No ratings"}
            </span>
            <span className="text-muted" style={{ fontSize: "13px" }}>
              {reviewSummary.totalReviews > 0
                ? `(${reviewSummary.totalReviews} ${
                    reviewSummary.totalReviews === 1 ? "review" : "reviews"
                  })`
                : ""}
            </span>
          </div>
        </div>

        {/* Cuisine & Dietary Type Badges */}
        <div
          className="mb-md"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <span className="badge badge-outline">{restaurant.cuisine}</span>

          {/* Dietary Type Badges */}
          {dietaryTypes.length > 0 &&
            dietaryTypes.map((type) => (
              <span
                key={type}
                className="badge"
                style={{
                  background: "#f0f9ff",
                  color: "#0369a1",
                  border: "1px solid #0ea5e9",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {getDietaryTypeEmoji(type)} {type}
              </span>
            ))}
        </div>

        {/* Location Badge */}
        {restaurant.address && (
          <div
            className="mb-md"
            style={{
              background: "#f3f4f6",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              color: "var(--text-dark)",
            }}
          >
            📍 {restaurant.address.addressLine1}, {restaurant.address.city}
          </div>
        )}

        {/* Phone */}
        <div
          className="flex gap-sm mb-md"
          style={{ alignItems: "center", color: "var(--text-muted)" }}
        >
          <span>📞</span>
          <span style={{ fontSize: "13px" }}>{restaurant.phone}</span>
        </div>

        {/* Description */}
        <p
          className="text-muted"
          style={{
            fontSize: "13px",
            marginBottom: "var(--spacing-md)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: "1.5",
          }}
        >
          {restaurant.description}
        </p>
      </Card.Content>
      {/* Content */}

      {/* Footer with Buttons */}
      <Card.Footer>
        <button
          className="btn btn-secondary"
          onClick={() =>
            isAdmin === "customer" ? onViewDetails(restaurant) : onViewChange(restaurant)
          }
        >
          View Details
        </button>
        {isAdmin === "customer" && (
          <button className="btn btn-primary" onClick={() => onBookNow(restaurant)}>
            Book Now
          </button>
        )}
      </Card.Footer>
    </Card>
  );
}
