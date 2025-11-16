const bookingsController = require("../controllers/bookings");

module.exports = (router) => {
  // =================================== Bookings Endpoints =====================================================================

  // Endpoint to create a new booking (Use Case 2: Book Reservation)
  router.post("/booking", bookingsController.createBooking);

  // Endpoint to get all bookings (Admin view - all restaurants)
  router.get("/booking", bookingsController.findAllBookings);

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
