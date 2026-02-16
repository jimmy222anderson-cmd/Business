import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Shield, Loader2 } from 'lucide-react';
import { getPrivacyPolicy, type ContentSection } from '@/lib/api/content';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Policy section interface (now using ContentSection from API)
interface PolicySection {
  id: string;
  title: string;
  content: string[];
}

// Table of contents component
function TableOfContents({ 
  sections, 
  activeSection, 
  onSectionClick,
  isCollapsed,
  onToggleCollapse 
}: { 
  sections: PolicySection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <Card className="p-6">
      {/* Mobile toggle button */}
      <button
        onClick={onToggleCollapse}
        className="lg:hidden flex items-center justify-between w-full mb-4 text-left"
      >
        <h2 className="text-lg font-bold text-foreground">Table of Contents</h2>
        {isCollapsed ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Desktop title */}
      <h2 className="hidden lg:block text-lg font-bold text-foreground mb-4">
        Table of Contents
      </h2>

      {/* TOC links */}
      <ScrollArea className={`${isCollapsed ? 'hidden lg:block' : 'block'} h-[400px] lg:h-[600px]`}>
        <nav className="space-y-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeSection === section.id
                  ? 'bg-yellow-500/10 text-yellow-500 font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="mr-2">{index + 1}.</span>
              {section.title}
            </button>
          ))}
        </nav>
      </ScrollArea>
    </Card>
  );
}

// Content section component
function ContentSection({ section, index }: { section: PolicySection; index: number }) {
  return (
    <motion.section
      id={section.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-12 scroll-mt-24"
    >
      <h2 className="text-2xl font-bold text-foreground mb-4">
        {index + 1}. {section.title}
      </h2>
      <div className="space-y-4">
        {section.content.map((paragraph, pIndex) => (
          <p key={pIndex} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </motion.section>
  );
}

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [isTocCollapsed, setIsTocCollapsed] = useState(true);
  const [sections, setSections] = useState<PolicySection[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPrivacyPolicy();
        
        // Convert API sections to PolicySection format
        const convertedSections: PolicySection[] = data.sections.map((section: ContentSection) => ({
          id: section.id,
          title: section.title,
          content: section.content.split('\n\n').filter(p => p.trim())
        }));
        
        setSections(convertedSections);
        setLastUpdated(new Date(data.lastUpdated).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      } catch (err) {
        console.error('Error fetching privacy policy:', err);
        setError('Failed to load privacy policy. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Collapse TOC on mobile after clicking
    if (window.innerWidth < 1024) {
      setIsTocCollapsed(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading privacy policy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield className="w-10 h-10 text-yellow-500" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Privacy Policy
                </h1>
              </div>
            </motion.div>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-6">
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Privacy Policy
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground">
              Last Updated: {lastUpdated || 'Loading...'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
              {/* Table of Contents - Sticky on desktop */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <TableOfContents
                  sections={sections}
                  activeSection={activeSection}
                  onSectionClick={handleSectionClick}
                  isCollapsed={isTocCollapsed}
                  onToggleCollapse={() => setIsTocCollapsed(!isTocCollapsed)}
                />
              </aside>

              {/* Content Sections */}
              <div className="max-w-3xl">
                <Card className="p-8">
                  {sections.map((section, index) => (
                    <ContentSection key={section.id} section={section} index={index} />
                  ))}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
