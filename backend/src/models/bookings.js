const { Bookings } = require("../schemas/booking.js");
const { SeatingPlans } = require("../schemas/seatingPlans.js");
const { Restaurants } = require("../schemas/restaurants.js");

// Create a new booking
module.exports.createBooking = async (bookingData) => {
  return await Bookings.create(bookingData);
};

// Find booking by confirmation code
module.exports.findBookingByConfirmationCode = async (confirmationCode) => {
  return await Bookings.findOne({
    where: {
      confirmationCode: confirmationCode,
    },
    include: [
      {
        model: Restaurants,
        attributes: ["restaurantId", "restaurantName"],
      },
      {
        model: SeatingPlans,
        attributes: ["seatingId", "tableNumber", "pax"],
      },
    ],
  });
};

// Find bookings by customer email
module.exports.findBookingsByCustomerEmail = async (email) => {
  return await Bookings.findAll({
    where: {
      customerEmail: email,
    },
    include: [
      {
        model: Restaurants,
        attributes: ["restaurantId", "restaurantName"],
      },
      {
        model: SeatingPlans,
        attributes: ["seatingId", "tableNumber", "pax"],
      },
    ],
    order: [["date", "DESC"]],
  });
};

// Find all bookings for a restaurant (admin view)
module.exports.findBookingsByRestaurantID = async (restaurantID) => {
  return await Bookings.findAll({
    where: {
      fkRestaurantId: restaurantID,
    },
    include: [
      {
        model: SeatingPlans,
        attributes: ["seatingId", "tableNumber", "pax", "tableType"],
      },
    ],
    order: [["date", "DESC"]],
  });
};

// Find booking by ID
module.exports.findBookingByID = async (bookingID) => {
  return await Bookings.findOne({
    where: {
      bookingId: bookingID,
    },
    include: [
      {
        model: Restaurants,
        attributes: ["restaurantId", "restaurantName"],
      },
      {
        model: SeatingPlans,
        attributes: ["seatingId", "tableType", "pax"],
      },
    ],
  });
};

// Find all bookings with a specific status
module.exports.findBookingsByStatus = async (restaurantID, status) => {
  return await Bookings.findAll({
    where: {
      fkRestaurantId: restaurantID,
      status: status,
    },
    include: [
      {
        model: SeatingPlans,
        attributes: ["seatingId", "tableNumber", "pax"],
      },
    ],
  });
};

// Update booking status
module.exports.updateBookingStatus = async (bookingID, status) => {
  return await Bookings.update(
    { status },
    {
      where: {
        bookingId: bookingID,
      },
    }
  );
};

// Update booking details
module.exports.updateBooking = async (bookingID, bookingData) => {
  return await Bookings.update(bookingData, {
    where: {
      bookingId: bookingID,
    },
  });
};

// Delete booking
module.exports.deleteBooking = async (bookingID) => {
  return await Bookings.destroy({
    where: {
      bookingId: bookingID,
    },
  });
};

// Check if a seating plan is available for a specific date and time
module.exports.checkSeatingAvailability = async (seatingID, date, time) => {
  const booking = await Bookings.findOne({
    where: {
      fkSeatingId: seatingID,
      date: date,
      time: time,
      status: {
        [require("sequelize").Op.in]: ["confirmed", "seated"],
      },
    },
  });
  return !booking; // Returns true if available (no conflicting booking)
};

// Get all bookings for a seating plan on a specific date
module.exports.findBookingsBySeatingDate = async (seatingID, date) => {
  return await Bookings.findAll({
    where: {
      fkSeatingId: seatingID,
      date: date,
      status: {
        [require("sequelize").Op.in]: ["confirmed", "seated", "completed"],
      },
    },
    order: [["time", "ASC"]],
  });
};
