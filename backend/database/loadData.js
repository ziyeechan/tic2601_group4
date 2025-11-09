const { Addresses } = require("../src/schemas/addresses.js");
const { Restaurants } = require("../src/schemas/restaurants.js");

module.exports.LoadData = async () => {
  try {
    const addressLine1 = "21 Sesame Street 9";
    const country = "Singapore";
    const city = "Singapore";
    const postalCode = "Singapore 611223";
    var addressId;

    await Addresses.create({
      addressLine1: addressLine1,
      country: country,
      city: city,
      postalCode: postalCode,
    })
      .then((results) => {
        console.log("success");
        addressId = results.dataValues.addressId;
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
      restaurantName: name,
      description: description,
      cuisine: cuisine,
      fkAddressId: addressId,
      phone: phone,
      email: email,
    });

    console.log("Initial Data Created!");
  } catch (err) {
    console.log("Something went wrong! " + err);
  }
};
