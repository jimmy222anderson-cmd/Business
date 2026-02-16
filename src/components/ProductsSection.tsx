import { motion } from 'framer-motion';
import { Carousel } from './Carousel';
import { ProductCard } from './ProductCard';
import { useState, useEffect } from 'react';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface UseCase {
  title: string;
  description: string;
  industry?: string;
}

interface Specification {
  key: string;
  value: string;
  unit?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  pricingBadge?: string;
  features: Feature[];
  useCases: UseCase[];
  specifications: Specification[];
  category: string;
  status: string;
  order: number;
}

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/public/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

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
              <div key={product._id} className="flex justify-center items-center px-4">
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
