/**
 * Quote request API endpoints
 */

import { apiClient } from '../api-client';

export interface QuoteRequest {
  _id: string;
  user_id?: string;
  fullName: string;
  email: string;
  companyName?: string;
  phoneNumber?: string;
  industry: string;
  estimatedDataVolume: string;
  requirements: string;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteRequestData {
  fullName: string;
  email: string;
  companyName?: string;
  phoneNumber?: string;
  industry: string;
  estimatedDataVolume: string;
  requirements: string;
}

export interface QuoteRequestResponse {
  message: string;
  quoteRequestId: string;
  quoteRequest: QuoteRequest;
}

/**
 * Create a quote request
 */
export async function createQuoteRequest(data: CreateQuoteRequestData): Promise<QuoteRequestResponse> {
  return apiClient.post<QuoteRequestResponse>('/quote/request', data);
}

/**
 * Get user's quote requests
 */
export async function getUserQuoteRequests(userId: string): Promise<QuoteRequest[]> {
  return apiClient.get<QuoteRequest[]>(`/quote/requests/user/${userId}`);
}

/**
 * Get all quote requests (admin only)
 */
export async function getAllQuoteRequests(params?: { 
  status?: string; 
  limit?: number; 
  skip?: number;
}): Promise<{ quoteRequests: QuoteRequest[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  
  const queryString = queryParams.toString();
  return apiClient.get<{ quoteRequests: QuoteRequest[]; total: number }>(
    `/admin/quote/requests${queryString ? `?${queryString}` : ''}`
  );
}

/**
 * Update quote request status (admin only)
 */
export async function updateQuoteRequestStatus(
  quoteRequestId: string,
  status: QuoteRequest['status']
): Promise<QuoteRequest> {
  return apiClient.put<QuoteRequest>(`/admin/quote/requests/${quoteRequestId}/status`, { status });
}

/**
 * Add quote details to a quote request (admin only)
 */
export async function addQuoteDetails(
  quoteRequestId: string,
  quoteDetails: {
    pricing: string;
    terms: string;
    validUntil: string;
  }
): Promise<QuoteRequest> {
  return apiClient.put<QuoteRequest>(`/admin/quote/requests/${quoteRequestId}/quote`, quoteDetails);
}
