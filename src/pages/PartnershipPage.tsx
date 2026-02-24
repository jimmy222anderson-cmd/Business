import { motion } from "framer-motion";
import { useState } from "react";
import { Handshake, Users, Globe, TrendingUp } from "lucide-react";
import { PartnershipInquiryForm, type PartnershipInquiryFormData } from "@/components/forms";
import { createContactInquiry } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const partnershipBenefits = [
  {
    icon: Handshake,
    title: "Strategic Collaboration",
    description: "Work together to deliver innovative solutions to customers worldwide.",
  },
  {
    icon: Users,
    title: "Expanded Reach",
    description: "Access new markets and customer segments through our partner network.",
  },
  {
    icon: Globe,
    title: "Global Presence",
    description: "Leverage our global infrastructure and distribution channels.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Growth",
    description: "Create new revenue streams through joint offerings and solutions.",
  },
];

const PartnershipPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PartnershipInquiryFormData) => {
    setIsSubmitting(true);
    try {
      await createContactInquiry({
        inquiry_type: 'partnership',
        full_name: data.full_name,
        email: data.email,
        company: data.company,
        subject: data.subject,
        message: `Partnership Type: ${data.partnership_type}\n\n${data.message}`,
      });

      toast.success("Partnership Inquiry Submitted!", {
        description: "Thank you for your interest. Our partnerships team will contact you within 2 business days.",
      });
    } catch (error) {
      console.error('Error submitting partnership inquiry:', error);
      toast.error("Submission Failed", {
        description: "There was an error submitting your inquiry. Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Partner with <span className="text-primary">Us</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Join our ecosystem of technology partners, data providers, and resellers to deliver cutting-edge space-based intelligence solutions.
          </motion.p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Partnership Benefits
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnershipBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Submit Partnership Inquiry</CardTitle>
                <CardDescription>
                  Tell us about your organization and how you'd like to partner with us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PartnershipInquiryForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PartnershipPage;
