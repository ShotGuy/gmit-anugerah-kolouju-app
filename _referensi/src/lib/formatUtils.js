// Utility function for consistent number formatting across server and client
export const formatNumber = (num) => {
  if (typeof num !== "number") return num;

  // Use a consistent format that works on both server and client
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format currency in IDR
export const formatCurrency = (num) => {
  if (typeof num !== "number") return num;

  const formatted = formatNumber(num);
  return `Rp ${formatted}`;
};

// Format percentage
export const formatPercentage = (num, decimals = 1) => {
  if (typeof num !== "number") return num;

  return `${num.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (date, format = "DD/MM/YYYY") => {
  if (!date) return "";
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    default:
      return d.toLocaleDateString();
  }
};

export const formatUtils = {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
};
