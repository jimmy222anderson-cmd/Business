import { toast } from "@/hooks/use-toast";
import { handleApiError } from "./api/errorHandler";

/**
 * Shared form submission handler utility
 * Handles form submission with loading state, success/error notifications, and form reset
 * 
 * @param data - The form data to submit
 * @param options - Configuration options for the submission
 * @returns Promise that resolves when submission is complete
 */
export async function handleFormSubmission<T>(
  data: T,
  options: {
    successTitle?: string;
    successDescription?: string;
    errorTitle?: string;
    errorDescription?: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    simulateDelay?: number;
  } = {}
): Promise<void> {
  const {
    successTitle = "Success!",
    successDescription = "Your request has been submitted.",
    errorTitle = "Error",
    errorDescription = "Something went wrong. Please try again.",
    onSuccess,
    onError,
    simulateDelay = 1000,
  } = options;

  try {
    // Placeholder for Phase 3 backend integration
    // await submitFormToBackend(data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, simulateDelay));
    
    // Show success message
    toast({
      title: successTitle,
      description: successDescription,
    });
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    const { message } = handleApiError(error);
    
    // Show error message
    toast({
      title: errorTitle,
      description: message || errorDescription,
      variant: "destructive",
    });
    
    // Call error callback if provided
    if (onError && error instanceof Error) {
      onError(error);
    }
    
    // Re-throw error for caller to handle if needed
    throw error;
  }
}

/**
 * Industry options for Request Quote form
 */
export const industryOptions = [
  "Financial Services",
  "Agriculture",
  "Energy",
  "Mining",
  "Construction",
  "Government",
  "Environment",
  "Insurance",
  "Other",
] as const;

/**
 * Data volume options for Request Quote form
 */
export const dataVolumeOptions = [
  "< 1 TB/month",
  "1-10 TB/month",
  "10-50 TB/month",
  "50-100 TB/month",
  "> 100 TB/month",
  "Not sure",
] as const;

export type Industry = typeof industryOptions[number];
export type DataVolume = typeof dataVolumeOptions[number];
