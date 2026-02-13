import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

// Terms section interface
interface TermsSection {
  id: string;
  title: string;
  content: string[];
}

// Terms of service sections data
const termsOfServiceSections: TermsSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: [
      "By accessing or using the Earth Intelligence Platform ('Platform', 'Service', 'we', 'our', or 'us'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, you may not access or use the Platform.",
      'These Terms constitute a legally binding agreement between you (whether personally or on behalf of an entity) and Earth Intelligence Platform. We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of any changes.',
      'If you are using the Platform on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.',
    ],
  },
  {
    id: 'description',
    title: 'Description of Service',
    content: [
      'Earth Intelligence Platform provides satellite intelligence services, including access to satellite imagery, geospatial data analysis, AI-powered insights, and related tools and features.',
      'Our Service includes access to data from multiple satellite providers (Maxar, Planet, Airbus, and others), advanced analytics capabilities, API access, and custom reporting tools.',
      'We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.',
      'The Service is provided on an "as is" and "as available" basis. We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free.',
    ],
  },
  {
    id: 'user-accounts',
    title: 'User Accounts and Registration',
    content: [
      'To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.',
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
      'We reserve the right to suspend or terminate your account if any information provided during registration or thereafter proves to be inaccurate, false, or misleading.',
      'You may not transfer your account to another person or entity without our prior written consent.',
      'You must be at least 18 years old to create an account and use the Service.',
    ],
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use Policy',
    content: [
      'You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:',
      'Use the Service in any way that violates any applicable federal, state, local, or international law or regulation.',
      'Engage in any conduct that restricts or inhibits anyone\'s use or enjoyment of the Service, or which may harm us or users of the Service.',
      'Use the Service to transmit any advertising or promotional material, spam, or unsolicited communications.',
      'Attempt to gain unauthorized access to any portion of the Service, other accounts, computer systems, or networks connected to the Service.',
      'Use any automated system, including robots, spiders, or scrapers, to access the Service without our express written permission.',
      'Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Service.',
      'Use the Service for any illegal surveillance, military targeting, or weapons development purposes.',
      'Resell, redistribute, or provide access to the Service or satellite data to third parties without proper licensing.',
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property Rights',
    content: [
      'The Platform and its entire contents, features, and functionality (including but not limited to all information, software, code, text, displays, graphics, photographs, video, audio, design, presentation, selection, and arrangement) are owned by Earth Intelligence Platform, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.',
      'Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Platform for your internal business purposes.',
      'Satellite imagery and data accessed through the Platform are subject to the terms and conditions of our data providers. You agree to comply with all applicable licensing terms for satellite data.',
      'You retain all rights to any data, content, or materials you upload to the Platform. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content solely for the purpose of providing the Service to you.',
      'Our trademarks, service marks, and logos used and displayed on the Platform are our registered and unregistered trademarks. Nothing in these Terms grants you any right to use our trademarks without our prior written permission.',
    ],
  },
  {
    id: 'payment-billing',
    title: 'Payment and Billing',
    content: [
      'Certain features of the Platform require payment of fees. You agree to pay all fees associated with your account in accordance with the pricing and payment terms presented to you.',
      'All fees are non-refundable unless otherwise stated in your service agreement or required by law.',
      'We reserve the right to change our pricing at any time. We will provide you with reasonable notice of any pricing changes, and such changes will apply to subsequent billing periods.',
      'You authorize us to charge your designated payment method for all fees incurred. If your payment method fails, we may suspend or terminate your access to the Service.',
      'You are responsible for all taxes associated with your use of the Service, excluding taxes based on our net income.',
      'For enterprise customers, payment terms will be specified in your separate service agreement.',
    ],
  },
  {
    id: 'service-modifications',
    title: 'Service Modifications and Availability',
    content: [
      'We reserve the right to modify, update, or discontinue the Service (or any part thereof) at any time with or without notice.',
      'We may perform scheduled maintenance that temporarily interrupts access to the Service. We will attempt to provide advance notice of scheduled maintenance when possible.',
      'We do not guarantee that the Service will be available at all times or that it will be free from errors, viruses, or other harmful components.',
      'Satellite data availability is subject to factors beyond our control, including weather conditions, satellite orbits, and data provider availability.',
      'We will not be liable for any loss or damage arising from Service unavailability, modifications, or interruptions.',
    ],
  },
  {
    id: 'limitation-liability',
    title: 'Limitation of Liability',
    content: [
      'TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL EARTH INTELLIGENCE PLATFORM, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:',
      '(a) Your access to or use of or inability to access or use the Service;',
      '(b) Any conduct or content of any third party on the Service;',
      '(c) Any content obtained from the Service;',
      '(d) Unauthorized access, use, or alteration of your transmissions or content.',
      'IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS RELATING TO THE SERVICE EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.',
      'SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.',
    ],
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    content: [
      'You agree to defend, indemnify, and hold harmless Earth Intelligence Platform, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys\' fees) arising out of or relating to:',
      '(a) Your violation of these Terms;',
      '(b) Your use of the Service, including any data or content transmitted or received by you;',
      '(c) Your violation of any rights of another party, including any intellectual property rights;',
      '(d) Your violation of any applicable law, rule, or regulation;',
      '(e) Any claim that your content caused damage to a third party.',
      'We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which event you will cooperate with us in asserting any available defenses.',
    ],
  },
  {
    id: 'termination',
    title: 'Termination',
    content: [
      'We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.',
      'You may terminate your account at any time by contacting us at support@earthintelligence.com. Upon termination, your right to use the Service will immediately cease.',
      'Upon termination, all provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnity, and limitations of liability.',
      'If your account is terminated, we may delete your data and content. We are not obligated to retain or provide you with copies of your data after termination.',
      'Termination does not relieve you of any obligations to pay outstanding fees or charges incurred prior to termination.',
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law and Dispute Resolution',
    content: [
      'These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.',
      'Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the Commercial Arbitration Rules of the American Arbitration Association.',
      'Arbitration shall take place in San Francisco, California. The arbitrator\'s decision shall be final and binding, and judgment may be entered upon it in any court of competent jurisdiction.',
      'Notwithstanding the foregoing, we may seek injunctive or other equitable relief in any court of competent jurisdiction to protect our intellectual property rights.',
      'You agree to waive any right to a jury trial or to participate in a class action lawsuit.',
      'If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: [
      'If you have any questions, concerns, or disputes regarding these Terms of Service, please contact us:',
      'Email: legal@earthintelligence.com',
      'Phone: +1 (555) 123-4567',
      'Address: Earth Intelligence Platform, 123 Satellite Way, San Francisco, CA 94105, United States',
      'Support: support@earthintelligence.com',
      'We will respond to your inquiry within 5 business days.',
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
  sections: TermsSection[];
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
function ContentSection({ section, index }: { section: TermsSection; index: number }) {
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

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('acceptance');
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
              <FileText className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Terms of Service
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Please read these terms carefully before using our platform and services.
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
                  sections={termsOfServiceSections}
                  activeSection={activeSection}
                  onSectionClick={handleSectionClick}
                  isCollapsed={isTocCollapsed}
                  onToggleCollapse={() => setIsTocCollapsed(!isTocCollapsed)}
                />
              </aside>

              {/* Content Sections */}
              <div className="max-w-3xl">
                <Card className="p-8">
                  {termsOfServiceSections.map((section, index) => (
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
