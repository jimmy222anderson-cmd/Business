/**
 * API functions for satellite products
 */

import { apiClient } from '../api-client';

export interface SatelliteProductSpecifications {
  swath_width?: number;
  revisit_time?: number;
  spectral_bands?: number;
  radiometric_resolution?: number;
}

export interface SatelliteProduct {
  _id: string;
  name: string;
  provider: string;
  sensor_type: 'optical' | 'radar' | 'thermal';
  resolution: number;
  resolution_category: 'vhr' | 'high' | 'medium' | 'low';
  bands: string[];
  coverage: string;
  availability: 'archive' | 'tasking' | 'both';
  description: string;
  sample_image_url: string;
  specifications: SatelliteProductSpecifications;
  pricing_info: string;
  status: 'active' | 'inactive';
  order: number;
  created_at: string;
  updated_at: string;
}

export interface SatelliteProductsResponse {
  products: SatelliteProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SatelliteProductsQueryParams {
  resolution_category?: string;
  sensor_type?: string;
  availability?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Get list of active satellite products
 */
export async function getSatelliteProducts(
  params?: SatelliteProductsQueryParams
): Promise<SatelliteProductsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.resolution_category) queryParams.append('resolution_category', params.resolution_category);
    if (params.sensor_type) queryParams.append('sensor_type', params.sensor_type);
    if (params.availability) queryParams.append('availability', params.availability);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.order) queryParams.append('order', params.order);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
  }
  
  const queryString = queryParams.toString();
  const url = `/public/satellite-products${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get<SatelliteProductsResponse>(url);
}

/**
 * Get single satellite product by ID
 */
export async function getSatelliteProduct(id: string): Promise<SatelliteProduct> {
  return apiClient.get<SatelliteProduct>(`/public/satellite-products/${id}`);
}
