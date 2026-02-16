import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Contact form schema
const contactFormSchema = z.object({
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  company: z.string()
    .optional(),
  subject: z.string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showCompanyField?: boolean;
}

export const ContactForm = ({
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Send Message",
  showCompanyField = true,
}: ContactFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const handleFormSubmit = async (data: ContactFormData) => {
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

      {/* Company (Optional) */}
      {showCompanyField && (
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
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
      )}

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          placeholder="How can we help you?"
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
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          placeholder="Tell us more about your inquiry..."
          rows={5}
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
        {isSubmitting ? "Sending..." : submitButtonText}
      </Button>
    </form>
  );
};
