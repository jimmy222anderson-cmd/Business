import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { industries } from '@/data/industries';
import { Industry } from '@/types';
import { ArrowRight } from 'lucide-react';

// Industry card component
function IndustryCard({ industry }: { industry: Industry }) {
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
            src={industry.image}
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
            {industries.map((industry) => (
              <IndustryCard key={industry.id} industry={industry} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
