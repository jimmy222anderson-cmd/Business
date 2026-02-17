const mongoose = require('mongoose');
const Content = require('../models/Content');
const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setDefaultResultOrder('ipv4first');

// Privacy Policy content
const privacyPolicyContent = {
  type: 'privacy-policy',
  version: '1.0',
  lastUpdated: new Date('2024-01-15'),
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: "Earth Intelligence Platform ('we', 'our', or 'us') is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our satellite intelligence platform and services.\n\nBy accessing or using our services, you agree to the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.\n\nWe reserve the right to update this Privacy Policy at any time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date."
    },
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      content: "We collect several types of information from and about users of our services, including:\n\nPersonal Information: Name, email address, phone number, company name, job title, and billing information when you register for an account or request services.\n\nUsage Data: Information about how you access and use our platform, including your IP address, browser type, operating system, pages viewed, time spent on pages, and navigation paths.\n\nGeospatial Data: Location data and satellite imagery requests you make through our platform, including areas of interest and analysis parameters.\n\nTechnical Data: Device information, log files, cookies, and similar tracking technologies to enhance your experience and analyze platform usage.\n\nCommunications: Records of your correspondence with us, including support tickets, feedback, and inquiries."
    },
    {
      id: 'how-we-use-information',
      title: 'How We Use Your Information',
      content: "We use the information we collect for various purposes, including:\n\nService Delivery: To provide, maintain, and improve our satellite intelligence platform and deliver the services you request.\n\nAccount Management: To create and manage your account, process transactions, and provide customer support.\n\nCommunication: To send you technical notices, updates, security alerts, and administrative messages.\n\nAnalytics and Improvement: To analyze usage patterns, optimize platform performance, and develop new features and services.\n\nMarketing: To send you promotional materials, newsletters, and information about our services (you can opt out at any time).\n\nLegal Compliance: To comply with legal obligations, enforce our terms of service, and protect our rights and the rights of our users.\n\nResearch and Development: To conduct research, analysis, and development of new satellite intelligence capabilities and AI algorithms."
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing and Disclosure',
      content: "We do not sell your personal information. We may share your information in the following circumstances:\n\nService Providers: We work with third-party service providers who perform services on our behalf, such as cloud hosting, payment processing, data analysis, and customer support. These providers have access to your information only to perform specific tasks and are obligated to protect your data.\n\nSatellite Data Partners: We share necessary information with our satellite data providers (Maxar, Planet, Airbus, etc.) to fulfill your data requests and deliver services.\n\nBusiness Transfers: If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.\n\nLegal Requirements: We may disclose your information if required by law, court order, or governmental request, or to protect our rights, property, or safety.\n\nWith Your Consent: We may share your information with third parties when you explicitly consent to such sharing."
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies and Tracking Technologies',
      content: "We use cookies and similar tracking technologies to collect and track information about your use of our platform. Cookies are small data files stored on your device.\n\nEssential Cookies: Required for the platform to function properly, including authentication and security features.\n\nAnalytics Cookies: Help us understand how users interact with our platform, allowing us to improve functionality and user experience.\n\nPreference Cookies: Remember your settings and preferences to provide a personalized experience.\n\nMarketing Cookies: Track your browsing activity to deliver relevant advertisements and measure campaign effectiveness.\n\nYou can control cookie preferences through your browser settings. However, disabling certain cookies may limit your ability to use some features of our platform."
    },
    {
      id: 'your-rights',
      title: 'Your Rights and Choices',
      content: "Depending on your location, you may have certain rights regarding your personal information:\n\nAccess: You can request access to the personal information we hold about you.\n\nCorrection: You can request that we correct inaccurate or incomplete information.\n\nDeletion: You can request that we delete your personal information, subject to certain legal exceptions.\n\nPortability: You can request a copy of your data in a structured, machine-readable format.\n\nObjection: You can object to our processing of your personal information for certain purposes.\n\nOpt-Out: You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly.\n\nTo exercise these rights, please contact us at privacy@earthintelligence.com. We will respond to your request within 30 days."
    },
    {
      id: 'data-security',
      title: 'Data Security',
      content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.\n\nOur security measures include encryption of data in transit and at rest, regular security assessments, access controls, and employee training on data protection.\n\nWe use industry-standard SSL/TLS encryption for all data transmissions and store sensitive data in secure, access-controlled environments.\n\nWhile we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your data to the best of our ability.\n\nIn the event of a data breach that affects your personal information, we will notify you and relevant authorities as required by applicable law."
    },
    {
      id: 'international-transfers',
      title: 'International Data Transfers',
      content: "Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.\n\nWhen we transfer personal information internationally, we ensure appropriate safeguards are in place, such as standard contractual clauses approved by relevant authorities.\n\nBy using our services, you consent to the transfer of your information to the United States and other countries where we or our service providers operate.\n\nWe comply with applicable data protection frameworks, including the EU-U.S. Data Privacy Framework and the UK-U.S. Data Privacy Framework."
    },
    {
      id: 'childrens-privacy',
      title: "Children's Privacy",
      content: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.\n\nIf we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information as quickly as possible.\n\nIf you believe we have collected information from a child, please contact us immediately at privacy@earthintelligence.com."
    },
    {
      id: 'changes-to-policy',
      title: 'Changes to This Policy',
      content: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.\n\nWe will notify you of any material changes by posting the updated policy on our website and updating the \"Last Updated\" date at the top of this page.\n\nFor significant changes, we may provide additional notice, such as sending an email notification or displaying a prominent notice on our platform.\n\nYour continued use of our services after any changes to this Privacy Policy constitutes your acceptance of the updated terms."
    },
    {
      id: 'contact-us',
      title: 'Contact Us',
      content: "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:\n\nEmail: privacy@earthintelligence.com\nPhone: +1 (555) 123-4567\nAddress: Earth Intelligence Platform, 123 Satellite Way, San Francisco, CA 94105, United States\nData Protection Officer: dpo@earthintelligence.com\n\nWe will respond to your inquiry within 30 business days."
    }
  ]
};

