const { Restaurants } = require("../schemas/restaurants.js");

module.exports.findRestaurantByName = async (name) => {
  const results = await Restaurants.findOne(name, {
    where: {
      restaurant_name: name,
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
    restaurant_name: restaurantInfo.name,
    description: restaurantInfo.description,
    cuisine: restaurantInfo.cuisine,
    fk_address_id: addressId,
  });
};

module.exports.updateRestaurant = (restaurantID, meta) =>
  Restaurants.update(
    {
      ...meta,
    },
    {
      where: {
        restuarant_id: restaurantID,
      },
    }
  );

module.exports.deleteRestaurantByPK = async (restaurantID) => {
  await Restaurants.destroy({
    where: { seating_id: restaurantID },
  });
};
