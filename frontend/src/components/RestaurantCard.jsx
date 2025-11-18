import { Card } from "./Common";

export function RestaurantCard({ restaurant, onViewDetails, onBookNow, isAdmin, onViewChange }) {
  return (
    <Card styles={{ overflow: "hidden" }}>
      {/* Image Container */}
      <div className="aspect-video image-container">
        <img
          src={restaurant.image}
          alt={restaurant.name}
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
      </div>

      <Card.Content>
        {/* Title */}
        <div className="flex-between mb-md" style={{ alignItems: "flex-start" }}>
          <h3 style={{ margin: "0", flex: 1 }}>{restaurant.restaurantName}</h3>
        </div>

        {/* Rating */}
        <div className="flex gap-sm mb-md" style={{ alignItems: "center" }}>
          {restaurant.reviewCount > 0 ? (
            <>
              <span>⭐</span>
              <span style={{ fontWeight: "600" }}>
                {typeof restaurant.averageRating === "number"
                  ? restaurant.averageRating.toFixed(1)
                  : "0.0"}
              </span>
              <span className="text-muted" style={{ fontSize: "14px" }}>
                ({restaurant.reviewCount} {restaurant.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </>
          ) : (
            <span className="text-muted" style={{ fontSize: "14px" }}>
              ⭐ No ratings yet
            </span>
          )}
        </div>

        {/* Cuisine Badge */}
        <div className="mb-md">
          <span className="badge badge-outline">{restaurant.cuisine}</span>
        </div>

        {/* Address */}
        <div
          className="flex gap-sm mb-sm"
          style={{ alignItems: "center", color: "var(--text-muted)" }}
        >
          <span>📍</span>
          <span
            style={{
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {restaurant.address
              ? `${restaurant.address.addressLine1}, ${restaurant.address.city}, ${restaurant.address.state || ""}, ${restaurant.address.country}`
              : "Address not available"}
          </span>
        </div>

        {/* Phone */}
        <div
          className="flex gap-sm mb-md"
          style={{ alignItems: "center", color: "var(--text-muted)" }}
        >
          <span>📞</span>
          <span style={{ fontSize: "14px" }}>{restaurant.phone}</span>
        </div>

        {/* Description */}
        <p
          className="text-muted"
          style={{
            fontSize: "14px",
            marginBottom: "var(--spacing-md)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {restaurant.description}
        </p>
      </Card.Content>
      {/* Content */}

      {/* Footer with Buttons */}
      <Card.Footer style={{ display: "flex", gap: "var(--spacing-sm)" }}>
        <button
          className="btn btn-secondary btn-full"
          onClick={() =>
            isAdmin === "customer" ? onViewDetails(restaurant) : onViewChange(restaurant)
          }
          style={{ flex: 1 }}
        >
          View Details
        </button>
        {isAdmin === "customer" && (
          <button
            className="btn btn-primary btn-full"
            onClick={() => onBookNow(restaurant)}
            style={{ flex: 1 }}
          >
            Book Now
          </button>
        )}
      </Card.Footer>
    </Card>
  );
}
