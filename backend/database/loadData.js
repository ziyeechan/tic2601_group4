const { Addresses } = require("../src/schemas/addresses.js");
const { Restaurants } = require("../src/schemas/restaurants.js");
const { SeatingPlans } = require("../src/schemas/seatingPlans.js");
const { Bookings } = require("../src/schemas/bookings.js");
const { Promotions } = require("../src/schemas/promotions.js");
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
        imageUrl:
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=1200&h=800&fit=crop",
        openingTime: "11:00:00",
        closingTime: "22:00:00",
      },
      {
        restaurantName: "The Garden Bistro",
        description:
          "An elegant French bistro offering classic dishes with a modern twist.",
        cuisine: "French",
        fkAddressId: 2,
        phone: "+1-555-0123",
        email: "reservations@gardenbistro.com",
        imageUrl:
          "https://images.unsplash.com/photo-1744313983217-e24a659bf7c1?w=1200&h=800&fit=crop",
        openingTime: "11:00:00",
        closingTime: "22:00:00",
      },
      {
        restaurantName: "Sakura Sushi & Grill",
        cuisine: "Japanese",
        description:
          "Fresh sushi and authentic Japanese cuisine in a contemporary setting.",
        fkAddressId: 3,
        phone: "+1-555-0456",
        email: "info@sakurasushi.com",
        imageUrl:
          "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=800&fit=crop",
        openingTime: "12:00:00",
        closingTime: "23:00:00",
      },
      {
        restaurantName: "Mama Rosa's Trattoria",
        cuisine: "Italian",
        description:
          "Traditional Italian family recipes passed down through generations.",
        fkAddressId: 3,
        phone: "+1-555-0789",
        email: "ciao@mamarosas.com",
        imageUrl:
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=800&fit=crop",
        openingTime: "17:00:00",
        closingTime: "23:00:00",
      },
      {
        restaurantName: "Spice Route",
        cuisine: "Indian",
        description:
          "Authentic Indian cuisine with aromatic spices and traditional cooking methods.",
        fkAddressId: 4,
        phone: "+1-555-0321",
        email: "hello@spiceroute.com",
        imageUrl:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop",
        openingTime: "11:30:00",
        closingTime: "23:00:00",
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
        comment:
          "Amazing experience! Vegetarian options were plentiful and tasty.",
        fkBookingId: 3,
        fkRestaurantId: 4,
      },
    ]);

    await Promotions.bulkCreate([
      // The Garden Bistro (fkRestaurantId: 2)
      {
        // promotionId: auto by DB
        fkRestaurantId: 2,
        termsNCond:
          "Valid for dine-in only. Applicable to 3-course set menu from 5:00 PM to 6:30 PM, Monday to Thursday. Not valid on public holidays. Cannot be combined with other promotions.",
        description: "Early Bird Dinner: 20% off our 3-course French set menu.",
        startAt: "2025-11-01",
        endAt: "2025-11-30",
        discount: "20% off 3-course set menu",
        isActive: true,
      },
      {
        fkRestaurantId: 2,
        termsNCond:
          "Valid for dine-in only on Fridays and Saturdays from 6:00 PM onwards. Complimentary glass limited to one per guest with purchase of any main course. Guests must be of legal drinking age.",
        description:
          "Wine Pairing Night: Complimentary house wine with every main course.",
        startAt: "2025-11-15",
        endAt: "2025-12-31",
        discount: "Free glass of house wine",
        isActive: true,
      },

      // Sakura Sushi & Grill (fkRestaurantId: 3)
      {
        fkRestaurantId: 3,
        termsNCond:
          "Valid for dine-in and takeaway from Monday to Friday. Discount applies to the lowest-priced roll. Not valid with lunch sets or other promotions.",
        description:
          "Sushi Lovers Deal: Buy 2 signature rolls, get 1 chef’s choice roll at 50% off.",
        startAt: "2025-11-05",
        endAt: "2025-12-05",
        discount: "50% off 1 roll (with purchase of 2)",
        isActive: true,
      },
      {
        fkRestaurantId: 3,
        termsNCond:
          "Valid for dine-in only from 5:00 PM to 7:00 PM daily. Discount applies to yakitori skewers only. While stocks last.",
        description:
          "Yakitori Happy Hour: 30% off all skewers from 5:00 PM–7:00 PM.",
        startAt: "2025-11-01",
        endAt: "2025-11-30",
        discount: "30% off yakitori skewers",
        isActive: true,
      },
      // Mama Rosa's Trattoria (restaurantId: 4)
      {
        fkRestaurantId: 4,
        termsNCond:
          "Valid for dine-in only, Sunday to Thursday from 5:00 PM onwards. Complimentary pizza limited to one per table. Not valid on eve of public holidays and public holidays.",
        description:
          "Family Pasta Night: Free margherita pizza with any 2 pasta mains.",
        startAt: "2025-11-10",
        endAt: "2025-12-10",
        discount: "Free margherita pizza",
        isActive: false,
      },
      {
        fkRestaurantId: 4,
        termsNCond:
          "Valid for dine-in only from 11:30 AM to 2:30 PM on weekdays. Not applicable to à la carte items. Service charge and taxes apply based on full price.",
        description: "Lunch Special: 15% off all lunch set menus.",
        startAt: "2025-11-01",
        endAt: "2025-11-30",
        discount: "15% off lunch sets",
        isActive: false,
      },
    ]);

    await Reviews.bulkCreate([
      {
        // Review for John Smith at Pasta Delights
        rating: 5,
        comment:
          "Amazing dinner experience. The food was excellent and the staff were very attentive. The window table request was fulfilled perfectly.",
        fkBookingId: 1,
        fkRestaurantId: 1,
      },
      {
        // Review for Sarah Johnson at The Garden Bistro
        rating: 4,
        comment:
          "Fresh sushi and a nice atmosphere. Service was a little slow, but overall we really enjoyed our meal.",
        fkBookingId: 2,
        fkRestaurantId: 2,
      },
      {
        // Review for Michael Chen at Mama Rosa's Trattoria
        rating: 5,
        comment:
          "Great Indian food with rich flavors. Really appreciated the vegetarian options and the staff were very accommodating.",
        fkBookingId: 3,
        fkRestaurantId: 4,
      },
    ]);

    await Promotions.bulkCreate([
      {
        description: "20% off on all main courses",
        discount: "LPRDINE20",
        startAt: "2024-11-01",
        endAt: "2024-11-30",
        termsNCond: "Valid for dine-in only. Not applicable to beverages.",
        discount: "20%",
        fkRestaurantId: 1,
      },
      {
        description: "Buy 1 sushi roll, get 1 free",
        discount: "SUSHI2FOR1",
        startAt: "2024-11-05",
        endAt: "2024-11-20",
        termsNCond: "Valid on selected menu items only. One per customer.",
        discount: "BOGO",
        fkRestaurantId: 3,
      },
      {
        description: "Happy Hour: 50% off appetizers 5-7 PM",
        discount: "HAPPYHOUR50",
        startAt: "2024-11-01",
        endAt: "2024-12-31",
        termsNCond: "Valid Monday to Friday, 5-7 PM. Dine-in only.",
        discount: "50%",
        fkRestaurantId: 2,
      },
      {
        description: "Birthday special: Complimentary dessert",
        discount: "BDAY2024",
        startAt: "2024-11-01",
        endAt: "2024-12-31",
        termsNCond: "Valid on your birthday month. Must show valid ID.",
        discount: "Free Dessert",
        fkRestaurantId: 5,
      },
      {
        description: "Family Combo Package: 30% discount",
        discount: "FAMILY30",
        startAt: "2024-11-10",
        endAt: "2024-11-25",
        termsNCond: "Valid for 4+ people. Not combinable with other offers.",
        discount: "30%",
        fkRestaurantId: 4,
      },
    ]);

    console.log("Initial Data Created!");
  } catch (err) {
    console.log("Something went wrong! " + err);
  }
};
