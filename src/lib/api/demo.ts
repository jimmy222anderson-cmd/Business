/**
 * Demo booking API endpoints
 */

import { apiClient } from '../api-client';

export interface DemoBookingRequest {
  fullName: string;
  email: string;
  companyName?: string;
  phoneNumber?: string;
  jobTitle?: string;
  message?: string;
}

export interface DemoBookingResponse {
  message: string;
  bookingId: string;
  booking: {
    _id: string;
    fullName: string;
    email: string;
    companyName?: string;
    phoneNumber?: string;
    jobTitle?: string;
    message?: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

/**
 * Create a demo booking
 */
export async function createDemoBooking(data: DemoBookingRequest): Promise<DemoBookingResponse> {
  return apiClient.post<DemoBookingResponse>('/demo/book', data);
}

/**
 * Get user's demo bookings
 */
export async function getUserDemoBookings(userId: string): Promise<any> {
  return apiClient.get<any>(`/demo/bookings/user/${userId}`);
}

/**
 * Get all demo bookings (admin only)
 */
export async function getAllDemoBookings(params?: { status?: string; limit?: number; skip?: number }): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  
  const queryString = queryParams.toString();
  return apiClient.get<any>(`/admin/demo/bookings${queryString ? `?${queryString}` : ''}`);
}

/**
 * Update demo booking status (admin only)
 */
export async function updateDemoBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<any> {
  return apiClient.put<any>(`/admin/demo/bookings/${bookingId}/status`, { status });
}
