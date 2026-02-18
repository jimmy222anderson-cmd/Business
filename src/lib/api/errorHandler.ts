/**
 * API Error Handler
 * Provides user-friendly error messages for different error types
 */

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  statusCode: number;
  originalError?: any;
  data?: any;

  constructor(message: string, statusCode: number, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.data = originalError;
  }
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyErrorMessage(error: any): string {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // API errors with status codes
  if (error instanceof ApiError || error.statusCode) {
    const statusCode = error.statusCode || error.status;

    switch (statusCode) {
      case 400:
        return error.message || 'Invalid request. Please check your input and try again.';
      
      case 401:
        return 'You are not authenticated. Please sign in and try again.';
      
      case 403:
        return 'You do not have permission to perform this action.';
      
      case 404:
        return 'The requested resource was not found.';
      
      case 409:
        return error.message || 'This resource already exists or there is a conflict.';
      
      case 422:
        return error.message || 'Validation failed. Please check your input.';
      
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      
      case 500:
        return 'An internal server error occurred. Please try again later.';
      
      case 502:
      case 503:
      case 504:
        return 'The server is temporarily unavailable. Please try again later.';
      
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // Generic errors
  if (error instanceof Error) {
    return error.message;
  }

  // Unknown errors
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: any): { message: string; statusCode?: number } {
  console.error('API Error:', error);

  const message = getUserFriendlyErrorMessage(error);
  const statusCode = error.statusCode || error.status;

  return { message, statusCode };
}

/**
 * Parse error response from fetch
 */
export async function parseErrorResponse(response: Response): Promise<ApiError> {
  let errorMessage = `HTTP error! status: ${response.status}`;
  let errorData: any = null;

  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } else {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }
  } catch (parseError) {
    // If parsing fails, use default message
    console.error('Error parsing error response:', parseError);
  }

  return new ApiError(errorMessage, response.status, errorData);
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') || 
     error.message.includes('network') ||
     error.message.includes('Failed to fetch'))
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  const statusCode = error.statusCode || error.status;
  return statusCode === 401;
}

/**
 * Check if error is an authorization error
 */
export function isAuthorizationError(error: any): boolean {
  const statusCode = error.statusCode || error.status;
  return statusCode === 403;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  const statusCode = error.statusCode || error.status;
  return statusCode === 400 || statusCode === 422;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: any): boolean {
  const statusCode = error.statusCode || error.status;
  return statusCode === 404;
}

/**
 * Check if error is a server error
 */
export function isServerError(error: any): boolean {
  const statusCode = error.statusCode || error.status;
  return statusCode >= 500 && statusCode < 600;
}

/**
 * Extract validation errors from error response
 */
export function extractValidationErrors(error: any): Record<string, string> | null {
  if (!isValidationError(error)) {
    return null;
  }

  const errors: Record<string, string> = {};

  // Check for common validation error formats
  if (error.originalError?.errors) {
    // Format: { errors: { field: 'message' } }
    if (typeof error.originalError.errors === 'object') {
      return error.originalError.errors;
    }

    // Format: { errors: [{ field: 'field', message: 'message' }] }
    if (Array.isArray(error.originalError.errors)) {
      error.originalError.errors.forEach((err: any) => {
        if (err.field && err.message) {
          errors[err.field] = err.message;
        }
      });
      return errors;
    }
  }

  // Check for validation details in message
  if (error.originalError?.validationErrors) {
    return error.originalError.validationErrors;
  }

  return null;
}
