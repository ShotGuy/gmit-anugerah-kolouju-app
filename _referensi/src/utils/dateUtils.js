/**
 * Date utility functions for formatting and calculating dates
 */

/**
 * Format date to Indonesian locale string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    const defaultOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Makassar', // WITA timezone for NTT
      ...options
    };

    return new Intl.DateTimeFormat('id-ID', defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format date to short format (dd/mm/yyyy)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Makassar'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date short:', error);
    return '-';
  }
};

/**
 * Format datetime to Indonesian locale string with time
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';

  try {
    const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Makassar'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '-';
  }
};

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  try {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;

    if (isNaN(birth.getTime())) {
      return 0;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return Math.max(0, age); // Ensure age is not negative
  } catch (error) {
    console.error('Error calculating age:', error);
    return 0;
  }
};

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();

    return dateObj.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPast = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);

    return dateObj < today;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFuture = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);

    return dateObj > today;
  } catch (error) {
    return false;
  }
};

/**
 * Get relative time string (e.g., "2 hari yang lalu", "dalam 3 hari")
 * @param {string|Date} date - Date to get relative time for
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hari ini';
    } else if (diffInDays === 1) {
      return 'Besok';
    } else if (diffInDays === -1) {
      return 'Kemarin';
    } else if (diffInDays > 1) {
      return `Dalam ${diffInDays} hari`;
    } else {
      return `${Math.abs(diffInDays)} hari yang lalu`;
    }
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '-';
  }
};

/**
 * Format time only (HH:mm)
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} Formatted time string
 */
export const formatTime = (datetime) => {
  if (!datetime) return '-';

  try {
    const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Makassar'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '-';
  }
};

/**
 * Parse date string in various formats
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;

  try {
    // Try to parse the date string
    const date = new Date(dateString);

    // Check if the parsed date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Get start of day (00:00:00)
 * @param {string|Date} date - Date
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date = new Date()) => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Get end of day (23:59:59)
 * @param {string|Date} date - Date
 * @returns {Date} End of day
 */
export const getEndOfDay = (date = new Date()) => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Add days to a date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
export const addDays = (date, days) => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Subtract days from a date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {Date} New date with days subtracted
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};