import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Product inquiry form schema
const productInquirySchema = z.object({
  product_id: z.string()
    .min(1, "Product ID is required"),
  full_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  company: z.string()
    .optional(),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

export type ProductInquiryFormData = z.infer<typeof productInquirySchema>;

interface ProductInquiryFormProps {
  productId: string;
  productName?: string;
  onSubmit: (data: ProductInquiryFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
  showCompanyField?: boolean;
}

export const ProductInquiryForm = ({
  productId,
  productName,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Submit Inquiry",
  showCompanyField = true,
}: ProductInquiryFormProps) => {
  const { user, isAuthenticated } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductInquiryFormData>({
    resolver: zodResolver(productInquirySchema),
    defaultValues: {
      product_id: productId,
    },
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

  const handleFormSubmit = async (data: ProductInquiryFormData) => {
    await onSubmit(data);
    reset({ product_id: productId });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Product Name Display (if provided) */}
      {productName && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Inquiring about:</p>
          <p className="font-semibold">{productName}</p>
        </div>
      )}

      {/* Hidden Product ID */}
      <input type="hidden" {...register("product_id")} />

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

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Your Inquiry *</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your requirements, use case, or any questions you have about this product..."
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
        {isSubmitting ? "Submitting..." : submitButtonText}
      </Button>
    </form>
  );
};
