/**
 * Mock data for development and testing
 *
 * IMPORTANT: This data structure includes FRONTEND-ONLY fields that don't exist in the backend.
 * When integrating with real backend API, these fields will need to be:
 * 1. Fetched from separate endpoints (addresses, menus, reviews)
 * 2. Calculated/aggregated from backend data (rating, reviewCount, priceRange)
 * 3. Sourced from image storage service (image URLs)
 *
 * See USE_CASE_ANALYSIS.md for detailed mapping between backend schema and frontend needs.
 */

/**
 * RESTAURANTS MOCK DATA
 *
 * Backend schema only has: restaurant_id, restaurant_name, description, cuisine, fk_address_id
 * Frontend needs more data - these fields are NOT in actual backend:
 * - priceRange (need separate field or calculate from menu)
 * - rating (calculated from reviews table)
 * - reviewCount (count from reviews table)
 * - image (from asset management service)
 * - address (JOIN from addresses table)
 * - phone, email (NOT IN SCHEMA - need to add to restaurants table)
 * - openingHours (NOT IN SCHEMA - need separate table)
 * - amenities (NOT IN SCHEMA - need separate table)
 * - availableTimeSlots (NOT IN SCHEMA - calculated from opening hours)
 */
export const mockRestaurants = [
  {
    // BACKEND FIELDS
    restaurant_id: 1,
    restaurant_name: 'The Garden Bistro',
    cuisine: 'French',
    description: 'An elegant French bistro offering classic dishes with a modern twist.',
    fk_address_id: 1,

    // FRONTEND-ONLY FIELDS (for mockup only)
    // TODO: Get from separate endpoints when backend is ready
    priceRange: '$$$',
    rating: 4.7,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzU3NTg2NjE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '123 Garden Street, Downtown, CA 90210',
    phone: '+1-555-0123',
    email: 'reservations@gardenbistro.com',
    openingHours: {
      Monday: '5:00 PM - 10:00 PM',
      Tuesday: '5:00 PM - 10:00 PM',
      Wednesday: '5:00 PM - 10:00 PM',
      Thursday: '5:00 PM - 10:00 PM',
      Friday: '5:00 PM - 11:00 PM',
      Saturday: '4:00 PM - 11:00 PM',
      Sunday: '4:00 PM - 9:00 PM'
    },
    amenities: ['Fine Dining', 'Wine Bar', 'Outdoor Seating', 'Private Dining'],
    availableTimeSlots: ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM']
  },
  {
    // BACKEND FIELDS
    restaurant_id: 2,
    restaurant_name: 'Sakura Sushi & Grill',
    cuisine: 'Japanese',
    description: 'Fresh sushi and authentic Japanese cuisine in a contemporary setting.',
    fk_address_id: 2,

    // FRONTEND-ONLY FIELDS (for mockup only)
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1663530761401-15eefb544889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NTc2Mzk3MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '456 Cherry Blossom Ave, Midtown, CA 90211',
    phone: '+1-555-0456',
    email: 'info@sakurasushi.com',
    openingHours: {
      Monday: 'Closed',
      Tuesday: '12:00 PM - 2:30 PM, 5:30 PM - 10:00 PM',
      Wednesday: '12:00 PM - 2:30 PM, 5:30 PM - 10:00 PM',
      Thursday: '12:00 PM - 2:30 PM, 5:30 PM - 10:00 PM',
      Friday: '12:00 PM - 2:30 PM, 5:30 PM - 10:30 PM',
      Saturday: '12:00 PM - 10:30 PM',
      Sunday: '12:00 PM - 9:30 PM'
    },
    amenities: ['Sushi Bar', 'Teppanyaki', 'Sake Bar', 'Takeout Available'],
    availableTimeSlots: ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM']
  },
  {
    // BACKEND FIELDS
    restaurant_id: 3,
    restaurant_name: 'Mama Rosa\'s Trattoria',
    cuisine: 'Italian',
    description: 'Traditional Italian family recipes passed down through generations.',
    fk_address_id: 3,

    // FRONTEND-ONLY FIELDS (for mockup only)
    priceRange: '$$',
    rating: 4.3,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1744313983217-e24a659bf7c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjByZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTc2MTg3ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '789 Little Italy Street, North End, CA 90212',
    phone: '+1-555-0789',
    email: 'ciao@mamarosas.com',
    openingHours: {
      Monday: 'Closed',
      Tuesday: '4:00 PM - 9:00 PM',
      Wednesday: '4:00 PM - 9:00 PM',
      Thursday: '4:00 PM - 9:00 PM',
      Friday: '4:00 PM - 10:00 PM',
      Saturday: '12:00 PM - 10:00 PM',
      Sunday: '12:00 PM - 9:00 PM'
    },
    amenities: ['Wood-fired Pizza', 'Family Friendly', 'Italian Wine Selection', 'Outdoor Patio'],
    availableTimeSlots: ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM']
  },
  {
    // BACKEND FIELDS
    restaurant_id: 4,
    restaurant_name: 'Spice Route',
    cuisine: 'Indian',
    description: 'Authentic Indian cuisine with aromatic spices and traditional cooking methods.',
    fk_address_id: 4,

    // FRONTEND-ONLY FIELDS (for mockup only)
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 203,
    image: 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzU3NTg2NjE2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '321 Curry Lane, Spice District, CA 90213',
    phone: '+1-555-0321',
    email: 'hello@spiceroute.com',
    openingHours: {
      Monday: '11:30 AM - 2:30 PM, 5:00 PM - 9:30 PM',
      Tuesday: '11:30 AM - 2:30 PM, 5:00 PM - 9:30 PM',
      Wednesday: '11:30 AM - 2:30 PM, 5:00 PM - 9:30 PM',
      Thursday: '11:30 AM - 2:30 PM, 5:00 PM - 9:30 PM',
      Friday: '11:30 AM - 2:30 PM, 5:00 PM - 10:00 PM',
      Saturday: '11:30 AM - 10:00 PM',
      Sunday: '11:30 AM - 9:30 PM'
    },
    amenities: ['Vegetarian Options', 'Vegan Options', 'Halal Certified', 'Lunch Buffet'],
    availableTimeSlots: ['11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM']
  }
];

