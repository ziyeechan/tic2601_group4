const { Reviews, sequelize } = require("../schemas/reviews");

module.exports.findAllReviews = async () => {
  return await Reviews.findAll();
};

module.exports.findReviewsByID = async (reviewID) => {
  return await Reviews.findByPk(reviewID);
};

module.exports.findReviewsByRestaurantID = async (restaurantID, options = {}) => {
  const { limit = 20, offset = 0, sort = "newest" } = options;

  const order = sort === "newest" ? [["createdAt", "DESC"]] : [["rating", "DESC"]];

  const { count, rows } = await Reviews.findAndCountAll({
    where: { fkRestaurantId: restaurantID },
    include: [
      {
        association: "booking",
        attributes: ["customerName"],
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order,
  });

  // Calculate aggregated statistics
  const stats = await Reviews.findOne({
    where: { fkRestaurantId: restaurantID },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("reviewId")), "totalReviews"],
      [
        sequelize.fn("SUM", sequelize.literal("CASE WHEN rating = 5 THEN 1 ELSE 0 END")),
        "count5Star",
      ],
      [
        sequelize.fn("SUM", sequelize.literal("CASE WHEN rating = 4 THEN 1 ELSE 0 END")),
        "count4Star",
      ],
      [
        sequelize.fn("SUM", sequelize.literal("CASE WHEN rating = 3 THEN 1 ELSE 0 END")),
        "count3Star",
      ],
      [
        sequelize.fn("SUM", sequelize.literal("CASE WHEN rating = 2 THEN 1 ELSE 0 END")),
        "count2Star",
      ],
      [
        sequelize.fn("SUM", sequelize.literal("CASE WHEN rating = 1 THEN 1 ELSE 0 END")),
        "count1Star",
      ],
    ],
    raw: true,
  });

  return {
    count,
    rows,
    stats: {
      averageRating: stats?.averageRating ? parseFloat(stats.averageRating).toFixed(1) : 0,
      totalReviews: parseInt(stats?.totalReviews || 0),
      distribution: {
        5: parseInt(stats?.count5Star || 0),
        4: parseInt(stats?.count4Star || 0),
        3: parseInt(stats?.count3Star || 0),
        2: parseInt(stats?.count2Star || 0),
        1: parseInt(stats?.count1Star || 0),
      },
    },
  };
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

// Fetch reviews for multiple booking IDs
module.exports.findReviewsByMultipleBookingIDs = async (bookingIDs) => {
  if (!bookingIDs || bookingIDs.length === 0) {
    return [];
  }

  return await Reviews.findAll({
    where: { fkBookingId: bookingIDs },
  });
};

// Calculate review stats for multiple restaurants in a single query
// Returns { restaurantId, stats: { averageRating, totalReviews, ratingDistribution } }
module.exports.getReviewStatsForRestaurants = async (restaurantIDs) => {
  if (!restaurantIDs || restaurantIDs.length === 0) {
    return [];
  }

  try {
    // Create safe SQL with placeholders to prevent SQL injection
    const placeholders = restaurantIDs.map(() => "?").join(",");

    const result = await sequelize.query(
      `
      SELECT
        fkRestaurantId as restaurantId,
        COALESCE(AVG(CAST(rating AS FLOAT)), 0) as averageRating,
        COALESCE(COUNT(*), 0) as totalReviews,
        COALESCE(SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END), 0) as count5Star,
        COALESCE(SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END), 0) as count4Star,
        COALESCE(SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END), 0) as count3Star,
        COALESCE(SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END), 0) as count2Star,
        COALESCE(SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END), 0) as count1Star
      FROM reviews
      WHERE fkRestaurantId IN (${placeholders})
      GROUP BY fkRestaurantId
    `,
      {
        replacements: restaurantIDs,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Transform to match expected format
    return result.map((row) => {
      const totalReviews = parseInt(row.totalReviews) || 0;
      // ✅ Convert to number, not string!
      const avgRating = parseFloat(row.averageRating) || 0;

      return {
        restaurantId: row.restaurantId,
        stats: {
          averageRating: parseFloat(avgRating.toFixed(1)), //  Returns number, not string
          totalReviews: totalReviews,
          ratingDistribution: {
            5: {
              count: parseInt(row.count5Star) || 0,
              percentage:
                totalReviews > 0
                  ? parseFloat(((parseInt(row.count5Star) / totalReviews) * 100).toFixed(1))
                  : 0,
            },
            4: {
              count: parseInt(row.count4Star) || 0,
              percentage:
                totalReviews > 0
                  ? parseFloat(((parseInt(row.count4Star) / totalReviews) * 100).toFixed(1))
                  : 0,
            },
            3: {
              count: parseInt(row.count3Star) || 0,
              percentage:
                totalReviews > 0
                  ? parseFloat(((parseInt(row.count3Star) / totalReviews) * 100).toFixed(1))
                  : 0,
            },
            2: {
              count: parseInt(row.count2Star) || 0,
              percentage:
                totalReviews > 0
                  ? parseFloat(((parseInt(row.count2Star) / totalReviews) * 100).toFixed(1))
                  : 0,
            },
            1: {
              count: parseInt(row.count1Star) || 0,
              percentage:
                totalReviews > 0
                  ? parseFloat(((parseInt(row.count1Star) / totalReviews) * 100).toFixed(1))
                  : 0,
            },
          },
        },
      };
    });
  } catch (error) {
    console.error("Error calculating review stats:", error);
    // Return empty stats for each restaurant as fallback
    return restaurantIDs.map((id) => ({
      restaurantId: id,
      stats: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          5: { count: 0, percentage: 0 },
          4: { count: 0, percentage: 0 },
          3: { count: 0, percentage: 0 },
          2: { count: 0, percentage: 0 },
          1: { count: 0, percentage: 0 },
        },
      },
    }));
  }
};
