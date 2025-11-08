const { Addresses } = require("../src/schemas/addresses.js");
const { Restaurants } = require("../src/schemas/restaurants.js");

module.exports.Load_Data = async () => {
  try {
    const address_line_1 = "21 Sesame Street 9";
    const country = "Singapore";
    const city = "Singapore";
    const postal_code = "Singapore 611223";
    var address_id;

    await Addresses.create({
      address_line_1: address_line_1,
      country: country,
      city: city,
      postal_code: postal_code,
    })
      .then((results) => {
        console.log("success");
        address_id = results.dataValues.address_id;
      })
      .catch((error) => {
        console.log("error", error);
      });

    const name = "Pasta Delights";
    const description = "A place for all to enjoy homemade pasta";
    const cuisine = "Italian";
    const phone = "(555) 123-4567";
    const email = "contact@lepetit.com";

    await Restaurants.create({
      restaurant_name: name,
      description: description,
      cuisine: cuisine,
      fk_address_id: address_id,
      phone: phone,
      email: email,
    });

    console.log("Initial Data Created!");
  } catch (err) {
    console.log("Something went wrong! " + err);
  }
};
