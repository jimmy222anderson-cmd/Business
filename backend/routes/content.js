const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get privacy policy content
router.get('/privacy', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'privacy-policy' });
    
    if (!content) {
      return res.status(404).json({ error: 'Privacy policy not found' });
    }

    res.json({
      sections: content.sections,
      lastUpdated: content.lastUpdated,
      version: content.version
    });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    res.status(500).json({ error: 'Failed to fetch privacy policy' });
  }
});

// Get terms of service content
router.get('/terms', async (req, res) => {
  try {
    const content = await Content.findOne({ type: 'terms-of-service' });
    
    if (!content) {
      return res.status(404).json({ error: 'Terms of service not found' });
    }

    res.json({
      sections: content.sections,
      lastUpdated: content.lastUpdated,
      version: content.version
    });
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    res.status(500).json({ error: 'Failed to fetch terms of service' });
  }
});

// Update content (admin only)
router.put('/admin/:type', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { sections, version } = req.body;

    // Validate type
    if (!['privacy-policy', 'terms-of-service'].includes(type)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Validate sections
    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: 'Sections must be an array' });
    }

    // Update or create content
    const content = await Content.findOneAndUpdate(
      { type },
      {
        sections,
        version: version || '1.0',
        lastUpdated: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      message: 'Content updated successfully',
      content: {
        type: content.type,
        sections: content.sections,
        lastUpdated: content.lastUpdated,
        version: content.version
      }
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Seed default content (development only)
router.post('/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Seeding not allowed in production' });
    }

    // Privacy Policy content
    const privacyPolicyData = {
      type: 'privacy-policy',
      version: '1.0',
      lastUpdated: new Date('2024-01-15'),
      sections: [
        {
          id: 'introduction',
          title: 'Introduction',
          content: "Earth Intelligence Platform ('we', 'our', or 'us') is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our satellite intelligence platform and services."
        },
        {
          id: 'information-we-collect',
          title: 'Information We Collect',
          content: "We collect several types of information from and about users of our services, including personal information, usage data, geospatial data, technical data, and communications."
        },
        {
          id: 'how-we-use-information',
          title: 'How We Use Your Information',
          content: "We use the information we collect for service delivery, account management, communication, analytics and improvement, marketing, legal compliance, and research and development."
        },
        {
          id: 'data-sharing',
          title: 'Data Sharing and Disclosure',
          content: "We do not sell your personal information. We may share your information with service providers, satellite data partners, for business transfers, legal requirements, and with your consent."
        },
        {
          id: 'cookies-tracking',
          title: 'Cookies and Tracking Technologies',
          content: "We use cookies and similar tracking technologies to collect and track information about your use of our platform. You can control cookie preferences through your browser settings."
        },
        {
          id: 'your-rights',
          title: 'Your Rights and Choices',
          content: "You have rights regarding your personal information including access, correction, deletion, portability, objection, and opt-out. Contact us at privacy@earthintelligence.com to exercise these rights."
        },
        {
          id: 'data-security',
          title: 'Data Security',
          content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          id: 'contact-us',
          title: 'Contact Us',
          content: "If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at privacy@earthintelligence.com or +1 (555) 123-4567."
        }
      ]
    };

    // Terms of Service content
    const termsOfServiceData = {
      type: 'terms-of-service',
      version: '1.0',
      lastUpdated: new Date('2024-01-15'),
      sections: [
        {
          id: 'acceptance',
          title: 'Acceptance of Terms',
          content: "By accessing or using the Earth Intelligence Platform, you agree to be bound by these Terms of Service. If you do not agree to these Terms, you may not access or use the Platform."
        },
        {
          id: 'description',
          title: 'Description of Service',
          content: "Earth Intelligence Platform provides satellite intelligence services, including access to satellite imagery, geospatial data analysis, AI-powered insights, and related tools and features."
        },
        {
          id: 'user-accounts',
          title: 'User Accounts and Registration',
          content: "To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration."
        },
        {
          id: 'acceptable-use',
          title: 'Acceptable Use Policy',
          content: "You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that violates any applicable law or regulation."
        },
        {
          id: 'intellectual-property',
          title: 'Intellectual Property Rights',
          content: "The Platform and its entire contents are owned by Earth Intelligence Platform and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws."
        },
        {
          id: 'payment-billing',
          title: 'Payment and Billing',
          content: "Certain features of the Platform require payment of fees. You agree to pay all fees associated with your account in accordance with the pricing and payment terms presented to you."
        },
        {
          id: 'limitation-liability',
          title: 'Limitation of Liability',
          content: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL EARTH INTELLIGENCE PLATFORM BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES."
        },
        {
          id: 'termination',
          title: 'Termination',
          content: "We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms."
        },
        {
          id: 'governing-law',
          title: 'Governing Law and Dispute Resolution',
          content: "These Terms shall be governed by and construed in accordance with the laws of the State of California, United States."
        },
        {
          id: 'contact',
          title: 'Contact Information',
          content: "If you have any questions regarding these Terms of Service, please contact us at legal@earthintelligence.com or +1 (555) 123-4567."
        }
      ]
    };

    // Clear existing content
    await Content.deleteMany({});

    // Insert privacy policy
    const privacyPolicy = new Content(privacyPolicyData);
    await privacyPolicy.save();

    // Insert terms of service
    const termsOfService = new Content(termsOfServiceData);
    await termsOfService.save();

    res.json({
      message: 'Content seeded successfully',
      seeded: ['privacy-policy', 'terms-of-service']
    });
  } catch (error) {
    console.error('Error seeding content:', error);
    res.status(500).json({ error: 'Failed to seed content' });
  }
});

module.exports = router;
