// ----- IMPORTS & CONFIGURATION -----

const db = require("../db.js");

// ----- CONSTANTS -----

const BOOKING_STATUSES = {
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
  CANCELLED: "cancelled",
};

// ----- DATABASE HELPERS -----

// Helper to promisify db.all
function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Detect and cache the primary key column name of the bookings table
let BOOKINGS_PK_COL = null;
async function getBookingsPkColumn() {
  if (BOOKINGS_PK_COL) return BOOKINGS_PK_COL;
  const cols = await dbAll(`PRAGMA table_info('bookings')`);
  const pk =
    cols.find((c) => c.pk === 1)?.name ||
    cols.find((c) => c.name === "id")?.name ||
    cols.find((c) => c.name === "bookingId")?.name;
  if (!pk) throw new Error("Unable to determine bookings primary key column");
  BOOKINGS_PK_COL = pk;
  return pk;
}

// ----- VALIDATION HELPERS -----

// Validate and normalize analytics parameters (restaurantId, month, year)
function validateAnalyticsParams(restaurantId, month, year) {
  if (!restaurantId) throw new Error("restaurantId is required");
  if (!year) throw new Error("year is required");
  if (!month) throw new Error("month is required");

  const m = String(month).padStart(2, "0");
  const y = String(year);

  return {
    restaurantId,
    year: y,
    month: m,
    yearMonth: `${y}-${m}`,
  };
}

// ----- RESTAURANT QUERIES -----

// Get list of existing restaurants for dropdown (restaurantId aliased as id)
function getRestaurants() {
  const sql = `SELECT restaurantId AS id, restaurantName FROM restaurants ORDER BY restaurantName`;
  return dbAll(sql);
}

// ----- BOOKING QUERIES -----

// Get bookings for a specific restaurant, month, and year
function getBookingsByRestaurant(restaurantId, month, year) {
  const { yearMonth } = validateAnalyticsParams(restaurantId, month, year);

  const sql = `
        SELECT *
        FROM bookings
        WHERE fkRestaurantId = ?
          AND strftime('%Y-%m', bookingDate) = ?
    `;
  return dbAll(sql, [restaurantId, yearMonth]);
}

// Daily booking count for a month (fills gaps with zeros)
function getDailyBookingCount(restaurantId, month, year) {
  const params = validateAnalyticsParams(restaurantId, month, year);

  const sql = `
        SELECT CAST(strftime('%d', bookingDate) AS INTEGER) AS day, COUNT(*) AS count
        FROM bookings
        WHERE fkRestaurantId = ?
          AND strftime('%Y-%m', bookingDate) = ?
        GROUP BY day
        ORDER BY day
    `;

  return dbAll(sql, [restaurantId, params.yearMonth]).then((rows) => {
    const daysInMonth = new Date(Number(params.year), Number(params.month), 0).getDate();
    const result = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, count: 0 }));

    for (const r of rows) {
      if (r.day >= 1 && r.day <= daysInMonth) {
        result[r.day - 1].count = r.count;
      }
    }
    return result;
  });
}

// Hourly heatmap (weekday x hour) for a month
function getHourlyHeatmapWeekday(
  restaurantId,
  month,
  year,
  statuses = [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.COMPLETED]
) {
  const params = validateAnalyticsParams(restaurantId, month, year);

  // Normalize statuses input
  let st = Array.isArray(statuses)
    ? statuses
    : typeof statuses === "string"
      ? statuses.split(",").map((s) => s.trim())
      : [];
  st = st.filter(Boolean);
  if (!st.length) st = [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.COMPLETED];

  const placeholders = st.map(() => "?").join(",");

  // Shift weekday: 0=Sun..6=Sat → 0=Mon..6=Sun
  const sql = `
        SELECT
            CASE
              WHEN strftime('%w', bookingDate) = '0' THEN 6
              ELSE CAST(strftime('%w', bookingDate) AS INTEGER) - 1
            END AS dow,
            CAST(substr(bookingTime, 1, 2) AS INTEGER) AS hour,
            COUNT(*) AS count
        FROM bookings
        WHERE fkRestaurantId = ?
          AND strftime('%Y-%m', bookingDate) = ?
          AND status IN (${placeholders})
        GROUP BY dow, hour
        ORDER BY dow, hour
    `;

  return dbAll(sql, [restaurantId, params.yearMonth, ...st]).then((rows) => {
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
    const totalsByWeekday = Array(7).fill(0);
    const totalsByHour = Array(24).fill(0);
    let maxCount = 0;
    let total = 0;
    let peak = { dow: 0, hour: 0, count: 0 };

    for (const r of rows) {
      if (r.dow >= 0 && r.dow <= 6 && r.hour >= 0 && r.hour <= 23) {
        matrix[r.dow][r.hour] = r.count;
        totalsByWeekday[r.dow] += r.count;
        totalsByHour[r.hour] += r.count;
        total += r.count;
        if (r.count > maxCount) {
          maxCount = r.count;
          peak = { dow: r.dow, hour: r.hour, count: r.count };
        }
      }
    }

    return {
      mode: "weekday",
      dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      matrix,
      maxCount,
      peak,
      totals: {
        byWeekday: totalsByWeekday,
        byHour: totalsByHour,
        total,
      },
    };
  });
}

