const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");

const Menus = db.define(
  "menus",
  {
    menu_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menu_types: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    menu_filepath: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

Restaurants.hasMany(Menus, { foreignKey: "fk_restaurant_id" });
Menus.belongsTo(Restaurants, { foreignKey: "fk_restaurant_id" });

module.exports = { Menus };
