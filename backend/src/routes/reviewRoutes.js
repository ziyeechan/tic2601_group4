const reviewController = require("../controllers/review");
module.exports = (router) => {
  // =================================== review Endpoints =================================================================

  // Endpoint to create review for restaurant
  router.post("/review/:restaurantID", reviewController.createReviews);

  // Endpoint to retrieve all reviews
  router.get(
    "/review/all",
    reviewController.findAllReviews
  );

  // Endpoint to get review by reviewID
  router.get("/review/:reviewID", reviewController.findReviewByID);

  // Endpoint to get all reviews for restaurant_id
  router.get(
    "/review/restaurant/:restaurantID",
    reviewController.findReviewsByRestaurantID
  );

    // Endpoint to get all reviews for booking_id
  router.get(
    "/review/bookings/:bookingID",
    reviewController.findReviewsByBookingID
  );

  // Endpoint to update review by reviewId
  router.put(
    "/review/:reviewID",
    reviewController.updatereview
  );

  // Endpoint to delete existing review
  router.delete(
    "/review/:reviewID",
    reviewController.deleteReviewByPK
  );

  // =================================== End of Restaurant Endpoints =================================================================
};
