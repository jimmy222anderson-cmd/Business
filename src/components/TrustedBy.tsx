import { motion } from "framer-motion";
import { Marquee } from "./Marquee";
import { useState, useEffect } from "react";

interface Partner {
  _id: string;
  name: string;
  logo: string;
}

const TrustedBy = () => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/public/partners');
        if (!response.ok) throw new Error('Failed to fetch partners');
        const data = await response.json();
        // Get first 10 partners for the marquee
        setPartners(data.slice(0, 10));
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
  <section className="py-16 border-t border-b border-border/30">
    <div className="container mx-auto px-6 mb-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground"
      >
        Trusted by industry leaders
      </motion.p>
    </div>
    <Marquee speed={50} pauseOnHover={true}>
      {partners.map((partner) => (
        <div
          key={partner._id}
          className="mx-8 flex items-center justify-center min-w-[140px] opacity-40 hover:opacity-80 transition-opacity duration-300"
        >
          <span className="font-display text-lg font-semibold text-muted-foreground">{partner.name}</span>
        </div>
      ))}
    </Marquee>
  </section>
  );
};

export default TrustedBy;
