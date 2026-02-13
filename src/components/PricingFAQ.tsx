import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "How is pricing calculated?",
    answer:
      "Pricing is based on three main factors: the type of data you need (commercial imagery, analytics, AIS data, etc.), the coverage area in square kilometers, and the frequency of data delivery. Our calculator provides instant estimates, and you can request a detailed quote for custom requirements.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, wire transfers, and purchase orders for enterprise customers. Monthly and annual subscriptions can be paid via credit card, while custom enterprise agreements support various payment terms.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll have immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle, and you'll retain access to your current plan until then.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, we offer a 14-day free trial for our Professional plan. This gives you full access to explore our platform, test data quality, and integrate with your systems. No credit card is required to start your trial.",
  },
  {
    question: "What's included in the coverage area?",
    answer:
      "Coverage area refers to the total square kilometers of satellite imagery or data you can access per month. For example, if you need to monitor a 500 sq km region weekly, you'd need approximately 2,000 sq km of monthly coverage. Our team can help you calculate your specific needs.",
  },
  {
    question: "Do you offer discounts for annual subscriptions?",
    answer:
      "Yes, annual subscriptions receive a 40% discount compared to monthly billing. Quarterly subscriptions receive a 30% discount. These discounts are automatically applied when you select your billing frequency.",
  },
  {
    question: "What happens if I exceed my coverage area?",
    answer:
      "If you exceed your plan's coverage area, you'll be notified and can either upgrade your plan or purchase additional coverage on-demand. On-demand pricing is slightly higher than subscription rates, so we recommend choosing a plan that fits your regular usage.",
  },
  {
    question: "Can I get a custom enterprise plan?",
    answer:
      "Absolutely! Our Enterprise plan is fully customizable to meet your organization's specific needs. This includes custom coverage areas, dedicated support, SLA guarantees, white-label options, and flexible payment terms. Contact our sales team to discuss your requirements.",
  },
  {
    question: "What data types are included in each plan?",
    answer:
      "The Starter plan includes access to open data sources. The Professional plan includes all commercial imagery, analytics, and AIS data. The Enterprise plan includes everything plus custom data processing, proprietary algorithms, and priority access to new data sources.",
  },
  {
    question: "Is there a setup fee?",
    answer:
      "No, there are no setup fees for any of our plans. You can start using the platform immediately after signing up. Enterprise customers may have optional onboarding and training services available at an additional cost.",
  },
];

const PricingFAQ = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
        <CardDescription>
          Common questions about our pricing and plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PricingFAQ;
