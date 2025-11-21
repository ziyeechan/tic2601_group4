const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");

const Menus = db.define(
  "menus",
  {
    menuId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menuTypes: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    menuFilepath: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

Restaurants.hasMany(Menus, { foreignKey: "fkRestaurantId" });
Menus.belongsTo(Restaurants, { foreignKey: "fkRestaurantId" });

module.exports = { Menus };
