import { motion } from "framer-motion";
import { Globe, Target, DollarSign, Clock, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Globe, title: "Comprehensive Coverage", desc: "Access imagery from 50+ satellite constellations worldwide." },
  { icon: Target, title: "High Precision", desc: "Up to 30cm resolution for detailed analysis and object detection." },
  { icon: DollarSign, title: "Cost-Effective", desc: "Pay only for what you need with flexible per-km² pricing." },
  { icon: Clock, title: "Rapid Delivery", desc: "Get imagery within hours — tasking to delivery in under 24 hours." },
  { icon: Layers, title: "Multi-Sensor", desc: "Optical, SAR, multispectral, and hyperspectral data in one place." },
  { icon: ShieldCheck, title: "Enterprise Security", desc: "SOC 2 compliant with end-to-end encryption and access controls." },
];

const PricingHighlights = () => (
  <section className="py-24">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Why <span className="text-gradient">Us</span>?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The most accessible satellite data platform on the planet.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-6 hover-glow group"
          >
            <f.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Button asChild size="lg" className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 text-white hover:bg-yellow-500/30 hover:border-yellow-500/50 rounded-full px-8 shadow-lg shadow-yellow-500/20 group">
          <Link to="/pricing">
            View Pricing <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

export default PricingHighlights;
