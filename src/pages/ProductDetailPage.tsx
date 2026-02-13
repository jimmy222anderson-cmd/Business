import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products } from '@/data/products';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  
  // Find the product by slug
  const product = products.find(p => p.slug === productId);

  // If product not found, redirect to products page
  if (!product) {
    return <Navigate to="/products" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[400px] object-cover rounded-lg shadow-2xl"
              />
              {product.pricingBadge && (
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-black hover:bg-yellow-600 text-lg px-4 py-2">
                  {product.pricingBadge}
                </Badge>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-4" variant="outline">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                {product.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {product.longDescription}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black" asChild>
                  <Link to="/demo">
                    Book a Demo
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {product.features.length > 0 && (
        <section className="py-20 bg-background/50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Key Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful capabilities designed to meet your needs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {product.features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card border border-border/50 rounded-lg p-6"
                >
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Use Cases Section */}
      {product.useCases.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Use Cases
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real-world applications across industries
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {product.useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card border border-border/50 rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {useCase.description}
                  </p>
                  {useCase.industry && (
                    <Badge variant="secondary">
                      {useCase.industry.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specifications Section */}
      {product.specifications.length > 0 && (
        <section className="py-20 bg-background/50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Technical Specifications
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl mx-auto bg-card border border-border/50 rounded-lg overflow-hidden"
            >
              <table className="w-full">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-background/50' : ''}
                    >
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {spec.key}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {spec.value} {spec.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-t from-background to-background/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contact our team to learn more about {product.name} and how it can
              help your organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black" asChild>
                <Link to="/demo">
                  Book a Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/quote">
                  Request a Quote
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;