// ----- BOOKING METRICS & ANALYTICS -----

// Get booking metrics (counts by status)
function getBookingMetrics(restaurantId, month, year) {
  const { yearMonth } = validateAnalyticsParams(restaurantId, month, year);

  const queries = [
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ?`,
      [restaurantId, yearMonth]
    ),
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = ?`,
      [restaurantId, yearMonth, BOOKING_STATUSES.CONFIRMED]
    ),
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = ?`,
      [restaurantId, yearMonth, BOOKING_STATUSES.COMPLETED]
    ),
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = ?`,
      [restaurantId, yearMonth, BOOKING_STATUSES.NO_SHOW]
    ),
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = ?`,
      [restaurantId, yearMonth, BOOKING_STATUSES.CANCELLED]
    ),
  ];

  return Promise.all(queries).then(([total, confirmed, completed, noShow, cancelled]) => ({
    "Total Bookings": total[0].count,
    "Confirmed Bookings": confirmed[0].count,
    "Completed Bookings": completed[0].count,
    "No Show Bookings": noShow[0].count,
    "Cancelled Bookings": cancelled[0].count,
  }));
}

// Get booking rates (percentages by status)
function getBookingRates(restaurantId, month, year) {
  const { yearMonth } = validateAnalyticsParams(restaurantId, month, year);

  const queries = [
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ?`,
      [restaurantId, yearMonth]
    ),
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = ?`,
      [restaurantId, yearMonth, BOOKING_STATUSES.COMPLETED]
    ),
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = ?`,
      [restaurantId, yearMonth, BOOKING_STATUSES.NO_SHOW]
    ),
    dbAll(
      `SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = ?`,
      [restaurantId, yearMonth, BOOKING_STATUSES.CANCELLED]
    ),
  ];

  return Promise.all(queries).then(([total, completed, noShow, cancelled]) => {
    const totalCount = total[0].count;
    return {
      "Completion Rate":
        totalCount > 0 ? ((completed[0].count / totalCount) * 100).toFixed(2) + "%" : "0%",
      "No Show Rate":
        totalCount > 0 ? ((noShow[0].count / totalCount) * 100).toFixed(2) + "%" : "0%",
      "Cancellation Rate":
        totalCount > 0 ? ((cancelled[0].count / totalCount) * 100).toFixed(2) + "%" : "0%",
    };
  });
}

// ----- REVIEW QUERIES -----

// Daily average review rating for a month (grouped by bookingDate, fills gaps)
async function getDailyAverageRating(restaurantId, month, year) {
  const params = validateAnalyticsParams(restaurantId, month, year);
  const pk = await getBookingsPkColumn();

  const sql = `
        SELECT CAST(strftime('%d', b.bookingDate) AS INTEGER) AS day,
               ROUND(AVG(r.rating), 2) AS avgRating,
               COUNT(r.rating) AS reviewCount
        FROM reviews r
        INNER JOIN bookings b ON b.${pk} = r.fkBookingId
        WHERE b.fkRestaurantId = ?
          AND strftime('%Y-%m', b.bookingDate) = ?
        GROUP BY day
        ORDER BY day
    `;

  const rows = await dbAll(sql, [restaurantId, params.yearMonth]);

  // Fill gaps with null average and 0 count
  const daysInMonth = new Date(Number(params.year), Number(params.month), 0).getDate();
  const result = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    averageRating: null,
    reviewCount: 0,
  }));

  for (const r of rows) {
    if (r.day >= 1 && r.day <= daysInMonth) {
      result[r.day - 1].averageRating = r.avgRating !== null ? Number(r.avgRating) : null;
      result[r.day - 1].reviewCount = r.reviewCount;
    }
  }
  return result;
}

// ----- EXPORTS -----

module.exports = {
  getRestaurants,
  getBookingsByRestaurant,
  getDailyBookingCount,
  getHourlyHeatmapWeekday,
  getBookingMetrics,
  getBookingRates,
  getDailyAverageRating,
};
