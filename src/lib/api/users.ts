/**
 * User Dashboard API functions
 */

import { apiClient } from '../api-client';
import { User } from './auth';

export interface DemoBooking {
  _id: string;
  user_id?: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ProductInquiry {
  _id: string;
  user_id?: string;
  product_id: string;
  full_name: string;
  email: string;
  company?: string;
  message: string;
  status: 'pending' | 'quoted' | 'ordered' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ContactInquiry {
  _id: string;
  user_id?: string;
  inquiry_type: 'general' | 'partnership' | 'product' | 'support';
  full_name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface QuoteRequest {
  _id: string;
  user_id?: string;
  fullName: string;
  email: string;
  companyName: string;
  phoneNumber: string;
  industry: string;
  estimatedDataVolume: string;
  requirements: string;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
  quoteDetails?: {
    pricing: string;
    terms: string;
    validUntil: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  company?: string;
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<User> {
  const response = await apiClient.get<{ user: User }>(`/users/${userId}/profile`);
  return response.user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: UpdateProfileData): Promise<User> {
  const response = await apiClient.put<{ user: User }>(`/users/${userId}/profile`, data);
  return response.user;
}

/**
 * Get user's demo bookings
 */
export async function getUserBookings(userId: string): Promise<DemoBooking[]> {
  const response = await apiClient.get<{ bookings: DemoBooking[] }>(`/users/${userId}/bookings`);
  return response.bookings;
}

/**
 * Get user's product inquiries
 */
export async function getUserInquiries(userId: string): Promise<ProductInquiry[]> {
  const response = await apiClient.get<{ inquiries: ProductInquiry[] }>(`/users/${userId}/inquiries`);
  return response.inquiries;
}

/**
 * Get user's contact inquiries
 */
export async function getUserContactInquiries(userId: string): Promise<ContactInquiry[]> {
  const response = await apiClient.get<{ contactInquiries: ContactInquiry[] }>(`/users/${userId}/contact-inquiries`);
  return response.contactInquiries;
}

/**
 * Get user's quote requests
 */
export async function getUserQuoteRequests(userId: string): Promise<QuoteRequest[]> {
  const response = await apiClient.get<{ quoteRequests: QuoteRequest[] }>(`/users/${userId}/quote-requests`);
  return response.quoteRequests;
}
