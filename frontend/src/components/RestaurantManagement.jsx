import { useEffect, useState } from "react";
import { Card, TextContainer, FormInput, Toast } from "./Common";
import { restaurantAPI, addressAPI } from "../utils/api";

const SidebarButtons = ({ onClick, text }) => {
  return (
    <button
      className="btn btn-secondary btn-sm btn-full"
      style={{ textAlign: "left" }}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export function RestaurantManagement({
  onBack,
  onViewChange,
  restaurantId,
  setReload,
  handleAppToast,
}) {
  const [restaurant, setRestaurant] = useState(null);
  const [address, setAddress] = useState();
  const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState({ ...restaurant });
  const [editedAddress, setEditedAddress] = useState({ ...address });
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (restaurantId === -1) {
      setRefresh(true);
      const emptyRestaurant = { name: "", cuisine: "" };
      const emptyAddress = {
        addressLine1: "",
        country: "",
        city: "",
        postalCode: "",
      };
      setAddress(emptyAddress);
      setRestaurant(emptyRestaurant);
      setEditedAddress(emptyAddress);
      setEditedRestaurant(emptyRestaurant);
      setIsEditingRestaurant(true);
      return;
    }

    restaurantAPI
      .getRestaurantById(restaurantId)
      .then((res) => {
        const { address, restaurant } = res.data;
        let closedDays = [];

        // Check if closedDays is a valid string before splitting
        if (restaurant.closedDays) {
          closedDays = restaurant.closedDays.split(",").map((day) => day.trim());
        }
        console.log(closedDays);
        setAddress({
          ...address,
        });
        setRestaurant({
          name: restaurant.restaurantName,
          closed: closedDays,
          ...restaurant,
        });
        setEditedAddress({
          ...address,
        });
        setEditedRestaurant({
          name: restaurant.restaurantName,
          closed: closedDays,
          ...restaurant,
        });
        setRefresh(true);
      })
      .catch((error) => console.error("Error fetching details: ", error));
  }, [refresh]);

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

      return hours;
    }
  };

  const handleToast = (type, message) => {
    setShow(true);
    setType(type);
    setMessage(message);
  };

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setEditedRestaurant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDaysChange = (e) => {
    const { name } = e.target;

    let updatedClosedDays = [...editedRestaurant.closed];
    if (updatedClosedDays.includes(name)) {
      // If the day is already in the closed array, remove it (uncheck the box)
      updatedClosedDays = updatedClosedDays.filter((day) => day !== name);
    } else {
      // If the day is not in the closed array, add it (check the box)
      updatedClosedDays.push(name);
    }

    setEditedRestaurant((prev) => ({
      ...prev,
      closed: updatedClosedDays,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditedAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (restaurantId) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      await restaurantAPI
        .deleteRestaurant(restaurantId)
        .then(() => {
          handleAppToast("success", "Restaurant has been deleted successfully!");
          onViewChange("home");
          setReload(false);
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.message;
          console.error(error);
          handleToast(
            "danger",
            `${errorMessage}.  Please try again.` || "Something went wrong. Please try again."
          );
        });
    }
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
      handleToast("warning", "Please fill in all required fields");
      // alert("Please fill in all required fields");
      return;
    }

    try {
      // Step 1: Checks if it's create or update restaurant
      if (restaurantId === -1) {
        // Step 2: Format data for create and pass into endpoint
        const formattedData = {
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

        await restaurantAPI.createRestaurant(formattedData);
      } else {
        //Step 2: Pass data into update endpoint
        await restaurantAPI.updateRestaurant(
          editedRestaurant.restaurantId || editedRestaurant.restaurant_id,
          editedRestaurant
        );

        if (editedAddress.addressId || editedAddress.address_id) {
          await addressAPI.updateAddress(
            editedAddress.addressId || editedAddress.address_id,
            editedAddress
          );
        }
      }

      // Step 3: Update local state to reflect changes
      setRestaurant({ ...editedRestaurant });
      setAddress({ ...editedAddress });
      setIsEditingRestaurant(false);

      // Step 4: Show success feedback to user
      handleToast("success", "Restaurant information updated successfully");
      // alert("Restaurant information updated successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      console.error("Error saving changes: ", error);
      handleToast(
        "danger",
        `${errorMessage}.  Please try again.` || "Failed to save changes. Please try again."
      );
      // alert(error.response?.data?.message || "Failed to save changes. Please try again.");
    }
  };

  const handleCancel = () => {
    if (restaurantId === -1) {
      onViewChange("home");
      setReload("false");
    }
    setEditedRestaurant({ ...restaurant });
    setEditedAddress({ ...address });
    setIsEditingRestaurant(false);
  };

  const cuisineOptions = [
    "",
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

  const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
            gridTemplateColumns: restaurantId != -1 ? "2fr 1fr" : "1fr",
            gap: "var(--spacing-lg)",
          }}
        >
          {/* Main Content */}
          <div>
            <div className="flex-between">
              <h2 style={{ marginBottom: "var(--spacing-lg)" }}>🍽️ Restaurant Management</h2>
              {restaurantId != -1 && (
                <div style={{ marginBottom: "var(--spacing-lg)" }}>
                  <button
                    className="btn-sm btn-danger"
                    onClick={() => handleDelete(restaurantId)}
                    style={{ flex: 1 }}
                  >
                    Delete Restaurant
                  </button>
                </div>
              )}
            </div>

            {!isEditingRestaurant ? (
              // View Mode
              <div>
                {/* Restaurant Info Card */}
                <Card className="mb-lg">
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
                    <TextContainer className="mb-md" text="Restaurant Name">
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
                    <TextContainer
                      className="mb-md"
                      text="Cuisine Type"
                      data={restaurant.cuisine}
                    />
                    <TextContainer
                      className="mb-md"
                      text="Description"
                      data={restaurant.description}
                    />

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
                <Card className="mb-lg">
                  <Card.Header title="Opening Hours" />
                  <Card.Content>
                    {VALID_DAYS.map((day) => (
                      <div
                        key={day}
                        className="flex-between mb-md"
                        style={{
                          paddingBottom: "var(--spacing-md)",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>{day}</span>
                        {restaurant.closed && restaurant.closed.includes(day) ? (
                          <span className="text-muted">Closed</span>
                        ) : (
                          <span className="text-muted">{getOpeningHoursDisplay()}</span>
                        )}
                      </div>
                    ))}
                  </Card.Content>
                </Card>
                {/* Address Card */}
                <Card className="mb-lg">
                  <Card.Header title="Address Information" />
                  <Card.Content>
                    <TextContainer className="mb-md" text="📍 Full Address">
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
                <Card className="mb-lg">
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
                        text="📞 Phone *"
                        type="tel"
                        onChange={handleRestaurantChange}
                      />
                      <FormInput
                        name="email"
                        value={editedRestaurant.email}
                        text="📧 Email *"
                        type="email"
                        onChange={handleRestaurantChange}
                      />
                    </div>
                    <FormInput
                      name="imageUrl"
                      value={editedRestaurant.imageUrl}
                      text="Image URL"
                      onChange={handleRestaurantChange}
                    />
                    <div className="form-row">
                      <FormInput
                        name="openingTime"
                        value={editedRestaurant.openingTime}
                        text="⏳ Opening Hours"
                        type="time"
                        onChange={handleRestaurantChange}
                      />
                      <FormInput
                        name="closingTime"
                        value={editedRestaurant.closingTime}
                        text="⌛️ Closing Hours"
                        type="time"
                        onChange={handleRestaurantChange}
                      />
                    </div>
                    <FormInput name="closedDays" text="☀️ Closed Days">
                      <div className="flex gap-md">
                        {VALID_DAYS.map((day) => (
                          <div key={day} className="flex" style={{ alignItems: "center" }}>
                            <input
                              type="checkbox"
                              name={day}
                              id={day}
                              checked={
                                editedRestaurant.closed && editedRestaurant.closed.includes(day)
                                  ? true
                                  : false
                              } // Check if the day is marked as closed
                              style={{
                                display: "block",
                                width: "fit-content",
                                marginRight: "var(--spacing-sm)",
                              }}
                              onChange={handleDaysChange}
                            />
                            <label
                              htmlFor={day}
                              style={{
                                margin: 0,
                              }}
                            >
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormInput>
                  </Card.Content>
                </Card>

                <Card className="mb-lg">
                  <Card.Header title="Edit Address Information" />
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
                        text="Postal Code *"
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
          {restaurantId != -1 && (
            <div>
              <div className="aspect-video image-container mb-lg">
                <img
                  src={restaurant.imageUrl}
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
                  }}
                />
              </div>

              <Card className="mb-lg">
                <Card.Header title="Quick Info" />
                <Card.Content>
                  <TextContainer
                    className="mb-md"
                    text="Restaurant ID"
                    data={restaurant.restaurantId}
                  />
                  <TextContainer className="mb-md" text="Status">
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
                  <TextContainer className="mb-lg" text="Related Sections">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-xs)",
                      }}
                    >
                      <SidebarButtons
                        text="🪑 Seating Plans"
                        onClick={() => onViewChange("seating")}
                      />
                      <SidebarButtons
                        text="🎉 Promotions"
                        onClick={() => onViewChange("promotions")}
                      />
                    </div>
                  </TextContainer>

                  <div className="alert alert-info">
                    <p style={{ margin: 0, fontSize: "14px" }}>
                      ℹ️ Changes to restaurant information will be reflected across the platform
                      within a few minutes.
                    </p>
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
          {show && (
            <Toast type={type} text={message} duration={2500} onClose={() => setShow(false)} />
          )}
        </div>
      </div>
    )
  );
}
