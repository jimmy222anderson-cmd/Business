import { motion } from "framer-motion";
import { Satellite, Database, Globe } from "lucide-react";

const cards = [
  {
    icon: Satellite,
    title: "Democratizing Space Data",
    description: "We're making satellite imagery as easy to access as a Google search. No contracts, no minimums — just the data you need, when you need it.",
  },
  {
    icon: Database,
    title: "One Platform, All Sources",
    description: "Instead of navigating dozens of providers, SkyFi aggregates 50+ satellite constellations into a single, unified marketplace.",
  },
  {
    icon: Globe,
    title: "Global Coverage, Local Detail",
    description: "From broad area monitoring to 30cm detail, cover any location on Earth with the right sensor for your mission.",
  },
];

const AboutPreview = () => (
  <section className="py-24">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
          About <span className="text-gradient">SkyFi</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="glass rounded-2xl p-8 text-center hover-glow"
          >
            <card.icon className="w-12 h-12 text-primary mx-auto mb-6" />
            <h3 className="font-display text-xl font-semibold mb-3">{card.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutPreview;
