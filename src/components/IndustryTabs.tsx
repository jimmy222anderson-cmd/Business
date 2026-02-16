import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Industry } from '@/types';

interface IndustryTabsProps {
  industries: Industry[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function IndustryTabs({ industries, activeTab, onTabChange }: IndustryTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = industries.findIndex((industry) => industry._id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];

    if (activeTabElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab, industries]);

  // Handle swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      const currentIndex = industries.findIndex((industry) => industry._id === activeTab);
      
      if (swipeDistance > 0 && currentIndex < industries.length - 1) {
        // Swipe left - next tab
        onTabChange(industries[currentIndex + 1]._id);
      } else if (swipeDistance < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        onTabChange(industries[currentIndex - 1]._id);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tabs Container */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-4 pb-4">
        {industries.map((industry, index) => (
          <button
            key={industry._id}
            ref={(el) => (tabsRef.current[index] = el)}
            onClick={() => onTabChange(industry._id)}
            className={`
              relative px-4 py-2 text-sm md:text-base font-medium whitespace-nowrap
              transition-colors duration-200 rounded-lg
              ${
                activeTab === industry._id
                  ? 'text-yellow-500'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
            aria-selected={activeTab === industry._id}
            role="tab"
          >
            {industry.name}
          </button>
        ))}
      </div>

      {/* Active Tab Indicator */}
      <motion.div
        className="absolute bottom-0 h-0.5 bg-yellow-500"
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />
    </div>
  );
}