export const mockMenuItems = [
  // The Garden Bistro menu
  {
    id: '1',
    restaurantId: '1',
    name: 'Coq au Vin',
    description: 'Classic French braised chicken in red wine with pearl onions and mushrooms',
    price: 28,
    category: 'food',
    allergens: ['gluten']
  },
  {
    id: '2',
    restaurantId: '1',
    name: 'Bouillabaisse',
    description: 'Traditional Provençal fish stew with saffron and rouille',
    price: 32,
    category: 'food',
    allergens: ['shellfish', 'gluten']
  },
  // Sakura Sushi & Grill menu
  {
    id: '3',
    restaurantId: '2',
    name: 'Omakase Platter',
    description: 'Chef\'s selection of 8 pieces of premium sushi',
    price: 45,
    category: 'food',
    allergens: []
  },
  {
    id: '4',
    restaurantId: '2',
    name: 'Chicken Teriyaki Bento',
    description: 'Grilled chicken with teriyaki sauce, rice, miso soup, and sides',
    price: 18,
    category: 'food',
    allergens: ['gluten']
  }
];

/**
 * BOOKINGS MOCK DATA
 *
 * Backend schema fields:
 * - booking_id, confirmation_code, customer_name, customer_email, customer_phone
 * - party_size, special_requests, booking_date, booking_time, status
 * - fk_seating_id, fk_restaurant_id
 *
 * IMPORTANT: The backend timestamps use 'booking_date' (DATE) and 'booking_time' (TIME)
 * not 'date' and 'time'. Frontend should map accordingly.
 *
 * NOTE: restaurantName is frontend-only (not in backend). It's used for display
 * but should be fetched via JOIN with restaurants table in real implementation.
 */
