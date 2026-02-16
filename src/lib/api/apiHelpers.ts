/**
 * API Helper Functions
 * Utilities for common API operations with toast notifications
 */

import { toast } from "@/hooks/use-toast";
import { handleApiError } from "./errorHandler";

export interface ApiCallOptions<T> {
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Execute an API call with automatic toast notifications
 * 
 * @param apiCall - The API function to execute
 * @param options - Configuration options
 * @returns Promise with the API response or null on error
 * 
 * @example
 * const result = await executeApiCall(
 *   () => createDemoBooking(formData),
 *   {
 *     successTitle: 'Demo Booked!',
 *     successDescription: 'We will contact you soon.',
 *     onSuccess: () => navigate('/dashboard')
 *   }
 * );
 */
export async function executeApiCall<T>(
  apiCall: () => Promise<T>,
  options: ApiCallOptions<T> = {}
): Promise<T | null> {
  const {
    successTitle,
    successDescription,
    errorTitle = "Error",
    showErrorToast = true,
    showSuccessToast = true,
    onSuccess,
    onError,
  } = options;

  try {
    const result = await apiCall();

    // Show success toast if enabled
    if (showSuccessToast && (successTitle || successDescription)) {
      toast({
        title: successTitle || "Success",
        description: successDescription,
      });
    }

    // Call success callback
    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error: any) {
    const { message } = handleApiError(error);

    // Show error toast if enabled
    if (showErrorToast) {
      toast({
        title: errorTitle,
        description: message,
        variant: "destructive",
      });
    }

    // Call error callback
    if (onError) {
      onError(message);
    }

    return null;
  }
}

/**
 * Execute a form submission with automatic toast notifications and form reset
 * 
 * @param apiCall - The API function to execute
 * @param resetForm - Function to reset the form
 * @param options - Configuration options
 * @returns Promise with the API response or null on error
 * 
 * @example
 * const result = await executeFormSubmission(
 *   () => submitContactForm(formData),
 *   reset,
 *   {
 *     successTitle: 'Message Sent!',
 *     successDescription: 'We will get back to you soon.'
 *   }
 * );
 */
export async function executeFormSubmission<T>(
  apiCall: () => Promise<T>,
  resetForm?: () => void,
  options: ApiCallOptions<T> = {}
): Promise<T | null> {
  const result = await executeApiCall(apiCall, {
    ...options,
    onSuccess: (data) => {
      // Reset form on success
      if (resetForm) {
        resetForm();
      }

      // Call original success callback
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });

  return result;
}

/**
 * Execute an API call with redirect on success
 * 
 * @param apiCall - The API function to execute
 * @param redirectTo - URL to redirect to on success
 * @param navigate - Navigation function from react-router
 * @param options - Configuration options
 * @returns Promise with the API response or null on error
 * 
 * @example
 * await executeWithRedirect(
 *   () => signIn(credentials),
 *   '/dashboard',
 *   navigate,
 *   { successTitle: 'Welcome back!' }
 * );
 */
export async function executeWithRedirect<T>(
  apiCall: () => Promise<T>,
  redirectTo: string,
  navigate: (path: string) => void,
  options: ApiCallOptions<T> = {}
): Promise<T | null> {
  return executeApiCall(apiCall, {
    ...options,
    onSuccess: (data) => {
      // Call original success callback
      if (options.onSuccess) {
        options.onSuccess(data);
      }

      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate(redirectTo);
      }, 500);
    },
  });
}

/**
 * Show a success toast notification
 */
export function showSuccessToast(title: string, description?: string) {
  toast({
    title,
    description,
  });
}

/**
 * Show an error toast notification
 */
export function showErrorToast(title: string, description?: string) {
  toast({
    title,
    description,
    variant: "destructive",
  });
}

/**
 * Show an info toast notification
 */
export function showInfoToast(title: string, description?: string) {
  toast({
    title,
    description,
  });
}
