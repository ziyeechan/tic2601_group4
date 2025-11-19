import { useState, useEffect } from "react";
import { mockMenuItems } from "../mockData";
import { generateTimeSlots } from "../utils/timeSlotUtils";
import { Reviews } from "./Reviews";
import { reviewAPI } from "../utils/api";
import { Card } from "./Common";

export function RestaurantDetail({ restaurant, onBack, onBookNow }) {
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Fetch reviews to calculate average rating
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (restaurant?.restaurantId) {
          const response = await reviewAPI.getReviewsByRestaurant(restaurant.restaurantId);
          const reviewsArray = response.data.reviewInfo || [];

          if (Array.isArray(reviewsArray) && reviewsArray.length > 0) {
            const ratings = reviewsArray
              .map((review) => parseInt(review.rating) || 0)
              .filter((rating) => rating > 0);

            const avgRating =
              ratings.length > 0
                ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
                : 0;

            setAverageRating(avgRating);
            setReviewCount(reviewsArray.length);
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setAverageRating(0);
        setReviewCount(0);
      }
    };

    fetchReviews();
  }, [restaurant?.restaurantId]);
  const menuItems = mockMenuItems.filter((item) => item.restaurantId === restaurant.restaurantId);

  // Default mock data for missing fields
  const defaultTimeSlots = ["12:00", "13:00", "18:00", "19:00", "20:00", "21:00"];

  // Generate opening hours display from database times or use defaults
  const getOpeningHoursDisplay = () => {
    if (restaurant.openingTime && restaurant.closingTime) {
      // Convert 24-hour format to 12-hour for display
      const convertTo12Hour = (time24) => {
        const [hour] = time24.split(":").map(Number);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${ampm}`;
      };

      const hours = `${convertTo12Hour(
        restaurant.openingTime
      )} - ${convertTo12Hour(restaurant.closingTime)}`;

      // Display the same hours for all days (since we don't have per-day hours)
      return {
        Monday: hours,
        Tuesday: hours,
        Wednesday: hours,
        Thursday: hours,
        Friday: hours,
        Saturday: hours,
        Sunday: hours,
      };
    }

    // Default if not available
    return {
      Monday: "10:00 AM - 10:00 PM",
      Tuesday: "10:00 AM - 10:00 PM",
      Wednesday: "10:00 AM - 10:00 PM",
      Thursday: "10:00 AM - 10:00 PM",
      Friday: "10:00 AM - 11:00 PM",
      Saturday: "11:00 AM - 11:00 PM",
      Sunday: "11:00 AM - 10:00 PM",
    };
  };

  // Generate available time slots from opening/closing times
  const getAvailableTimeSlots = () => {
    if (restaurant.openingTime && restaurant.closingTime) {
      return generateTimeSlots(restaurant.openingTime, restaurant.closingTime);
    }
    return defaultTimeSlots;
  };

  const openingHours = getOpeningHoursDisplay();
  const availableTimeSlots = getAvailableTimeSlots();

  const getAllergenBadge = (allergen) => {
    const colors = {
      dairy: "#fee2e2",
      shellfish: "#fef3c7",
      gluten: "#cffafe",
      nuts: "#fce7f3",
    };
    return colors[allergen] || "#e2e8f0";
  };

  return (
    <div>
      {/* Back Button */}
      <button className="btn btn-secondary mb-lg" onClick={onBack} style={{ border: "none" }}>
        ← Back to Restaurants
      </button>

      {/* Hero Image */}
      <div className="aspect-video image-container mb-lg" style={{ height: "300px" }}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.innerHTML =
              '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-light);color:var(--text-muted);">No Image Available</div>';
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--spacing-lg)",
          marginBottom: "var(--spacing-lg)",
        }}
      >
        {/* Left Column - Basic Info */}
        <div>
          {/* Info Card */}
          <Card className="mb-lg">
            <Card.Content>
              <div className="flex-between mb-md" style={{ alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: "var(--spacing-sm)" }}>
                    {restaurant.restaurantName}
                  </h2>
                  <p className="text-muted" style={{ margin: 0 }}>
                    {restaurant.cuisine || "Cuisine Not Specified"}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-md mb-md" style={{ alignItems: "center" }}>
                <div style={{ fontSize: "20px" }}>
                  ⭐ {averageRating > 0 ? averageRating : "N/A"}
                </div>
                <div className="text-muted">
                  {reviewCount > 0
                    ? `(${reviewCount} ${reviewCount === 1 ? "review" : "reviews"})`
                    : "(No reviews yet)"}
                </div>
              </div>

              {/* Description */}
              <p className="text-muted">{restaurant.description}</p>
            </Card.Content>
          </Card>

          {/* Contact Info Card */}
          <Card className="mb-lg">
            <Card.Header title="Contact Information" />
            <Card.Content>
              <div className="mb-md">
                <div className="text-muted" style={{ fontSize: "14px" }}>
                  📍 Address
                </div>
                <p>
                  {restaurant.address
                    ? `${restaurant.address.addressLine1}${
                        restaurant.address.addressLine2
                          ? ", " + restaurant.address.addressLine2
                          : ""
                      }, ${restaurant.address.city}, ${
                        restaurant.address.state || ""
                      }, ${restaurant.address.country}`
                    : "Address not available"}
                </p>
              </div>
              <div className="mb-md">
                <div className="text-muted" style={{ fontSize: "14px" }}>
                  📞 Phone
                </div>
                <p>{restaurant.phone}</p>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: "14px" }}>
                  📧 Email
                </div>
                <p>{restaurant.email}</p>
              </div>
            </Card.Content>
          </Card>

          {/* Opening Hours Card */}
          <Card>
            <Card.Header title="Opening Hours" />
            <Card.Content>
              {Object.entries(openingHours).map(([day, hours]) => (
                <div
                  key={day}
                  className="flex-between mb-md"
                  style={{
                    paddingBottom: "var(--spacing-md)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>{day}</span>
                  <span className="text-muted">{hours}</span>
                </div>
              ))}
            </Card.Content>
          </Card>
        </div>

        {/* Right Column - Menu & Booking */}
        <div>
          {/* Available Times Card */}
          <Card className="mb-lg">
            <Card.Header title="Available Time Slots" />
            <Card.Content>
              {" "}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "var(--spacing-sm)",
                }}
              >
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    className="btn btn-secondary"
                    style={{ padding: "8px 12px", fontSize: "14px" }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Menu Card */}
          {menuItems.length > 0 && (
            <Card className="mb-lg">
              <Card.Header title="Sample Menu" />
              <Card.Content>
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="mb-md"
                    style={{
                      paddingBottom: "var(--spacing-md)",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <div className="flex-between mb-sm" style={{ alignItems: "flex-start" }}>
                      <h5 style={{ margin: 0 }}>{item.name}</h5>
                      <span style={{ fontWeight: "600", color: "var(--success)" }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p
                      className="text-muted"
                      style={{
                        fontSize: "14px",
                        marginBottom: "var(--spacing-sm)",
                      }}
                    >
                      {item.description}
                    </p>
                    {item.allergens && item.allergens.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "var(--spacing-xs)",
                        }}
                      >
                        {item.allergens.map((allergen) => (
                          <span
                            key={allergen}
                            className="badge"
                            style={{
                              background: getAllergenBadge(allergen),
                              color: "#000",
                              fontSize: "12px",
                              padding: "2px 8px",
                            }}
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Book Now Button */}
          <button
            className="btn btn-primary btn-full"
            onClick={() => onBookNow(restaurant)}
            style={{ padding: "12px 24px", fontSize: "16px" }}
          >
            🎫 Book Now
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: "var(--spacing-lg)" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ margin: 0 }}>
              ⭐ Reviews & Ratings
            </h3>
          </div>
          <div className="card-content">
            <Reviews restaurant={restaurant} onBack={onBack} />
          </div>
        </div>
      </div>
    </div>
  );
}
