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
