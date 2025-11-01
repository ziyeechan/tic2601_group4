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
      confirmation_code: confirmationCode,
    },
    include: [
      {
        model: Restaurants,
        attributes: ["restaurant_id", "restaurant_name"],
      },
      {
        model: SeatingPlans,
        attributes: ["seating_id", "table_number", "pax"],
      },
    ],
  });
};

// Find bookings by customer email
module.exports.findBookingsByCustomerEmail = async (email) => {
  return await Bookings.findAll({
    where: {
      customer_email: email,
    },
    include: [
      {
        model: Restaurants,
        attributes: ["restaurant_id", "restaurant_name"],
      },
      {
        model: SeatingPlans,
        attributes: ["seating_id", "table_number", "pax"],
      },
    ],
    order: [["date", "DESC"]],
  });
};

// Find all bookings for a restaurant (admin view)
module.exports.findBookingsByRestaurantID = async (restaurantID) => {
  return await Bookings.findAll({
    where: {
      fk_restaurant_id: restaurantID,
    },
    include: [
      {
        model: SeatingPlans,
        attributes: ["seating_id", "table_number", "pax", "types_of_table"],
      },
    ],
    order: [["date", "DESC"]],
  });
};

// Find booking by ID
module.exports.findBookingByID = async (bookingID) => {
  return await Bookings.findOne({
    where: {
      booking_id: bookingID,
    },
    include: [
      {
        model: Restaurants,
        attributes: ["restaurant_id", "restaurant_name"],
      },
      {
        model: SeatingPlans,
        attributes: ["seating_id", "table_number", "pax"],
      },
    ],
  });
};

// Find all bookings with a specific status
module.exports.findBookingsByStatus = async (restaurantID, status) => {
  return await Bookings.findAll({
    where: {
      fk_restaurant_id: restaurantID,
      status: status,
    },
    include: [
      {
        model: SeatingPlans,
        attributes: ["seating_id", "table_number", "pax"],
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
        booking_id: bookingID,
      },
    }
  );
};

// Update booking details
module.exports.updateBooking = async (bookingID, bookingData) => {
  return await Bookings.update(bookingData, {
    where: {
      booking_id: bookingID,
    },
  });
};

// Delete booking
module.exports.deleteBooking = async (bookingID) => {
  return await Bookings.destroy({
    where: {
      booking_id: bookingID,
    },
  });
};

// Check if a seating plan is available for a specific date and time
module.exports.checkSeatingAvailability = async (seatingID, date, time) => {
  const booking = await Bookings.findOne({
    where: {
      fk_seating_plan_id: seatingID,
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
      fk_seating_plan_id: seatingID,
      date: date,
      status: {
        [require("sequelize").Op.in]: ["confirmed", "seated", "completed"],
      },
    },
    order: [["time", "ASC"]],
  });
};
