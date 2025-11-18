const { SeatingPlans } = require("../schemas/seatingPlans");

module.exports.findSeatingPlanByTableNum = async (tableNum, restaurantID) => {
  const results = await SeatingPlans.findOne({
    where: { tableNumber: tableNum, fkRestaurantId: restaurantID },
  });

  return results;
};

module.exports.findSeatingPlanByRestaurantID = async (restaurantID) => {
  const results = await SeatingPlans.findAll({
    where: { fkRestaurantId: restaurantID },
  });

  return results;
};

module.exports.findSeatingPlanByID = async (seatingID) => {
  const results = await SeatingPlans.findByPk(seatingID);

  return results;
};

module.exports.createSeatingPlan = async (seatingInfo, restaurantID) => {
  await SeatingPlans.create({
    pax: seatingInfo.pax,
    tableType: seatingInfo.tableType,
    tableNumber: seatingInfo.tableNumber,
    x: seatingInfo.x,
    y: seatingInfo.y, 
    fkRestaurantId: restaurantID,
  });
};

module.exports.updateSeatingPlanByID = async (seatingID, meta) => {
  await SeatingPlans.update(
    { ...meta },
    {
      where: { seatingId: seatingID },
    }
  );
};

module.exports.deleteSeatingPlanByID = async (seatingID) => {
  await SeatingPlans.destroy({
    where: { seatingId: seatingID },
  });
};

// Find an available seating plan for a party (auto-assignment)
// Returns the first available table that fits the party size
module.exports.findAvailableSeating = async (restaurantID, partySize, bookingDate, bookingTime) => {
  const { Op } = require("sequelize");
  const Bookings = require("../schemas/bookings").Bookings;

  // Find all seating plans for the restaurant that fit the party size
  const availableSeating = await SeatingPlans.findOne({
    where: {
      fkRestaurantId: restaurantID,
      pax: {
        [Op.gte]: partySize, // pax >= partySize
      },
    },
    // Exclude tables that are already booked at this date/time
    include: [
      {
        model: Bookings,
        as: "Bookings",
        where: {
          bookingDate: bookingDate,
          bookingTime: bookingTime,
          status: {
            [Op.in]: ["confirmed", "seated"],
          },
        },
        required: false,
      },
    ],
    subQuery: false,
  });

  // If findOne with include doesn't work well, use raw query approach
  if (!availableSeating) {
    // Alternative: Get all tables that fit, then check availability manually
    const seatingPlans = await SeatingPlans.findAll({
      where: {
        fkRestaurantId: restaurantID,
        pax: {
          [Op.gte]: partySize,
        },
      },
    });

    if (seatingPlans.length === 0) {
      return null;
    }

    // Check each table for availability
    for (const seating of seatingPlans) {
      const booking = await Bookings.findOne({
        where: {
          fkSeatingId: seating.seatingId,
          bookingDate: bookingDate,
          bookingTime: bookingTime,
          status: {
            [Op.in]: ["confirmed", "seated"],
          },
        },
      });

      if (!booking) {
        return seating; // Return first available table
      }
    }
  }

  return availableSeating;
};
