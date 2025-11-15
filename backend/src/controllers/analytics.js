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

module.exports = {
    getBookingsByRestaurant,
    getBookingMetrics,
};
