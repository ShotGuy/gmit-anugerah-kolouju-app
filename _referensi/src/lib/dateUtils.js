/**
 * Utility functions for handling dates in API endpoints
 * Ensures consistent date formatting for Prisma/database operations
 */

/**
 * Convert various date formats to ISO DateTime string for Prisma
 * @param {string|Date} dateInput - Date input in various formats
 * @returns {string} ISO DateTime string
 */
export function formatDateForDatabase(dateInput) {
  if (!dateInput) return null;

  let date;

  if (typeof dateInput === 'string') {
    // If it's just a date string (YYYY-MM-DD), add time component
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/) && !dateInput.includes('T')) {
      date = new Date(dateInput + 'T00:00:00.000Z');
    } else {
      date = new Date(dateInput);
    }
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    // Try to convert other formats
    date = new Date(dateInput);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateInput}`);
  }

  return date.toISOString();
}

/**
 * Process an object's date fields to ensure proper formatting
 * @param {object} data - Data object that may contain date fields
 * @param {string[]} dateFields - Array of field names that contain dates
 * @returns {object} Data object with properly formatted dates
 */
export function processDateFields(data, dateFields = ['tanggalLahir', 'tanggal']) {
  if (!data || typeof data !== 'object') return data;

  const processedData = { ...data };

  dateFields.forEach(field => {
    if (processedData[field]) {
      try {
        processedData[field] = formatDateForDatabase(processedData[field]);
      } catch (error) {
        throw new Error(`Error processing ${field}: ${error.message}`);
      }
    }
  });

  return processedData;
}

/**
 * Format date for display in frontend
 * @param {string|Date} dateInput - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDateForDisplay(dateInput, options = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta'
}) {
  if (!dateInput) return '-';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', options);
}

/**
 * Format datetime for display in frontend
 * @param {string|Date} dateInput - Date to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTimeForDisplay(dateInput) {
  return formatDateForDisplay(dateInput, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
}