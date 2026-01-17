/**
 * Utility functions for phone number formatting and validation
 * Specifically for Indonesian phone numbers with +62 format for WhatsApp
 */

/**
 * Format phone number to +62 format for WhatsApp
 * @param {string} phoneNumber - Raw phone number input
 * @returns {string} - Formatted phone number in +62 format
 */
export const formatPhoneToWhatsApp = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove all non-digits
  let cleanNumber = phoneNumber.replace(/\D/g, '');

  // Handle different input formats
  if (cleanNumber.startsWith('62')) {
    // Already has country code, just add +
    return `+${cleanNumber}`;
  } else if (cleanNumber.startsWith('0')) {
    // Starts with 0, replace with +62
    return `+62${cleanNumber.substring(1)}`;
  } else if (cleanNumber.startsWith('8')) {
    // Starts with 8 (without 0), add +62
    return `+62${cleanNumber}`;
  } else {
    // Assume it needs +62
    return `+62${cleanNumber}`;
  }
};

/**
 * Display phone number in readable format (remove + and add dashes)
 * @param {string} phoneNumber - Phone number in +62 format
 * @returns {string} - Readable format without + and with proper spacing
 */
export const displayPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove + and format with spaces
  const cleaned = phoneNumber.replace('+', '');

  // Format Indonesian number: +62 812-3456-7890
  if (cleaned.startsWith('62') && cleaned.length >= 10) {
    const countryCode = cleaned.substring(0, 2); // 62
    const prefix = cleaned.substring(2, 5); // 812
    const middle = cleaned.substring(5, 9); // 3456
    const end = cleaned.substring(9); // 7890

    return `${countryCode} ${prefix}-${middle}-${end}`;
  }

  return phoneNumber;
};

/**
 * Validate Indonesian phone number
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid Indonesian phone number
 */
export const validateIndonesianPhone = (phoneNumber) => {
  if (!phoneNumber) return false;

  // Handle +62 format directly (as typed by user)
  if (phoneNumber.startsWith('+62')) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('62')) {
      const numberAfterCountryCode = cleanNumber.substring(2);
      return numberAfterCountryCode.startsWith('8') &&
             numberAfterCountryCode.length >= 9 &&
             numberAfterCountryCode.length <= 13;
    }
  }

  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Indonesian phone numbers after country code should:
  // - Start with 8 (after 62)
  // - Be between 9-13 digits total (after 62)
  if (cleanNumber.startsWith('62')) {
    const numberAfterCountryCode = cleanNumber.substring(2);
    return numberAfterCountryCode.startsWith('8') &&
           numberAfterCountryCode.length >= 9 &&
           numberAfterCountryCode.length <= 13;
  }

  // If starts with 0
  if (cleanNumber.startsWith('0')) {
    const numberAfterZero = cleanNumber.substring(1);
    return numberAfterZero.startsWith('8') &&
           numberAfterZero.length >= 9 &&
           numberAfterZero.length <= 13;
  }

  // If starts with 8 directly
  if (cleanNumber.startsWith('8')) {
    return cleanNumber.length >= 9 && cleanNumber.length <= 13;
  }

  return false;
};

/**
 * Format phone number for input display (user-friendly)
 * @param {string} phoneNumber - Phone number in any format
 * @returns {string} - User-friendly format for input fields
 */
export const formatPhoneForInput = (phoneNumber) => {
  if (!phoneNumber) return '';

  // If it starts with +62, keep it as is
  if (phoneNumber.startsWith('+62')) {
    return phoneNumber;
  }

  // Remove all non-digits first
  let cleanNumber = phoneNumber.replace(/\D/g, '');

  // Convert to standard format starting with 0
  if (cleanNumber.startsWith('62')) {
    cleanNumber = '0' + cleanNumber.substring(2);
  } else if (!cleanNumber.startsWith('0') && cleanNumber.startsWith('8')) {
    cleanNumber = '0' + cleanNumber;
  }

  return cleanNumber;
};

/**
 * Generate WhatsApp URL from phone number
 * @param {string} phoneNumber - Phone number in any format
 * @param {string} message - Optional message to include
 * @returns {string} - WhatsApp URL
 */
export const generateWhatsAppUrl = (phoneNumber, message = '') => {
  const formattedNumber = formatPhoneToWhatsApp(phoneNumber);
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${formattedNumber.replace('+', '')}${message ? `?text=${encodedMessage}` : ''}`;
};

/**
 * Mask phone number for privacy display
 * @param {string} phoneNumber - Phone number to mask
 * @returns {string} - Masked phone number
 */
export const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  const formatted = formatPhoneForInput(phoneNumber);
  if (formatted.length < 8) return formatted;

  const start = formatted.substring(0, 4);
  const end = formatted.substring(formatted.length - 4);
  const middle = '*'.repeat(formatted.length - 8);

  return `${start}${middle}${end}`;
};

export default {
  formatPhoneToWhatsApp,
  displayPhoneNumber,
  validateIndonesianPhone,
  formatPhoneForInput,
  generateWhatsAppUrl,
  maskPhoneNumber
};