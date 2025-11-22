const { createAddress, findAddressByID, updateAddress } = require("../models/address");
const {
  findAllRestaurants,
  findRestaurantByID,
  findRestaurantByName,
  createRestaurant,
  updateRestaurant,
  deleteRestaurantByID,
} = require("../models/restaurant");
const { getReviewStatsForRestaurants } = require("../models/review");
const { Op } = require("sequelize");
const { Restaurants } = require("../schemas/restaurants.js");
const { Addresses } = require("../schemas/addresses");
const { Promotions } = require("../schemas/promotions");
const { Menus } = require("../schemas/menus");

const VALID_DAYS = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

module.exports.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      cuisine,
      phone,
      email,
      imageUrl,
      closed,
      openingTime,
      closingTime,
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      postalCode,
    } = req.body;

    if (
      !name ||
      !cuisine ||
      !addressLine1 ||
      !country ||
      !city ||
      !postalCode ||
      !phone ||
      !email
    ) {
      return res.status(400).json({
        message: "Missing Fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate phone format
    // only allow space, (), -, and +
    const cleaned = phone.replace(/[()\-\s]/g, "");
    const normalized = cleaned.replace(/^\+/, "");
    const phoneRegex = /^[0-9]{8,15}$/;

    if (!phoneRegex.test(normalized)) {
      return res.status(400).json({
        message: "Invalid phone format",
      });
    }

    const addressInfo = {
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      postalCode,
    };

    if (closingTime <= openingTime) {
      return res.status(400).json({
        message: "Opening time must be before closing time",
      });
    }

    if (!new URL(imageUrl)) {
      return res.status(400).json({
        message: "Invalid Url",
      });
    }

    let formattedDays = "";
    if (closed) {
      for (let i = 0; i < closed.length; i++) {
        if (!VALID_DAYS.includes(closed[i])) {
          return res.status(400).json({
            message: "Invalid days",
          });
        }
        if (i == closed.length - 1) {
          formattedDays += closed[i];
        } else {
          formattedDays += closed[i] + ",";
        }
      }
    }

    const addressId = await createAddress(addressInfo);
    const restaurantInfo = {
      name,
      description,
      cuisine,
      phone,
      email,
      imageUrl,
      formattedDays,
      openingTime,
      closingTime,
    };
    await createRestaurant(restaurantInfo, addressId.dataValues.addressId);

    return res.status(200).send("Restaurant has been successfully created");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong! Contact your local administrator");
  }
};

module.exports.findAllRestaurants = async (req, res) => {
  try {
    const restaurants = await findAllRestaurants();
    return res.status(200).json(restaurants);
  } catch (err) {
    console.log(err);
  }
};

module.exports.findRestaurantByID = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const restaurant = await findRestaurantByID(restaurantID);
    const address = await findAddressByID(restaurant.fkAddressId);

    return res.status(200).json({
      restaurant,
      address,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.findRestaurantByName = async (req, res) => {
  try {
    const name = req.params.name;
    if (!name)
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const restaurant = await findRestaurantByName(name);
    const address = await findAddressByID(restaurant.fkAddressId);

    return res.status(200).json({
      restaurant,
      address,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.updateRestaurant = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    const {
      name,
      description,
      cuisine,
      phone,
      email,
      imageUrl,
      closed,
      openingTime,
      closingTime,
      addressLine1,
      addressLine2,
      country,
      state,
      city,
      postalCode,
    } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate phone format
    // only allow space, (), -, and +
    const cleaned = phone.replace(/[()\-\s]/g, "");
    const normalized = cleaned.replace(/^\+/, "");
    const phoneRegex = /^[0-9]{8,15}$/;

    if (!phoneRegex.test(normalized)) {
      return res.status(400).json({
        message: "Invalid phone format",
      });
    }

    if (closingTime <= openingTime) {
      return res.status(400).json({
        message: "Opening time must be before closing time",
      });
    }

    if (!new URL(imageUrl)) {
      return res.status(400).json({
        message: "Invalid Url",
      });
    }

    let formattedDays = "";
    if (closed) {
      for (let i = 0; i < closed.length; i++) {
        if (!VALID_DAYS.includes(closed[i])) {
          return res.status(400).json({
            message: "Invalid days",
          });
        }
        if (i == closed.length - 1) {
          formattedDays += closed[i];
        } else {
          formattedDays += closed[i] + ",";
        }
      }
    }

    if (
      name ||
      description ||
      cuisine ||
      phone ||
      email ||
      imageUrl ||
      closed ||
      openingTime ||
      closingTime
    ) {
      const formattedData = {
        restaurantName: name,
        description: description,
        cuisine: cuisine,
        phone: phone,
        email: email,
        imageUrl: imageUrl,
        closedDays: formattedDays,
        openingTime: openingTime,
        closingTime: closingTime,
      };

      await updateRestaurant(restaurantID, formattedData);
    } else if (addressLine1 || addressLine2 || country || state || city || postalCode) {
      const restaurant = await findRestaurantByID(restaurantID);

      const formattedData = {
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        country: country,
        state: state,
        city: city,
        postalCode: postalCode,
      };

      await updateAddress(restaurant.fkAddressId, formattedData);
    }
    return res.status(200).send("Restaurant has been successfully updated");
  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteRestaurantByID = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    await deleteRestaurantByID(restaurantID);
    return res.status(200).send("Restaurant has been successfully deleted!");
  } catch (err) {
    console.log(err);
  }
};

/**
 * Advanced restaurant search with filtering and aggregation
 * GET /restaurant/search
 * Query params: q, cuisine, minRating, maxRating, hasPromotion, dietaryType, limit, offset
 * Optimized to use database queries instead of in-memory filtering
 */
module.exports.searchRestaurants = async (req, res) => {
  try {
    const {
      q,
      cuisine,
      minRating,
      maxRating,
      hasPromotion,
      dietaryType,
      limit = 20,
      offset = 0,
    } = req.query;

    // Build WHERE clause for restaurants
    const where = {};
    if (cuisine) {
      const cuisines = cuisine.split(",").map((c) => c.trim());
      where.cuisine = { [Op.in]: cuisines };
    }

    // Fetch restaurants with eager loading (JOINs)
    let restaurants = await Restaurants.findAll({
      where,
      include: [
        { model: Addresses, required: false },
        { model: Promotions, required: false },
        { model: Menus, required: false },
      ],
      subQuery: false,
      raw: false,
      nest: true,
    });

    // Filter by search query in JavaScript (after eager loading) to avoid ambiguity with joined tables
    if (q) {
      const searchLower = q.toLowerCase();
      restaurants = restaurants.filter(
        (r) =>
          r.restaurantName.toLowerCase().includes(searchLower) ||
          (r.description && r.description.toLowerCase().includes(searchLower))
      );
    }

    // Fetch review stats for ALL restaurants in a single database query
    const restaurantIds = restaurants.map((r) => r.restaurantId);
    const reviewStats = await getReviewStatsForRestaurants(restaurantIds);

    // Create a map for quick lookup: restaurantId -> stats
    const statsMap = new Map(reviewStats.map((stat) => [stat.restaurantId, stat.stats]));

    // Enrich restaurants with calculated data
    const now = new Date();
    const enrichedRestaurants = restaurants.map((restaurant) => {
      const restaurantJSON = restaurant.toJSON ? restaurant.toJSON() : restaurant;

      // Get stats from database map (already calculated in SQL)
      const reviewSummary = statsMap.get(restaurantJSON.restaurantId) || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          5: { count: 0, percentage: 0 },
          4: { count: 0, percentage: 0 },
          3: { count: 0, percentage: 0 },
          2: { count: 0, percentage: 0 },
          1: { count: 0, percentage: 0 },
        },
      };

      // Promotions are already loaded via eager loading, just filter by date
      const allRestaurantPromotions = Array.isArray(restaurantJSON.promotions)
        ? restaurantJSON.promotions
        : [];
      const restaurantPromotions = allRestaurantPromotions.filter(
        (p) => new Date(p.startAt) <= now && new Date(p.endAt) >= now
      );

      // Menus are already loaded via eager loading
      const restaurantMenus = Array.isArray(restaurantJSON.menus) ? restaurantJSON.menus : [];
      const dietaryTypes = restaurantMenus.map((m) => m.menuTypes).filter(Boolean);

      // Address is already loaded via eager loading
      const restaurantAddress = restaurantJSON.address || restaurantJSON.Address || null;

      return {
        // Core restaurant data
        restaurantId: restaurantJSON.restaurantId,
        restaurantName: restaurantJSON.restaurantName,
        description: restaurantJSON.description,
        cuisine: restaurantJSON.cuisine,
        phone: restaurantJSON.phone,
        email: restaurantJSON.email,
        imageUrl: restaurantJSON.imageUrl,
        openingTime: restaurantJSON.openingTime,
        closingTime: restaurantJSON.closingTime,
        fkAddressId: restaurantJSON.fkAddressId,

        // Related data (explicitly returned)
        address: restaurantAddress || null,
        reviews: [], // ← Empty array (no review details needed, just stats in reviewSummary)
        promotions: restaurantPromotions, // ← Filtered active promotions for this restaurant
        menus: restaurantMenus, // ← Menus for this restaurant

        // Calculated/enriched data (now from database, not JavaScript)
        reviewSummary, //  Aggregate review stats
        dietaryTypes,
        hasActivePromotion: restaurantPromotions.length > 0,
      };
    });

    // Apply filters that require calculated data
    let filtered = enrichedRestaurants;

    // Filter by rating
    if (minRating) {
      filtered = filtered.filter((r) => r.reviewSummary.averageRating >= parseFloat(minRating));
    }
    if (maxRating) {
      filtered = filtered.filter((r) => r.reviewSummary.averageRating <= parseFloat(maxRating));
    }

    // Filter by promotion
    if (hasPromotion === "true") {
      filtered = filtered.filter((r) => r.hasActivePromotion);
    }

    // Filter by dietary type
    if (dietaryType && dietaryType !== "All") {
      filtered = filtered.filter((r) =>
        r.dietaryTypes.some((type) =>
          (type || "").toLowerCase().includes(dietaryType.toLowerCase())
        )
      );
    }

    // Apply pagination
    const total = filtered.length;
    const paginatedRestaurants = filtered.slice(
      parseInt(offset) || 0,
      (parseInt(offset) || 0) + (parseInt(limit) || 20)
    );

    res.json({
      restaurants: paginatedRestaurants,
      pagination: {
        total,
        limit: Math.min(parseInt(limit) || 20, 100),
        offset: parseInt(offset) || 0,
        hasMore: (parseInt(offset) || 0) + (parseInt(limit) || 20) < total,
      },
    });
  } catch (error) {
    console.error("Error searching restaurants:", error);
    res.status(500).json({
      message: "Failed to search restaurants",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
