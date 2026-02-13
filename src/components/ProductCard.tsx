import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
  variant?: 'carousel' | 'grid';
}

export function ProductCard({ product, variant = 'carousel' }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-lg bg-card border border-border/50 ${
        variant === 'carousel' ? 'min-w-[300px] md:min-w-[350px]' : 'w-full'
      }`}
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {/* Pricing Badge */}
        {product.pricingBadge && (
          <Badge className="absolute top-4 right-4 bg-yellow-500 text-black hover:bg-yellow-600">
            {product.pricingBadge}
          </Badge>
        )}
      </div>

      {/* Product Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {product.name}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {product.description}
        </p>

        {/* CTA Link */}
        <Button
          variant="ghost"
          className="group p-0 h-auto text-yellow-500 hover:text-yellow-400 hover:bg-transparent"
          asChild
        >
          <Link to={`/products/${product.slug}`}>
            Learn More
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
