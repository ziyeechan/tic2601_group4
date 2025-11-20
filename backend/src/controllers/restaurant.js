const { createAddress, findAddressByID, updateAddress, findAllAddresses } = require("../models/address");
const {
  findAllRestaurants,
  findRestaurantByID,
  findRestaurantByName,
  findRestaurantsByCountry,
  findRestaurantsByCity,
  findRestaurantsByState,
  createRestaurant,
  updateRestaurant,
  deleteRestaurantByID,
} = require("../models/restaurant");
const { Restaurants } = require("../schemas/restaurants.js");

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

    if (!name || !cuisine || !addressLine1 || !country || !city || !postalCode) {
      return res.status(400).json({
        message: "Missing Fields",
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
    await createRestaurant(restaurantInfo, addressId);

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

module.exports.findRestaurantsByCountry = async (req, res) => {
  try {
    const country = req.params.country;
    if (!country) {
      return res.status(400).json({ message: "Missing country parameter" });
    }

    const restaurants = await findRestaurantsByCountry(country);
    return res.status(200).json({ restaurants });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.findRestaurantsByCity = async (req, res) => {
  try {
    const city = req.params.city;
    if (!city) {
      return res.status(400).json({ message: "Missing city parameter" });
    }

    const restaurants = await findRestaurantsByCity(city);
    return res.status(200).json({ restaurants });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports.findRestaurantsByState = async (req, res) => {
  try {
    const state = req.params.state;
    if (!state) {
      return res.status(400).json({ message: "Missing state parameter" });
    }

    const restaurants = await findRestaurantsByState(state);
    return res.status(200).json({ restaurants });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
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

    // Fetch all restaurants and convert to JSON
    let allRestaurants = await findAllRestaurants();
    allRestaurants = allRestaurants.map((r) => r.toJSON ? r.toJSON() : r);

    // Fetch all addresses for enrichment
    const allAddressesRaw = await findAllAddresses();
    const allAddresses = allAddressesRaw.map((a) => a.toJSON ? a.toJSON() : a);

    // Fetch all reviews for rating calculation
    let allReviews = [];
    try {
      allReviews = await Restaurants.sequelize.query(
        "SELECT * FROM reviews",
        { type: require("sequelize").QueryTypes.SELECT }
      );
    } catch (e) {
      // Reviews table might not have data yet
      allReviews = [];
    }

    // Fetch all promotions for filtering
    let allPromotions = [];
    try {
      allPromotions = await Restaurants.sequelize.query(
        "SELECT * FROM promotions",
        { type: require("sequelize").QueryTypes.SELECT }
      );
    } catch (e) {
      allPromotions = [];
    }

    // Fetch all menus for dietary type filtering
    let allMenus = [];
    try {
      allMenus = await Restaurants.sequelize.query(
        "SELECT * FROM menus",
        { type: require("sequelize").QueryTypes.SELECT }
      );
    } catch (e) {
      allMenus = [];
    }

    // Filter by text search
    if (q) {
      const searchTerm = q.toLowerCase();
      allRestaurants = allRestaurants.filter(
        (r) =>
          (r.restaurantName && r.restaurantName.toLowerCase().includes(searchTerm)) ||
          (r.description && r.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by cuisine
    if (cuisine) {
      const cuisines = cuisine.split(",").map((c) => c.trim());
      allRestaurants = allRestaurants.filter((r) => cuisines.includes(r.cuisine));
    }

    // Enrich restaurants with reviews and promotions data
    const now = new Date();
    let enrichedRestaurants = allRestaurants.map((restaurant) => {
      // Get reviews for this restaurant
      const restaurantReviews = allReviews.filter(
        (review) => review.fkRestaurantId === restaurant.restaurantId
      );

      // Calculate average rating
      const ratings = restaurantReviews
        .map((r) => parseInt(r.rating))
        .filter((r) => !isNaN(r));

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

      const reviewSummary = {
        averageRating:
          ratings.length > 0
            ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 0,
        totalReviews: ratings.length,
        ratingDistribution,
      };

      // Get active promotions for this restaurant
      const activePromotions = allPromotions.filter(
        (p) =>
          p.fkRestaurantId === restaurant.restaurantId &&
          new Date(p.startAt) <= now &&
          new Date(p.endAt) >= now
      );

      // Get address info
      const address = allAddresses.find((a) => a.addressId === restaurant.fkAddressId);

      // Get menus (dietary types) for this restaurant
      const restaurantMenus = allMenus.filter(
        (menu) => menu.fkRestaurantId === restaurant.restaurantId
      );

      return {
        ...restaurant,
        reviewSummary,
        hasActivePromotion: activePromotions.length > 0,
        address,
        promotions: activePromotions,
        menus: restaurantMenus,
        dietaryTypes: restaurantMenus.map((m) => m.menuTypes).filter(Boolean),
      };
    });

    // Filter by rating
    if (minRating) {
      enrichedRestaurants = enrichedRestaurants.filter(
        (r) => r.reviewSummary.averageRating >= parseFloat(minRating)
      );
    }
    if (maxRating) {
      enrichedRestaurants = enrichedRestaurants.filter(
        (r) => r.reviewSummary.averageRating <= parseFloat(maxRating)
      );
    }

    // Filter by promotion
    if (hasPromotion === "true") {
      enrichedRestaurants = enrichedRestaurants.filter(
        (r) => r.hasActivePromotion
      );
    }

    // Filter by dietary type (Halal, Vegan, Vegetarian)
    if (dietaryType && dietaryType !== "All") {
      const restaurantIdsWithDietaryType = new Set(
        allMenus
          .filter((menu) =>
            (menu.menuTypes || "").toLowerCase().includes(dietaryType.toLowerCase())
          )
          .map((menu) => menu.fkRestaurantId)
      );

      enrichedRestaurants = enrichedRestaurants.filter((r) =>
        restaurantIdsWithDietaryType.has(r.restaurantId)
      );
    }

    // Apply pagination
    const total = enrichedRestaurants.length;
    const paginatedRestaurants = enrichedRestaurants.slice(
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
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
