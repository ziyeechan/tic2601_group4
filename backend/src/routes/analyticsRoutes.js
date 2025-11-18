// ----- IMPORTS -----

const {
  getRestaurants,
  getBookingsByRestaurant,
  getDailyBookingCount,
  getHourlyHeatmapWeekday,
  getBookingMetrics,
  getBookingRates,
  getDailyAverageRating,
} = require('../controllers/analytics');

// Validate analytics query parameters (restaurantId, year, month)
function validateAnalyticsQuery(req, res, next) {
  const { restaurantId, year, month } = req.query;

  // Check for array params (repeated query params)
  if (Array.isArray(restaurantId) || Array.isArray(year) || Array.isArray(month)) {
    return res.status(400).json({ error: "Provide a single restaurantId, year and month" });
  }

  // Check required fields
  if (!restaurantId) {
    return res.status(400).json({ error: "restaurantId query parameter is required" });
  }
  if (!year) {
    return res.status(400).json({ error: "year query parameter is required" });
  }
  if (!month) {
    return res.status(400).json({ error: "month query parameter is required" });
  }

  // All good, proceed
  next();
}

// ----- ERROR HANDLER -----

// Centralized error handler for controller errors
function handleControllerError(res, err) {
  return res.status(500).json({ error: err.message });
}

// ----- ROUTES -----

module.exports = (router) => {

  // Health Check
  router.get("/analytics", async (req, res) => {
    return res.status(200).json({ message: "Analytics Endpoint is working" });
  });

  // --- Restaurant Endpoints ---
  router.get("/analytics/restaurants", async (req, res) => {
    try {
      const restaurants = await getRestaurants();
      return res.status(200).json({ restaurants });
    } catch (err) {
      return handleControllerError(res, err);
    }
  });

  // --- Booking Endpoints ---
  
  // Get all bookings for a restaurant in a specific month
  router.get("/analytics/bookings", validateAnalyticsQuery, async (req, res) => {
    const { restaurantId, year, month } = req.query;
    try {
      const bookings = await getBookingsByRestaurant(restaurantId, month, year);
      return res.status(200).json({ bookings });
    } catch (err) {
      return handleControllerError(res, err);
    }
  });

  // Get booking metrics (counts by status)
  router.get("/analytics/bookings/metrics", validateAnalyticsQuery, async (req, res) => {
    const { restaurantId, year, month } = req.query;
    try {
      const metrics = await getBookingMetrics(restaurantId, month, year);
      return res.status(200).json({ metrics });
    } catch (err) {
      return handleControllerError(res, err);
    }
  });

  // Get booking rates (percentages by status)
  router.get("/analytics/bookings/rates", validateAnalyticsQuery, async (req, res) => {
    const { restaurantId, year, month } = req.query;
    try {
      const rates = await getBookingRates(restaurantId, month, year);
      return res.status(200).json({ rates });
    } catch (err) {
      return handleControllerError(res, err);
    }
  });

  // Get daily booking count for a month
  router.get("/analytics/bookings/daily-count", validateAnalyticsQuery, async (req, res) => {
    const { restaurantId, year, month } = req.query;
    try {
      const daily = await getDailyBookingCount(restaurantId, month, year);
      return res.status(200).json({ dailyBookingCount: daily });
    } catch (err) {
      return handleControllerError(res, err);
    }
  });

  // Get hourly heatmap (weekday x hour) for a month
  router.get("/analytics/bookings/heatmap", validateAnalyticsQuery, async (req, res) => {
    const { restaurantId, year, month, statuses: statusesParam } = req.query;

    // Parse statuses parameter (optional)
    const statuses = Array.isArray(statusesParam)
      ? statusesParam
      : (typeof statusesParam === 'string' 
          ? statusesParam.split(',').map(s => s.trim()).filter(Boolean) 
          : undefined);

    try {
      const heatmap = await getHourlyHeatmapWeekday(restaurantId, month, year, statuses);
      return res.status(200).json({ heatmap });
    } catch (err) {
      return handleControllerError(res, err);
    }
  });

  // --- Review Endpoints ---

  // Get daily average rating for a month
  router.get("/analytics/reviews/daily-avg", validateAnalyticsQuery, async (req, res) => {
    const { restaurantId, year, month } = req.query;
    try {
      const daily = await getDailyAverageRating(restaurantId, month, year);
      return res.status(200).json({ dailyAverageRating: daily });
    } catch (err) {
      return handleControllerError(res, err);
    }
  });

};
