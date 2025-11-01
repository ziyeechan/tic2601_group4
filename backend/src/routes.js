const express = require("express");

const restaurantController = require("./controllers/restaurant");
const seatingController = require("./controllers/seatingPlan");
const bookingsController = require("./controllers/bookings");
module.exports = (router) => {
  // Default Endpoint
  // Use this to test your postman if its able to fetch
  router.get("/", (req, res) => {
    res
      .status(200)
      .send("Makan Time APIs are online and functioning properly!");
  });

  // =================================== Restaurant Endpoints =================================================================

  // Endpoint to create new restaurants
  router.post("/restaurant", restaurantController.createRestaurant);

  // Endpoint to find restaurant by restaurant_id
  router.get(
    "/restaurant/id/:restaurantID",
    restaurantController.findRestaurantByID
  );

  // Endpoint to find restaurant by name
  router.get(
    "/restaurant/name/:name",
    restaurantController.findRestaurantByName
  );

  // Endpoint to update restaurant by restaurant_id
  router.put(
    "/restaurant/:restaurantID",
    restaurantController.updateRestaurant
  );

  // Endpoint to delete existing restaurant
  router.delete(
    "/restaurant/:restaurantID",
    restaurantController.deleteRestaurantByPK
  );

  // =================================== End of Restaurant Endpoints =================================================================

  // =================================== Seating Plans Endpoints =====================================================================

  // Endpoint to create seating plan for restaurant
  router.post("/seating/:restaurantID", seatingController.createSeatingPlan);

  // Endpoint to get seating plan by table_num for restaurant_id
  router.get(
    "/seating/restaurant/:restaurantID/tableNum/:tableNum",
    seatingController.findSeatingPlanByTableNum
  );

  // Endpoint to get all seating plans for restaurant_id
  router.get(
    "/seating/:restaurantID",
    seatingController.findSeatingPlanByRestaurantID
  );

  // Endpoint to get seatingp plan by seating_id
  router.get("/seating/id/:seatingID", seatingController.findSeatingPlanByPK);

  // Endpoint to update seating plan by seating_id
  router.put("/seating/:seatingID", seatingController.updateSeatingPlanByPK);

  // Endpoint to delete exisiting seating plan
  router.delete("/seating/:seatingID", seatingController.deleteSeatingPlanByPK);

  // =================================== End of Seating Plans Endpoints =================================================================

  // =================================== Bookings Endpoints =====================================================================

  // Endpoint to create a new booking (Use Case 2: Book Reservation)
  router.post("/booking", bookingsController.createBooking);

  // Endpoint to find booking by confirmation code (Use Case 3: Manage Reservation)
  router.get(
    "/booking/code/:confirmationCode",
    bookingsController.findBookingByConfirmationCode
  );

  // Endpoint to find all bookings by customer email (Use Case 3: Manage Reservation)
  router.get(
    "/booking/email/:email",
    bookingsController.findBookingsByCustomerEmail
  );

  // Endpoint to find booking by ID (Admin use)
  router.get("/booking/:bookingID", bookingsController.findBookingByID);

  // Endpoint to get all bookings for a restaurant (Use Case 4: View All Bookings - Admin)
  router.get(
    "/booking/restaurant/:restaurantID",
    bookingsController.findBookingsByRestaurantID
  );

  // Endpoint to get bookings filtered by status (Admin use)
  router.get(
    "/booking/restaurant/:restaurantID/status/:status",
    bookingsController.findBookingsByStatus
  );

  // Endpoint to update booking status (Use Case 5: Update Booking Status - Admin)
  router.put(
    "/booking/:bookingID/status",
    bookingsController.updateBookingStatus
  );

  // Endpoint to update booking details (Use Case 3: Manage Reservation)
  router.put("/booking/:bookingID", bookingsController.updateBooking);

  // Endpoint to delete a booking (Admin or customer)
  router.delete("/booking/:bookingID", bookingsController.deleteBooking);

  // =================================== End of Bookings Endpoints =================================================================
};
