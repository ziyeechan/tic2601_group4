const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");
const { Bookings } = require("./bookings.js");

const Reviews = db.define(
  "reviews",
  {
    reviewId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fkBookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Enforce one review per booking
    },
    fkRestaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    timestamps: true, // Enable sequelize to automatically manage createdAt
    updatedAt: false, // Disable updatedAt as we don't need it
  }
);

Bookings.hasOne(Reviews, { foreignKey: "fkBookingId" });
Reviews.belongsTo(Bookings, { foreignKey: "fkBookingId", as: "booking" });

Restaurants.hasMany(Reviews, { foreignKey: "fkRestaurantId" });
Reviews.belongsTo(Restaurants, { foreignKey: "fkRestaurantId" });

module.exports = { Reviews, sequelize: db };