export const mockBookings = [
  {
    // BACKEND FIELDS
    booking_id: 1,
    confirmation_code: 'BK6F8K9J2L',
    customer_name: 'John Smith',
    customer_email: 'john.smith@email.com',
    customer_phone: '+1-555-1234',
    party_size: 2,
    special_requests: 'Window table preferred',
    booking_date: '2024-12-15',
    booking_time: '19:00',  // TIME format (24-hour)
    status: 'confirmed',
    fk_restaurant_id: 1,
    fk_seating_id: 1,

    // FRONTEND-ONLY FIELD (not in backend - fetched via JOIN)
    restaurantName: 'The Garden Bistro',
    createdAt: '2024-12-10T10:00:00Z'
  },
  {
    // BACKEND FIELDS
    booking_id: 2,
    confirmation_code: 'BK4N5M3P9X',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.j@email.com',
    customer_phone: '+1-555-5678',
    party_size: 4,
    special_requests: null,
    booking_date: '2024-12-16',
    booking_time: '18:30',  // TIME format (24-hour)
    status: 'pending',
    fk_restaurant_id: 2,
    fk_seating_id: 3,

    // FRONTEND-ONLY FIELD (not in backend - fetched via JOIN)
    restaurantName: 'Sakura Sushi & Grill',
    createdAt: '2024-12-12T14:30:00Z'
  },
  {
    // BACKEND FIELDS
    booking_id: 3,
    confirmation_code: 'BK7R2W5T8Q',
    customer_name: 'Michael Chen',
    customer_email: 'michael.chen@email.com',
    customer_phone: '+1-555-9012',
    party_size: 3,
    special_requests: 'Vegetarian options required',
    booking_date: '2024-12-17',
    booking_time: '17:30',  // TIME format (24-hour)
    status: 'confirmed',
    fk_restaurant_id: 4,
    fk_seating_id: 5,

    // FRONTEND-ONLY FIELD
    restaurantName: 'Spice Route',
    createdAt: '2024-12-13T09:15:00Z'
  }
];

/**
 * SEATING PLANS MOCK DATA
 *
 * Backend schema fields:
 * - seating_id, pax, table_type, table_number, is_available, fk_restaurant_id
 *
 * IMPORTANT: Backend uses:
 * - 'seating_id' not 'id'
 * - 'pax' for capacity (must be > 0)
 * - 'table_type' must be one of: 'vip', 'indoor', 'outdoor'
 * - 'table_number' as string (e.g., 'T1', 'VIP-1', 'PATIO-2')
 * - 'is_available' as boolean
 * - 'fk_restaurant_id' to link to restaurant
 *
 * NOTE: x, y coordinates are frontend-only for visualization.
 * Backend doesn't store layout positions - frontend can manage this separately.
 */
export const mockTables = [
  {
    // BACKEND FIELDS
    seating_id: 1,
    pax: 2,
    table_type: 'indoor',
    table_number: 'T1',
    is_available: false,  // Currently booked
    fk_restaurant_id: 1,

    // FRONTEND-ONLY FIELDS (for visualization)
    x: 100,
    y: 100
  },
  {
    // BACKEND FIELDS
    seating_id: 2,
    pax: 4,
    table_type: 'indoor',
    table_number: 'T2',
    is_available: true,
    fk_restaurant_id: 1,

    // FRONTEND-ONLY FIELDS
    x: 200,
    y: 100
  },
  {
    // BACKEND FIELDS
    seating_id: 3,
    pax: 6,
    table_type: 'vip',
    table_number: 'VIP-1',
    is_available: true,
    fk_restaurant_id: 1,

    // FRONTEND-ONLY FIELDS
    x: 100,
    y: 200
  },
  {
    // BACKEND FIELDS
    seating_id: 4,
    pax: 2,
    table_type: 'outdoor',
    table_number: 'PATIO-1',
    is_available: true,
    fk_restaurant_id: 1,

    // FRONTEND-ONLY FIELDS
    x: 300,
    y: 150
  },
  {
    // BACKEND FIELDS - For Restaurant 2 (Sakura Sushi)
    seating_id: 5,
    pax: 4,
    table_type: 'indoor',
    table_number: 'T1',
    is_available: false,  // Currently booked
    fk_restaurant_id: 2,

    // FRONTEND-ONLY FIELDS
    x: 100,
    y: 100
  }
];
