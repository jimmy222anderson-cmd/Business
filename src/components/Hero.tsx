import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CoordinatesOverlay from "./CoordinatesOverlay";
import SatelliteDetectionBoxes from "./SatelliteDetectionBoxes";

const coordinates = [
  "40.7128° N, 74.0060° W",
  "35.6762° N, 139.6503° E",
  "51.5074° N, 0.1278° W",
  "48.8566° N, 2.3522° E",
  "-33.8688° S, 151.2093° E",
];

const Hero = () => {
  // Parallax effect for background
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark gradient background simulating satellite view with parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background"
        style={{ y: backgroundY }}
      />
      <motion.div 
        className="absolute inset-0 opacity-20" 
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(45 100% 55% / 0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, hsl(210 100% 50% / 0.06) 0%, transparent 50%),
                            radial-gradient(circle at 50% 80%, hsl(45 100% 55% / 0.04) 0%, transparent 50%)`,
          y: backgroundY,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Detection boxes */}
      <SatelliteDetectionBoxes />

      {/* Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 text-center"
        style={{ opacity }}
      >
        {/* Coordinates */}
        <CoordinatesOverlay coordinates={coordinates} typingSpeed={50} />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          Earth Intelligence
          <br />
          <span className="text-gradient">Platform</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Access the world's satellite data marketplace. High-resolution imagery,
          analytics, and insights — all in one platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-base font-semibold group"
            asChild
          >
            <Link to="/get-started">
              Get Started
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 text-base border-border/50 hover:bg-secondary/50"
            asChild
          >
            <Link to="/demo">
              Book a Demo
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
