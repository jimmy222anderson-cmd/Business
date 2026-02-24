// Core type definitions for the ATLAS Space & Data Systems Platform

// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  price?: string;
  pricingBadge?: string;
  features: Feature[];
  useCases: UseCase[];
  specifications: Specification[];
  category: "analytics" | "imagery" | "data" | "plugin";
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  industry?: string;
}

export interface Specification {
  key: string;
  value: string;
  unit?: string;
}

// Industry types
export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  useCases: UseCase[];
  relevantProducts: string[]; // Product IDs
}

// Blog post types
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  featuredImage: string;
  tags: string[];
  status: "draft" | "published";
}

// Partner types
export interface Partner {
  id: string;
  name: string;
  logo: string;
  description?: string;
  website?: string;
  category: "satellite" | "data" | "technology" | "client";
}

// Pricing types
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year" | "one-time";
  features: string[];
  highlighted?: boolean;
}

// Navigation types
export interface NavLink {
  label: string;
  href: string;
  dropdown?: NavLink[];
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "date";
  required?: boolean;
  placeholder?: string;
  validation?: (value: string) => string | null;
}

// User types (Phase 3)
export interface UserProfile {
  _id: string;
  email: string;
  full_name?: string;
  company?: string;
  role: "user" | "admin";
  created_at: Date;
  updated_at: Date;
}

// Demo booking types (Phase 3)
export interface DemoBooking {
  _id: string;
  user_id?: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  preferred_date: Date;
  preferred_time: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: Date;
  updated_at: Date;
}

// Contact inquiry types (Phase 3)
export interface ContactInquiry {
  _id: string;
  user_id?: string;
  inquiry_type: "general" | "partnership" | "product" | "support";
  full_name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  created_at: Date;
  updated_at: Date;
}
