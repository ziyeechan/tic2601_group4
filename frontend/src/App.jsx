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
import { SeatingPlan } from "./components/SeatingPlan2(Ziyee)";
import { Analytics } from "./components/Analytics";
import { RestaurantManagement } from "./components/RestaurantManagement2";
import { Promotions } from "./components/Promotions";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [userRole, setUserRole] = useState("customer");

  //Restaurants table
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [filters, setFilters] = useState({
    cuisine: "All Cuisines",
    search: "",
    reviews: "",
    promotion: "",
  });

  //Address table
  const [addresses, setAddresses] = useState([]);

  //Promotion table
  const [promotions, setPromotions] = useState([]);

  //Review table
  const [reviews, setReviews] = useState([]);

  // Track booking confirmation for auto-fill
  const [lastBookingEmail, setLastBookingEmail] = useState("");
  const [lastConfirmationCode, setLastConfirmationCode] = useState("");

  //USEEFFECT
  useEffect(() => {
    Promise.all([
      restaurantAPI.getAllRestaurants(),
      addressAPI.getAllAddresses(),
      promotionAPI.getAllPromotions(),
      reviewAPI.getAllReviews()
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
          const ratings = reviewsForThis
            .map((r) => Number(r.rating))
            .filter((r) => !isNaN(r));

          // Calculate average rating
          const reviewCount = ratings.length;
          const averageRating =
            reviewCount > 0
              ? ratings.reduce((sum, r) => sum + r, 0) / reviewCount
              : 0;

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
      })
      .catch((err) => {
        console.error("Error loading data:", err);
      });
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedRestaurant(null);
  };

  const handleRestaurantSelect = async (restaurant) => {
    try {
      // Fetch detailed restaurant info with address
      const response = await restaurantAPI.getRestaurantById(
        restaurant.restaurantId
      );
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
      const response = await restaurantAPI.getRestaurantById(
        restaurant.restaurantId
      );
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

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
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

        return (nameMatch || cityMatch || stateMatch || countryMatch);
      });
    }

    //Cuisine filter
    if (filters.cuisine !== "All Cuisines") {
      filtered = filtered.filter(
        (restaurant) => restaurant.cuisine === filters.cuisine
      );
    }

    //Rating filter
     if (filters.reviews) {
        const selected = Number(filters.reviews);
        filtered = filtered.filter((r) =>
          r.reviewCount > 0 &&
          r.averageRating >= selected &&
          r.averageRating < selected + 1
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

      filtered = filtered.filter((restaurant) =>
        promoRestaurantIds.has(restaurant.restaurantId)
      );
    }

    setFilteredRestaurants(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      cuisine: "All Cuisines",
      search: "",
      reviews: "",
      promotion: "",
    });
    setFilteredRestaurants(restaurants);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
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
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onApplyFilters={handleApplyFilters}
                  onClearFilters={handleClearFilters}
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
                    <h2 style={{ margin: 0 }}>Available Restaurants</h2>
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
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>No restaurants found</h3>
                    <p>Try adjusting your filters to see more results.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "promotions":
        return (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <Promotions onBack={() => setCurrentView("home")} />
          </div>
        );

      case "restaurant-detail":
        return selectedRestaurant ? (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <RestaurantDetail
              restaurant={selectedRestaurant}
              onBack={() => setCurrentView("home")}
              onBookNow={handleBookNow}
            />
          </div>
        ) : null;

      case "booking-form":
        return selectedRestaurant ? (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <BookingForm
              restaurant={selectedRestaurant}
              onBack={() => setCurrentView("restaurant-detail")}
              onBookingComplete={handleBookingComplete}
              onBookingSuccess={handleBookingSuccess}
            />
          </div>
        ) : null;

      case "my-bookings":
        return (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <MyBookings
              autoFillEmail={lastBookingEmail}
              highlightConfirmationCode={lastConfirmationCode}
            />
          </div>
        );
      
        case "restaurant-management":
        return (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <RestaurantManagement
              onBack={() => setCurrentView("analytics")}
              onViewChange={setCurrentView}
            />
          </div>
        );

      case "admin-bookings":
        return (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <AdminBookings />
          </div>
        );

      case "seating":
        return (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <SeatingPlan />
          </div>
        );

      case "analytics":
        return (
          <div
            className="container"
            style={{
              paddingTop: "var(--spacing-lg)",
              paddingBottom: "var(--spacing-lg)",
            }}
          >
            <Analytics />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        userRole={userRole}
      />

      <main style={{ flex: 1, minHeight: "calc(100vh - 80px)" }}>
        {renderCurrentView()}
      </main>

      {/* Role Switcher for Demo */}
      <div
        style={{ position: "fixed", bottom: "16px", right: "16px", zIndex: 50 }}
      >
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
            alert(`Switched to ${newRole} view`);
          }}
        >
          👤 Switch to {userRole === "customer" ? "Admin" : "Customer"} View
        </button>
      </div>
    </div>
  );
}
