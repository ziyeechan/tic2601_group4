const restaurantController = require("../controllers/restaurant");

module.exports = (router) => {
  // =================================== Restaurant Endpoints =================================================================

  // Endpoint to create new restaurants
  router.post("/restaurant", restaurantController.createRestaurant);

  // Endpoint to search restaurants with advanced filtering
  router.get("/restaurant/search", restaurantController.searchRestaurants);

  // Endpoint to retrieve all restaurants
  router.get("/restaurant/all", restaurantController.findAllRestaurants);

  // Endpoint to find restaurant by restaurantId
  router.get("/restaurant/id/:restaurantID", restaurantController.findRestaurantByID);

  // Endpoint to find restaurant by name
  router.get("/restaurant/name/:name", restaurantController.findRestaurantByName);

  // Endpoint to find restaurant by country
  router.get("/restaurant/country/:country", restaurantController.findRestaurantsByCountry);

  // Endpoint to find restaurant by city
  router.get("/restaurant/city/:city", restaurantController.findRestaurantsByCity);

  // Endpoint to find restaurant by state
  router.get("/restaurant/state/:state", restaurantController.findRestaurantsByState);

  // Endpoint to update restaurant by restaurantId
  router.put("/restaurant/:restaurantID", restaurantController.updateRestaurant);

  // Endpoint to delete existing restaurant
  router.delete("/restaurant/:restaurantID", restaurantController.deleteRestaurantByID);

  // =================================== End of Restaurant Endpoints =================================================================
};
