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
    // Why have this attribute?
    menu_types: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    terms_and_cond: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (value < this.start_at) {
            throw new Error("end_at must be after start_at");
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

Restaurants.hasMany(Promotions, { foreignKey: "fk_restaurant_id" });
Promotions.belongsTo(Restaurants, { foreignKey: "fk_restaurant_id" });

module.exports = { Promotions };
