const db = require('../db.js');

// Helper to promisify db.all
function dbAll(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// Get bookings for a specific restaurant - restaurantId, month and year are REQUIRED
function getBookingsByRestaurant(restaurantId, month, year) {
    if (!restaurantId) return Promise.reject(new Error('restaurantId is required'));
    if (!year) return Promise.reject(new Error('year is required'));
    if (!month) return Promise.reject(new Error('month is required'));

    // ensure month is two-digit
    const m = String(month).padStart(2, '0');
    const y = String(year);

    const sql = `
        SELECT *
        FROM bookings
        WHERE fkRestaurantId = ?
          AND strftime('%Y-%m', bookingDate) = ?
    `;
    return dbAll(sql, [restaurantId, `${y}-${m}`]);
}

// Get booking metrics for a specific restaurant
function getBookingMetrics(restaurantId, month, year) {
    if (!restaurantId) return Promise.reject(new Error('restaurantId is required'));
    if (!year) return Promise.reject(new Error('year is required'));
    if (!month) return Promise.reject(new Error('month is required'));

    const m = String(month).padStart(2, '0');
    const y = String(year);

    return Promise.all([
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ?`, [restaurantId, `${y}-${m}`]),
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = 'confirmed'`, [restaurantId, `${y}-${m}`]),
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = 'completed'`, [restaurantId, `${y}-${m}`]),
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = 'no_show'`, [restaurantId, `${y}-${m}`]),
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = 'cancelled'`, [restaurantId, `${y}-${m}`]),
    ]).then(([total, confirmed, completed, noShow, cancelled]) => ({
        "Total Bookings": total[0].count,
        "Confirmed Bookings": confirmed[0].count,
        "Completed Bookings": completed[0].count,
        "No Show Bookings": noShow[0].count,
        "Cancelled Bookings": cancelled[0].count,
    }));
}

// Get booking rates for a specific restaurant
function getBookingRates(restaurantId, month, year) {
    if (!restaurantId) return Promise.reject(new Error('restaurantId is required'));
    if (!year) return Promise.reject(new Error('year is required'));
    if (!month) return Promise.reject(new Error('month is required'));

    const m = String(month).padStart(2, '0');
    const y = String(year);
    const dateFilter = [restaurantId, `${y}-${m}`];

    return Promise.all([
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ?`, dateFilter),
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = 'completed'`, dateFilter),
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = 'no_show'`, dateFilter),
        dbAll(`SELECT COUNT(*) as count FROM bookings WHERE fkRestaurantId = ? AND strftime('%Y-%m', bookingDate) = ? AND status = 'cancelled'`, dateFilter),
    ]).then(([total, completed, noShow, cancelled]) => {
        const totalCount = total[0].count;
        return {
            "Completion Rate": totalCount > 0 ? ((completed[0].count / totalCount) * 100).toFixed(2) + '%' : '0%',
            "No Show Rate": totalCount > 0 ? ((noShow[0].count / totalCount) * 100).toFixed(2) + '%' : '0%',
            "Cancellation Rate": totalCount > 0 ? ((cancelled[0].count / totalCount) * 100).toFixed(2) + '%' : '0%',
        };
    });
}

// Daily booking count for a month
function getDailyBookingCount(restaurantId, month, year) {
    if (!restaurantId) return Promise.reject(new Error('restaurantId is required'));
    if (!year) return Promise.reject(new Error('year is required'));
    if (!month) return Promise.reject(new Error('month is required'));

    const m = String(month).padStart(2, '0');
    const y = String(year);

    const sql = `
        SELECT CAST(strftime('%d', bookingDate) AS INTEGER) AS day, COUNT(*) AS count
        FROM bookings
        WHERE fkRestaurantId = ?
          AND strftime('%Y-%m', bookingDate) = ?
        GROUP BY day
        ORDER BY day
    `;
    return dbAll(sql, [restaurantId, `${y}-${m}`]).then(rows => {
        const dim = new Date(Number(y), Number(m), 0).getDate();
        const out = Array.from({ length: dim }, (_, i) => ({ day: i + 1, count: 0 }));
        for (const r of rows) {
            if (r.day >= 1 && r.day <= dim) out[r.day - 1].count = r.count;
        }
        return out;
    });
}

