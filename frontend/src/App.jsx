import { useState, useEffect } from "react";
import "./styles.css";
import { restaurantAPI } from "./utils/api";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 6; // 3 columns x 2 rows

  // Track booking confirmation for auto-fill
  const [lastBookingEmail, setLastBookingEmail] = useState("");
  const [lastConfirmationCode, setLastConfirmationCode] = useState("");

  // For toast
  const [show, setShow] = useState(false);
  const [type, setType] = useState("");
  const [text, setText] = useState("");

  //USEEFFECT
  useEffect(() => {
    // Fetch all restaurants with enriched data (reviews, promotions, menus, address)
    // Single API call replaces the previous multi-call approach
    restaurantAPI
      .searchRestaurants({})
      .then((response) => {
        const restaurantList = response.data.restaurants;

        // Map fields for component compatibility
        const enrichedRestaurants = restaurantList.map((restaurant) => ({
          ...restaurant,
          image: restaurant.imageUrl, // Map imageUrl to image field
          reviewCount: restaurant.reviewSummary?.totalReviews || 0,
          averageRating: restaurant.reviewSummary?.averageRating || 0,
        }));

        setRestaurants(enrichedRestaurants);
        setFilteredRestaurants(enrichedRestaurants);
        setSelectedRestaurant(null);
        setReload(true);
      })
      .catch((err) => {
        console.error("Error loading restaurants:", err);
      });
  }, [reload]);

  // Pagination logic
  const totalPages = Math.ceil((filteredRestaurants?.length || 0) / restaurantsPerPage);
  const startIndex = (currentPage - 1) * restaurantsPerPage;
  const endIndex = startIndex + restaurantsPerPage;
  const paginatedRestaurants = filteredRestaurants
    ? filteredRestaurants.slice(startIndex, endIndex)
    : [];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRestaurants]);

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
      // Check if restaurant already has enriched data from search endpoint
      if (restaurant.promotions && restaurant.dietaryTypes) {
        // Use existing enriched data
        setSelectedRestaurant(restaurant);
        setCurrentView("restaurant-detail");
      } else {
        // Fetch detailed restaurant info with address (fallback for old data)
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
      }
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      // Fallback to using the restaurant data passed from card
      setSelectedRestaurant(restaurant);
      setCurrentView("restaurant-detail");
    }
  };

  const handleBookNow = async (restaurant) => {
    try {
      // Check if restaurant already has enriched data from search endpoint
      if (restaurant.promotions && restaurant.dietaryTypes) {
        // Use existing enriched data
        setSelectedRestaurant(restaurant);
        setCurrentView("booking-form");
      } else {
        // Fetch detailed restaurant info with address (fallback for old data)
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
      }
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
                          onClick={() => {
                            setSelectedRestaurantId(-1);
                            setCurrentView("restaurant-management");
                          }}
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
                  <div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "var(--spacing-md)",
                      }}
                      className="restaurant-grid"
                    >
                      {paginatedRestaurants.map((restaurant) => (
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "var(--spacing-sm)",
                          marginTop: "var(--spacing-lg)",
                          padding: "var(--spacing-md)",
                          backgroundColor: "var(--bg-light)",
                          borderRadius: "8px",
                        }}
                      >
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="btn btn-secondary"
                          style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            opacity: currentPage === 1 ? 0.5 : 1,
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          }}
                        >
                          ← Previous
                        </button>

                        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  backgroundColor:
                                    currentPage === pageNum ? "#0ea5e9" : "var(--bg-secondary)",
                                  color: currentPage === pageNum ? "white" : "var(--text-dark)",
                                  border:
                                    currentPage === pageNum
                                      ? "1px solid #0ea5e9"
                                      : "1px solid var(--border-color)",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="btn btn-secondary"
                          style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    )}

                    {/* Page Info */}
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "var(--spacing-md)",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Showing {startIndex + 1} - {Math.min(endIndex, filteredRestaurants.length)} of{" "}
                      {filteredRestaurants.length} restaurants
                    </div>
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
