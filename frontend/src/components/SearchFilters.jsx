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
 * These have been removed to align with actual backend capabilities.
 */

export function SearchFilters({ filters, onFiltersChange, onApplyFilters }) {
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
        {/* Cuisine Filter - Only filter supported by backend */}
        <div className="form-group">
          <label htmlFor="cuisine">🍽️ Cuisine Type</label>
          <select
            id="cuisine"
            value={filters.cuisine}
            onChange={(e) => handleFilterChange('cuisine', e.target.value)}
          >
            {cuisineOptions.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Apply Button */}
        <button
          className="btn btn-primary btn-full"
          onClick={onApplyFilters}
        >
          Apply Filters
        </button>

        <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm)', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-dark)' }}>
          <p><strong>ℹ️ Note:</strong> Only cuisine filtering is available. Other filters (location, price, rating) require additional backend endpoints that aren't implemented yet.</p>
        </div>
      </div>
    </div>
  );
}
