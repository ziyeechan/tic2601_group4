import { useEffect, useState } from "react";
import { Card, TextContainer, FormInput } from "./Common";
import { restaurantAPI } from "../utils/api";

export function RestaurantManagement({ onBack, onViewChange, restaurantId }) {
  const [restaurant, setRestaurant] = useState(null);
  const [address, setAddress] = useState();
  const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState({ ...restaurant });
  const [editedAddress, setEditedAddress] = useState({ ...address });

  useEffect(() => {
    restaurantAPI
      .getRestaurantById(restaurantId)
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
      console.error("Something went wrong. Please try again later");
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
      restaurantAPI
        .updateRestaurant(restaurant.restaurantId || restaurant.restaurant_id, data)
        .then((res) => {
          console.log("success");
        });
      setRestaurant({ ...editedRestaurant });
      setAddress({ ...editedAddress });
      setIsEditingRestaurant(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditedRestaurant({ ...restaurant });
    setEditedAddress({ ...address });
    setIsEditingRestaurant(false);
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
        <button className="btn btn-secondary mb-lg" onClick={onBack} style={{ border: "none" }}>
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
            <h2 style={{ marginBottom: "var(--spacing-lg)" }}>🍽️ Restaurant Management</h2>

            {!isEditingRestaurant ? (
              // View Mode
              <div>
                {/* Restaurant Info Card */}
                <Card>
                  <Card.Header>
                    <div className="flex-between">
                      <h3 className="card-title">Restaurant Information</h3>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsEditingRestaurant(true)}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <TextContainer text="Restaurant Name">
                      <p
                        style={{
                          fontWeight: "600",
                          margin: 0,
                          fontSize: "18px",
                        }}
                      >
                        {restaurant.name}
                      </p>
                    </TextContainer>
                    <TextContainer text="Cuisine Type" data={restaurant.cuisine} />
                    <TextContainer text="Description" data={restaurant.description} />

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
                      <p className="text-muted" style={{ margin: 0, fontSize: "14px" }}>
                        📞 {restaurant.phone}
                      </p>
                      <p className="text-muted" style={{ margin: 0, fontSize: "14px" }}>
                        📧 {restaurant.email}
                      </p>
                    </div>
                  </Card.Content>
                </Card>

                {/* Address Card */}
                <Card>
                  <Card.Header title="Address Information" />
                  <Card.Content>
                    <TextContainer text="📍 Full Address">
                      <p style={{ fontWeight: "600", margin: 0 }}>
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-muted" style={{ margin: 0, fontSize: "14px" }}>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-muted" style={{ margin: 0, fontSize: "14px" }}>
                        {address.country}
                      </p>
                    </TextContainer>
                  </Card.Content>
                </Card>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSave}>
                <Card>
                  <Card.Header title="Edit Restaurant Information" />
                  <Card.Content>
                    <FormInput
                      name="name"
                      value={editedRestaurant.name}
                      text="🍽️ Restaurant Name *"
                      onChange={handleRestaurantChange}
                      required={true}
                    />
                    <FormInput name="cuisine" text="🍴 Cuisine Type *">
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
                    </FormInput>

                    <FormInput name="description" text="📝 Description">
                      <textarea
                        id="description"
                        name="description"
                        value={editedRestaurant.description}
                        onChange={handleRestaurantChange}
                        style={{ minHeight: "100px" }}
                      />
                    </FormInput>

                    <div className="form-row">
                      <FormInput
                        name="phone"
                        value={editedRestaurant.phone}
                        text="📞 Phone"
                        type="tel"
                        onChange={handleRestaurantChange}
                      />
                      <FormInput
                        name="email"
                        value={editedRestaurant.email}
                        text="📧 Email"
                        type="email"
                        onChange={handleRestaurantChange}
                      />
                    </div>
                  </Card.Content>
                </Card>

                <Card>
                  <Card.Header>
                    <h4 className="card-title">Edit Address Information</h4>
                  </Card.Header>
                  <Card.Content>
                    <FormInput
                      name="addressLine1"
                      value={editedAddress.addressLine1}
                      text="Address Line 1 *"
                      onChange={handleAddressChange}
                      required={true}
                    />
                    <FormInput
                      name="addressLine2"
                      value={editedAddress.addressLine2}
                      text="Address Line 2"
                      onChange={handleAddressChange}
                    />

                    <div className="form-row">
                      <FormInput
                        name="city"
                        value={editedAddress.city}
                        text="City *"
                        onChange={handleAddressChange}
                        required={true}
                      />
                      <FormInput
                        name="state"
                        value={editedAddress.state}
                        text="State/Province"
                        onChange={handleAddressChange}
                      />
                    </div>

                    <div className="form-row">
                      <FormInput
                        name="postalCode"
                        value={editedAddress.postalCode}
                        text="Postal Code"
                        onChange={handleAddressChange}
                      />
                      <FormInput
                        name="country"
                        value={editedAddress.country}
                        text="Country *"
                        onChange={handleAddressChange}
                        required={true}
                      />
                    </div>
                  </Card.Content>
                </Card>

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
                    ❌ Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <Card.Header title="Quick Info" />
              <Card.Content>
                <TextContainer text="Restaurant ID" data={restaurant.restaurantId} />
                <TextContainer text="Status">
                  <p
                    style={{
                      fontWeight: "600",
                      margin: 0,
                      color: "var(--success)",
                    }}
                  >
                    ✓ Active
                  </p>
                </TextContainer>

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
                    ℹ️ Changes to restaurant information will be reflected across the platform
                    within a few minutes.
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    )
  );
}
