const { Reviews } = require("../schemas/reviews");

module.exports.findAllReviews = async (name) => {
  const results = await Reviews.findAll();

  return results;
};

module.exports.findReviewsByPK = async (reviewID) => {
  const results = await Reviews.findByPk(reviewID);

  return results;
};

module.exports.findReviewsByRestaurantID = async (restaurantID) => {
  const results = await Reviews.findAll({
    where: { fkRestaurantId: restaurantID },
  });

  return results;
};

module.exports.findReviewsByBookingID = async (bookingID) => {
  const results = await Reviews.findAll({
    where: { fkBookingId: bookingID },
  });

  return results;
};

module.exports.createReviews = async (reviewInfo, bookingID, restaurantID) => {
  await Reviews.create({
    rating: reviewInfo.rating,
    comment: reviewInfo.comment,
    createdAt: reviewInfo.createdAt,
    fkBookingId: bookingID,
    fkRestaurantId: restaurantID,
  });
};

module.exports.updateReviews = async (reviewID, meta) => {
  await Reviews.update(
    {
      ...meta,
    },
    { where: { reviewId: reviewID } }
  );
};

module.exports.deleteReviews = async (reviewID) => {
  await Reviews.destroy({
    where: { reviewId: reviewID },
  });
};
