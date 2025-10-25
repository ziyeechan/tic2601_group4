const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");

const Promotions = db.define(
  "promotions",
  {
    promotion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menu_types: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    terms_and_cond: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    starts_at: {
      type: DataTypes.DATE,
    },
    ends_at: {
      type: DataTypes.DATE,
    },
    discount: {
      type: DataTypes.STRING(100),
    },
  },
  {
    freezeTableName: true,
  }
);

Restaurants.hasMany(Promotions, { foreignKey: "fk_restaurant_id" });
Promotions.belongsTo(Restaurants, { foreignKey: "fk_restaurant_id" });

module.exports = { Promotions };
