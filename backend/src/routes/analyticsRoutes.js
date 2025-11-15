const {getBookingsByRestaurant, getBookingMetrics, getBookingRates, getDailyBookingCount, getDailyAverageRating, getHourlyHeatmapWeekday} = require('../controllers/analytics');

module.exports = (router) => {
  // =================================== Analytics Endpoints =====================================================================

  router.get("/analytics", async (req, res) => {
      return res.status(200).json({ message: "Analytics Endpoint is working" });
  });

  // Endpoint to get bookings for a specific restaurant (restaurant, year and month are REQUIRED)
  router.get("/analytics/bookings", async (req, res) => {
    const restaurantId = req.body.restaurantId;
    const year = req.body.year;
    const month = req.body.month;

    // ensure single values (not repeated query params)
    if (Array.isArray(restaurantId) || Array.isArray(year) || Array.isArray(month)) {
      return res.status(400).json({ error: "Provide a single restaurantId, year and month/date" });
    }

    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId query parameter is required" });
    }
    if (!year) {
      return res.status(400).json({ error: "year query parameter is required" });
    }
    if (!month) {
      return res.status(400).json({ error: "month query parameter is required" });
    }

    try {
      const bookings = await getBookingsByRestaurant(restaurantId, month, year);
      return res.status(200).json({ bookings });
    } catch (err) {
      // controller errors are treated as server errors here
      return res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to get booking metrics for a specific restaurant (restaurant, year and month are REQUIRED)
  router.get("/analytics/bookings/metrics", async (req, res) => {
    const restaurantId = req.body.restaurantId;
    const year = req.body.year;
    const month = req.body.month;

    // ensure single values (not repeated query params)
    if (Array.isArray(restaurantId) || Array.isArray(year) || Array.isArray(month)) {
      return res.status(400).json({ error: "Provide a single restaurantId, year and month/date" });
    }

    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId query parameter is required" });
    }
    if (!year) {
      return res.status(400).json({ error: "year query parameter is required" });
    }
    if (!month) {
      return res.status(400).json({ error: "month query parameter is required" });
    }

    try {
      const metrics = await getBookingMetrics(restaurantId, month, year);
      return res.status(200).json({ metrics });
    } catch (err) {
      // controller errors are treated as server errors here
      return res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to get booking rates for a specific restaurant (restaurant, year and month are REQUIRED)
  router.get("/analytics/bookings/rates", async (req, res) => {
    const restaurantId = req.body.restaurantId;
    const year = req.body.year;
    const month = req.body.month;

    // ensure single values (not repeated query params)
    if (Array.isArray(restaurantId) || Array.isArray(year) || Array.isArray(month)) {
      return res.status(400).json({ error: "Provide a single restaurantId, year and month/date" });
    }

    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId query parameter is required" });
    }
    if (!year) {
      return res.status(400).json({ error: "year query parameter is required" });
    }
    if (!month) {
      return res.status(400).json({ error: "month query parameter is required" });
    }

    try {
      const rates = await getBookingRates(restaurantId, month, year);
      return res.status(200).json({ rates });
    } catch (err) {
      // controller errors are treated as server errors here
      return res.status(500).json({ error: err.message });
    }
  });

  // Daily booking count for a month
  router.get("/analytics/bookings/daily-count", async (req, res) => {
    const restaurantId = req.body.restaurantId;
    const year = req.body.year;
    const month = req.body.month;

    if (Array.isArray(restaurantId) || Array.isArray(year) || Array.isArray(month)) {
      return res.status(400).json({ error: "Provide a single restaurantId, year and month/date" });
    }
    if (!restaurantId) return res.status(400).json({ error: "restaurantId query parameter is required" });
    if (!year) return res.status(400).json({ error: "year query parameter is required" });
    if (!month) return res.status(400).json({ error: "month query parameter is required" });

    try {
      const daily = await getDailyBookingCount(restaurantId, month, year);
      return res.status(200).json({ dailyBookingCount: daily });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Daily average rating for a month
  router.get("/analytics/reviews/daily-avg", async (req, res) => {
    const restaurantId = req.body.restaurantId;
    const year = req.body.year;
    const month = req.body.month;

    if (Array.isArray(restaurantId) || Array.isArray(year) || Array.isArray(month)) {
      return res.status(400).json({ error: "Provide a single restaurantId, year and month/date" });
    }
    if (!restaurantId) return res.status(400).json({ error: "restaurantId query parameter is required" });
    if (!year) return res.status(400).json({ error: "year query parameter is required" });
    if (!month) return res.status(400).json({ error: "month query parameter is required" });

    try {
      const daily = await getDailyAverageRating(restaurantId, month, year);
      return res.status(200).json({ dailyAverageRating: daily });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Hourly heatmap (weekday x hour) for a month
  router.get("/analytics/bookings/heatmap", async (req, res) => {
    const restaurantId = req.body.restaurantId;
    const year = req.body.year;
    const month = req.body.month;
    const statusesParam = req.body.statuses; // e.g. "confirmed,completed"

    if (Array.isArray(restaurantId) || Array.isArray(year) || Array.isArray(month)) {
      return res.status(400).json({ error: "Provide a single restaurantId, year and month/date" });
    }
    if (!restaurantId) return res.status(400).json({ error: "restaurantId query parameter is required" });
    if (!year) return res.status(400).json({ error: "year query parameter is required" });
    if (!month) return res.status(400).json({ error: "month query parameter is required" });

    const statuses = Array.isArray(statusesParam)
      ? statusesParam
      : (typeof statusesParam === 'string' ? statusesParam.split(',').map(s => s.trim()).filter(Boolean) : undefined);

    try {
      const heatmap = await getHourlyHeatmapWeekday(restaurantId, month, year, statuses);
      return res.status(200).json({ heatmap });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });


  // =================================== End of Analytics Endpoints =================================================================
};
