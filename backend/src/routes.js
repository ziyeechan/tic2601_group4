const express = require("express");

const restaurantController = require("./controllers/restaurant");
const seatingController = require("./controllers/seatingPlan");
module.exports = (router) => {
  router.get("/", (req, res) => {
    res
      .status(200)
      .send("Makan Time APIs are online and functioning properly!");
  });

  router.post("/restaurant", restaurantController.createRestaurant);

  router.get(
    "/restaurant/:restaurantID",
    restaurantController.findRestaurantByID
  );

  router.get("/restaurant/:name", restaurantController.findRestaurantByName);

  router.put(
    "/restaurant/:restaurantID",
    restaurantController.findRestaurantByName
  );

  router.post("/seating/:restaurantID", seatingController.createSeatingPlan);

  router.get(
    "/seating/:restaurantID/:tableNum",
    seatingController.findSeatingPlanByTableNum
  );

  router.get(
    "/seating/:restaurantID",
    seatingController.findSeatingPlanByRestaurantID
  );

  router.get("/seating/:seatingID", seatingController.findSeatingPlanByPK);

  router.put("/seating/:seatingID", seatingController.updateSeatingPlanByPK);

  router.delete(
    "/seating/:seatingID",
    seatingController.updateSeatingPlanByPK
  );
};
