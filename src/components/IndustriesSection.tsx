import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndustryTabs } from './IndustryTabs';
import { IndustryContent } from './IndustryContent';

interface UseCase {
  _id: string;
  title: string;
  description: string;
}

interface Industry {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  icon: string;
  useCases: UseCase[];
}

export function IndustriesSection() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/public/industries');
        if (!response.ok) throw new Error('Failed to fetch industries');
        const data = await response.json();
        setIndustries(data);
        if (data.length > 0) {
          setActiveTab(data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading industries...</p>
        </div>
      </section>
    );
  }

  if (industries.length === 0) {
    return null;
  }

  const activeIndustry = industries.find(
    (industry) => industry._id === activeTab
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
