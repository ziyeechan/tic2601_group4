import { Toast } from "./Toast";
import { useEffect, useState } from "react";
import axios from "axios";

export function RestaurantManagement({ onBack, onViewChange }) {
  const [restaurant, setRestaurant] = useState(null);
  const [address, setAddress] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState({ ...restaurant });
  const [editedAddress, setEditedAddress] = useState({ ...address });

  useEffect(() => {
    axios
      .get(`/api/restaurant/id/${1}`)
      .then((res) => {
        const { address, restaurant } = res.data;
        setAddress({
          ...address,
        });
        setRestaurant({
          name: restaurant.restaurantName,
          ...restaurant,
        });
        setEditedAddress({
          ...address,
        });
        setEditedRestaurant({
          name: restaurant.restaurantName,
          ...restaurant,
        });
        setRefresh(true);
      })
      .catch((e) => console.error(e));
  }, [refresh]);

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setEditedRestaurant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditedAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !editedRestaurant.name.trim() ||
      !editedRestaurant.cuisine.trim() ||
      !editedAddress.addressLine1.trim() ||
      !editedAddress.city.trim()
    ) {
      Toast.fire({
        icon: "error",
        title: "Please fill in all required fields",
      });
      return;
    }

    try {
      const data = {
        name: editedRestaurant.name,
        description: editedRestaurant.description,
        cuisine: editedRestaurant.cuisine,
        phone: editedRestaurant.phone,
        email: editedRestaurant.email,
        addressLine1: editedAddress.addressLine1,
        addressLine2: editedAddress.addressLine2,
        country: editedAddress.country,
        state: editedAddress.state,
        city: editedAddress.city,
        postalCode: editedAddress.postalCode,
      };
      axios
        .put(`/api/restaurant/${restaurant.restaurant_id}`, data)
        .then((res) => {
          console.log(res);
          Toast.fire({
            icon: "success",
            title: res.data,
          });
        });
      setRestaurant({ ...editedRestaurant });
      setAddress({ ...editedAddress });
      setIsEditing(false);
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: "Failed to update restaurant information. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setEditedRestaurant({ ...restaurant });
    setEditedAddress({ ...address });
    setIsEditing(false);
  };

  const cuisineOptions = [
    "French",
    "Italian",
    "Japanese",
    "Indian",
    "Chinese",
    "Mexican",
    "Thai",
    "American",
    "Mediterranean",
    "Spanish",
    "Korean",
    "Vietnamese",
  ];

  return (
    refresh && (
      <div>
        {/* Back Button */}
        <button
          className="btn btn-secondary mb-lg"
          onClick={onBack}
          style={{ border: "none" }}
        >
          ← Back
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "var(--spacing-lg)",
          }}
        >
          {/* Main Content */}
          <div>
            <h2 style={{ marginBottom: "var(--spacing-lg)" }}>
              🍽️ Restaurant Management
            </h2>

            {!isEditing ? (
              // View Mode
              <div>
                {/* Restaurant Info Card */}
                <div className="card mb-lg">
                  <div className="card-header">
                    <div className="flex-between">
                      <h3 className="card-title">Restaurant Information</h3>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsEditing(true)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                  <div className="card-content">
                    <div
                      className="mb-md"
                      style={{
                        paddingBottom: "var(--spacing-md)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <p
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                          marginBottom: "4px",
                        }}
                      >
                        Restaurant Name
                      </p>
                      <p
                        style={{
                          fontWeight: "600",
                          margin: 0,
                          fontSize: "18px",
                        }}
                      >
                        {restaurant.name}
                      </p>
                    </div>

                    <div
                      className="mb-md"
                      style={{
                        paddingBottom: "var(--spacing-md)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <p
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                          marginBottom: "4px",
                        }}
                      >
                        Cuisine Type
                      </p>
                      <p style={{ fontWeight: "600", margin: 0 }}>
                        {restaurant.cuisine}
                      </p>
                    </div>

                    <div
                      className="mb-md"
                      style={{
                        paddingBottom: "var(--spacing-md)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <p
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                          marginBottom: "4px",
                        }}
                      >
                        Description
                      </p>
                      <p style={{ margin: 0 }}>{restaurant.description}</p>
                    </div>

                    <div>
                      <p
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                          marginBottom: "4px",
                        }}
                      >
                        Contact Details
                      </p>
                      <p
                        className="text-muted"
                        style={{ margin: 0, fontSize: "14px" }}
                      >
                        📞 {restaurant.phone}
                      </p>
                      <p
                        className="text-muted"
                        style={{ margin: 0, fontSize: "14px" }}
                      >
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
                    <div
                      className="mb-md"
                      style={{
                        paddingBottom: "var(--spacing-md)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <p
                        className="text-muted"
                        style={{
                          fontSize: "12px",
                          margin: 0,
                          marginBottom: "4px",
                        }}
                      >
                        📍 Full Address
                      </p>
                      <p style={{ fontWeight: "600", margin: 0 }}>
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p
                        className="text-muted"
                        style={{ margin: 0, fontSize: "14px" }}
                      >
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p
                        className="text-muted"
                        style={{ margin: 0, fontSize: "14px" }}
                      >
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
                        {cuisineOptions.map((cuisine) => (
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
                        style={{ minHeight: "100px" }}
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
                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    style={{ padding: "12px 24px", fontSize: "16px" }}
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={handleCancel}
                    style={{ padding: "12px 24px", fontSize: "16px" }}
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
                <div
                  className="mb-md"
                  style={{
                    paddingBottom: "var(--spacing-md)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <p
                    className="text-muted"
                    style={{ fontSize: "12px", margin: 0, marginBottom: "4px" }}
                  >
                    Restaurant ID
                  </p>
                  <p style={{ fontWeight: "600", margin: 0 }}>
                    {restaurant.id}
                  </p>
                </div>

                <div
                  className="mb-md"
                  style={{
                    paddingBottom: "var(--spacing-md)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <p
                    className="text-muted"
                    style={{ fontSize: "12px", margin: 0, marginBottom: "4px" }}
                  >
                    Status
                  </p>
                  <p
                    style={{
                      fontWeight: "600",
                      margin: 0,
                      color: "var(--success)",
                    }}
                  >
                    ✓ Active
                  </p>
                </div>

                <div
                  className="mb-lg"
                  style={{
                    paddingBottom: "var(--spacing-md)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <p
                    className="text-muted"
                    style={{ fontSize: "12px", margin: 0, marginBottom: "4px" }}
                  >
                    Related Sections
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--spacing-xs)",
                    }}
                  >
                    <button
                      className="btn btn-secondary btn-sm btn-full"
                      style={{ textAlign: "left" }}
                    >
                      📋 Manage Menus
                    </button>
                    <button
                      className="btn btn-secondary btn-sm btn-full"
                      style={{ textAlign: "left" }}
                      onClick={() => onViewChange("seating")}
                    >
                      🪑 Seating Plans
                    </button>
                    <button
                      className="btn btn-secondary btn-sm btn-full"
                      style={{ textAlign: "left" }}
                      onClick={() => onViewChange("promotions")}
                    >
                      🎉 Promotions
                    </button>
                  </div>
                </div>

                <div className="alert alert-info">
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    ℹ️ Changes to restaurant information will be reflected
                    across the platform within a few minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
