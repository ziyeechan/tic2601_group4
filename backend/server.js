const { Addresses } = require("./src/schemas/addresses.js");
const { Bookings } = require("./src/schemas/booking.js");
const { Menus } = require("./src/schemas/menus.js");
const { Promotions } = require("./src/schemas/promotions.js");
const { Restaurants } = require("./src/schemas/restaurants.js");
const { Reviews } = require("./src/schemas/reviews.js");
const { SeatingPlans } = require("./src/schemas/seatingPlans.js");

const express = require("express");
const db = require("./database/connection");
const routes = require("./src/routes/index.js");
const port = 3000;

const app = express();
const router = express.Router();

const onFirstLoad = false;

app.use(express.json());
app.use(router);

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
        const { LoadData } = require("./database/loadData.js");
        await LoadData();
      } catch (err) {
        console.log(err);
      }
    }
  }
});

routes(router);
