const { DataTypes } = require("sequelize");
const db = require("../../database/connection.js");
const { Restaurants } = require("./restaurants.js");
const { SeatingPlans } = require("./seatingPlans.js");

const Bookings = db.define(
  "bookings",
  {
    bookingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    confirmationCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    partySize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      min: 0,
    },
    specialRequests: {
      type: DataTypes.TEXT,
    },
    bookingDate: {
      type: DataTypes.DATEONLY,
    },
    bookingTime: {
      type: DataTypes.TIME,
    },
    status: {
      type: DataTypes.STRING(50),
      default: "confirmed",
      validate: {
        isIn: [
          [
            "pending",
            "confirmed",
            "seated",
            "completed",
            "cancelled",
            "no_show",
            "cancelled",
          ],
        ],
      },
    },
    fkSeatingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SeatingPlans,
        key: "seatingId",
      },
    },
  },
  {
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["fkSeatingId", "bookingDate", "bookingTime"],
        name: "unique_seating_date_time",
      },
      {
        unique: true,
        fields: ["customerEmail", "fkRestaurantId", "bookingDate"],
        name: "unique_customer_restaurant_date",
      },
    ],
  }
);

Restaurants.hasMany(Bookings, { foreignKey: "fkRestaurantId" });
Bookings.belongsTo(Restaurants, { foreignKey: "fkRestaurantId" });

SeatingPlans.hasMany(Bookings, { foreignKey: "fkSeatingId" });
Bookings.belongsTo(SeatingPlans, { foreignKey: "fkSeatingId" });

module.exports = { Bookings };
