import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CoordinatesOverlay from "./CoordinatesOverlay";

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
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-background.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Gradient overlay for depth */}
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
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 px-4"
        >
          <span className="block sm:inline">ATLAS Space</span>
          <span className="block sm:inline"> </span>
          <span className="text-gradient block sm:inline">& Data Systems</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Access the world's satellite data marketplace. High-resolution imagery,
          analytics, and space-based intelligence — all in one platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 text-white hover:bg-yellow-500/30 hover:border-yellow-500/50 hover:text-black rounded-full px-8 text-base font-semibold group shadow-lg shadow-yellow-500/20"
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
            className="bg-white/20 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/30 hover:border-white/60 rounded-full px-8 text-base font-semibold shadow-lg shadow-white/10"
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
