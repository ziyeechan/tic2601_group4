const {
  createBooking,
  findBookingByConfirmationCode,
  findBookingsByCustomerEmail,
  findBookingsByRestaurantID,
  findBookingByID,
  findBookingsByStatus,
  updateBookingStatus: updateBookingStatusInDB,
  updateBooking,
  deleteBooking,
  checkSeatingAvailability,
  findAllBookings,
} = require("../models/bookings");
const { findSeatingPlanByPK } = require("../models/seatingPlan");
const { findRestaurantByID } = require("../models/restaurant");

// Generate a unique confirmation code
const generateConfirmationCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Create a new booking (Use Case 2: Book Reservation)
module.exports.createBooking = async (req, res) => {
  try {
    const {
      restaurantID,
      seatingID,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      bookingDate,
      bookingTime,
      specialRequests,
    } = req.body;

    // Validation
    if (
      !restaurantID ||
      !seatingID ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !partySize ||
      !bookingDate ||
      !bookingTime
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Check if restaurant exists
    const restaurant = await findRestaurantByID(restaurantID);
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    // Check if seating plan exists
    const seatingPlan = await findSeatingPlanByPK(seatingID);
    if (!seatingPlan) {
      return res.status(404).json({
        message: "Seating plan not found",
      });
    }

    // Validate party size matches seating capacity
    if (partySize > seatingPlan.pax) {
      return res.status(400).json({
        message: `Party size exceeds table capacity (${seatingPlan.pax} people max)`,
      });
    }

    // Check if seating is available for the requested date and time
    const isAvailable = await checkSeatingAvailability(
      seatingID,
      bookingDate,
      bookingTime
    );
    if (!isAvailable) {
      return res.status(409).json({
        message: "Seating is not available for the requested date and time",
      });
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Create booking
    const bookingData = {
      confirmationCode: confirmationCode,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      partySize: partySize,
      specialRequests: specialRequests || null,
      fkRestaurantId: restaurantID,
      fkSeatingId: seatingID,
      date: bookingDate,
      time: bookingTime,
      status: "confirmed",
    };

    await createBooking(bookingData);

    return res.status(201).json({
      message: "Booking successfully created",
      confirmationCode: confirmationCode,
      booking: bookingData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// Find booking by confirmation code (Use Case 3: Manage Reservation)
module.exports.findBookingByConfirmationCode = async (req, res) => {
  try {
    const { confirmationCode } = req.params;

    if (!confirmationCode) {
      return res.status(400).json({
        message: "Confirmation code is required",
      });
    }

    const booking = await findBookingByConfirmationCode(confirmationCode);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      booking: booking,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// Find all bookings by customer email (Use Case 3: Manage Reservation)
module.exports.findBookingsByCustomerEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const bookings = await findBookingsByCustomerEmail(email);

    if (bookings.length === 0) {
      return res.status(404).json({
        message: "No bookings found for this email",
      });
    }

    return res.status(200).json({
      count: bookings.length,
      bookings: bookings,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// Find booking by ID (Admin use)
module.exports.findBookingByID = async (req, res) => {
  try {
    const { bookingID } = req.params;

    if (!bookingID) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const bookingIDNum = parseInt(bookingID);
    if (isNaN(bookingIDNum)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await findBookingByID(bookingIDNum);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      booking: booking,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// View all bookings for a restaurant (Use Case 4: View All Bookings - Admin)
module.exports.findBookingsByRestaurantID = async (req, res) => {
  try {
    const { restaurantID } = req.params;

    if (!restaurantID) {
      return res.status(400).json({
        message: "Restaurant ID is required",
      });
    }

    const restaurantIDNum = parseInt(restaurantID);
    if (isNaN(restaurantIDNum)) {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }

    // Check if restaurant exists
    const restaurant = await findRestaurantByID(restaurantIDNum);
    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const bookings = await findBookingsByRestaurantID(restaurantIDNum);

    return res.status(200).json({
      restaurantID: restaurantIDNum,
      totalBookings: bookings.length,
      bookings: bookings,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// Get bookings by status for a restaurant (Admin filter)
module.exports.findBookingsByStatus = async (req, res) => {
  try {
    const { restaurantID, status } = req.params;

    if (!restaurantID || !status) {
      return res.status(400).json({
        message: "Restaurant ID and status are required",
      });
    }

    const restaurantIDNum = parseInt(restaurantID);
    if (isNaN(restaurantIDNum)) {
      return res.status(400).json({
        message: "Invalid restaurant ID",
      });
    }

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "seated",
      "completed",
      "no_show",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const bookings = await findBookingsByStatus(restaurantIDNum, status);

    return res.status(200).json({
      restaurantID: restaurantIDNum,
      status: status,
      count: bookings.length,
      bookings: bookings,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// Update booking status (Use Case 5: Update Booking Status - Admin)
module.exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingID } = req.params;
    const { status } = req.body;

    if (!bookingID || !status) {
      return res.status(400).json({
        message: "Booking ID and status are required",
      });
    }

    const bookingIDNum = parseInt(bookingID);
    if (isNaN(bookingIDNum)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    // Validate status
    const validStatuses = [
      "pending",
      "confirmed",
      "seated",
      "completed",
      "no_show",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    // Check if booking exists
    const booking = await findBookingByID(bookingIDNum);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await updateBookingStatusInDB(bookingIDNum, status);

    return res.status(200).json({
      message: `Booking status updated to ${status}`,
      bookingID: bookingIDNum,
      newStatus: status,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// Update booking details (Use Case 3: Manage Reservation)
module.exports.updateBooking = async (req, res) => {
  try {
    const { bookingID } = req.params;
    const updateData = req.body;

    if (!bookingID) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const bookingIDNum = parseInt(bookingID);
    if (isNaN(bookingIDNum)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    // Check if booking exists
    const booking = await findBookingByID(bookingIDNum);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Allowed fields to update
    const allowedFields = [
      "customerName",
      "customerEmail",
      "customerPhone",
      "partySize",
      "specialRequests",
      "bookingDate",
      "bookingTime",
      "fkSeatingId"
    ];

    const filteredData = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        message: "No valid fields to update",
      });
    }

    await updateBooking(bookingIDNum, filteredData);

    return res.status(200).json({
      message: "Booking updated successfully",
      bookingID: bookingIDNum,
      updatedFields: filteredData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// Get all bookings (Admin view - all restaurants)
module.exports.findAllBookings = async (req, res) => {
  try {
    const bookings = await findAllBookings();

    // Convert Sequelize instances to plain JSON objects
    const bookingsJSON = bookings.map(booking => booking.toJSON ? booking.toJSON() : booking);

    return res.status(200).json({
      totalBookings: bookingsJSON.length,
      bookings: bookingsJSON,
    });
  } catch (err) {
    console.error('Error in findAllBookings controller:', err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};

// Delete booking (Admin or customer with confirmation code)
module.exports.deleteBooking = async (req, res) => {
  try {
    const { bookingID } = req.params;

    if (!bookingID) {
      return res.status(400).json({
        message: "Booking ID is required",
      });
    }

    const bookingIDNum = parseInt(bookingID);
    if (isNaN(bookingIDNum)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    // Check if booking exists
    const booking = await findBookingByID(bookingIDNum);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await deleteBooking(bookingIDNum);

    return res.status(200).json({
      message: "Booking deleted successfully",
      bookingID: bookingIDNum,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong! Contact your local administrator",
      error: err.message,
    });
  }
};
