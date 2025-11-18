const { Reviews } = require("../schemas/reviews");

module.exports.findAllReviews = async () => {
  return await Reviews.findAll();
};

module.exports.findReviewsByID = async (reviewID) => {
  return await Reviews.findByPk(reviewID);
};

module.exports.findReviewsByRestaurantID = async (restaurantID) => {
  return await Reviews.findAll({
    where: { fkRestaurantId: restaurantID },
  });
};

module.exports.findReviewsByBookingID = async (bookingID) => {
  return await Reviews.findAll({
    where: { fkBookingId: bookingID },
  });
};

module.exports.createReviews = async (reviewInfo, bookingID, restaurantID) => {
  return await Reviews.create({
    rating: reviewInfo.rating,
    comment: reviewInfo.comment,
    fkBookingId: bookingID,
    fkRestaurantId: restaurantID,
  });
};

module.exports.updateReviews = async (reviewID, meta) => {
  return await Reviews.update(
    {
      rating: meta.rating,
      comment: meta.comment,
    },
    { where: { reviewId: reviewID } }
  );
};

module.exports.deleteReviews = async (reviewID) => {
  return await Reviews.destroy({
    where: { reviewId: reviewID },
  });
};
