import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Partnership inquiry form schema
const partnershipInquirySchema = z.object({
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  company: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  partnership_type: z.string()
    .min(1, "Please select a partnership type"),
  subject: z.string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z.string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

export type PartnershipInquiryFormData = z.infer<typeof partnershipInquirySchema>;

interface PartnershipInquiryFormProps {
  onSubmit: (data: PartnershipInquiryFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

const partnershipTypes = [
  { value: "technology", label: "Technology Partner" },
  { value: "data", label: "Data Provider" },
  { value: "reseller", label: "Reseller/Distributor" },
  { value: "integration", label: "Integration Partner" },
  { value: "strategic", label: "Strategic Alliance" },
  { value: "other", label: "Other" },
];

export const PartnershipInquiryForm = ({
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Submit Partnership Inquiry",
}: PartnershipInquiryFormProps) => {
  const { user, isAuthenticated } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PartnershipInquiryFormData>({
    resolver: zodResolver(partnershipInquirySchema),
  });

  // Auto-fill form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.full_name) {
        setValue("full_name", user.full_name);
      }
      if (user.email) {
        setValue("email", user.email);
      }
      if (user.company) {
        setValue("company", user.company);
      }
    }
  }, [isAuthenticated, user, setValue]);

  const handleFormSubmit = async (data: PartnershipInquiryFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          placeholder="John Doe"
          {...register("full_name")}
          aria-invalid={errors.full_name ? "true" : "false"}
          aria-describedby={errors.full_name ? "full_name-error" : undefined}
        />
        {errors.full_name && (
          <p id="full_name-error" className="text-sm text-destructive">
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@company.com"
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company">Company Name *</Label>
        <Input
          id="company"
          placeholder="Your Company"
          {...register("company")}
          aria-invalid={errors.company ? "true" : "false"}
          aria-describedby={errors.company ? "company-error" : undefined}
        />
        {errors.company && (
          <p id="company-error" className="text-sm text-destructive">
            {errors.company.message}
          </p>
        )}
      </div>

      {/* Partnership Type */}
      <div className="space-y-2">
        <Label htmlFor="partnership_type">Partnership Type *</Label>
        <Select
          onValueChange={(value) => setValue("partnership_type", value)}
        >
          <SelectTrigger
            id="partnership_type"
            aria-invalid={errors.partnership_type ? "true" : "false"}
            aria-describedby={errors.partnership_type ? "partnership_type-error" : undefined}
          >
            <SelectValue placeholder="Select partnership type" />
          </SelectTrigger>
          <SelectContent>
            {partnershipTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.partnership_type && (
          <p id="partnership_type-error" className="text-sm text-destructive">
            {errors.partnership_type.message}
          </p>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          placeholder="Partnership Opportunity"
          {...register("subject")}
          aria-invalid={errors.subject ? "true" : "false"}
          aria-describedby={errors.subject ? "subject-error" : undefined}
        />
        {errors.subject && (
          <p id="subject-error" className="text-sm text-destructive">
            {errors.subject.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Partnership Details *</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your partnership proposal, including your company's capabilities, target markets, and how you envision working together..."
          rows={6}
          {...register("message")}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : submitButtonText}
      </Button>
    </form>
  );
};
