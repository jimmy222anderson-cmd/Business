import { motion } from "framer-motion";

const partners = [
  "Maxar", "Planet", "Airbus", "ICEYE", "Capella Space",
  "Satellogic", "Umbra", "BlackSky", "21AT", "HEAD Aerospace",
  "SI Imaging", "Chang Guang Satellite", "GHGSat", "Pixxel", "Spire Global",
  "HawkEye 360",
];

const PartnersGrid = () => (
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
        {partners.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-6 flex items-center justify-center hover-scale hover-glow cursor-pointer"
          >
            <span className="font-display font-semibold text-muted-foreground text-sm text-center">{name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PartnersGrid;
