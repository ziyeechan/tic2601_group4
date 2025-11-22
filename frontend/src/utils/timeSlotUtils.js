/**
 * Generate 30-minute time slots between opening and closing time
 * Stops 1 hour before closing time (last seating)
 *
 * @param {string} openingTime - Time in HH:MM or HH:MM:SS format (e.g., "11:00" or "11:00:00")
 * @param {string} closingTime - Time in HH:MM or HH:MM:SS format (e.g., "22:00" or "22:00:00")
 * @returns {string[]} Array of time slots in HH:MM format (24-hour)
 *
 * @example
 * generateTimeSlots("11:00", "22:00")
 * // Returns: ["11:00", "11:30", "12:00", "12:30", ..., "20:30"]
 */
export function generateTimeSlots(openingTime, closingTime) {
  if (!openingTime || !closingTime) {
    return [];
  }

  const slots = [];

  // Parse times - handle both "HH:MM" and "HH:MM:SS" formats
  const parseTime = (timeStr) => {
    const parts = timeStr.split(":");
    const hour = parseInt(parts[0]);
    const minute = parts.length > 1 ? parseInt(parts[1]) : 0;
    return { hour, minute };
  };

  const { hour: openHour, minute: openMinute } = parseTime(openingTime);
  const { hour: closeHour, minute: closeMinute } = parseTime(closingTime);

  // Convert to total minutes for easier calculation
  let currentMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute - 60; // 1 hour before closing

  // Generate 30-minute slots
  while (currentMinutes <= closeMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    const paddedHour = String(hour).padStart(2, "0");
    const paddedMinute = String(minute).padStart(2, "0");
    slots.push(`${paddedHour}:${paddedMinute}`);
    currentMinutes += 30; // Add 30 minutes for next slot
  }

  // If no slots were generated, return just the opening time
  if (slots.length === 0 && openHour < closeHour) {
    const paddedHour = String(openHour).padStart(2, "0");
    const paddedMinute = String(openMinute).padStart(2, "0");
    slots.push(`${paddedHour}:${paddedMinute}`);
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
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr);

  const ampm = hour >= 12 ? "PM" : "AM";
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
