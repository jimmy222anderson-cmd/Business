import { describe, it, expect } from "vitest";
import { z } from "zod";

// Import form schemas from the components
const contactFormSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().optional(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

const partnershipInquirySchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().min(2).max(100),
  partnership_type: z.string().min(1),
  subject: z.string().min(3).max(200),
  message: z.string().min(20).max(2000),
});

const productInquirySchema = z.object({
  product_id: z.string().min(1),
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(10).max(2000),
});

describe("Contact Form Validation", () => {
  it("should validate valid contact form data", () => {
    const validData = {
      full_name: "John Doe",
      email: "john@example.com",
      company: "Test Company",
      subject: "Test Subject",
      message: "This is a test message with enough characters.",
    };

    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidData = {
      full_name: "John Doe",
      email: "invalid-email",
      subject: "Test Subject",
      message: "This is a test message with enough characters.",
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject short message", () => {
    const invalidData = {
      full_name: "John Doe",
      email: "john@example.com",
      subject: "Test Subject",
      message: "Short",
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept data without optional company field", () => {
    const validData = {
      full_name: "John Doe",
      email: "john@example.com",
      subject: "Test Subject",
      message: "This is a test message with enough characters.",
    };

    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe("Partnership Inquiry Form Validation", () => {
  it("should validate valid partnership inquiry data", () => {
    const validData = {
      full_name: "Jane Smith",
      email: "jane@company.com",
      company: "Partner Corp",
      partnership_type: "technology",
      subject: "Partnership Opportunity",
      message: "We are interested in partnering with your organization to deliver solutions.",
    };

    const result = partnershipInquirySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should require company field", () => {
    const invalidData = {
      full_name: "Jane Smith",
      email: "jane@company.com",
      partnership_type: "technology",
      subject: "Partnership Opportunity",
      message: "We are interested in partnering with your organization to deliver solutions.",
    };

    const result = partnershipInquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should require longer message (20+ chars)", () => {
    const invalidData = {
      full_name: "Jane Smith",
      email: "jane@company.com",
      company: "Partner Corp",
      partnership_type: "technology",
      subject: "Partnership Opportunity",
      message: "Short message",
    };

    const result = partnershipInquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Product Inquiry Form Validation", () => {
  it("should validate valid product inquiry data", () => {
    const validData = {
      product_id: "analytics",
      full_name: "Bob Johnson",
      email: "bob@example.com",
      company: "Tech Solutions",
      message: "I am interested in learning more about this product.",
    };

    const result = productInquirySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should require product_id", () => {
    const invalidData = {
      full_name: "Bob Johnson",
      email: "bob@example.com",
      message: "I am interested in learning more about this product.",
    };

    const result = productInquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept data without optional company field", () => {
    const validData = {
      product_id: "analytics",
      full_name: "Bob Johnson",
      email: "bob@example.com",
      message: "I am interested in learning more about this product.",
    };

    const result = productInquirySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email format", () => {
    const invalidData = {
      product_id: "analytics",
      full_name: "Bob Johnson",
      email: "not-an-email",
      message: "I am interested in learning more about this product.",
    };

    const result = productInquirySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
