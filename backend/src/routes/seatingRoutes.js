const seatingController = require("../controllers/seatingPlan");

module.exports = (router) => {
  // =================================== Seating Plans Endpoints =====================================================================

  // Endpoint to create seating plan for restaurant
  router.post("/seating/:restaurantID", seatingController.createSeatingPlan);

  // Endpoint to get seating plan by tableNum for restaurantId
  router.get(
    "/seating/restaurant/:restaurantID/tableNum/:tableNum",
    seatingController.findSeatingPlanByTableNum
  );

  // Endpoint to get all seating plans for restaurantId
  router.get(
    "/seating/:restaurantID",
    seatingController.findSeatingPlanByRestaurantID
  );

  // Endpoint to get seating plan by seatingId
  router.get("/seating/id/:seatingID", seatingController.findSeatingPlanByID);

  // Endpoint to update seating plan by seatingId
  router.put("/seating/:seatingID", seatingController.updateSeatingPlanByID);

  // Endpoint to delete existing seating plan
  router.delete("/seating/:seatingID", seatingController.deleteSeatingPlanByID);

  // =================================== End of Seating Plans Endpoints =================================================================
};
