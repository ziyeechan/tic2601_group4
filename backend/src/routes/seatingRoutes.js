const seatingController = require("../controllers/seatingPlan");

module.exports = (router) => {
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

  // Endpoint to get seating plan by seating_id
  router.get("/seating/id/:seatingID", seatingController.findSeatingPlanByPK);

  // Endpoint to update seating plan by seating_id
  router.put("/seating/:seatingID", seatingController.updateSeatingPlanByPK);

  // Endpoint to delete existing seating plan
  router.delete("/seating/:seatingID", seatingController.deleteSeatingPlanByPK);

  // =================================== End of Seating Plans Endpoints =================================================================
};
