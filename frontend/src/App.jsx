import { useState } from "react";
import "./styles.css";
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

export default function App() {
  const [currentView, setCurrentView] = useState("home");
  const [userRole, setUserRole] = useState("customer");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] =
    useState(mockRestaurants);

  const [filters, setFilters] = useState({
    cuisine: "All Cuisines",
  });

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

    if (filters.cuisine !== "All Cuisines") {
      filtered = filtered.filter(
        (restaurant) => restaurant.cuisine === filters.cuisine
      );
    }

    setFilteredRestaurants(filtered);
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
                        key={restaurant.restaurant_id}
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
