import { useState, useEffect } from "react";
import "./styles.css";
import axios from "axios";
import { Header } from "./components/Header";
import { RestaurantCard } from "./components/RestaurantCard";
import { SearchFilters } from "./components/SearchFilters";
import { RestaurantDetail } from "./components/RestaurantDetail";
import { BookingForm } from "./components/BookingForm";
import { MyBookings } from "./components/MyBookings";
import { AdminBookings } from "./components/AdminBookings";
import { SeatingPlan } from "./components/SeatingPlan2";
import { Analytics } from "./components/Analytics";
import { RestaurantManagement } from "./components/RestaurantManagement2";
import { mockRestaurants } from "./mockData";
import { Promotions } from "./components/Promotions";

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [userRole, setUserRole] = useState("customer");

  //Restaurants table
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: "All Cuisines",
    search: "",
    reviews: "",
    promotion: "",
  });

  //Promotion table
  const [promotions, setPromotions] = useState(false);

  //Review table
  const [reviews, setReviews] = useState(false);

  useEffect(() => {
    //Fetch restaurants
    axios
      .get(`/api/restaurant/all`)
      .then((res) => {
        console.log(res.data);
        setRestaurants(res.data);
        setSelectedRestaurant(res.data);
        setFilteredRestaurants(res.data);
      })
      .catch((err) => {
        console.error(err);
      });

    // Fetch promotions
    axios
      .get(`/api/promotion/all`)
      .then((res) => {
        console.log("promotion", res.data);
        setPromotions(res.data);
      })
      .catch((err) => {
        console.error(err);
      });

    // Fetch reviews
    axios
      .get(`/api/review/all`)
      .then((res) => {
        console.log("review", res.data);
        setReviews(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSelectedRestaurant(null);
  };

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentView("restaurant-detail");
  };

  const handleBookNow = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentView("booking-form");
  };

  const handleBookingComplete = () => {
    setCurrentView("my-bookings");
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    let filtered = [...restaurants];

    //Search bar filter - yet to add location
    if (filters.search && filters.search.trim() !== "") {
      const term = filters.search.trim().toLowerCase();

      filtered = filtered.filter((restaurant) => {
        const name = (restaurant.restaurantName || "").toLowerCase();
        return name.includes(term);
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
      filtered = filtered.filter((restaurant) => {
        // Get reviews for this restaurant
        const restaurantReviews = reviews.filter(
          (review) => review.fkRestaurantId === restaurant.restaurantId
        );

        if (restaurantReviews.length === 0) return false;

        // Extract valid ratings
        const ratings = restaurantReviews
          .map((r) => Number(r.rating))
          .filter((r) => !Number.isNaN(r));

        if (ratings.length === 0) return false;

        // Compute average
        const averageRating =
          ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

        // Filter by selected rating range
        return averageRating >= selected && averageRating < selected + 1;
      });
    }

    //Promotion filter
    if (filters.promotion == "Yes") {
      const promoRestaurantIds = new Set(
        promotions
          .filter((promo) => promo.isActive) // only active promotions
          .map((promo) => promo.fkRestaurantId)
      );
      filtered = filtered.filter((restaurant) => {
        return promoRestaurantIds.has(restaurant.restaurantId);
      });
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
              onBack={() => setCurrentView("home")}
              onViewChange={setCurrentView}
            />
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

      // return selectedRestaurant ? (
      //   <div
      //     className="container"
      //     style={{
      //       paddingTop: "var(--spacing-lg)",
      //       paddingBottom: "var(--spacing-lg)",
      //     }}
      //   >
      //     <RestaurantManagement onBack={() => setCurrentView("home")} />
      //   </div>
      // ) : null;

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
            <MyBookings />
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
            setCurrentView("home");
            alert(`Switched to ${newRole} view`);
          }}
        >
          👤 Switch to {userRole === "customer" ? "Admin" : "Customer"} View
        </button>
      </div>
    </div>
  );
}
