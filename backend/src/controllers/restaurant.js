const { createAddress, findAddressByID, updateAddress } = require("../models/address");
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
const { Addresses } = require("../models/address");

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
