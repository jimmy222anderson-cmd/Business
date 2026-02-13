import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Satellite } from "lucide-react";

interface CoordinatesOverlayProps {
  coordinates: string[];
  typingSpeed?: number;
}

/**
 * CoordinatesOverlay component displays a typing animation effect
 * that cycles through different coordinate strings.
 * 
 * Requirements: 3.2.2
 * - Character-by-character reveal effect
 * - Configurable typing speed (default 50ms per character)
 */
const CoordinatesOverlay = ({ 
  coordinates, 
  typingSpeed = 50 
}: CoordinatesOverlayProps) => {
  const [coordIndex, setCoordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const target = coordinates[coordIndex];
    
    if (isTyping) {
      // Typing forward
      if (displayText.length < target.length) {
        const timeout = setTimeout(
          () => setDisplayText(target.slice(0, displayText.length + 1)), 
          typingSpeed
        );
        return () => clearTimeout(timeout);
      } else {
        // Pause before deleting
        const timeout = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting backward
      if (displayText.length > 0) {
        const timeout = setTimeout(
          () => setDisplayText(displayText.slice(0, -1)), 
          typingSpeed * 0.6 // Delete faster than typing
        );
        return () => clearTimeout(timeout);
      } else {
        // Move to next coordinate
        setCoordIndex((prev) => (prev + 1) % coordinates.length);
        setIsTyping(true);
      }
    }
  }, [displayText, isTyping, coordIndex, coordinates, typingSpeed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-mono text-muted-foreground">
        <Satellite className="w-3.5 h-3.5 text-primary" />
        <span>{displayText}</span>
        <span className="animate-blink text-primary">|</span>
      </div>
    </motion.div>
  );
};

export default CoordinatesOverlay;
