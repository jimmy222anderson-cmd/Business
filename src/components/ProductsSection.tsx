import { motion } from 'framer-motion';
import { Carousel } from './Carousel';
import { ProductCard } from './ProductCard';
import { useState, useEffect } from 'react';
import { Product } from '@/types';

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  pricingBadge?: string;
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  useCases: Array<{
    title: string;
    description: string;
    industry?: string;
  }>;
  specifications: Array<{
    key: string;
    value: string;
    unit?: string;
  }>;
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
        const data: ApiProduct[] = await response.json();
        
        // Map API response to Product type
        const mappedProducts: Product[] = data.map(product => ({
          id: product._id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          longDescription: product.longDescription,
          image: product.image,
          pricingBadge: product.pricingBadge,
          features: product.features.map((f, idx) => ({
            id: `${product._id}-feature-${idx}`,
            title: f.title,
            description: f.description,
            icon: f.icon
          })),
          useCases: product.useCases.map((uc, idx) => ({
            id: `${product._id}-usecase-${idx}`,
            title: uc.title,
            description: uc.description,
            industry: uc.industry
          })),
          specifications: product.specifications,
          category: product.category as any
        }));
        
        setProducts(mappedProducts);
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
    <section className="relative py-24 bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 text-yellow-500 text-sm font-semibold">
              Our Solutions
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Our <span className="text-gradient">Products</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive suite of satellite data products and services designed to transform your business intelligence
          </p>
        </motion.div>

        {/* Products Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Decorative gradient borders */}
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/5 via-transparent to-blue-500/5 rounded-3xl blur-xl" />
          
          <div className="relative">
            <Carousel
              autoPlay={true}
              interval={5000}
              showArrows={true}
              showDots={true}
              className="h-[450px]"
            >
              {products.map((product, index) => (
                <div key={product.id || `product-carousel-${index}`} className="flex justify-center items-center px-4 h-full">
                  <ProductCard product={product} variant="carousel" />
                </div>
              ))}
            </Carousel>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ProductsSection;
