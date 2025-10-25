const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");

const Seating_Plans = db.define(
  "seating_plans",
  {
    seating_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pax: {
      type: DataTypes.INTEGER,
      allowNull: false,
      min: 0,
    },
    table_type: {
      type: DataTypes.STRING(50),
      isIn: ["vip", "indoor", "outdoor"],
    },
    table_number: {
      type: DataTypes.STRING(50),
    },
    is_available: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    freezeTableName: true,
  }
);

Restaurants.hasMany(Seating_Plans, { foreignKey: "fk_restaurant_id" });
Seating_Plans.belongsTo(Restaurants, { foreignKey: "fk_restaurant_id" });

module.exports = { Seating_Plans };
