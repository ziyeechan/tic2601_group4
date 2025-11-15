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
        fkRestaurantId: 1,
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
        fkRestaurantId: 1,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK8A1B2C3D",
        customerName: "Emily Davis",
        customerEmail: "emily.davis@email.com",
        customerPhone: "+1-555-2468",
        partySize: 2,
        specialRequests: null,
        bookingDate: "2024-12-18",
        bookingTime: "19:30",
        status: "confirmed",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK9E4F5G6H",
        customerName: "Robert Wilson",
        customerEmail: "robert.w@email.com",
        customerPhone: "+1-555-1357",
        partySize: 4,
        specialRequests: "Birthday celebration",
        bookingDate: "2024-12-19",
        bookingTime: "18:00",
        status: "pending",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK1I7J8K9L",
        customerName: "Jessica Martinez",
        customerEmail: "jessica.m@email.com",
        customerPhone: "+1-555-9753",
        partySize: 3,
        specialRequests: "Allergic to shellfish",
        bookingDate: "2024-12-12",
        bookingTime: "20:00",
        status: "completed",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK2M0N1O2P",
        customerName: "David Brown",
        customerEmail: "david.brown@email.com",
        customerPhone: "+1-555-3579",
        partySize: 2,
        specialRequests: null,
        bookingDate: "2024-12-10",
        bookingTime: "19:00",
        status: "no_show",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK3Q4R5S6T",
        customerName: "Lisa Anderson",
        customerEmail: "lisa.a@email.com",
        customerPhone: "+1-555-7531",
        partySize: 5,
        specialRequests: "High chair needed",
        bookingDate: "2024-12-20",
        bookingTime: "17:00",
        status: "cancelled",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK4U5V6W7X",
        customerName: "James Taylor",
        customerEmail: "james.t@email.com",
        customerPhone: "+1-555-8642",
        partySize: 4,
        specialRequests: null,
        bookingDate: "2024-12-21",
        bookingTime: "18:45",
        status: "confirmed",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK5Y6Z7A8B",
        customerName: "Patricia Lee",
        customerEmail: "patricia.lee@email.com",
        customerPhone: "+1-555-2468",
        partySize: 3,
        specialRequests: "Window seat preferred",
        bookingDate: "2024-12-22",
        bookingTime: "19:15",
        status: "pending",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK6C7D8E9F",
        customerName: "Thomas Garcia",
        customerEmail: "thomas.g@email.com",
        customerPhone: "+1-555-4820",
        partySize: 2,
        specialRequests: null,
        bookingDate: "2024-12-09",
        bookingTime: "20:30",
        status: "completed",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK7G8H9I0J",
        customerName: "Amanda White",
        customerEmail: "amanda.white@email.com",
        customerPhone: "+1-555-1928",
        partySize: 3,
        specialRequests: null,
        bookingDate: "2024-12-08",
        bookingTime: "18:15",
        status: "no_show",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK8K9L0M1N",
        customerName: "Christopher Moore",
        customerEmail: "chris.moore@email.com",
        customerPhone: "+1-555-3746",
        partySize: 2,
        specialRequests: "Quiet table",
        bookingDate: "2024-12-23",
        bookingTime: "19:00",
        status: "cancelled",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK9O1P2Q3R",
        customerName: "Michelle Rodriguez",
        customerEmail: "michelle.r@email.com",
        customerPhone: "+1-555-5564",
        partySize: 4,
        specialRequests: null,
        bookingDate: "2024-12-07",
        bookingTime: "20:00",
        status: "no_show",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
      {
        confirmationCode: "BK0S3T4U5V",
        customerName: "Kevin Jackson",
        customerEmail: "kevin.j@email.com",
        customerPhone: "+1-555-7382",
        partySize: 5,
        specialRequests: "Celebration dinner",
        bookingDate: "2024-12-24",
        bookingTime: "17:45",
        status: "cancelled",
        fkRestaurantId: 2,
        fkSeatingId: 5,
      },
    ]);

    await Reviews.bulkCreate([
      {
        rating: 5,
        comment: "Excellent pasta! The carbonara was absolutely delicious.",
        fkBookingId: 1,
        fkRestaurantId: 1,
      },
      {
        rating: 4,
        comment: "Great service and ambiance. Food was very good.",
        fkBookingId: 2,
        fkRestaurantId: 2,
      },
      {
        rating: 5,
        comment: "Amazing experience! Vegetarian options were plentiful and tasty.",
        fkBookingId: 3,
        fkRestaurantId: 4,
      },
    ]);

    console.log("Initial Data Created!");
  } catch (err) {
    console.log("Something went wrong! " + err);
  }
};
