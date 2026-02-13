import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndustryTabs } from './IndustryTabs';
import { IndustryContent } from './IndustryContent';
import { industries } from '@/data/industries';

export function IndustriesSection() {
  const [activeTab, setActiveTab] = useState(industries[0].id);

  const activeIndustry = industries.find(
    (industry) => industry.id === activeTab
  ) || industries[0];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Industries We Serve
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how satellite intelligence transforms operations across diverse sectors
          </p>
        </motion.div>

        {/* Industry Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <IndustryTabs
            industries={industries}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </motion.div>

        {/* Industry Content */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <IndustryContent industry={activeIndustry} />
        </motion.div>
      </div>
    </section>
  );
}

export default IndustriesSection;
