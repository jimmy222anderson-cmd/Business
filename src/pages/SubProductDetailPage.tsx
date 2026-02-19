import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductInquiryForm, type ProductInquiryFormData } from '@/components/forms';
import { createProductInquiry } from '@/lib/api';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/utils/image';

export function SubProductDetailPage() {
  const { productId, subProductId } = useParams<{ productId: string; subProductId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [subProduct, setSubProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProductAndSubProduct();
  }, [productId, subProductId]);

  const fetchProductAndSubProduct = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/public/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
        }
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      setProduct(data);

      // Find the sub-product
      const foundSubProduct = data.subProducts?.find((sp: any) => sp.slug === subProductId);
      if (!foundSubProduct) {
        setNotFound(true);
      } else {
        setSubProduct(foundSubProduct);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // If not found, redirect to parent product page
  if (notFound) {
    return <Navigate to={`/products/${productId}`} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!product || !subProduct) {
    return <Navigate to="/products" replace />;
  }

  const handleInquirySubmit = async (data: ProductInquiryFormData) => {
    setIsSubmitting(true);
    try {
      const inquiryData = {
        product_id: product._id || product.id,
        full_name: data.full_name || '',
        email: data.email || '',
        company: data.company || '',
        message: `Inquiry about ${product.name} - ${subProduct.name}\n\n${data.message || ''}`
      };
      
      await createProductInquiry(inquiryData);

      toast.success("Inquiry Submitted!", {
        description: "Thank you for your interest. Our sales team will contact you within 1 business day.",
      });
    } catch (error) {
      console.error('Error submitting product inquiry:', error);
      toast.error("Submission Failed", {
        description: "There was an error submitting your inquiry. Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-6">
          {/* Breadcrumb Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link to="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <span>/</span>
            <Link to={`/products/${product.slug}`} className="hover:text-foreground transition-colors">
              {product.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">{subProduct.name}</span>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Sub-Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src={getImageUrl(subProduct.image || product.image)}
                alt={subProduct.name}
                className="w-full h-[400px] object-cover rounded-lg shadow-2xl"
              />
            </motion.div>

            {/* Sub-Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-4" variant="outline">
                {product.name}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                {subProduct.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {subProduct.longDescription || subProduct.description}
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
      {subProduct.features && subProduct.features.length > 0 && (
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
                Powerful capabilities of {subProduct.name}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {subProduct.features.map((feature: any, index: number) => (
                <motion.div
                  key={feature._id || `feature-${index}`}
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

      {/* Specifications Section */}
      {subProduct.specifications && subProduct.specifications.length > 0 && (
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
                  {subProduct.specifications.map((spec: any, index: number) => (
                    <tr
                      key={spec._id || `spec-${index}`}
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

      {/* Other Sub-Products */}
      {product.subProducts && product.subProducts.length > 1 && (
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
                Other {product.name} Options
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {product.subProducts
                .filter((sp: any) => sp.slug !== subProductId)
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((sp: any, index: number) => (
                  <motion.div
                    key={sp._id || `subproduct-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Link to={`/products/${product.slug}/${sp.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-yellow-500/50">
                        {sp.image && sp.image !== '/placeholder.svg' && (
                          <img
                            src={getImageUrl(sp.image)}
                            alt={sp.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        <CardHeader>
                          <CardTitle className="text-xl">{sp.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3">
                            {sp.description}
                          </p>
                          <Button variant="link" className="mt-4 p-0 text-yellow-500">
                            Learn More →
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Inquiry Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Inquire About {subProduct.name}</CardTitle>
                  <CardDescription>
                    Have questions or want to learn more? Send us your inquiry and our team will get back to you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductInquiryForm
                    productId={product._id || product.id}
                    productName={`${product.name} - ${subProduct.name}`}
                    onSubmit={handleInquirySubmit}
                    isSubmitting={isSubmitting}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

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
              Contact our team to learn more about {subProduct.name} and how it can
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

export default SubProductDetailPage;
