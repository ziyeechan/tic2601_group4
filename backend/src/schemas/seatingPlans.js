const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");

const SeatingPlans = db.define(
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
      validate: {
        isIn: [["vip", 'indoor', "outdoor"]],
      },
    },
    table_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

Restaurants.hasMany(SeatingPlans, {
  foreignKey: "fk_restaurant_id",
  onUpdate: "NO ACTION",
});
SeatingPlans.belongsTo(Restaurants, {
  foreignKey: "fk_restaurant_id",
  onUpdate: "NO ACTION",
});

module.exports = { SeatingPlans };
