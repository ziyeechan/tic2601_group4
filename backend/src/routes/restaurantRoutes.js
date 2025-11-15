const restaurantController = require("../controllers/restaurant");

module.exports = (router) => {
  // =================================== Restaurant Endpoints =================================================================

  // Endpoint to create new restaurants
  router.post("/restaurant", restaurantController.createRestaurant);

  // Endpoint to retrieve all restaurants
  router.get(
    "/restaurant/all",
    restaurantController.findAllRestaurants
  );

  // Endpoint to find restaurant by restaurantId
  router.get(
    "/restaurant/id/:restaurantID",
    restaurantController.findRestaurantByID
  );

  // Endpoint to find restaurant by name
  router.get(
    "/restaurant/name/:name",
    restaurantController.findRestaurantByName
  );

  // Endpoint to update restaurant by restaurantId
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
};
