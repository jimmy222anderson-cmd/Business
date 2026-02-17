import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/utils/image';

interface UseCase {
  _id: string;
  title: string;
  description: string;
}

interface Industry {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  image: string;
  useCases: UseCase[];
}

export default function IndustryDetailPage() {
  const { industryId } = useParams<{ industryId: string }>();
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchIndustry = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/public/industries/${industryId}`);
        if (!response.ok) {
          setNotFound(true);
          return;
        }
        const data = await response.json();
        setIndustry(data);
      } catch (error) {
        console.error('Error fetching industry:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustry();
  }, [industryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading industry details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !industry) {
    return <Navigate to="/industries" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(industry.image)}
            alt={industry.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              {industry.name}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {industry.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Long Description Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {industry.longDescription}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Key Use Cases
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how satellite intelligence solves real-world challenges in {industry.name.toLowerCase()}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {industry.useCases.map((useCase, index) => (
              <motion.div
                key={useCase._id || `usecase-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-6 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Ready to Transform Your Operations?
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover how our satellite intelligence platform can help your organization
                make better decisions with real-time geospatial insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                asChild
              >
                <Link to="/demo">
                  Book a Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                asChild
              >
                <Link to="/products">
                  Explore Products
                </Link>
              </Button>
            </div>

            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Have questions? Our team is here to help.
              </p>
              <Button variant="link" className="text-yellow-500" asChild>
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
