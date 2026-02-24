import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/utils/image';

interface Partner {
  _id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  category: 'satellite' | 'data' | 'technology' | 'client';
}

const categoryLabels: Record<Partner['category'], string> = {
  satellite: 'Satellite Providers',
  data: 'Data Providers',
  technology: 'Technology Partners',
  client: 'Client Partners',
};

// Partner card component
function PartnerCard({ partner }: { partner: Partner }) {
  const [imageError, setImageError] = useState(false);

  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-yellow-500/50 transition-all duration-300 p-6 h-full flex flex-col"
    >
      {/* Partner Logo */}
      <div className="flex items-center justify-center h-24 mb-4 bg-muted rounded-lg">
        {!imageError ? (
          <img
            src={getImageUrl(partner.logo)}
            alt={`${partner.name} logo`}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 p-2"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-2xl font-bold text-muted-foreground">
            {partner.name.split(' ').map(word => word[0]).join('').slice(0, 3)}
          </div>
        )}
      </div>

      {/* Partner Name */}
      <h3 className="text-lg font-bold text-foreground group-hover:text-yellow-500 transition-colors text-center mb-2">
        {partner.name}
      </h3>

      {/* Partner Description */}
      {partner.description && (
        <p className="text-sm text-muted-foreground text-center flex-grow">
          {partner.description}
        </p>
      )}

      {/* External Link Icon */}
      {partner.website && (
        <div className="flex items-center justify-center mt-4 text-yellow-500">
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </motion.div>
  );

  // Wrap in anchor if website exists
  if (partner.website) {
    return (
      <a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {CardContent}
      </a>
    );
  }

  return CardContent;
}

// Category section component
function CategorySection({
  category,
  categoryPartners,
}: {
  category: Partner['category'];
  categoryPartners: Partner[];
}) {
  return (
    <section className="mb-16">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-2xl md:text-3xl font-bold text-foreground mb-8"
      >
        {categoryLabels[category]}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoryPartners.map((partner, index) => (
          <PartnerCard key={partner._id || `partner-${index}`} partner={partner} />
        ))}
      </div>
    </section>
  );
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/public/partners');
        if (!response.ok) throw new Error('Failed to fetch partners');
        const data = await response.json();
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading partners...</p>
        </div>
      </div>
    );
  }

  // Group partners by category
  const satellitePartners = partners.filter((p) => p.category === 'satellite');
  const dataPartners = partners.filter((p) => p.category === 'data');
  const technologyPartners = partners.filter((p) => p.category === 'technology');
  const clientPartners = partners.filter((p) => p.category === 'client');

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
              Our Partners
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              We collaborate with leading satellite providers, data sources, and technology
              companies to deliver comprehensive space-based intelligence solutions. Our partner
              network ensures you have access to the best data and tools available.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Partners Directory */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Satellite Providers */}
          <CategorySection
            category="satellite"
            categoryPartners={satellitePartners}
          />

          {/* Data Providers */}
          <CategorySection category="data" categoryPartners={dataPartners} />

          {/* Technology Partners */}
          <CategorySection
            category="technology"
            categoryPartners={technologyPartners}
          />

          {/* Client Partners */}
          <CategorySection category="client" categoryPartners={clientPartners} />
        </div>
      </section>
    </div>
  );
}
