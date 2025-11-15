const {getBookingsByRestaurant, getBookingMetrics} = require('../controllers/analytics');

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

  // =================================== End of Analytics Endpoints =================================================================
};
