const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");

const Promotions = db.define(
  "promotions",
  {
    promotionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    termsNCond: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (value < this.startAt) {
            throw new Error("endAt must be after startAt");
          }
        },
      },
    },
    discount: {
      type: DataTypes.STRING(100),
    },
  },
  {
    freezeTableName: true,
  }
);

Restaurants.hasMany(Promotions, { foreignKey: "fkRestaurantId" });
Promotions.belongsTo(Restaurants, { foreignKey: "fkRestaurantId" });

module.exports = { Promotions };
