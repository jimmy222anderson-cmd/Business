/**
 * Contact inquiry API endpoints
 */

import { apiClient } from '../api-client';
import type { 
  ContactInquiry, 
  CreateContactInquiryRequest,
  ProductInquiry,
  CreateProductInquiryRequest
} from '../api-types';

export interface SimpleContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  message: string;
  inquiryId: string;
  inquiry: ContactInquiry;
}

/**
 * Submit contact form (simplified interface)
 */
export async function submitContactForm(data: SimpleContactFormData): Promise<ContactFormResponse> {
  const requestData: CreateContactInquiryRequest = {
    inquiry_type: 'general',
    full_name: data.fullName,
    email: data.email,
    subject: data.subject,
    message: data.message,
  };
  
  return apiClient.post<ContactFormResponse>('/contact', requestData);
}

/**
 * Create a contact inquiry
 */
export async function createContactInquiry(data: CreateContactInquiryRequest): Promise<ContactInquiry> {
  return apiClient.post<ContactInquiry>('/contact', data);
}

/**
 * Create a product inquiry
 */
export async function createProductInquiry(data: CreateProductInquiryRequest): Promise<ProductInquiry> {
  return apiClient.post<ProductInquiry>('/inquiries/product', data);
}

/**
 * Get user's contact inquiries
 */
export async function getUserContactInquiries(userId: string): Promise<ContactInquiry[]> {
  return apiClient.get<ContactInquiry[]>(`/contact/inquiries/user/${userId}`);
}

/**
 * Get user's product inquiries
 */
export async function getUserProductInquiries(userId: string): Promise<ProductInquiry[]> {
  return apiClient.get<ProductInquiry[]>(`/inquiries/product/user/${userId}`);
}

/**
 * Get all contact inquiries (admin only)
 */
export async function getAllContactInquiries(): Promise<ContactInquiry[]> {
  return apiClient.get<ContactInquiry[]>('/contact/admin/contact/inquiries');
}

/**
 * Get all product inquiries (admin only)
 */
export async function getAllProductInquiries(): Promise<ProductInquiry[]> {
  return apiClient.get<ProductInquiry[]>('/admin/inquiries/product');
}

/**
 * Update contact inquiry status (admin only)
 */
export async function updateContactInquiryStatus(
  inquiryId: string,
  status: ContactInquiry['status']
): Promise<ContactInquiry> {
  return apiClient.put<ContactInquiry>(`/contact/admin/contact/inquiries/${inquiryId}/status`, { status });
}

/**
 * Update product inquiry status (admin only)
 */
export async function updateProductInquiryStatus(
  inquiryId: string,
  status: ProductInquiry['status']
): Promise<ProductInquiry> {
  return apiClient.put<ProductInquiry>(`/admin/inquiries/product/${inquiryId}/status`, { status });
}
