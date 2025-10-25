const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");

const Addresses = db.define(
  "addresses",
  {
    address_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    address_line_1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_line_2: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Addresses.hasOne(Restaurants, { foreignKey: "fk_address_id" });
Restaurants.belongsTo(Addresses, { foreignKey: "fk_address_id" });

module.exports = { Addresses };
