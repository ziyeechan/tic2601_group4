const {
  findAllPromotions,
  findPromotionsByPK,
  findPromotionsByRestaurantID,
  createPromotions,
  updatePromotions,
  expiredPromotions,
  deletePromotions,
} = require("../models/promotion");

module.exports.findAllPromotions = async (req, res) => {
  try {
    const results = await findAllPromotions();

    return res.status(200).json({
      promotion: results,
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports.createPromotions = async (req, res) => {
  try {
    const { termsNCond, description, startAt, endAt, discount } = req.body;
    const restaurantID = parseInt(req.params.restaurantID);

    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    if (!termsNCond || !description || !startAt || !endAt || !discount) {
      return res.status(400).json({
        message: "Missing Fields",
      });
    }

    const promotionInfo = {
      termsNCond: termsNCond,
      description: description,
      startAt: startAt,
      endAt: endAt,
      discount: discount,
    };
    await createPromotions(promotionInfo, restaurantID);

    return res.status(200).json({
      message: "Promotions has been created",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.findPromotionsByRestaurantID = async (req, res) => {
  try {
    const restaurantID = req.params.restaurantID;

    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const promotionInfo = await findPromotionsByRestaurantID(restaurantID);
    return res.status(200).json({
      promotionInfo,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.findPromotionByID = async (req, res) => {
  try {
    const promotionID = parseInt(req.params.promotionID);
    if (isNaN(promotionID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const promotion = await findPromotionsByPK(promotionID);

    return res.status(200).json({
      promotion,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.deletePromotion = async (req, res) => {
  try {
    const promotionID = req.params.promotionID;

    if (isNaN(promotionID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    await deletePromotions(promotionID);

    return res.status(200).json({
      message: "Promotions has been deleted",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.updatePromotions = async (req, res) => {
  try {
    const { termsNCond, description, startAt, endAt, discount } = req.body;
    const promotionID = parseInt(req.params.promotionID);

    if (isNaN(promotionID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    if (!termsNCond || !description || !startAt || !endAt || !discount) {
      return res.status(400).json({
        message: "Missing Fields",
      });
    }

    const promotionInfo = {
      termsNCond: termsNCond,
      description: description,
      startAt: startAt,
      endAt: endAt,
      discount: discount,
    };

    await updatePromotions(promotionID, promotionInfo);

    return res.status(200).json({
      message: "Promotion has been updated",
    });
  } catch (err) {
    console.log(err);
  }
};