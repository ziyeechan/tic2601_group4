const { Addresses } = require("../src/schemas/addresses.js");
const { Restaurants } = require("../src/schemas/restaurants.js");
const { SeatingPlans } = require("../src/schemas/seatingPlans.js");
const { Bookings } = require("../src/schemas/bookings.js");
const { Reviews } = require("../src/schemas/reviews.js");

module.exports.LoadData = async () => {
  try {
    await Addresses.bulkCreate([
      {
        addressLine1: "21 Sesame Street 9",
        country: "USA",
        city: "Midtown",
        state: "California",
        postalCode: "CA 90209",
      },
      {
        addressLine1: "123 Garden Street",
        country: "USA",
        city: "Downtown",
        state: "California",
        postalCode: "CA 90210",
      },
      {
        addressLine1: "456 Cherry Blossom Ave",
        country: "USA",
        city: "Midtown",
        state: "California",
        postalCode: "CA 90211",
      },
      {
        addressLine1: "789 Little Italy Street",
        country: "USA",
        city: "North End",
        state: "California",
        postalCode: "CA 90212",
      },
      {
        addressLine1: "321 Curry Lane",
        country: "USA",
        city: "Spice District",
        state: "California",
        postalCode: "CA 90213",
      },
    ]);

    await Restaurants.bulkCreate([
      {
        restaurantName: "Pasta Delights",
        description: "A place for all to enjoy homemade pasta",
        cuisine: "Italian",
        fkAddressId: 1,
        phone: "(555) 876-5544",
        email: "contact@pasta.com",
      },
      {
        restaurantName: "The Garden Bistro",
        description:
          "An elegant French bistro offering classic dishes with a modern twist.",
        cuisine: "French",
        fkAddressId: 2,
        phone: "+1-555-0123",
        email: "reservations@gardenbistro.com",
      },
      {
        restaurantName: "Sakura Sushi & Grill",
        cuisine: "Japanese",
        description:
          "Fresh sushi and authentic Japanese cuisine in a contemporary setting.",
        fkAddressId: 3,
        phone: "+1-555-0456",
        email: "info@sakurasushi.com",
      },
      {
        restaurantName: "Mama Rosa's Trattoria",
        cuisine: "Italian",
        description:
          "Traditional Italian family recipes passed down through generations.",
        fkAddressId: 3,
        phone: "+1-555-0789",
        email: "ciao@mamarosas.com",
      },
      {
        restaurantName: "Spice Route",
        cuisine: "Indian",
        description:
          "Authentic Indian cuisine with aromatic spices and traditional cooking methods.",
        fkAddressId: 4,
        phone: "+1-555-0321",
        email: "hello@spiceroute.com",
      },
    ]);

    await SeatingPlans.bulkCreate([
      {
        pax: 2,
        tableType: "indoor",
        tableNumber: "T1",
        isAvailable: false, // Currently booked
        fkRestaurantId: 1,
      },
      {
        pax: 4,
        tableType: "indoor",
        tableNumber: "T2",
        isAvailable: true,
        fkRestaurantId: 1,
      },
      {
        pax: 6,
        tableType: "vip",
        tableNumber: "VIP-1",
        isAvailable: true,
        fkRestaurantId: 1,
      },
      {
        pax: 2,
        tableType: "outdoor",
        tableNumber: "PATIO-1",
        isAvailable: true,
        fkRestaurantId: 1,
      },
      {
        pax: 4,
        tableType: "indoor",
        tableNumber: "T1",
        isAvailable: false, // Currently booked
        fkRestaurantId: 2,
      },
    ]);

    await Bookings.bulkCreate([
      {
        confirmationCode: "BK6F8K9J2L",
        customerName: "John Smith",
        customerEmail: "john.smith@email.com",
        customerPhone: "+1-555-1234",
        partySize: 2,
        specialRequests: "Window table preferred",
        bookingDate: "2024-12-15",
        bookingTime: "19:00", // TIME format (24-hour)
        status: "confirmed",
        fkRestaurantId: 1,
        fkSeatingId: 1,
      },
      {
        confirmationCode: "BK4N5M3P9X",
        customerName: "Sarah Johnson",
        customerEmail: "sarah.j@email.com",
        customerPhone: "+1-555-5678",
        partySize: 4,
        specialRequests: null,
        bookingDate: "2024-12-16",
        bookingTime: "18:30", // TIME format (24-hour)
        status: "pending",
        fkRestaurantId: 2,
        fkSeatingId: 3,
      },
      {
        // BACKEND FIELDS
        confirmationCode: "BK7R2W5T8Q",
        customerName: "Michael Chen",
        customerEmail: "michael.chen@email.com",
        customerPhone: "+1-555-9012",
        partySize: 3,
        specialRequests: "Vegetarian options required",
        bookingDate: "2024-12-17",
        bookingTime: "17:30", // TIME format (24-hour)
        status: "confirmed",
        fkRestaurantId: 4,
        fkSeatingId: 5,
      },
    ]);

    console.log("Initial Data Created!");
  } catch (err) {
    console.log("Something went wrong! " + err);
  }
};
