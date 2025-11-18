const addressController = require("../controllers/address");

module.exports = (router) => {
  // =================================== Address Endpoints =================================================================

  // Endpoint to create new address
  router.post("/address", addressController.createAddress);

  // Endpoint to retrieve all addresses
  router.get("/address/", addressController.findAllAddresses);

  // Endpoint to find address by addressId
  router.get("/address/:addressID", addressController.findAddressByID);

  // Endpoint to update restaurant by restaurantId
  router.put("/address/:addressID", addressController.updateAddress);

  // Endpoint to delete existing restaurant
  router.delete("/address/:addressID", addressController.deleteAddress);

  // =================================== End of Restaurant Endpoints =================================================================
};
