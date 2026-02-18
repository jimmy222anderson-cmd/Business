import { describe, it, expect } from "vitest";
import { z } from "zod";

// Request form schema (matching the component)
const requestFormSchema = z.object({
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  company: z.string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  phone: z.string()
    .max(20, "Phone number must be less than 20 characters")
    .optional(),
  urgency: z.enum(["standard", "urgent", "emergency"], {
    required_error: "Please select an urgency level",
  }),
  additional_requirements: z.string()
    .max(2000, "Additional requirements must be less than 2000 characters")
    .optional(),
});

describe("RequestForm Validation", () => {
  it("should validate valid request form data with all fields", () => {
    const validData = {
      full_name: "John Doe",
      email: "john@example.com",
      company: "Test Company",
      phone: "+1 (555) 123-4567",
      urgency: "standard" as const,
      additional_requirements: "Need high resolution imagery for urban planning.",
    };

    const result = requestFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate valid request form data with only required fields", () => {
    const validData = {
      full_name: "Jane Smith",
      email: "jane@example.com",
      urgency: "urgent" as const,
    };

    const result = requestFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidData = {
      full_name: "John Doe",
      email: "invalid-email",
      urgency: "standard" as const,
    };

    const result = requestFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject short name", () => {
    const invalidData = {
      full_name: "J",
      email: "john@example.com",
      urgency: "standard" as const,
    };

    const result = requestFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject name that is too long", () => {
    const invalidData = {
      full_name: "A".repeat(101),
      email: "john@example.com",
      urgency: "standard" as const,
    };

    const result = requestFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid urgency value", () => {
    const invalidData = {
      full_name: "John Doe",
      email: "john@example.com",
      urgency: "invalid" as any,
    };

    const result = requestFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept all valid urgency levels", () => {
    const urgencyLevels = ["standard", "urgent", "emergency"] as const;

    urgencyLevels.forEach((urgency) => {
      const validData = {
        full_name: "John Doe",
        email: "john@example.com",
        urgency,
      };

      const result = requestFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  it("should reject phone number that is too long", () => {
    const invalidData = {
      full_name: "John Doe",
      email: "john@example.com",
      phone: "1".repeat(21),
      urgency: "standard" as const,
    };

    const result = requestFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject company name that is too long", () => {
    const invalidData = {
      full_name: "John Doe",
      email: "john@example.com",
      company: "A".repeat(101),
      urgency: "standard" as const,
    };

    const result = requestFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject additional requirements that are too long", () => {
    const invalidData = {
      full_name: "John Doe",
      email: "john@example.com",
      urgency: "standard" as const,
      additional_requirements: "A".repeat(2001),
    };

    const result = requestFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept empty optional fields", () => {
    const validData = {
      full_name: "John Doe",
      email: "john@example.com",
      urgency: "emergency" as const,
      company: "",
      phone: "",
      additional_requirements: "",
    };

    const result = requestFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
