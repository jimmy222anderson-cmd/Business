import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PricingCalculator from "@/components/PricingCalculator";
import PlanComparison from "@/components/PlanComparison";
import PricingFAQ from "@/components/PricingFAQ";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const dataTypeComparisons = [
  {
    name: "Commercial Imagery",
    resolution: "30cm - 5m",
    revisitTime: "Daily",
    coverage: "Global",
    bestFor: "High-detail monitoring, infrastructure, urban planning",
  },
  {
    name: "Open Data",
    resolution: "10m - 30m",
    revisitTime: "5-16 days",
    coverage: "Global",
    bestFor: "Research, education, large-area analysis",
  },
  {
    name: "Analytics",
    resolution: "Processed insights",
    revisitTime: "On-demand",
    coverage: "Custom",
    bestFor: "Change detection, object recognition, trend analysis",
  },
  {
    name: "AIS Data",
    resolution: "Vessel tracking",
    revisitTime: "Real-time",
    coverage: "Maritime zones",
    bestFor: "Maritime monitoring, logistics, security",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Transparent Pricing for
            <span className="text-primary"> Earth Intelligence</span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
          >
            Choose the plan that fits your needs. Scale up or down anytime.
          </motion.p>
        </div>
      </section>

      {/* Pricing Calculator Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <PricingCalculator />
        </motion.div>
      </section>

      {/* Plan Comparison Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <PlanComparison />
        </motion.div>
      </section>

      {/* Data Type Comparison Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Data Type Comparison</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Compare different satellite data types to find the best fit for your use case
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataTypeComparisons.map((dataType, index) => (
              <motion.div
                key={dataType.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{dataType.name}</CardTitle>
                    <CardDescription>{dataType.bestFor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Resolution:</span>{" "}
                        <span className="text-muted-foreground">
                          {dataType.resolution}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Revisit Time:</span>{" "}
                        <span className="text-muted-foreground">
                          {dataType.revisitTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Coverage:</span>{" "}
                        <span className="text-muted-foreground">
                          {dataType.coverage}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <PricingFAQ />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-8">
            Our team is here to help you find the perfect solution for your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
            >
              Contact Sales
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-8"
            >
              View Products
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default PricingPage;
