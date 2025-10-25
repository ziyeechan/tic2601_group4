const { Addresses } = require("../src/schemas/addresses.js");
const { Restaurants } = require("../src/schemas/restaurants.js");

module.exports.Load_Data = async () => {
  try {
    const address_line_1 = "21 Sesame Street 9";
    const country = "Singapore";
    const city = "Singapore";
    const postal_code = "Singapore 611223";

    await Addresses.create({
      address_line_1: address_line_1,
      country: country,
      city: city,
      postal_code: postal_code,
    })
      .then(() => {
        console.log("success");
      })
      .catch((error) => {
        console.log("error", error);
      });

    const name = "Pasta Delights";
    const description = "A place for all to enjoy homemade pasta";
    const cuisine = "Italian";
    const address_id = 1;

    await Restaurants.create({
      restaurant_name: name,
      description: description,
      cuisine: cuisine,
      fk_address_id: address_id,
    });

    console.log("Initial Data Created!");
  } catch (err) {
    console.log("Something went wrong! " + err);
  }
};
