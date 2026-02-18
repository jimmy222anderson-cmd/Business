import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils/image";

interface Partner {
  _id: string;
  name: string;
  logo: string;
}

// Partner card component with image error handling
function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl p-6 flex items-center justify-center hover-scale hover-glow cursor-pointer"
    >
      {!imageError ? (
        <img
          src={getImageUrl(partner.logo)}
          alt={`${partner.name} logo`}
          className="max-h-16 max-w-full object-contain"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-display font-semibold text-muted-foreground text-sm text-center">
          {partner.name}
        </span>
      )}
    </motion.div>
  );
}

const PartnersGrid = () => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/public/partners');
        if (!response.ok) throw new Error('Failed to fetch partners');
        const data = await response.json();
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
    };

    fetchPartners();
  }, []);

  if (partners.length === 0) {
    return null;
  }

  return (
  <section className="py-24 bg-secondary/30">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Our <span className="text-gradient">Partners</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Integrated with the world's leading satellite data providers.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {partners.map((partner, i) => (
          <PartnerCard key={partner._id} partner={partner} index={i} />
        ))}
      </div>
    </div>
  </section>
  );
};

export default PartnersGrid;
