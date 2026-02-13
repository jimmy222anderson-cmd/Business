import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import ProductsSection from "@/components/ProductsSection";
import IndustriesSection from "@/components/IndustriesSection";
import PricingHighlights from "@/components/PricingHighlights";
import PartnersGrid from "@/components/PartnersGrid";
import AboutPreview from "@/components/AboutPreview";
import BlogSection from "@/components/BlogSection";

const Index = () => (
  <div className="min-h-screen bg-background scroll-smooth">
    <Hero />
    <TrustedBy />
    <ProductsSection />
    <IndustriesSection />
    <PricingHighlights />
    <PartnersGrid />
    <AboutPreview />
    <BlogSection />
  </div>
);

export default Index;
