const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");

const SeatingPlans = db.define(
  "seatingPlans",
  {
    seatingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pax: {
      type: DataTypes.INTEGER,
      allowNull: false,
      min: 1,
    },
    tableType: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [["vip", "indoor", "outdoor"]],
      },
    },
    tableNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    //seating layout
    x: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    fkRestaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Restaurants,
        key: "restaurantId",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Restaurants.hasMany(SeatingPlans, {
  foreignKey: "fkRestaurantId",
  onUpdate: "NO ACTION",
});
SeatingPlans.belongsTo(Restaurants, {
  foreignKey: "fkRestaurantId",
  onUpdate: "NO ACTION",
});

module.exports = { SeatingPlans };
