/**
 * Type definitions for API requests and responses
 */

// User types
export interface UserProfile {
  _id: string;
  email: string;
  full_name?: string;
  company?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// Demo booking types
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

export interface CreateDemoBookingRequest {
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
}

// Contact inquiry types
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

export interface CreateContactInquiryRequest {
  inquiry_type: 'general' | 'partnership' | 'product' | 'support';
  full_name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

// Product inquiry types
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

export interface CreateProductInquiryRequest {
  product_id: string;
  full_name: string;
  email: string;
  company?: string;
  message: string;
}

// Newsletter subscription types
export interface NewsletterSubscription {
  _id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  status: 'active' | 'unsubscribed';
}

export interface SubscribeNewsletterRequest {
  email: string;
}

// Blog post types
export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  featured_image_url?: string;
  tags: string[];
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostRequest {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface UpdateBlogPostRequest extends Partial<CreateBlogPostRequest> {
  _id: string;
}

// File upload types
export interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}
