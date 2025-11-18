const {
  findAllReviews,
  findReviewsByID,
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
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.findReviewsByID = async (req, res) => {
  try {
    const reviewID = parseInt(req.params.reviewID);
    if (isNaN(reviewID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const review = await findReviewsByID(reviewID);

    return res.status(200).json({
      review,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.findReviewsByRestaurantID = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);

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
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.findReviewsByBookingID = async (req, res) => {
  try {
    const bookingID = parseInt(req.params.bookingID);

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
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.createReviews = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const restaurantID = parseInt(req.params.restaurantID);
    const bookingID = parseInt(req.params.bookingID);

    if (isNaN(restaurantID) || isNaN(bookingID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    if (rating == null) {
      return res.status(400).json({
        message: "Missing Fields",
      });
    }

    const reviewInfo = {
      rating: rating,
      comment: comment,
    };
    await createReviews(reviewInfo, bookingID, restaurantID);

    return res.status(200).json({
      message: "Review has been created",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.updateReviews = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewID = parseInt(req.params.reviewID);

    if (isNaN(reviewID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    if (rating == null) {
      return res.status(400).json({
        message: "Missing Fields",
      });
    }

    const reviewInfo = {
      rating: rating,
      comment: comment,
    };

    await updateReviews(reviewID, reviewInfo);

    return res.status(200).json({
      message: "Review has been updated",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.deleteReviews = async (req, res) => {
  try {
    const reviewID = parseInt(req.params.reviewID);

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
    return res.status(500).json({ message: "Server Error" });
  }
};
