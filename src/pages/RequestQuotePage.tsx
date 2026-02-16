import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { quoteSchema, type QuoteFormData } from "@/lib/form-schemas";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const industries = [
  "Financial Services",
  "Agriculture",
  "Energy",
  "Mining",
  "Construction",
  "Government",
  "Environment",
  "Insurance",
  "Other",
] as const;

const dataVolumes = [
  "< 1 TB/month",
  "1-10 TB/month",
  "10-50 TB/month",
  "50-100 TB/month",
  "> 100 TB/month",
  "Not sure",
] as const;

const RequestQuotePage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const calculatorData = location.state as {
    estimatedPrice?: number;
    dataType?: string;
    coverageArea?: number;
    frequency?: string;
  } | null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      industry: "",
      estimatedDataVolume: "",
    },
  });

  // Pre-fill requirements if coming from calculator
  useEffect(() => {
    if (calculatorData) {
      const requirements = `Data Type: ${calculatorData.dataType || 'N/A'}
Coverage Area: ${calculatorData.coverageArea || 'N/A'} sq km
Frequency: ${calculatorData.frequency || 'N/A'}
Estimated Price: $${calculatorData.estimatedPrice?.toFixed(2) || 'N/A'}

Additional Requirements:
`;
      setValue('requirements', requirements);
    }
  }, [calculatorData, setValue]);

  const industry = watch("industry");
  const estimatedDataVolume = watch("estimatedDataVolume");

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${API_BASE_URL}/quote/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && result.details) {
          const errorMessages = Array.isArray(result.details) 
            ? result.details.join(', ')
            : Object.values(result.details).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(result.error || 'Failed to submit quote request');
      }

      // Success
      toast.success("Quote Request Received!", {
        description: "Our sales team will review your requirements and contact you within 1-2 business days with a custom quote.",
      });
      
      reset();
    } catch (error) {
      console.error('Quote request error:', error);
      toast.error("Failed to Submit Request", {
        description: error instanceof Error ? error.message : "Please try again later or contact support.",
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
            Request a <span className="text-primary">Quote</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Get a custom pricing quote tailored to your specific needs and data requirements.
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
          className="max-w-3xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Get Your Custom Quote</CardTitle>
              <CardDescription>
                Tell us about your requirements and we'll provide a tailored pricing solution for your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Grid layout for two-column fields on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {/* Industry */}
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select
                      value={industry}
                      onValueChange={(value) => setValue("industry", value, { shouldValidate: true })}
                    >
                      <SelectTrigger
                        id="industry"
                        aria-invalid={errors.industry ? "true" : "false"}
                        aria-describedby={errors.industry ? "industry-error" : undefined}
                      >
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industry && (
                      <p id="industry-error" className="text-sm text-destructive">
                        {errors.industry.message}
                      </p>
                    )}
                  </div>

                  {/* Estimated Data Volume */}
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDataVolume">Estimated Data Volume *</Label>
                    <Select
                      value={estimatedDataVolume}
                      onValueChange={(value) => setValue("estimatedDataVolume", value, { shouldValidate: true })}
                    >
                      <SelectTrigger
                        id="estimatedDataVolume"
                        aria-invalid={errors.estimatedDataVolume ? "true" : "false"}
                        aria-describedby={errors.estimatedDataVolume ? "estimatedDataVolume-error" : undefined}
                      >
                        <SelectValue placeholder="Select data volume" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataVolumes.map((volume) => (
                          <SelectItem key={volume} value={volume}>
                            {volume}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.estimatedDataVolume && (
                      <p id="estimatedDataVolume-error" className="text-sm text-destructive">
                        {errors.estimatedDataVolume.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Requirements - Full width */}
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Please describe your specific requirements, use cases, and any technical specifications..."
                    rows={6}
                    {...register("requirements")}
                    aria-invalid={errors.requirements ? "true" : "false"}
                    aria-describedby={errors.requirements ? "requirements-error" : undefined}
                  />
                  {errors.requirements && (
                    <p id="requirements-error" className="text-sm text-destructive">
                      {errors.requirements.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Request Quote"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default RequestQuotePage;
