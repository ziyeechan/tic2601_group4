const { createAddress, findAddressByFK } = require("../models/address");
const {
  findRestaurantByID,
  findRestaurantByName,
  createRestaurant,
  updateRestaurant,
  deleteRestaurantByPK,
} = require("../models/restaurant");

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
      !postalCode
    ) {
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
    return res
      .status(500)
      .send("Something went wrong! Contact your local administrator");
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
    const address = await findAddressByFK(restaurant.fk_address_id);

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
    const address = await findAddressByFK(restaurant.fk_address_id);

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
    console.log("===============================================");
    console.log("here");
    console.log("===============================================");
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
        restaurant_name: name,
        description: description,
        cuisine: cuisine,
        phone: phone,
        email: email,
      };

      await updateRestaurant(restaurantID, formattedData);
    } else if (
      addressLine1 ||
      addressLine2 ||
      country ||
      state ||
      city ||
      postalCode
    ) {
      const restaurant = await findRestaurantByID(restaurantID);

      const formattedData = {
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        country: country,
        state: state,
        city: city,
        postal_code: postalCode,
      };

      await updateRestaurant(restaurant.fk_address_id, formattedData);
    }
    return res.status(200).send("Restaurant has been successfully updated");
  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteRestaurantByPK = async (req, res) => {
  try {
    const restaurantID = parseInt(req.params.restaurantID);
    if (isNaN(restaurantID))
      return res.status(400).json({
        message: "Invalid Parameter",
      });

    await deleteRestaurantByPK(restaurantID);
    return res.status(200).send("Restaurant has been successfully deleted!");
  } catch (err) {
    console.log(err);
  }
};
