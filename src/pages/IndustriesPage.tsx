import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils/image';

// Industry card component
function IndustryCard({ industry }: { industry: any }) {
  return (
    <Link to={`/industries/${industry.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-yellow-500/50 transition-all duration-300"
      >
        {/* Industry Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getImageUrl(industry.image)}
            alt={industry.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Industry Content */}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-bold text-foreground group-hover:text-yellow-500 transition-colors">
            {industry.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {industry.description}
          </p>

          {/* Learn More Link */}
          <div className="flex items-center text-sm text-yellow-500 font-medium group-hover:gap-2 transition-all">
            <span>Learn more</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function IndustriesPage() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/public/industries`);
      
      if (!response.ok) throw new Error('Failed to fetch industries');
      
      const data = await response.json();
      setIndustries(data);
    } catch (error) {
      console.error('Error fetching industries:', error);
      toast.error('Failed to load industries');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">Loading industries...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Industries We Serve
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Discover how satellite intelligence transforms operations across diverse sectors.
              From agriculture to insurance, our platform delivers actionable insights for every industry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <IndustryCard key={industry._id || industry.id || `industry-${index}`} industry={industry} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
