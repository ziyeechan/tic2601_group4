import { useState } from 'react';

export function RestaurantManagement({ onBack }) {
  const [restaurant, setRestaurant] = useState({
    id: 1,
    name: 'Le Petit Restaurant',
    cuisine: 'French',
    description: 'Authentic French cuisine with a touch of modern elegance.',
    address: '123 Culinary Lane, Downtown',
    phone: '(555) 123-4567',
    email: 'contact@lepetit.com'
  });

  const [address, setAddress] = useState({
    addressLine1: '123 Culinary Lane',
    addressLine2: 'Suite 200',
    city: 'Downtown',
    state: 'CA',
    country: 'USA',
    postalCode: '90210'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [editedRestaurant, setEditedRestaurant] = useState({ ...restaurant });
  const [editedAddress, setEditedAddress] = useState({ ...address });

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setEditedRestaurant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditedAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!editedRestaurant.name.trim() || !editedRestaurant.cuisine.trim() ||
        !editedAddress.addressLine1.trim() || !editedAddress.city.trim()) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields'
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRestaurant({ ...editedRestaurant });
      setAddress({ ...editedAddress });
      setIsEditing(false);
      setMessage({
        type: 'success',
        text: 'Restaurant information updated successfully!'
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update restaurant information. Please try again.'
      });
    }
  };

  const handleCancel = () => {
    setEditedRestaurant({ ...restaurant });
    setEditedAddress({ ...address });
    setIsEditing(false);
  };

  const cuisineOptions = [
    'French',
    'Italian',
    'Japanese',
    'Indian',
    'Chinese',
    'Mexican',
    'Thai',
    'American',
    'Mediterranean',
    'Spanish',
    'Korean',
    'Vietnamese'
  ];

  return (
    <div>
      {/* Back Button */}
      <button className="btn btn-secondary mb-lg" onClick={onBack} style={{ border: 'none' }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Main Content */}
        <div>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>🍽️ Restaurant Management</h2>

          {message && (
            <div className={`alert alert-${message.type} mb-lg`}>
              {message.text}
            </div>
          )}

          {!isEditing ? (
            // View Mode
            <div>
              {/* Restaurant Info Card */}
              <div className="card mb-lg">
                <div className="card-header">
                  <div className="flex-between">
                    <h4 className="card-title">Restaurant Information</h4>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
                <div className="card-content">
                  <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                    <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                      Restaurant Name
                    </p>
                    <p style={{ fontWeight: '600', margin: 0, fontSize: '18px' }}>
                      {restaurant.name}
                    </p>
                  </div>

                  <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                    <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                      Cuisine Type
                    </p>
                    <p style={{ fontWeight: '600', margin: 0 }}>
                      {restaurant.cuisine}
                    </p>
                  </div>

                  <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                    <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                      Description
                    </p>
                    <p style={{ margin: 0 }}>
                      {restaurant.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                      Contact Details
                    </p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>
                      📞 {restaurant.phone}
                    </p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>
                      📧 {restaurant.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Address Information</h4>
                </div>
                <div className="card-content">
                  <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                    <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                      📍 Full Address
                    </p>
                    <p style={{ fontWeight: '600', margin: 0 }}>
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>
                      {address.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSave}>
              <div className="card mb-lg">
                <div className="card-header">
                  <h4 className="card-title">Edit Restaurant Information</h4>
                </div>
                <div className="card-content">
                  <div className="form-group">
                    <label htmlFor="name">🍽️ Restaurant Name *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={editedRestaurant.name}
                      onChange={handleRestaurantChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cuisine">🍴 Cuisine Type *</label>
                    <select
                      id="cuisine"
                      name="cuisine"
                      value={editedRestaurant.cuisine}
                      onChange={handleRestaurantChange}
                      required
                    >
                      {cuisineOptions.map(cuisine => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">📝 Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={editedRestaurant.description}
                      onChange={handleRestaurantChange}
                      style={{ minHeight: '100px' }}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">📞 Phone</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={editedRestaurant.phone}
                        onChange={handleRestaurantChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">📧 Email</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={editedRestaurant.email}
                        onChange={handleRestaurantChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-lg">
                <div className="card-header">
                  <h4 className="card-title">Edit Address Information</h4>
                </div>
                <div className="card-content">
                  <div className="form-group">
                    <label htmlFor="addressLine1">Address Line 1 *</label>
                    <input
                      id="addressLine1"
                      type="text"
                      name="addressLine1"
                      value={editedAddress.addressLine1}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="addressLine2">Address Line 2</label>
                    <input
                      id="addressLine2"
                      type="text"
                      name="addressLine2"
                      value={editedAddress.addressLine2}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        value={editedAddress.city}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State/Province</label>
                      <input
                        id="state"
                        type="text"
                        name="state"
                        value={editedAddress.state}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="postalCode">Postal Code</label>
                      <input
                        id="postalCode"
                        type="text"
                        name="postalCode"
                        value={editedAddress.postalCode}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="country">Country *</label>
                      <input
                        id="country"
                        type="text"
                        name="country"
                        value={editedAddress.country}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ padding: '12px 24px', fontSize: '16px' }}
                >
                  ✓ Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={handleCancel}
                  style={{ padding: '12px 24px', fontSize: '16px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Quick Info</h4>
            </div>
            <div className="card-content">
              <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                  Restaurant ID
                </p>
                <p style={{ fontWeight: '600', margin: 0 }}>
                  {restaurant.id}
                </p>
              </div>

              <div className="mb-md" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                  Status
                </p>
                <p style={{ fontWeight: '600', margin: 0, color: 'var(--success)' }}>
                  ✓ Active
                </p>
              </div>

              <div className="mb-lg" style={{ paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-muted" style={{ fontSize: '12px', margin: 0, marginBottom: '4px' }}>
                  Related Sections
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  <button className="btn btn-secondary btn-sm btn-full" style={{ textAlign: 'left' }}>
                    📋 Manage Menus
                  </button>
                  <button className="btn btn-secondary btn-sm btn-full" style={{ textAlign: 'left' }}>
                    🪑 Seating Plans
                  </button>
                  <button className="btn btn-secondary btn-sm btn-full" style={{ textAlign: 'left' }}>
                    🎉 Promotions
                  </button>
                </div>
              </div>

              <div className="alert alert-info">
                <p style={{ margin: 0, fontSize: '14px' }}>
                  ℹ️ Changes to restaurant information will be reflected across the platform within a few minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
