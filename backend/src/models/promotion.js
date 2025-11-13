const { Promotions } = require("../schemas/promotions");

module.exports.findAllPromotions = async () => {
  const results = await Promotions.findAll({ where: { isActive: true } });

  return results;
};

module.exports.findPromotionsByRestaurantID = async (restaurantID) => {
  const results = await Promotions.findAll({
    where: { fkRestaurantId: restaurantID },
  });

  return results;
};

module.exports.findPromotionsByPK = async (promotionID) => {
  const results = await Promotions.findByPk(promotionID);

  return results;
};

module.exports.createPromotions = async (promotionInfo, restaurantID) => {
  await Promotions.create({
    termsNCond: promotionInfo.termsNCond,
    description: promotionInfo.description,
    startAt: promotionInfo.startAt,
    endAt: promotionInfo.endAt,
    discount: promotionInfo.discount,
    isActive: true,
    fkRestaurantId: restaurantID,
  });
};

module.exports.updatePromotions = async (promotionID, meta) => {
  await Promotions.update(
    {
      ...meta,
    },
    { where: { promotionId: promotionID } }
  );
};

module.exports.expiredPromotions = async (promotionID) => {
  await Promotions.update(
    { isActive: false },
    { where: { promotionId: promotionID } }
  );
};

module.exports.deletePromotions = async (promotionID) => {
  await Promotions.destroy({
    where: { promotionId: promotionID },
  });
};