// Terms of Service content
const termsOfServiceContent = {
  type: 'terms-of-service',
  version: '1.0',
  lastUpdated: new Date('2024-01-15'),
  sections: [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content: "By accessing or using the Earth Intelligence Platform ('Platform', 'Service', 'we', 'our', or 'us'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, you may not access or use the Platform.\n\nThese Terms constitute a legally binding agreement between you (whether personally or on behalf of an entity) and Earth Intelligence Platform. We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of any changes.\n\nIf you are using the Platform on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms."
    },
    {
      id: 'description',
      title: 'Description of Service',
      content: "Earth Intelligence Platform provides satellite intelligence services, including access to satellite imagery, geospatial data analysis, AI-powered insights, and related tools and features.\n\nOur Service includes access to data from multiple satellite providers (Maxar, Planet, Airbus, and others), advanced analytics capabilities, API access, and custom reporting tools.\n\nWe reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.\n\nThe Service is provided on an \"as is\" and \"as available\" basis. We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free."
    },
    {
      id: 'user-accounts',
      title: 'User Accounts and Registration',
      content: "To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.\n\nYou are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.\n\nWe reserve the right to suspend or terminate your account if any information provided during registration or thereafter proves to be inaccurate, false, or misleading.\n\nYou may not transfer your account to another person or entity without our prior written consent.\n\nYou must be at least 18 years old to create an account and use the Service."
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use Policy',
      content: "You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:\n\nUse the Service in any way that violates any applicable federal, state, local, or international law or regulation.\n\nEngage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm us or users of the Service.\n\nUse the Service to transmit any advertising or promotional material, spam, or unsolicited communications.\n\nAttempt to gain unauthorized access to any portion of the Service, other accounts, computer systems, or networks connected to the Service.\n\nUse any automated system, including robots, spiders, or scrapers, to access the Service without our express written permission.\n\nReverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Service.\n\nUse the Service for any illegal surveillance, military targeting, or weapons development purposes.\n\nResell, redistribute, or provide access to the Service or satellite data to third parties without proper licensing."
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      content: "The Platform and its entire contents, features, and functionality (including but not limited to all information, software, code, text, displays, graphics, photographs, video, audio, design, presentation, selection, and arrangement) are owned by Earth Intelligence Platform, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.\n\nSubject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Platform for your internal business purposes.\n\nSatellite imagery and data accessed through the Platform are subject to the terms and conditions of our data providers. You agree to comply with all applicable licensing terms for satellite data.\n\nYou retain all rights to any data, content, or materials you upload to the Platform. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content solely for the purpose of providing the Service to you.\n\nOur trademarks, service marks, and logos used and displayed on the Platform are our registered and unregistered trademarks. Nothing in these Terms grants you any right to use our trademarks without our prior written permission."
    },
    {
      id: 'payment-billing',
      title: 'Payment and Billing',
      content: "Certain features of the Platform require payment of fees. You agree to pay all fees associated with your account in accordance with the pricing and payment terms presented to you.\n\nAll fees are non-refundable unless otherwise stated in your service agreement or required by law.\n\nWe reserve the right to change our pricing at any time. We will provide you with reasonable notice of any pricing changes, and such changes will apply to subsequent billing periods.\n\nYou authorize us to charge your designated payment method for all fees incurred. If your payment method fails, we may suspend or terminate your access to the Service.\n\nYou are responsible for all taxes associated with your use of the Service, excluding taxes based on our net income.\n\nFor enterprise customers, payment terms will be specified in your separate service agreement."
    },
    {
      id: 'service-modifications',
      title: 'Service Modifications and Availability',
      content: "We reserve the right to modify, update, or discontinue the Service (or any part thereof) at any time with or without notice.\n\nWe may perform scheduled maintenance that temporarily interrupts access to the Service. We will attempt to provide advance notice of scheduled maintenance when possible.\n\nWe do not guarantee that the Service will be available at all times or that it will be free from errors, viruses, or other harmful components.\n\nSatellite data availability is subject to factors beyond our control, including weather conditions, satellite orbits, and data provider availability.\n\nWe will not be liable for any loss or damage arising from Service unavailability, modifications, or interruptions."
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      content: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL EARTH INTELLIGENCE PLATFORM, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:\n\n(a) Your access to or use of or inability to access or use the Service;\n(b) Any conduct or content of any third party on the Service;\n(c) Any content obtained from the Service;\n(d) Unauthorized access, use, or alteration of your transmissions or content.\n\nIN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS RELATING TO THE SERVICE EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.\n\nSOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU."
    },
    {
      id: 'indemnification',
      title: 'Indemnification',
      content: "You agree to defend, indemnify, and hold harmless Earth Intelligence Platform, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:\n\n(a) Your violation of these Terms;\n(b) Your use of the Service, including any data or content transmitted or received by you;\n(c) Your violation of any rights of another party, including any intellectual property rights;\n(d) Your violation of any applicable law, rule, or regulation;\n(e) Any claim that your content caused damage to a third party.\n\nWe reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which event you will cooperate with us in asserting any available defenses."
    },
    {
      id: 'termination',
      title: 'Termination',
      content: "We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.\n\nYou may terminate your account at any time by contacting us at support@earthintelligence.com. Upon termination, your right to use the Service will immediately cease.\n\nUpon termination, all provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnity, and limitations of liability.\n\nIf your account is terminated, we may delete your data and content. We are not obligated to retain or provide you with copies of your data after termination.\n\nTermination does not relieve you of any obligations to pay outstanding fees or charges incurred prior to termination."
    },
    {
      id: 'governing-law',
      title: 'Governing Law and Dispute Resolution',
      content: "These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.\n\nAny dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the Commercial Arbitration Rules of the American Arbitration Association.\n\nArbitration shall take place in San Francisco, California. The arbitrator's decision shall be final and binding, and judgment may be entered upon it in any court of competent jurisdiction.\n\nNotwithstanding the foregoing, we may seek injunctive or other equitable relief in any court of competent jurisdiction to protect our intellectual property rights.\n\nYou agree to waive any right to a jury trial or to participate in a class action lawsuit.\n\nIf any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect."
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: "If you have any questions, concerns, or disputes regarding these Terms of Service, please contact us:\n\nEmail: legal@earthintelligence.com\nPhone: +1 (555) 123-4567\nAddress: Earth Intelligence Platform, 123 Satellite Way, San Francisco, CA 94105, United States\nSupport: support@earthintelligence.com\n\nWe will respond to your inquiry within 5 business days."
    }
  ]
};

async function seedContent() {
  try {
    // Connect to MongoDB with timeout
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Clear existing content
    await Content.deleteMany({});
    console.log('Cleared existing content');

    // Insert privacy policy
    const privacyPolicy = new Content(privacyPolicyContent);
    await privacyPolicy.save();
    console.log('Privacy Policy seeded successfully');

    // Insert terms of service
    const termsOfService = new Content(termsOfServiceContent);
    await termsOfService.save();
    console.log('Terms of Service seeded successfully');

    console.log('Content seeding completed successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding content:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedContent();
