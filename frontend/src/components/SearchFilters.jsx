import React, { useState } from "react";
import axios from "axios";
import { Card } from "./Common";

export function SearchFilters({ restaurants, promotions, onFiltered }) {

  const [filters, setFilters] = useState({
		cuisine: "All Cuisines",
		search: "",
		reviews: "",
		promotion: "",
  });
  
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

  const menuTypeOptions = ["Halal", "Vegan", "Vegetarian"];

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

  const handleApplyFilters = () => {
    let filtered = [...restaurants];

    //Search bar filter
    if (filters.search && filters.search.trim() !== "") {
      const term = filters.search.trim().toLowerCase();

      filtered = filtered.filter((restaurant) => {
        const nameMatch = (restaurant.restaurantName || "").toLowerCase().includes(term);

        const address = restaurant.address;

        const cityMatch = (address?.city || "").toLowerCase().includes(term);
        const stateMatch = (address?.state || "").toLowerCase().includes(term);
        const countryMatch = (address?.country || "").toLowerCase().includes(term);

        return nameMatch || cityMatch || stateMatch || countryMatch;
      });
    }

    //Cuisine filter
    if (filters.cuisine !== "All Cuisines") {
      filtered = filtered.filter((restaurant) => restaurant.cuisine === filters.cuisine);
    }

    //Rating filter
    if (filters.reviews) {
      const selected = Number(filters.reviews);
      filtered = filtered.filter(
        (r) => r.reviewCount > 0 && r.averageRating >= selected && r.averageRating < selected + 1
      );
    }

    //Promotion filter
    if (filters.promotion === "Yes") {
      const now = new Date();

      const promoRestaurantIds = new Set(
        promotions
          .filter((promo) => {
            const start = new Date(promo.startAt);
            const end = new Date(promo.endAt);
            return start <= now && now <= end;
          })
          .map((promo) => promo.fkRestaurantId)
      );

      filtered = filtered.filter((restaurant) => promoRestaurantIds.has(restaurant.restaurantId));
    }

    onFiltered(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      cuisine: "All Cuisines",
      search: "",
      reviews: "",
      promotion: "",
    });
    onFiltered(restaurants);
  };

  return (
    <Card>
      <Card.Header title="🔍 Search Filters" />
      <Card.Content>
        {/* 🔍 Search Bar */}
        <div className="form-group">
          <label htmlFor="search">Search bar</label>
          <input
            type="text"
            id="search"
            placeholder="Enter restaurant name or country"
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApplyFilters();
              }
            }}
          />
        </div>
        {/* Cuisine Filter*/}
        <div className="form-group">
          <label htmlFor="cuisine">🍽️ Cuisine</label>
          <select
            id="cuisine"
            value={filters.cuisine}
            onChange={(e) => handleFilterChange("cuisine", e.target.value)}
          >
            {cuisineOptions.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Reviews Filter */}
        <div className="form-group">
          <label htmlFor="reviews">⭐ Reviews</label>
          <select
            id="reviews"
            value={filters.reviews || ""}
            onChange={(e) =>
              handleFilterChange("reviews", e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">All Ratings</option>
            {reviewsOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Promotion Filter */}
        <div className="form-group">
          <label htmlFor="promtion">🏷️ Promotion</label>
          <select
            id="promotion"
            value={filters.promotion}
            onChange={(e) => handleFilterChange("promotion", e.target.value)}
          >
            {promotionOptions.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <button className="btn btn-primary btn-full" onClick={handleApplyFilters}>
          Apply Filters
        </button>

        {/* Clear Filters */}
        <button className="btn btn-primary btn-full" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </Card.Content>
    </Card>
  );
}
