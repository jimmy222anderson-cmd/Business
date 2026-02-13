import { motion } from "framer-motion";
import { Marquee } from "./Marquee";

const partners = [
  "Maxar", "Planet", "Airbus", "BlackBridge", "ICEYE",
  "Capella", "Satellogic", "21AT", "HEAD Aerospace", "Umbra",
];

const TrustedBy = () => (
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
      {partners.map((name, i) => (
        <div
          key={i}
          className="mx-8 flex items-center justify-center min-w-[140px] opacity-40 hover:opacity-80 transition-opacity duration-300"
        >
          <span className="font-display text-lg font-semibold text-muted-foreground">{name}</span>
        </div>
      ))}
    </Marquee>
  </section>
);

export default TrustedBy;
