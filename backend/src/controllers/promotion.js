const {
  findAllPromotions,
  findPromotionByID,
  findPromotionsByRestaurantID,
  createPromotions,
  updatePromotions,
  deletePromotions,
} = require("../models/promotion");

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

    if(endAt <= startAt) {
      return res.status(400).json({
        message: "Start date must be before end date"
      })
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
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.findAllPromotions = async (req, res) => {
  try {
    const promotions = await findAllPromotions();
    return res.status(200).json(promotions);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.findPromotionsByRestaurantID = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);

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
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.findPromotionByID = async (req, res) => {
  try {
    const promotionID = parseInt(req.params.promotionID);
    if (isNaN(promotionID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const promotion = await findPromotionByID(promotionID);

    return res.status(200).json({
      promotion,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.deletePromotion = async (req, res) => {
  try {
    const promotionID = parseInt(req.params.promotionID);

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
    return res.status(500).json({ message: "Server Error" });
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

    if(endAt <= startAt) {
      return res.status(400).json({
        message: "Start date must be before end date"
      })
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
    return res.status(500).json({ message: "Server Error" });
  }
};
