const promotionController = require("../controllers/promotion");
module.exports = (router) => {
  // =================================== Promotions Endpoints =====================================================================

  // Endpoint to create promotion for restaurant
  router.post("/promotion/:restaurantID", promotionController.createPromotions);

    // Endpoint to get all promotions for restaurantID
  router.get(
    "/promotion/restaurant/:restaurantID",
    promotionController.findPromotionsByRestaurantID
  );

  // Endpoint to get promotion by promotionID
  router.get("/promotion/:promotionID", promotionController.findPromotionByID);

    // Endpoint to retrieve all promotions
  router.get("/promotion/", promotionController.findAllPromotions);

  // Endpoint to update promotion by promotionID
  router.put("/promotion/:promotionID", promotionController.updatePromotions);

  // Endpoint to delete exisiting promotion
  router.delete("/promotion/:promotionID", promotionController.deletePromotion);

  // =================================== End of Promotions Endpoints =================================================================
};
