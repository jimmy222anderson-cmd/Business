import { motion } from 'framer-motion';
import { Carousel } from './Carousel';
import { ProductCard } from './ProductCard';
import { products } from '@/data/products';

export function ProductsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Our Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive suite of satellite data products and services
          </p>
        </motion.div>

        {/* Products Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Carousel
            autoPlay={true}
            interval={5000}
            showArrows={true}
            showDots={true}
            className="h-[400px]"
          >
            {products.map((product) => (
              <div key={product.id} className="flex justify-center items-center px-4">
                <ProductCard product={product} variant="carousel" />
              </div>
            ))}
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}

export default ProductsSection;
