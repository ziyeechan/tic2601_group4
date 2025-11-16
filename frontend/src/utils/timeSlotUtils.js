/**
 * Generate 1-hour time slots between opening and closing time
 * Stops 1 hour before closing time (last seating)
 *
 * @param {string} openingTime - Time in HH:MM or HH:MM:SS format (e.g., "11:00" or "11:00:00")
 * @param {string} closingTime - Time in HH:MM or HH:MM:SS format (e.g., "22:00" or "22:00:00")
 * @returns {string[]} Array of time slots in HH:MM format (24-hour)
 *
 * @example
 * generateTimeSlots("11:00", "22:00")
 * // Returns: ["11:00", "12:00", "13:00", ..., "21:00"]
 */
export function generateTimeSlots(openingTime, closingTime) {
  if (!openingTime || !closingTime) {
    return [];
  }

  const slots = [];

  // Parse times - handle both "HH:MM" and "HH:MM:SS" formats
  const parseTime = (timeStr) => {
    const parts = timeStr.split(':');
    return parseInt(parts[0]); // Extract hour
  };

  const openHour = parseTime(openingTime);
  const closeHour = parseTime(closingTime);

  // Generate 1-hour slots from opening until 1 hour before closing
  // If closing is 22:00, last seating is 21:00, so we include hour 21
  for (let hour = openHour; hour < closeHour; hour++) {
    const paddedHour = String(hour).padStart(2, '0');
    slots.push(`${paddedHour}:00`);
  }

  // If no slots were generated (restaurant open for less than 1 hour),
  // return just the opening time as the only available slot
  if (slots.length === 0 && openHour < closeHour) {
    const paddedHour = String(openHour).padStart(2, '0');
    slots.push(`${paddedHour}:00`);
  }

  return slots;
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 *
 * @param {string} time24 - Time in HH:MM format (24-hour)
 * @returns {string} Time in HH:MM AM/PM format
 *
 * @example
 * convertTo12Hour("14:30")
 * // Returns: "2:30 PM"
 */
export function convertTo12Hour(time24) {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr);

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // 0 should be 12

  return `${hour}:${minute} ${ampm}`;
}

/**
 * Check if restaurant is closed (no opening/closing times)
 *
 * @param {string} openingTime
 * @param {string} closingTime
 * @returns {boolean}
 */
export function isRestaurantClosed(openingTime, closingTime) {
  return !openingTime || !closingTime;
}
