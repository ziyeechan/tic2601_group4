/**
 * SearchFilters Component
 *
 * BACKEND SUPPORT ANALYSIS:
 * The backend only supports GET /restaurant/id/:id and GET /restaurant/name/:name
 * NO filtering endpoints exist. However, frontend can filter from local restaurant list.
 *
 * Only useful filters that match backend schema:
 * - Cuisine (field exists in restaurants table)
 *
 * These are NOT in backend schema, so removed:
 * - Price Range (doesn't exist in restaurants table)
 * - Rating (comes from reviews table, no endpoints)
 * - Location (addresses table not linked, no endpoints)
 * - Date, Time, Party Size (these are booking filters, not restaurant filters)
 *
 */

import React, { useState } from "react";
import axios from "axios";

export function SearchFilters({ filters, onFiltersChange, onApplyFilters, onClearFilters }) {
  const cuisineOptions = [
    'All Cuisines',
    'French',
    'Italian',
    'Japanese',
    'Indian',
    'Chinese',
    'Mexican',
    'Thai',
    'American',
    'Mediterranean'
  ];

  const menuTypeOptions = [
    'Halal',
    'Vegan',
    'Vegetarian'
  ];

  const reviewsOptions = [
    { label: '5 stars', value: 5 },
    { label: '4 stars', value: 4 },
    { label: '3 stars', value: 3 },
  ];

  const promotionOptions = [
    { label: 'All', value: '' },
    { label: 'Show promotion only', value: 'Yes' },
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">🔍 Search Filters</h4>
      </div>
      <div className="card-content">
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
                onApplyFilters();
              }
            }}
          />
        </div>
        {/* Cuisine Filter - Only filter supported by backend */}
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
        <button className="btn btn-primary btn-full" onClick={onApplyFilters}>
          Apply Filters
        </button>

        {/* Clear Filters */}
        <button className="btn btn-primary btn-full" onClick={onClearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  );
}
