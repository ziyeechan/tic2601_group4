const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");
const { SeatingPlans } = require("./seatingPlans.js");

const Bookings = db.define(
  "bookings",
  {
    booking_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    confirmation_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    customer_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    customer_email: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    party_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      min: 0,
    },
    special_requests: {
      type: DataTypes.TEXT,
    },
    booking_date: {
      type: DataTypes.DATE,
    },
    booking_time: {
      type: DataTypes.TIME,
    },
    status: {
      type: DataTypes.STRING(50),
      default: "confirmed",
      isIn: [
        "pending",
        "confirmed",
        "seated",
        "completed",
        "cancelled",
        "no_show",
        "cancelled",
      ],
    },
    fk_seating_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SeatingPlans,
        key: "seating_id",
      },
    },
  },
  {
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["fk_seating_id", "booking_date", "booking_time"],
      },
    ],
  }
);

Restaurants.hasMany(Bookings, { foreignKey: "fk_restaurant_id" });
Bookings.belongsTo(Restaurants, { foreignKey: "fk_restaurant_id" });

module.exports = { Bookings };
