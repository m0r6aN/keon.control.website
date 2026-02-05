/**
 * API Error Types
 * Centralized error handling for KEON Control API
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, undefined, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string) {
    super(message, undefined, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, statusCode, 'SERVER_ERROR', details);
    this.name = 'ServerError';
  }
}

/**
 * Parse API error response
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Network request failed. Check your connection and ensure the API is running.');
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('An unknown error occurred');
}
