import { z } from "zod";

// Book Demo Form Schema
export const bookDemoSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  companyName: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  phoneNumber: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits"),
  jobTitle: z.string()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title must be less than 100 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

// Sign In Form Schema
export const signInSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
});

// Contact Form Schema
export const contactSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  subject: z.string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

// Request Quote Form Schema
export const quoteSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  companyName: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  phoneNumber: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits"),
  industry: z.string()
    .min(1, "Please select an industry"),
  estimatedDataVolume: z.string()
    .min(1, "Please select an estimated data volume"),
  requirements: z.string()
    .min(20, "Requirements must be at least 20 characters")
    .max(2000, "Requirements must be less than 2000 characters"),
});

// TypeScript type inference from schemas
export type BookDemoFormData = z.infer<typeof bookDemoSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type QuoteFormData = z.infer<typeof quoteSchema>;