// Detect and cache the primary key column name of the bookings table (e.g., "id" or "bookingId")
let BOOKINGS_PK_COL = null;
async function getBookingsPkColumn() {
    if (BOOKINGS_PK_COL) return BOOKINGS_PK_COL;
    const cols = await dbAll(`PRAGMA table_info('bookings')`);
    const pk = cols.find(c => c.pk === 1)?.name
        || cols.find(c => c.name === 'id')?.name
        || cols.find(c => c.name === 'bookingId')?.name;
    if (!pk) throw new Error('Unable to determine bookings primary key column');
    BOOKINGS_PK_COL = pk;
    return pk;
}

// Daily average review rating for a month (grouped by bookingDate)
async function getDailyAverageRating(restaurantId, month, year) {
    if (!restaurantId) return Promise.reject(new Error('restaurantId is required'));
    if (!year) return Promise.reject(new Error('year is required'));
    if (!month) return Promise.reject(new Error('month is required'));

    const m = String(month).padStart(2, '0');
    const y = String(year);
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
    const rows = await dbAll(sql, [restaurantId, `${y}-${m}`]);

    // Build full month with gaps filled (null average, 0 count)
    const dim = new Date(Number(y), Number(m), 0).getDate();
    const out = Array.from({ length: dim }, (_, i) => ({ day: i + 1, averageRating: null, reviewCount: 0 }));
    for (const r of rows) {
        if (r.day >= 1 && r.day <= dim) {
            out[r.day - 1].averageRating = r.avgRating !== null ? Number(r.avgRating) : null;
            out[r.day - 1].reviewCount = r.reviewCount;
        }
    }
    return out;
}

// Hourly heatmap (weekday x hour) for a month
function getHourlyHeatmapWeekday(restaurantId, month, year, statuses = ['confirmed', 'completed']) {
    if (!restaurantId) return Promise.reject(new Error('restaurantId is required'));
    if (!year) return Promise.reject(new Error('year is required'));
    if (!month) return Promise.reject(new Error('month is required'));

    const m = String(month).padStart(2, '0');
    const y = String(year);

    let st = Array.isArray(statuses)
        ? statuses
        : (typeof statuses === 'string' ? statuses.split(',').map(s => s.trim()) : []);
    st = st.filter(Boolean);
    if (!st.length) st = ['confirmed', 'completed'];

    const placeholders = st.map(() => '?').join(',');

    // Shift weekday: original %w => 0=Sun..6=Sat. Convert to 0=Mon..6=Sun.
    // Formula: CASE WHEN w='0' THEN 6 ELSE CAST(w AS INTEGER)-1 END
    const sql = `
        SELECT
            CASE
              WHEN strftime('%w', bookingDate) = '0' THEN 6
              ELSE CAST(strftime('%w', bookingDate) AS INTEGER) - 1
            END AS dow,                                   -- 0=Mon .. 6=Sun
            CAST(substr(bookingTime, 1, 2) AS INTEGER) AS hour,
            COUNT(*) AS count
        FROM bookings
        WHERE fkRestaurantId = ?
          AND strftime('%Y-%m', bookingDate) = ?
          AND status IN (${placeholders})
        GROUP BY dow, hour
        ORDER BY dow, hour
    `;

    return dbAll(sql, [restaurantId, `${y}-${m}`, ...st]).then(rows => {
        const matrix = Array.from({ length: 7 }, () => Array(24).fill(0)); // [Mon..Sun][0..23]
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
            mode: 'weekday',
            dayLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            matrix,
            maxCount,
            peak,
            totals: {
                byWeekday: totalsByWeekday,
                byHour: totalsByHour,
                total
            }
        };
    });
}

module.exports = {
    getBookingsByRestaurant,
    getBookingMetrics,
    getBookingRates,
    getDailyBookingCount,
    getDailyAverageRating,
    getHourlyHeatmapWeekday,
};
