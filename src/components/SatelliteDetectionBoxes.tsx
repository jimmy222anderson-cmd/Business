import { motion } from "framer-motion";

interface DetectionBox {
  top: string;
  left: string;
  w: number;
  h: number;
  label: string;
  delay: number;
}

interface SatelliteDetectionBoxesProps {
  boxes?: DetectionBox[];
}

const defaultBoxes: DetectionBox[] = [
  { top: "25%", left: "15%", w: 60, h: 45, label: "Building", delay: 0.5 },
  { top: "40%", left: "65%", w: 50, h: 50, label: "Vehicle", delay: 1.0 },
  { top: "60%", left: "35%", w: 70, h: 40, label: "Infrastructure", delay: 1.5 },
  { top: "30%", left: "75%", w: 45, h: 55, label: "Vessel", delay: 2.0 },
];

/**
 * SatelliteDetectionBoxes component displays animated detection boxes
 * that simulate satellite object detection overlays.
 * 
 * Requirements: 3.2.5
 * - Floating animation with random positions
 * - 3-5 second duration per animation cycle
 */
const SatelliteDetectionBoxes = ({ boxes = defaultBoxes }: SatelliteDetectionBoxesProps) => {
  return (
    <>
      {boxes.map((box, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: box.delay, duration: 0.5 }}
          className="absolute hidden md:block"
          style={{ top: box.top, left: box.left }}
        >
          <div 
            className="relative animate-float" 
            style={{ 
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s` // 3-5 second duration
            }}
          >
            <div
              className="border border-primary/40 rounded-sm animate-pulse-glow"
              style={{ width: box.w, height: box.h }}
            />
            <span className="absolute -top-5 left-0 text-[10px] font-mono text-primary/70">
              {box.label}
            </span>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export default SatelliteDetectionBoxes;
