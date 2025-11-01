const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");
const { Bookings } = require("./booking.js");

const Reviews = db.define(
  "reviews",
  {
    review_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

Bookings.hasOne(Reviews, { foreignKey: "fk_booking_id" });
Reviews.belongsTo(Bookings, { foreignKey: "fk_booking_id" });

Restaurants.hasMany(Reviews, { foreignKey: "fk_restaurant_id" });
Reviews.belongsTo(Restaurants, { foreignKey: "fk_restaurant_id" });

module.exports = { Reviews };
