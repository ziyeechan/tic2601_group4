const { createAddress, findAddressByID, updateAddress } = require("../models/address");
const {
  findAllRestaurants,
  findRestaurantByID,
  findRestaurantByName,
  createRestaurant,
  updateRestaurant,
  deleteRestaurantByID,
} = require("../models/restaurant");
const { Op, sequelize } = require("sequelize");
const { Restaurants } = require("../schemas/restaurants.js");
const { Addresses } = require("../schemas/addresses");
const { Reviews } = require("../schemas/reviews");
const { Promotions } = require("../schemas/promotions");
const { Menus } = require("../schemas/menus");

module.exports.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      cuisine,
      phone,
      email,
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

    const addressId = await createAddress(addressInfo);
    const restaurantInfo = { name, description, cuisine, phone, email };
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

    if (name || description || cuisine || phone || email) {
      const formattedData = {
        restaurantName: name,
        description: description,
        cuisine: cuisine,
        phone: phone,
        email: email,
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
    if (q) {
      where[Op.or] = [
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("restaurantName")),
          Op.like,
          `%${q.toLowerCase()}%`
        ),
        sequelize.where(
          sequelize.fn("LOWER", sequelize.col("description")),
          Op.like,
          `%${q.toLowerCase()}%`
        ),
      ];
    }
    if (cuisine) {
      const cuisines = cuisine.split(",").map((c) => c.trim());
      where.cuisine = { [Op.in]: cuisines };
    }

    // Fetch restaurants with eager loading (JOINs) - only loads data for filtered restaurants
    const restaurants = await Restaurants.findAll({
      where,
      include: [
        { model: Addresses, required: false },
        { model: Reviews, required: false },
        { model: Promotions, required: false },
        { model: Menus, required: false },
      ],
      subQuery: false,
      raw: false,
      nest: true,
    });

    // Enrich restaurants with calculated data
    const now = new Date();
    const enrichedRestaurants = restaurants.map((restaurant) => {
      const restaurantJSON = restaurant.toJSON ? restaurant.toJSON() : restaurant;

      // Get reviews for this restaurant and calculate average rating
      // Reviews are already loaded via eager loading (as lowercase key from toJSON)
      const restaurantReviews = Array.isArray(restaurantJSON.reviews) ? restaurantJSON.reviews : [];
      const ratings = restaurantReviews.map((r) => parseInt(r.rating)).filter((r) => !isNaN(r));

      // Calculate rating distribution
      const ratingDistribution = {
        5: {
          count: ratings.filter((r) => r === 5).length,
          percentage:
            ratings.length > 0
              ? parseFloat(
                  ((ratings.filter((r) => r === 5).length / ratings.length) * 100).toFixed(1)
                )
              : 0,
        },
        4: {
          count: ratings.filter((r) => r === 4).length,
          percentage:
            ratings.length > 0
              ? parseFloat(
                  ((ratings.filter((r) => r === 4).length / ratings.length) * 100).toFixed(1)
                )
              : 0,
        },
        3: {
          count: ratings.filter((r) => r === 3).length,
          percentage:
            ratings.length > 0
              ? parseFloat(
                  ((ratings.filter((r) => r === 3).length / ratings.length) * 100).toFixed(1)
                )
              : 0,
        },
        2: {
          count: ratings.filter((r) => r === 2).length,
          percentage:
            ratings.length > 0
              ? parseFloat(
                  ((ratings.filter((r) => r === 2).length / ratings.length) * 100).toFixed(1)
                )
              : 0,
        },
        1: {
          count: ratings.filter((r) => r === 1).length,
          percentage:
            ratings.length > 0
              ? parseFloat(
                  ((ratings.filter((r) => r === 1).length / ratings.length) * 100).toFixed(1)
                )
              : 0,
        },
      };

      const averageRating =
        ratings.length > 0
          ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
          : 0;

      const reviewSummary = {
        averageRating,
        totalReviews: ratings.length,
        ratingDistribution,
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
        reviews: restaurantReviews, // ← Actual review objects for this restaurant
        promotions: restaurantPromotions, // ← Filtered active promotions for this restaurant
        menus: restaurantMenus, // ← Menus for this restaurant

        // Calculated/enriched data
        reviewSummary, // ← Aggregate review stats
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
