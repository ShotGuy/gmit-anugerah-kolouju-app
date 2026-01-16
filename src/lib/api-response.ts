export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  timestamp: string;
};

export const createResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  errors?: Record<string, string>,
): ApiResponse<T> => ({
  success,
  data,
  message,
  errors,
  timestamp: new Date().toISOString(),
});

