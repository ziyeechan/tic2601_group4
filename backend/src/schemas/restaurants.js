const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");

const Restaurants = db.define(
  "restaurants",
  {
    restaurantId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    restaurantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    cuisine: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "URL to restaurant image (e.g., from Unsplash)",
    },
    closedDays: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Comma-Separated Days e.g. Monday, Tuesday, Wednesday....",
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Restaurant opening time (HH:MM:SS format)",
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Restaurant closing time (HH:MM:SS format)",
      validate: {
        isAfterStart(value) {
          if (value <= this.openingTime) {
            throw new Error("closingTime must be before openingTime!");
          }
        },
      },
    },
  },
  { freezeTableName: true }
);

module.exports = { Restaurants };
