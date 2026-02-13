import { motion, AnimatePresence } from 'framer-motion';
import { Industry } from '@/types';

interface IndustryContentProps {
  industry: Industry;
}

export function IndustryContent({ industry }: IndustryContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={industry.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="grid md:grid-cols-2 gap-8 items-center"
      >
        {/* Industry Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-lg aspect-video"
        >
          <img
            src={industry.image}
            alt={industry.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>

        {/* Industry Description */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
            {industry.name}
          </h3>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            {industry.description}
          </p>

          {/* Use Cases (if available) */}
          {industry.useCases && industry.useCases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-yellow-500 uppercase tracking-wide">
                Key Use Cases
              </h4>
              <ul className="space-y-2">
                {industry.useCases.slice(0, 3).map((useCase) => (
                  <li
                    key={useCase.id}
                    className="flex items-start text-sm text-muted-foreground"
                  >
                    <span className="mr-2 text-yellow-500">•</span>
                    <span>{useCase.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
