import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { bookDemoSchema, type BookDemoFormData } from "@/lib/form-schemas";
import { handleFormSubmission } from "@/lib/form-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BookDemoPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BookDemoFormData>({
    resolver: zodResolver(bookDemoSchema),
  });

  // Auto-fill form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.full_name) {
        setValue("fullName", user.full_name);
      }
      if (user.email) {
        setValue("email", user.email);
      }
      if (user.company) {
        setValue("companyName", user.company);
      }
    }
  }, [isAuthenticated, user, setValue]);

  const onSubmit = async (data: BookDemoFormData) => {
    setIsSubmitting(true);
    try {
      // Import the API function dynamically to avoid circular dependencies
      const { createDemoBooking } = await import("@/lib/api/demo");
      
      // Transform form data to API request format
      const bookingData = {
        fullName: data.fullName,
        email: data.email,
        companyName: data.companyName,
        phoneNumber: data.phoneNumber,
        jobTitle: data.jobTitle,
        message: data.message,
      };

      // Call the API
      const response = await createDemoBooking(bookingData);

      // Show success message
      await handleFormSubmission(data, {
        successTitle: "Demo Request Received!",
        successDescription: `Your booking ID is ${response.bookingId}. Our team will contact you within 24 hours to schedule your personalized demo.`,
        onSuccess: () => reset(),
        simulateDelay: 0, // No delay since we already made the API call
      });
    } catch (error) {
      console.error('Demo booking error:', error);
      // Show error message
      await handleFormSubmission(data, {
        errorTitle: "Submission Failed",
        errorDescription: error instanceof Error ? error.message : "Unable to submit your demo request. Please try again or contact support.",
        simulateDelay: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Request a <span className="text-primary">Demo</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            See how Earth Intelligence Platform can transform your business with satellite data and analytics.
          </motion.p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Book Your Demo</CardTitle>
              <CardDescription>
                Fill out the form below and our team will reach out to schedule a personalized demonstration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register("fullName")}
                    aria-invalid={errors.fullName ? "true" : "false"}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="text-sm text-destructive">
                      {errors.fullName.message}
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

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    {...register("companyName")}
                    aria-invalid={errors.companyName ? "true" : "false"}
                    aria-describedby={errors.companyName ? "companyName-error" : undefined}
                  />
                  {errors.companyName && (
                    <p id="companyName-error" className="text-sm text-destructive">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register("phoneNumber")}
                    aria-invalid={errors.phoneNumber ? "true" : "false"}
                    aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                  />
                  {errors.phoneNumber && (
                    <p id="phoneNumber-error" className="text-sm text-destructive">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Chief Technology Officer"
                    {...register("jobTitle")}
                    aria-invalid={errors.jobTitle ? "true" : "false"}
                    aria-describedby={errors.jobTitle ? "jobTitle-error" : undefined}
                  />
                  {errors.jobTitle && (
                    <p id="jobTitle-error" className="text-sm text-destructive">
                      {errors.jobTitle.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your use case and what you'd like to see in the demo..."
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
                  {isSubmitting ? "Submitting..." : "Request Demo"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default BookDemoPage;
