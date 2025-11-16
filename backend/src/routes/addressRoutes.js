const addressController = require("../controllers/address");

module.exports = (router) => {
  // =================================== Address Endpoints =================================================================

  // Endpoint to create new address
  router.post("/address", addressController.createAddress);

  // Endpoint to retrieve all addresses
  router.get(
    "/address/all",
    addressController.findAllAddresses
  );

  // Endpoint to find address by addressId
  router.get(
    "/address/:addressID",
    addressController.findAddressByID
  );

  // Endpoint to find address by restaurantId
  router.get(
    "/address/restaurant/:restaurantID",
    addressController.findAddressByRestaurantID
  );

  // Endpoint to find restaurant by country
  router.get(
    "/address/country/:addressCountry",
    addressController.findAddressByCountry
  );

  // Endpoint to find restaurant by city
  router.get(
    "/address/city/:addressCity",
    addressController.findAddressByCity
  );

  // Endpoint to find restaurant by state
  router.get(
    "/address/state/:addressState",
    addressController.findAddressByState
  );

  // Endpoint to update restaurant by restaurantId
  router.put(
    "/address/:addressID",
    addressController.updateAddressID
  );

  // Endpoint to delete existing restaurant
  router.delete(
    "/address/:addressID",
    addressController.deleteAddressByID
  );

  // =================================== End of Restaurant Endpoints =================================================================
};
