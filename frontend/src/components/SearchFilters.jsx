import { useState } from "react";
import { Card } from "./Common";
import { restaurantAPI } from "../utils/api";

export function SearchFilters({ restaurants, onFiltered }) {
  const [filters, setFilters] = useState({
    cuisine: "All Cuisines",
    search: "",
    reviews: "",
    promotion: "",
    dietaryType: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const cuisineOptions = [
    "All Cuisines",
    "French",
    "Italian",
    "Japanese",
    "Indian",
    "Chinese",
    "Mexican",
    "Thai",
    "American",
    "Mediterranean",
  ];

  const dietaryTypeOptions = [
    { label: "All Dietary Types", value: "" },
    { label: "Halal", value: "Halal" },
    { label: "Vegan", value: "Vegan" },
    { label: "Vegetarian", value: "Vegetarian" },
  ];

  const reviewsOptions = [
    { label: "5 stars", value: 5 },
    { label: "4 stars", value: 4 },
    { label: "3 stars", value: 3 },
  ];

  const promotionOptions = [
    { label: "All", value: "" },
    { label: "Show promotion only", value: "Yes" },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = async () => {
    try {
      setIsLoading(true);

      // Build filter object for backend API
      const searchFilters = {
        q: filters.search || undefined,
        cuisine: filters.cuisine !== "All Cuisines" ? filters.cuisine : undefined,
        minRating: filters.reviews ? Number(filters.reviews) : undefined,
        hasPromotion: filters.promotion === "Yes" ? "true" : undefined,
        dietaryType: filters.dietaryType || undefined,
      };

      // Call backend search endpoint
      const response = await restaurantAPI.searchRestaurants(searchFilters);
      const filteredRestaurants = response.data.restaurants;

      // Add missing fields that frontend components might expect
      // (e.g., averageRating, reviewCount for compatibility)
      const enrichedRestaurants = filteredRestaurants.map((restaurant) => ({
        ...restaurant,
        averageRating: restaurant.reviewSummary?.averageRating || 0,
        reviewCount: restaurant.reviewSummary?.totalReviews || 0,
        image: restaurant.imageUrl, // Map imageUrl to image for components
      }));

      onFiltered(enrichedRestaurants);
    } catch (error) {
      console.error("Error applying filters:", error);
      // Fallback: show all restaurants if search fails
      onFiltered(restaurants);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = async () => {
    try {
      setIsLoading(true);
      setFilters({
        cuisine: "All Cuisines",
        search: "",
        reviews: "",
        promotion: "",
        dietaryType: "",
      });

      // Fetch all restaurants without filters
      const response = await restaurantAPI.searchRestaurants({});
      const allRestaurants = response.data.restaurants;

      // Enrich with expected fields
      const enrichedRestaurants = allRestaurants.map((restaurant) => ({
        ...restaurant,
        averageRating: restaurant.reviewSummary?.averageRating || 0,
        reviewCount: restaurant.reviewSummary?.totalReviews || 0,
        image: restaurant.imageUrl,
      }));

      onFiltered(enrichedRestaurants);
    } catch (error) {
      console.error("Error clearing filters:", error);
      onFiltered(restaurants);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header title="🔍 Search Filters" />
      <Card.Content>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* 🔍 Search Bar Section */}
          <div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                htmlFor="search"
                style={{ fontWeight: "600", color: "#333", fontSize: "0.95rem" }}
              >
                🔍 Search Restaurant
              </label>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Enter restaurant name..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplyFilters();
                }
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Separator */}
          <div style={{ height: "1px", backgroundColor: "#eee" }} />

          {/* Cuisine Filter Section */}
          <div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                htmlFor="cuisine"
                style={{ fontWeight: "600", color: "#333", fontSize: "0.95rem" }}
              >
                🍽️ Cuisine Type
              </label>
            </div>
            <select
              id="cuisine"
              value={filters.cuisine}
              onChange={(e) => handleFilterChange("cuisine", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              {cuisineOptions.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>

          {/* Reviews Filter Section */}
          <div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                htmlFor="reviews"
                style={{ fontWeight: "600", color: "#333", fontSize: "0.95rem" }}
              >
                ⭐ Minimum Rating
              </label>
            </div>
            <select
              id="reviews"
              value={filters.reviews || ""}
              onChange={(e) =>
                handleFilterChange("reviews", e.target.value ? Number(e.target.value) : "")
              }
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">All Ratings</option>
              {reviewsOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Promotion Filter Section */}
          <div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                htmlFor="promotion"
                style={{ fontWeight: "600", color: "#333", fontSize: "0.95rem" }}
              >
                🏷️ Active Promotions
              </label>
            </div>
            <select
              id="promotion"
              value={filters.promotion}
              onChange={(e) => handleFilterChange("promotion", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              {promotionOptions.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Type Filter Section */}
          <div>
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                htmlFor="dietaryType"
                style={{ fontWeight: "600", color: "#333", fontSize: "0.95rem" }}
              >
                🥗 Dietary Type
              </label>
            </div>
            <select
              id="dietaryType"
              value={filters.dietaryType}
              onChange={(e) => handleFilterChange("dietaryType", e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              {dietaryTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Separator */}
          <div style={{ height: "1px", backgroundColor: "#eee" }} />

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              className="btn btn-primary btn-full"
              onClick={handleApplyFilters}
              disabled={isLoading}
              style={{
                padding: "0.85rem 1rem",
                fontWeight: "600",
                fontSize: "0.95rem",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "⏳ Searching..." : "✓ Apply Filters"}
            </button>

            <button
              className="btn btn-primary btn-full"
              onClick={handleClearFilters}
              disabled={isLoading}
              style={{
                padding: "0.85rem 1rem",
                fontWeight: "600",
                fontSize: "0.95rem",
                backgroundColor: "#f0f0f0",
                color: "#333",
                border: "1px solid #ddd",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              ✕ Clear Filters
            </button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
