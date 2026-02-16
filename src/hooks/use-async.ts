/**
 * useAsync Hook
 * Manages async operations with loading, error, and data states
 */

import { useState, useCallback, useEffect } from 'react';
import { handleApiError } from '@/lib/api/errorHandler';

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  immediate?: boolean;
}

export interface UseAsyncReturn<T, Args extends any[]> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing async operations
 * 
 * @param asyncFunction - The async function to execute
 * @param options - Configuration options
 * @returns Object with state and control functions
 * 
 * @example
 * const { data, isLoading, error, execute } = useAsync(
 *   async (id: string) => fetchUser(id),
 *   {
 *     onSuccess: (user) => console.log('User loaded:', user),
 *     onError: (error) => console.error('Failed to load user:', error)
 *   }
 * );
 * 
 * // Execute the async function
 * await execute('user-123');
 */
export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T, Args> {
  const { onSuccess, onError, immediate = false } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({
        data: null,
        error: null,
        isLoading: true,
        isError: false,
        isSuccess: false,
      });

      try {
        const result = await asyncFunction(...args);

        setState({
          data: result,
          error: null,
          isLoading: false,
          isError: false,
          isSuccess: true,
        });

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error: any) {
        const { message } = handleApiError(error);

        setState({
          data: null,
          error: message,
          isLoading: false,
          isError: true,
          isSuccess: false,
        });

        if (onError) {
          onError(message);
        }

        return null;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    });
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, [immediate]); // Only run on mount if immediate is true

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for managing form submissions with async operations
 * Similar to useAsync but optimized for form handling
 * 
 * @param submitFunction - The async function to execute on form submit
 * @param options - Configuration options
 * @returns Object with state and control functions
 * 
 * @example
 * const { isSubmitting, error, handleSubmit } = useAsyncForm(
 *   async (data) => submitContactForm(data),
 *   {
 *     onSuccess: () => {
 *       toast({ title: 'Form submitted successfully!' });
 *       reset();
 *     }
 *   }
 * );
 */
export function useAsyncForm<T, Args extends any[] = []>(
  submitFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const asyncState = useAsync(submitFunction, options);

  return {
    ...asyncState,
    isSubmitting: asyncState.isLoading,
    handleSubmit: asyncState.execute,
  };
}
