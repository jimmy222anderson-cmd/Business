import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';

// Policy section interface
interface PolicySection {
  id: string;
  title: string;
  content: string[];
}

// Privacy policy sections data
const privacyPolicySections: PolicySection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: [
      "Earth Intelligence Platform ('we', 'our', or 'us') is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our satellite intelligence platform and services.",
      'By accessing or using our services, you agree to the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.',
      'We reserve the right to update this Privacy Policy at any time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.',
    ],
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    content: [
      'We collect several types of information from and about users of our services, including:',
      'Personal Information: Name, email address, phone number, company name, job title, and billing information when you register for an account or request services.',
      'Usage Data: Information about how you access and use our platform, including your IP address, browser type, operating system, pages viewed, time spent on pages, and navigation paths.',
      'Geospatial Data: Location data and satellite imagery requests you make through our platform, including areas of interest and analysis parameters.',
      'Technical Data: Device information, log files, cookies, and similar tracking technologies to enhance your experience and analyze platform usage.',
      'Communications: Records of your correspondence with us, including support tickets, feedback, and inquiries.',
    ],
  },
  {
    id: 'how-we-use-information',
    title: 'How We Use Your Information',
    content: [
      'We use the information we collect for various purposes, including:',
      'Service Delivery: To provide, maintain, and improve our satellite intelligence platform and deliver the services you request.',
      'Account Management: To create and manage your account, process transactions, and provide customer support.',
      'Communication: To send you technical notices, updates, security alerts, and administrative messages.',
      'Analytics and Improvement: To analyze usage patterns, optimize platform performance, and develop new features and services.',
      'Marketing: To send you promotional materials, newsletters, and information about our services (you can opt out at any time).',
      'Legal Compliance: To comply with legal obligations, enforce our terms of service, and protect our rights and the rights of our users.',
      'Research and Development: To conduct research, analysis, and development of new satellite intelligence capabilities and AI algorithms.',
    ],
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing and Disclosure',
    content: [
      'We do not sell your personal information. We may share your information in the following circumstances:',
      'Service Providers: We work with third-party service providers who perform services on our behalf, such as cloud hosting, payment processing, data analysis, and customer support. These providers have access to your information only to perform specific tasks and are obligated to protect your data.',
      'Satellite Data Partners: We share necessary information with our satellite data providers (Maxar, Planet, Airbus, etc.) to fulfill your data requests and deliver services.',
      'Business Transfers: If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.',
      'Legal Requirements: We may disclose your information if required by law, court order, or governmental request, or to protect our rights, property, or safety.',
      'With Your Consent: We may share your information with third parties when you explicitly consent to such sharing.',
    ],
  },
  {
    id: 'cookies-tracking',
    title: 'Cookies and Tracking Technologies',
    content: [
      'We use cookies and similar tracking technologies to collect and track information about your use of our platform. Cookies are small data files stored on your device.',
      'Essential Cookies: Required for the platform to function properly, including authentication and security features.',
      'Analytics Cookies: Help us understand how users interact with our platform, allowing us to improve functionality and user experience.',
      'Preference Cookies: Remember your settings and preferences to provide a personalized experience.',
      'Marketing Cookies: Track your browsing activity to deliver relevant advertisements and measure campaign effectiveness.',
      'You can control cookie preferences through your browser settings. However, disabling certain cookies may limit your ability to use some features of our platform.',
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Rights and Choices',
    content: [
      'Depending on your location, you may have certain rights regarding your personal information:',
      'Access: You can request access to the personal information we hold about you.',
      'Correction: You can request that we correct inaccurate or incomplete information.',
      'Deletion: You can request that we delete your personal information, subject to certain legal exceptions.',
      'Portability: You can request a copy of your data in a structured, machine-readable format.',
      'Objection: You can object to our processing of your personal information for certain purposes.',
      'Opt-Out: You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly.',
      'To exercise these rights, please contact us at privacy@earthintelligence.com. We will respond to your request within 30 days.',
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    content: [
      'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
      'Our security measures include encryption of data in transit and at rest, regular security assessments, access controls, and employee training on data protection.',
      'We use industry-standard SSL/TLS encryption for all data transmissions and store sensitive data in secure, access-controlled environments.',
      'While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your data to the best of our ability.',
      'In the event of a data breach that affects your personal information, we will notify you and relevant authorities as required by applicable law.',
    ],
  },
  {
    id: 'international-transfers',
    title: 'International Data Transfers',
    content: [
      'Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.',
      'When we transfer personal information internationally, we ensure appropriate safeguards are in place, such as standard contractual clauses approved by relevant authorities.',
      'By using our services, you consent to the transfer of your information to the United States and other countries where we or our service providers operate.',
      'We comply with applicable data protection frameworks, including the EU-U.S. Data Privacy Framework and the UK-U.S. Data Privacy Framework.',
    ],
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    content: [
      'Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.',
      'If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information as quickly as possible.',
      'If you believe we have collected information from a child, please contact us immediately at privacy@earthintelligence.com.',
    ],
  },
  {
    id: 'changes-to-policy',
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.',
      'We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date at the top of this page.',
      'For significant changes, we may provide additional notice, such as sending an email notification or displaying a prominent notice on our platform.',
      'Your continued use of our services after any changes to this Privacy Policy constitutes your acceptance of the updated terms.',
    ],
  },
  {
    id: 'contact-us',
    title: 'Contact Us',
    content: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
      'Email: privacy@earthintelligence.com',
      'Phone: +1 (555) 123-4567',
      'Address: Earth Intelligence Platform, 123 Satellite Way, San Francisco, CA 94105, United States',
      'Data Protection Officer: dpo@earthintelligence.com',
      'We will respond to your inquiry within 30 business days.',
    ],
  },
];

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
              Last Updated: January 15, 2024
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
                  sections={privacyPolicySections}
                  activeSection={activeSection}
                  onSectionClick={handleSectionClick}
                  isCollapsed={isTocCollapsed}
                  onToggleCollapse={() => setIsTocCollapsed(!isTocCollapsed)}
                />
              </aside>

              {/* Content Sections */}
              <div className="max-w-3xl">
                <Card className="p-8">
                  {privacyPolicySections.map((section, index) => (
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
