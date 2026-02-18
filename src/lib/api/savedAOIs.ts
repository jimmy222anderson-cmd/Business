/**
 * Saved AOIs API
 * Handles all API calls related to saved areas of interest
 */

import { apiClient } from '@/lib/api-client';

export interface SavedAOI {
  _id: string;
  user_id: string;
  name: string;
  description?: string;
  aoi_type: 'polygon' | 'rectangle' | 'circle';
  aoi_coordinates: {
    type: string;
    coordinates: any;
  };
  aoi_area_km2: number;
  aoi_center: {
    lat: number;
    lng: number;
  };
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedAOIsResponse {
  aois: SavedAOI[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateSavedAOIData {
  name: string;
  description?: string;
  aoi_type: 'polygon' | 'rectangle' | 'circle';
  aoi_coordinates: {
    type: string;
    coordinates: any;
  };
  aoi_area_km2: number;
  aoi_center: {
    lat: number;
    lng: number;
  };
}

export interface UpdateSavedAOIData {
  name?: string;
  description?: string;
}

/**
 * Get all saved AOIs for the authenticated user
 */
export async function getSavedAOIs(params?: {
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}): Promise<SavedAOIsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.order) queryParams.append('order', params.order);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  
  const query = queryParams.toString();
  const endpoint = `/user/saved-aois${query ? `?${query}` : ''}`;
  
  return apiClient.get<SavedAOIsResponse>(endpoint);
}

/**
 * Get a single saved AOI by ID
 */
export async function getSavedAOI(id: string): Promise<{ aoi: SavedAOI }> {
  return apiClient.get<{ aoi: SavedAOI }>(`/user/saved-aois/${id}`);
}

/**
 * Create a new saved AOI
 */
export async function createSavedAOI(data: CreateSavedAOIData): Promise<{ message: string; aoi: SavedAOI }> {
  return apiClient.post<{ message: string; aoi: SavedAOI }>('/user/saved-aois', data);
}

/**
 * Update a saved AOI (name and/or description)
 */
export async function updateSavedAOI(id: string, data: UpdateSavedAOIData): Promise<{ message: string; aoi: SavedAOI }> {
  return apiClient.put<{ message: string; aoi: SavedAOI }>(`/user/saved-aois/${id}`, data);
}

/**
 * Delete a saved AOI
 */
export async function deleteSavedAOI(id: string): Promise<{ message: string; deletedAOI: { id: string; name: string } }> {
  return apiClient.delete<{ message: string; deletedAOI: { id: string; name: string } }>(`/user/saved-aois/${id}`);
}

/**
 * Update last_used_at timestamp when an AOI is loaded
 */
export async function markAOIAsUsed(id: string): Promise<{ message: string; aoi: SavedAOI }> {
  return apiClient.put<{ message: string; aoi: SavedAOI }>(`/user/saved-aois/${id}/use`, {});
}
