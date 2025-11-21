const { Restaurants } = require("../schemas/restaurants.js");

module.exports.findAllRestaurants = async (name) => {
  const results = await Restaurants.findAll();

  return results;
};

module.exports.findRestaurantByName = async (name) => {
  const results = await Restaurants.findOne({
    where: {
      restaurantName: name,
    },
  });

  return results;
};

module.exports.findRestaurantByID = async (restaurantID) => {
  const results = await Restaurants.findByPk(restaurantID);

  return results;
};

module.exports.createRestaurant = async (restaurantInfo, addressId) => {
  await Restaurants.create({
    restaurantName: restaurantInfo.name,
    description: restaurantInfo.description,
    cuisine: restaurantInfo.cuisine,
    phone: restaurantInfo.phone,
    email: restaurantInfo.email,
    fkAddressId: addressId,
  });
};

module.exports.updateRestaurant = (restaurantID, meta) =>
  Restaurants.update(
    {
      ...meta,
    },
    {
      where: {
        restaurantId: restaurantID,
      },
    }
  );

module.exports.deleteRestaurantByID = async (restaurantID) => {
  await Restaurants.destroy({
    where: { restaurantId: restaurantID },
  });
};
