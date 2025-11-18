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
    openingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Restaurant opening time (HH:MM:SS format)",
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: "Restaurant closing time (HH:MM:SS format)",
    },
  },
  { freezeTableName: true }
);

module.exports = { Restaurants };
