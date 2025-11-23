/**
 * Format a full address from address object
 * @param {Object} address - Address object with addressLine1, addressLine2, city, state, country, postalCode
 * @returns {string} Formatted address string
 */
export const formatFullAddress = (address) => {
  if (!address) return "Address not available";

  const parts = [];

  if (address.addressLine1) parts.push(address.addressLine1);
  if (address.addressLine2) parts.push(address.addressLine2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);

  return parts.join(", ");
};
