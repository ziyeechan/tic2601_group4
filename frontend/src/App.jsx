import { useState, useEffect } from "react";
import "./styles.css";
import { restaurantAPI, promotionAPI, reviewAPI, addressAPI } from "./utils/api";
import { Header } from "./components/Header";
import { RestaurantCard } from "./components/RestaurantCard";
import { SearchFilters } from "./components/SearchFilters";
import { RestaurantDetail } from "./components/RestaurantDetail";
import { BookingForm } from "./components/BookingForm";
import { MyBookings } from "./components/MyBookings";
import { AdminBookings } from "./components/AdminBookings";
import { SeatingPlan } from "./components/SeatingPlan";
import { Analytics } from "./components/Analytics";
import { RestaurantManagement } from "./components/RestaurantManagement";
import { Promotions } from "./components/Promotions2";
import { AllPromotions } from "./components/Promotions";
import { Toast } from "./components/Common";

const Views = ({ children }) => {
  return (
    <div
      className="container"
      style={{
        paddingTop: "var(--spacing-lg)",
        paddingBottom: "var(--spacing-lg)",
      }}
    >
      {children}
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [userRole, setUserRole] = useState("customer");

  //Restaurants table
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(-1);
  const [restaurants, setRestaurants] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState(false);
  const [reload, setReload] = useState(false);
  //Address table
  const [addresses, setAddresses] = useState([]);

  //Promotion table
  const [promotions, setPromotions] = useState([]);

  //Review table
  const [reviews, setReviews] = useState([]);

  // Track booking confirmation for auto-fill
  const [lastBookingEmail, setLastBookingEmail] = useState("");
  const [lastConfirmationCode, setLastConfirmationCode] = useState("");

  // For toast
  const [show, setShow] = useState(false);
  const [type, setType] = useState("");
  const [text, setText] = useState("");

  //USEEFFECT
  useEffect(() => {
    Promise.all([
      restaurantAPI.getAllRestaurants(),
      addressAPI.getAllAddresses(),
      promotionAPI.getAllPromotions(),
      reviewAPI.getAllReviews(),
    ])
      .then(([resRestaurants, resAddresses, resPromotions, resReviews]) => {
        const restaurantList = resRestaurants.data;
        const addressList = resAddresses.data;
        const promotionList = resPromotions.data;
        const reviewList = resReviews.data;

        // Save raw data to state
        setAddresses(addressList);
        setPromotions(promotionList);
        setReviews(reviewList);

        // Build final restaurant objects with extra info
        const finalRestaurants = restaurantList.map((restaurant) => {
          // Get reviews for this restaurant
          const reviewsForThis = reviewList.filter(
            (review) => review.fkRestaurantId === restaurant.restaurantId
          );

          // Extract valid ratings
          const ratings = reviewsForThis.map((r) => Number(r.rating)).filter((r) => !isNaN(r));

          // Calculate average rating
          const reviewCount = ratings.length;
          const averageRating =
            reviewCount > 0 ? ratings.reduce((sum, r) => sum + r, 0) / reviewCount : 0;

          // Find matching address
          const restaurantAddress = addressList.find(
            (addr) => addr.addressId === restaurant.fkAddressId
          );

          // Return the final restaurant object
          return {
            ...restaurant,
            image: restaurant.imageUrl,
            reviewCount,
            averageRating,
            address: restaurantAddress,
          };
        });

        // Save final restaurant list to state
        setRestaurants(finalRestaurants);
        setFilteredRestaurants(finalRestaurants);
        setSelectedRestaurant(null);
        setReload(true);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
      });
  }, [reload]);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedRestaurant(null);
  };

  const handleToast = (type, message) => {
    setShow(true);
    setType(type);
    setText(message);
  };

  const handleRestaurantView = (restaurant) => {
    setSelectedRestaurantId(restaurant.restaurantId);
    setCurrentView("restaurant-management");
  };

  const handleRestaurantSelect = async (restaurant) => {
    try {
      // Fetch detailed restaurant info with address
      const response = await restaurantAPI.getRestaurantById(restaurant.restaurantId);
      const { restaurant: restaurantData, address } = response.data;

      // Combine restaurant data with address information
      const enrichedRestaurant = {
        ...restaurantData,
        address,
        image: restaurantData.imageUrl, // Map imageUrl to image for components
      };

      setSelectedRestaurant(enrichedRestaurant);
      setCurrentView("restaurant-detail");
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      // Fallback to using the restaurant data passed from card
      setSelectedRestaurant(restaurant);
      setCurrentView("restaurant-detail");
    }
  };

  const handleBookNow = async (restaurant) => {
    try {
      // Fetch detailed restaurant info with address
      const response = await restaurantAPI.getRestaurantById(restaurant.restaurantId);
      const { restaurant: restaurantData, address } = response.data;

      // Combine restaurant data with address information
      const enrichedRestaurant = {
        ...restaurantData,
        address,
        image: restaurantData.imageUrl, // Map imageUrl to image for components
      };

      setSelectedRestaurant(enrichedRestaurant);
      setCurrentView("booking-form");
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      // Fallback to using the restaurant data passed from card
      setSelectedRestaurant(restaurant);
      setCurrentView("booking-form");
    }
  };

  const handleBookingSuccess = (email, confirmationCode) => {
    setLastBookingEmail(email);
    setLastConfirmationCode(confirmationCode);
  };

  const handleBookingComplete = () => {
    setCurrentView("my-bookings");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return (
          <Views>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "var(--spacing-lg)",
                alignItems: "start",
              }}
              className="home-grid"
            >
              {/* Filters Sidebar - 1 column */}
              <div className="sidebar" style={{ gridColumn: "span 1" }}>
                <SearchFilters
                  restaurants={restaurants || []}
                  promotions={promotions || []}
                  onFiltered={setFilteredRestaurants}
                />
              </div>

              {/* Restaurant Grid - 3 columns */}
              <div style={{ gridColumn: "span 3" }}>
                <div className="mb-lg">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "var(--spacing-md)",
                    }}
                  >
                    <div className="flex-between gap-lg">
                      <h2 style={{ margin: 0 }}>Available Restaurants</h2>
                      {userRole != "customer" && (
                        <button
                          className="btn btn-success"
                          onClick={() => setCurrentView("restaurant-management")}
                        >
                          Create Restaurant
                        </button>
                      )}
                    </div>
                    <p className="text-muted" style={{ margin: 0 }}>
                      {filteredRestaurants.length} restaurants found
                    </p>
                  </div>
                </div>

                {filteredRestaurants.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "var(--spacing-md)",
                    }}
                    className="restaurant-grid"
                  >
                    {filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant.restaurantId}
                        restaurant={restaurant}
                        onViewDetails={handleRestaurantSelect}
                        onBookNow={handleBookNow}
                        isAdmin={userRole}
                        onViewChange={handleRestaurantView}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>No restaurants found</h3>
                    <p>Try adjusting your filters to see more results.</p>
                    <button className="btn btn-success mt-lg">Create Restaurant</button>
                  </div>
                )}
              </div>
            </div>
          </Views>
        );

      case "restaurant-management":
        return (
          <Views>
            <RestaurantManagement
              onBack={() => setCurrentView("home")}
              onViewChange={setCurrentView}
              restaurantId={selectedRestaurantId}
              handleAppToast={handleToast}
              setReload={setReload}
            />
          </Views>
        );

      case "promotions":
        return (
          <Views>
            <Promotions onBack={() => setCurrentView("home")} restaurantId={selectedRestaurantId} />
          </Views>
        );

      case "all-promotions":
        return (
          <Views>
            <AllPromotions onBack={() => setCurrentView("home")} />
          </Views>
        );

      case "restaurant-detail":
        return selectedRestaurant ? (
          <Views>
            <RestaurantDetail
              restaurant={selectedRestaurant}
              onBack={() => setCurrentView("home")}
              onBookNow={handleBookNow}
            />
          </Views>
        ) : null;

      case "booking-form":
        return selectedRestaurant ? (
          <Views>
            <BookingForm
              restaurant={selectedRestaurant}
              onBack={() => setCurrentView("restaurant-detail")}
              onBookingComplete={handleBookingComplete}
              onBookingSuccess={handleBookingSuccess}
            />
          </Views>
        ) : null;

      case "my-bookings":
        return (
          <Views>
            <MyBookings
              autoFillEmail={lastBookingEmail}
              highlightConfirmationCode={lastConfirmationCode}
            />
          </Views>
        );

      case "admin-bookings":
        return (
          <Views>
            <AdminBookings />
          </Views>
        );

      case "seating":
        return (
          <Views>
            <SeatingPlan />
          </Views>
        );

      case "analytics":
        return (
          <Views>
            <Analytics />
          </Views>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header currentView={currentView} onViewChange={handleViewChange} userRole={userRole} />

      <main style={{ flex: 1, minHeight: "calc(100vh - 80px)" }}>{renderCurrentView()}</main>

      {/* Role Switcher for Demo */}
      <div style={{ position: "fixed", bottom: "16px", right: "16px", zIndex: 50 }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            const newRole = userRole === "customer" ? "admin" : "customer";
            setUserRole(newRole);
            if (newRole === "admin") {
              setCurrentView("analytics");
            } else {
              setCurrentView("home");
            }
            handleToast("info", `Switched to ${newRole} view`);
            // alert(`Switched to ${newRole} view`);
          }}
        >
          👤 Switch to {userRole === "customer" ? "Admin" : "Customer"} View
        </button>
      </div>
      {show && <Toast type={type} text={text} duration={2500} onClose={() => setShow(false)} />}
    </div>
  );
}
