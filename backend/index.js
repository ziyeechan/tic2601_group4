const { Addresses } = require("./src/schemas/addresses.js");
const { Bookings } = require("./src/schemas/booking.js");
const { Menus } = require("./src/schemas/menus.js");
const { Promotions } = require("./src/schemas/promotions.js");
const { Restaurants } = require("./src/schemas/restaurants.js");
const { Reviews } = require("./src/schemas/reviews.js");
const { Seating_Plans } = require("./src/schemas/seating_plans.js");

const express = require("express");
const db = require("./database/connection");
const port = 3000;

const app = express();

const onFirstLoad = false;

app.listen(port, async (err) => {
  if (err) {
    console.log(`Cannot Listen on PORT: ${port}`);
  } else {
    console.log(`Server is Listening on: http://localhost:${port}/`);

    await db
      .sync({ force: onFirstLoad })
      .then(async () => {
        console.log("Connection to SQLite is successful");
      })
      .catch((error) => {
        console.log(`Failed to connect to SQLite: ${error}`);
      });

    if (onFirstLoad) {
      try {
        const { Load_Data } = require("./database/load_data.js");
        await Load_Data();
      } catch (err) {
        console.log(err);
      }
    }
  }
});
