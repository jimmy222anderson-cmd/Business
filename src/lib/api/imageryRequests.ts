/**
 * API functions for imagery requests
 */

import { apiClient } from '../api-client';

export interface ImageryRequestPayload {
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  aoi_type: string;
  aoi_coordinates: {
    type: string;
    coordinates: number[][][];
  };
  aoi_area_km2: number;
  aoi_center: {
    lat: number;
    lng: number;
  };
  date_range?: {
    start_date?: string;
    end_date?: string;
  };
  filters?: {
    resolution_category?: string[];
    max_cloud_coverage?: number;
    providers?: string[];
    bands?: string[];
    image_types?: string[];
  };
  urgency: 'standard' | 'urgent' | 'emergency';
  additional_requirements?: string;
}

export interface ImageryRequest {
  _id: string;
  user_id?: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  aoi_type: string;
  aoi_coordinates: {
    type: string;
    coordinates: any;
  };
  aoi_area_km2: number;
  aoi_center: {
    lat: number;
    lng: number;
  };
  date_range?: {
    start_date?: string;
    end_date?: string;
  };
  filters?: {
    resolution_category?: string[];
    max_cloud_coverage?: number;
    providers?: string[];
    bands?: string[];
    image_types?: string[];
  };
  urgency: string;
  additional_requirements?: string;
  status: string;
  status_history?: Array<{
    status: string;
    changed_at: string;
    changed_by?: string;
    notes?: string;
  }>;
  admin_notes?: string;
  quote_amount?: number;
  quote_currency?: string;
  created_at: string;
  updated_at: string;
}

export interface ImageryRequestResponse {
  message: string;
  request_id: string;
  request: {
    id: string;
    status: string;
    aoi_area_km2: number;
    created_at: string;
  };
}

export interface UserImageryRequestsResponse {
  requests: ImageryRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Submit a new imagery request
 */
export async function submitImageryRequest(
  payload: ImageryRequestPayload
): Promise<ImageryRequestResponse> {
  return apiClient.post<ImageryRequestResponse>('/public/imagery-requests', payload);
}

/**
 * Get user's imagery requests
 */
export async function getUserImageryRequests(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<UserImageryRequestsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const query = queryParams.toString();
  const endpoint = `/user/imagery-requests${query ? `?${query}` : ''}`;
  
  return apiClient.get<UserImageryRequestsResponse>(endpoint);
}

/**
 * Get a single imagery request by ID
 */
export async function getUserImageryRequest(id: string): Promise<{ request: ImageryRequest }> {
  return apiClient.get<{ request: ImageryRequest }>(`/user/imagery-requests/${id}`);
}

/**
 * Cancel an imagery request
 */
export async function cancelImageryRequest(
  id: string,
  cancellation_reason?: string
): Promise<{ message: string; request: { _id: string; status: string; updated_at: string } }> {
  return apiClient.post(`/user/imagery-requests/${id}/cancel`, { cancellation_reason });
}
