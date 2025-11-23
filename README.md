# MakanTime - Restaurant Reservation & Management System

**TIC2601 Group 4 Project**

## About MakanTime

MakanTime is a comprehensive restaurant reservation and management platform designed to streamline operations for both customers and restaurant staff. The system enables customers to discover restaurants, make reservations, and leave reviews while providing restaurant managers with powerful tools to manage bookings, seating arrangements, and operations efficiently.

**Key Goals:**

- Provide customers with a seamless online booking experience
- Reduce booking errors and improve operational efficiency
- Enable restaurant staff to manage reservations and tables effectively
- Optimize table turnover and customer satisfaction

## Team Members

- Ginna Tai
- Zheng Shao Bin
- Cheng Wei Xian
- Chan Zi Yee
- Jerin Paul

---

## Getting Started

### Prerequisites

Before running the project, ensure you have:

- Node.js installed
- npm (Node Package Manager)
- SQLite database support

### Project Setup

1. **Clone/Navigate to project directory**

   ```bash
   cd tic2601_group4
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

---

## Project Structure

### Backend Architecture

```
backend/
├── server.js                 # Main server entry point
├── database/
│   ├── connection.js        # SQLite database connection
│   └── loadData.js          # Data seeding script
├── src/
│   ├── routes/              # API endpoint definitions
│   ├── controllers/         # Business logic for endpoints
│   ├── models/              # Sequelize ORM queries
│   └── schemas/             # Database table definitions
└── makan_time.db            # SQLite database file
```

### Data Flow

```
Request → routes.js → controllers/ → models/ → SQLite
                                      ↓
                                  Schemas/
                                (create tables)
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/          # React components for each feature
│   ├── utils/               # API integration & utilities
│   └── App.jsx              # Main app component
├── package.json
└── vite.config.js           # Vite configuration
```

---

## Running the Application

### Step 1: Start the Backend Server

```bash
cd backend
npm start
```

**Important: Database Seeding with loadData**

The backend includes a `loadData.js` script that populates the database with sample data. To enable it:

1. **Open `backend/server.js`**

2. **Find the `onFirstLoad` variable (line 19):**

   ```javascript
   const onFirstLoad = true; // Change from false to true
   ```

3. **What this does:**

   - Sets database to create fresh tables using schemas
   - Runs `loadData.js` to populate with sample restaurants, bookings, reviews, menus, and promotions
   - Initializes the system with demo data for testing

4. **After seeding is complete:**

   ```javascript
   const onFirstLoad = false; // Change back to false
   ```

   **⚠️ Important:** Set `onFirstLoad` back to `false` after seeding. If left as `true`, the database will reset every time you restart the server, losing all your data.

**Server Output When Running:**

```
Server is Listening on: http://localhost:3000/
Connection to SQLite is successful
Loading sample data into database...
✓ Sample data loaded successfully
```

---

### Step 2: Start the Frontend Server

In a new terminal window:

```bash
cd frontend
npm run dev
```

The frontend will typically run on `http://localhost:5173`

**Frontend Output:**

```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## Features Overview

### For Customers (UC1-UC5)

1. **UC1: Discover & Filter Restaurants**

   - Search by name, cuisine, rating, dietary type
   - View restaurant details, menus, and reviews
   - Optimized single API call for performance

2. **UC2: Make Reservations**

   - Select restaurant, date, time, and party size
   - Automatic table assignment based on availability
   - Instant confirmation code

3. **UC3: Manage Reservations**
   - View all bookings by email (no login required)
   - Modify or cancel reservations
   - Track confirmation codes

### For Administrators (UC4-UC10)

4. **UC4: View All Bookings**

   - Real-time booking dashboard
   - Filter by status and date

5. **UC5: Update Booking Status**

   - Mark bookings as confirmed, seated, completed, cancelled
   - Track no-shows

6. **UC6: Manage Seating Plan**

   - Create and arrange tables (drag-and-drop)
   - Manage daily time slot availability
   - Assign bookings to tables with conflict detection
   - Prevent double-booking with 90-minute dining window

7. **UC7: Edit Restaurant Information (Admin)**

   - Edit restaurant details (name, cuisine, description, phone, email)
   - Edit address information (street, city, state, country, postal code)
   - Real-time database persistence with validation

8. **UC8: View Analytics**

   - Booking trends and metrics
   - Rating trends and distribution
   - Hourly heatmap for peak times

9. **UC9: Manage Promotions**

   - Create and manage restaurant promotions
   - Set discount percentages and validity periods

10. **UC10: Submit & View Reviews**
    - Customers can review completed bookings
    - Rate 1-5 stars with comments
    - Duplicate review prevention via database constraints
    - Backend-calculated rating statistics

---

## Technology Stack

| Layer        | Technologies          |
| ------------ | --------------------- |
| **Frontend** | React, Vite, Axios    |
| **Backend**  | Node.js, Express.js   |
| **Database** | SQLite, Sequelize ORM |
| **Styling**  | CSS3                  |

---

## API Endpoints Summary

### Restaurant Endpoints

- `GET /restaurant/all` - Get all restaurants
- `GET /restaurant/search` - Search with filters (cuisine, rating, promotions, dietary)
- `GET /restaurant/id/:id` - Get specific restaurant

### Booking Endpoints

- `POST /booking` - Create new booking
- `GET /booking/all` - Get all bookings (admin)
- `GET /booking/email/:email` - Get bookings by customer email
- `PUT /booking/:id` - Update booking
- `PUT /booking/:id/status` - Update booking status
- `DELETE /booking/:id` - Cancel booking

### Seating Plan Endpoints

- `POST /seating/:restaurantId` - Create table
- `GET /seating/:restaurantId` - Get all tables for restaurant
- `PUT /seating/:id` - Update table
- `DELETE /seating/:id` - Delete table

### Review Endpoints

- `POST /review/:restaurantId/:bookingId` - Submit review
- `GET /review/restaurant/:restaurantId` - Get reviews for restaurant (with pagination)
- `PUT /review/:id` - Update review
- `DELETE /review/:id` - Delete review

### Analytics Endpoints

- `GET /analytics/bookings` - Get booking analytics
- `GET /analytics/bookings/metrics` - Get booking metrics

---
