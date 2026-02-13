import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface SlideUpProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  triggerOnScroll?: boolean;
  className?: string;
}

export function SlideUp({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  triggerOnScroll = false,
  className = '',
}: SlideUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const shouldAnimate = triggerOnScroll ? isInView : true;

  // Calculate initial position based on direction
  const getInitialPosition = () => {
    if (prefersReducedMotion) return { x: 0, y: 0 };
    
    switch (direction) {
      case 'up':
        return { x: 0, y: 50 };
      case 'down':
        return { x: 0, y: -50 };
      case 'left':
        return { x: 50, y: 0 };
      case 'right':
        return { x: -50, y: 0 };
      default:
        return { x: 0, y: 50 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={
        shouldAnimate
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...getInitialPosition() }
      }
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
