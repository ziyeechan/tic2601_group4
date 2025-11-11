const restaurantRoutes = require("./restaurantRoutes");
const seatingRoutes = require("./seatingRoutes");
const bookingRoutes = require("./bookingRoutes");
const promotionRoutes = require("./promotionRoutes");

module.exports = (router) => {
  // Default Endpoint
  router.get("/", (req, res) => {
    res
      .status(200)
      .send("Makan Time APIs are online and functioning properly!");
  });

  // Aggregate all routes
  restaurantRoutes(router);
  seatingRoutes(router);
  bookingRoutes(router);
  promotionRoutes(router);
};
