import axios from "axios";

// Create axios instance with base URL for localhost:3000
const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Booking API endpoints
export const bookingAPI = {
  // Create a new booking
  createBooking: (bookingData) => api.post("/booking", bookingData),

  // Get all bookings (Admin view)
  getAllBookings: () => api.get("/booking/all"),

  // Get booking by confirmation code
  getBookingByCode: (confirmationCode) => api.get(`/booking/code/${confirmationCode}`),

  // Get all bookings by customer email
  getBookingsByEmail: (email) => api.get(`/booking/email/${email}`),

  // Get booking by ID
  getBookingById: (bookingId) => api.get(`/booking/${bookingId}`),

  // Get all bookings for a restaurant
  getBookingsByRestaurantId: (restaurantId) => api.get(`/booking/restaurant/${restaurantId}`),

  // Get bookings by restaurant and status
  getBookingsByStatus: (restaurantId, status) =>
    api.get(`/booking/restaurant/${restaurantId}/status/${status}`),

  // Update booking details
  updateBooking: (bookingId, bookingData) => api.put(`/booking/${bookingId}`, bookingData),

  // Update booking status
  updateBookingStatus: (bookingId, status) => api.put(`/booking/${bookingId}/status`, { status }),

  // Delete/cancel a booking
  deleteBooking: (bookingId) => api.delete(`/booking/${bookingId}`),
};

// Restaurant API endpoints
export const restaurantAPI = {
  createRestaurant: (restaurantData) => api.post("/restaurant", restaurantData),

  getAllRestaurants: () => api.get("/restaurant/all"),

  getRestaurantById: (restaurantId) => api.get(`/restaurant/id/${restaurantId}`),

  getRestaurantByName: (name) => api.get(`/restaurant/name/${name}`),

  updateRestaurant: (restaurantId, restaurantData) =>
    api.put(`/restaurant/${restaurantId}`, restaurantData),

  deleteRestaurant: (restaurantId) => api.delete(`/restaurant/${restaurantId}`),
};

// Seating API endpoints
export const seatingAPI = {
  createSeatingPlan: (restaurantId, seatingData) =>
    api.post(`/seating/${restaurantId}`, seatingData),

  getSeatingPlansByRestaurant: (restaurantId) => api.get(`/seating/${restaurantId}`),

  getSeatingPlanById: (seatingId) => api.get(`/seating/id/${seatingId}`),

  getSeatingPlanByTableNumber: (restaurantId, tableNumber) =>
    api.get(`/seating/${restaurantId}/tableNum/${tableNumber}`),

  updateSeatingPlan: (seatingId, seatingData) => api.put(`/seating/${seatingId}`, seatingData),

  deleteSeatingPlan: (seatingId) => api.delete(`/seating/${seatingId}`),
};

// Address API endpoints
export const addressAPI = {
  // Create a new address
  createAddress: (addressData) => api.post("/address", addressData),

  // Get all addresses
  getAllAddresses: () => api.get(`/address/`),

  // Get address by ID
  getAddressById: (addressId) => api.get(`/address/${addressId}`),

  // Update address by ID
  updateAddress: (addressId, addressData) => api.put(`/address/${addressId}`, addressData),

  // Delete address by ID
  deleteAddress: (addressId) => api.delete(`/address/${addressId}`),
};

// Promotion API endpoints
export const promotionAPI = {
  // Create promotion for a specific restaurant
  createPromotion: (restaurantId, promotionData) =>
    api.post(`/promotion/${restaurantId}`, promotionData),

  // Get all promotions (no filter)
  getAllPromotions: () => api.get("/promotion/"),

  // Get promotion by ID
  getPromotionById: (promotionId) => api.get(`/promotion/${promotionId}`),

  // Get all promotions for a specific restaurant
  getPromotionsByRestaurant: (restaurantId) => api.get(`/promotion/restaurant/${restaurantId}`),

  // Update promotion
  updatePromotion: (promotionId, promotionData) =>
    api.put(`/promotion/${promotionId}`, promotionData),

  // Delete promotion
  deletePromotion: (promotionId) => api.delete(`/promotion/${promotionId}`),
};

// Review API endpoints
export const reviewAPI = {
  // Create a review for a restaurant booking
  createReview: (restaurantId, bookingId, reviewData) =>
    api.post(`/review/${restaurantId}/${bookingId}`, reviewData),

  // Get all reviews
  getAllReviews: () => api.get("/review/all"),

  // Get review by ID
  getReviewById: (reviewId) => api.get(`/review/${reviewId}`),

  // Get all reviews for a specific restaurant
  getReviewsByRestaurant: (restaurantId) => api.get(`/review/restaurant/${restaurantId}`),

  // Get all reviews for a specific booking
  getReviewsByBooking: (bookingId) => api.get(`/review/booking/${bookingId}`),

  // Update a review
  updateReview: (reviewId, reviewData) => api.put(`/review/${reviewId}`, reviewData),

  // Delete a review
  deleteReview: (reviewId) => api.delete(`/review/${reviewId}`),
};

// Analytics API endpoints
export const analyticsAPI = {
  // Get bookings analytics for a restaurant (requires restaurantId, year, month)
  getBookingsAnalytics: (restaurantId, year, month) =>
    api.get("/analytics/bookings", {
      params: { restaurantId, year, month },
    }),

  // Get booking metrics for a restaurant (requires restaurantId, year, month)
  getBookingsMetrics: (restaurantId, year, month) =>
    api.get("/analytics/bookings/metrics", {
      params: { restaurantId, year, month },
    }),
};

export default api;
