// API Response Helper untuk konsistensi response format
export const apiResponse = (
  success,
  data = null,
  message = "",
  errors = null
) => {
  return {
    success,
    data,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

// Standard Error Response Handler
export const handleApiError = (res, error, message = "Server error") => {
  console.error(`API Error: ${message}`, error);

  return res.status(500).json(apiResponse(false, null, message, error.message));
};

// Validation Error Response
export const validationError = (res, errors) => {
  return res
    .status(400)
    .json(apiResponse(false, null, "Validasi gagal", errors));
};

// Not Found Error Response
export const notFoundError = (res, message = "Data tidak ditemukan") => {
  return res.status(404).json(apiResponse(false, null, message));
};

// Conflict Error Response (Duplikasi)
export const conflictError = (
  res,
  message = "Data sudah ada",
  errors = null
) => {
  return res.status(409).json(apiResponse(false, null, message, errors));
};

// Success Response
export const successResponse = (
  res,
  data = null,
  message = "Berhasil",
  statusCode = 200
) => {
  return res.status(statusCode).json(apiResponse(true, data, message));
};

// Method Not Allowed Response
export const methodNotAllowed = (res, method) => {
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);

  return res
    .status(405)
    .json(apiResponse(false, null, `Method ${method} not allowed`));
};

// Standard Pagination Helper
export const buildPagination = (page, limit, total) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const totalPages = Math.ceil(total / limitNum);

  return {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    hasNext: pageNum < totalPages,
    hasPrev: pageNum > 1,
  };
};
