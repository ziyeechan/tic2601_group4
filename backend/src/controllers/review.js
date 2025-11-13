const {
  findAllReviews,
  findReviewsByPK,
  findReviewsByRestaurantID,
  findReviewsByBookingID,
  createReviews,
  updateReviews,
  deleteReviews,
} = require("../models/review");

module.exports.findAllReviews = async (req, res) => {
  try {
    const reviews = await findAllReviews();
    return res.status(200).json(reviews);
  } catch (err) {
    console.log(err);
  }
};

module.exports.findReviewsByID = async (req, res) => {
  try {
    const reviewsID = parseInt(req.params.reviewsID);
    if (isNaN(reviewsID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const reviews = await findReviewsByPK(reviewsID);

    return res.status(200).json({
      reviews,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.findReviewsByRestaurantID = async (req, res) => {
  try {
    const restaurantID = req.params.restaurantID;

    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const reviewInfo = await findReviewsByRestaurantID(restaurantID);
    return res.status(200).json({
      reviewInfo,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.findReviewsByBookingID = async (req, res) => {
  try {
    const bookingID = req.params.bookingID;

    if (isNaN(bookingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const reviewInfo = await findReviewsByBookingID(bookingID);
    return res.status(200).json({
      reviewInfo,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.createReviews = async (req, res) => {
  try {
    const { rating, comment, createdAt } = req.body;
    const restaurantID = parseInt(req.params.restaurantID);
    const bookingID = parseInt(req.params.bookingID);

    if (isNaN(restaurantID) && isNaN(bookingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });


    if (!rating || !createdAt ) {
      return res.status(400).json({
        message: "Missing Fields",
      });
    }

    const reviewInfo = {
      rating: rating,
      comment: comment,
      createdAt: createdAt,
    };
    await createReviews(reviewInfo, bookingID, restaurantID);

    return res.status(200).json({
      message: "Review has been created",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.updateReviews = async (req, res) => {
  try {
    const { rating, comment, createdAt } = req.body;
    const reviewID = parseInt(req.params.reviewID);

    if (isNaN(reviewID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    if (!rating || !createdAt ) {
      return res.status(400).json({
        message: "Missing Fields",
      });
    }

    const reviewInfo = {
      rating: rating,
      comment: comment,
      createdAt: createdAt,
    };

    await updateReviews(reviewID, reviewInfo);

    return res.status(200).json({
      message: "Review has been updated",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteReviews = async (req, res) => {
  try {
    const reviewID = req.params.reviewID;

    if (isNaN(reviewID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    await deleteReviews(reviewID);

    return res.status(200).json({
      message: "Review has been deleted",
    });
  } catch (err) {
    console.log(err);
  }
};