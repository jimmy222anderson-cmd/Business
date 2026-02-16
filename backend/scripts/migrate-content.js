require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const { Product, Industry, Partner, BlogPost, UserProfile } = require('../models');

// Fix DNS resolution for MongoDB Atlas on Windows
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);

// Import hardcoded data
const productsData = [
  {
    name: 'Analytics',
    slug: 'analytics',
    description: 'Advanced geospatial analytics powered by AI and machine learning for actionable insights.',
    longDescription: 'Our Analytics platform combines cutting-edge AI and machine learning algorithms with satellite data to deliver actionable insights. Process vast amounts of geospatial data to detect changes, identify patterns, and make informed decisions.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    pricingBadge: 'From $99/mo',
    category: 'analytics',
    status: 'active',
    order: 1,
    features: [
      { title: 'AI-Powered Analysis', description: 'Machine learning algorithms for automated feature detection', icon: 'brain' },
      { title: 'Change Detection', description: 'Identify and track changes over time', icon: 'activity' },
      { title: 'Custom Workflows', description: 'Build custom analytics pipelines', icon: 'workflow' }
    ],
    useCases: [
      { title: 'Infrastructure Monitoring', description: 'Track construction progress', industry: 'construction' },
      { title: 'Environmental Analysis', description: 'Monitor deforestation and water quality', industry: 'environment' }
    ],
    specifications: [
      { key: 'Processing Speed', value: 'Real-time', unit: '' },
      { key: 'Data Formats', value: 'GeoTIFF, COG, NetCDF', unit: '' }
    ]
  },
  {
    name: 'Commercial Imagery',
    slug: 'commercial-imagery',
    description: 'High-resolution satellite imagery from leading providers worldwide.',
    longDescription: 'Access premium commercial satellite imagery from the world\'s leading providers. Get high-resolution optical and radar imagery with flexible licensing options.',
    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
    pricingBadge: 'Custom Pricing',
    category: 'imagery',
    status: 'active',
    order: 2,
    features: [
      { title: 'Multi-Provider Access', description: 'Single platform for imagery from Maxar, Planet, Airbus', icon: 'satellite' },
      { title: 'High Resolution', description: 'Up to 30cm resolution', icon: 'zoom-in' }
    ],
    useCases: [
      { title: 'Asset Monitoring', description: 'Monitor facilities and infrastructure', industry: 'energy' }
    ],
    specifications: [
      { key: 'Resolution', value: '30cm - 5m', unit: '' },
      { key: 'Revisit Rate', value: 'Daily', unit: '' }
    ]
  },
  {
    name: 'Open Data',
    slug: 'open-data',
    description: 'Free access to open-source satellite data from government and public sources.',
    longDescription: 'Explore our comprehensive collection of open satellite data from government agencies. Access Landsat, Sentinel, MODIS, and other freely available datasets.',
    image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop',
    pricingBadge: 'Free',
    category: 'data',
    status: 'active',
    order: 3,
    features: [
      { title: 'Government Sources', description: 'Access data from NASA, ESA, USGS', icon: 'globe' },
      { title: 'No Cost', description: 'Completely free access', icon: 'dollar-sign' }
    ],
    useCases: [],
    specifications: [
      { key: 'Resolution', value: '10m - 30m', unit: '' }
    ]
  }
];

const industriesData = [
  {
    name: 'Financial Services',
    slug: 'financial-services',
    description: 'Leverage satellite data for risk assessment, fraud detection, and market intelligence.',
    longDescription: 'Financial institutions rely on satellite intelligence to gain competitive advantages in risk assessment, investment analysis, and market forecasting.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    status: 'active',
    order: 1,
    useCases: [
      { title: 'Infrastructure monitoring', description: 'Track construction and development projects' },
      { title: 'Supply chain visibility', description: 'Monitor global logistics and trade flows' }
    ]
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'Optimize crop management with precision agriculture insights.',
    longDescription: 'Modern agriculture demands precision and efficiency. Our satellite-powered solutions enable farmers to monitor crop health and optimize irrigation.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
    status: 'active',
    order: 2,
    useCases: [
      { title: 'Crop health monitoring', description: 'Early identification of crop stress and disease' },
      { title: 'Irrigation optimization', description: 'Efficient water usage based on soil moisture data' }
    ]
  }
];

const partnersData = [
  { name: 'Maxar Technologies', logo: 'https://via.placeholder.com/200x80/1a1a1a/ffffff?text=Maxar', description: 'Leading provider of high-resolution satellite imagery', website: 'https://www.maxar.com', category: 'satellite', status: 'active', order: 1 },
  { name: 'Planet Labs', logo: 'https://via.placeholder.com/200x80/1a1a1a/ffffff?text=Planet', description: 'Daily global imagery from 200+ satellites', website: 'https://www.planet.com', category: 'satellite', status: 'active', order: 2 },
  { name: 'ICEYE', logo: 'https://via.placeholder.com/200x80/1a1a1a/ffffff?text=ICEYE', description: 'SAR satellite imagery with all-weather capabilities', website: 'https://www.iceye.com', category: 'satellite', status: 'active', order: 3 },
  { name: 'NASA', logo: 'https://via.placeholder.com/200x80/1a1a1a/ffffff?text=NASA', description: 'Open satellite data from government missions', website: 'https://www.nasa.gov', category: 'data', status: 'active', order: 4 },
  { name: 'Amazon Web Services', logo: 'https://via.placeholder.com/200x80/1a1a1a/ffffff?text=AWS', description: 'Cloud infrastructure and data processing', website: 'https://aws.amazon.com', category: 'technology', status: 'active', order: 5 }
];

async function migrateContent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('\nClearing existing data...');
    await Product.deleteMany({});
    await Industry.deleteMany({});
    await Partner.deleteMany({});
    await BlogPost.deleteMany({});
    console.log('Existing data cleared');

    // Migrate Products
    console.log('\nMigrating products...');
    const products = await Product.insertMany(productsData);
    console.log(`✓ Migrated ${products.length} products`);

    // Migrate Industries (with product references)
    console.log('\nMigrating industries...');
    const industriesWithProducts = industriesData.map(industry => ({
      ...industry,
      relevantProducts: products.slice(0, 2).map(p => p._id) // Link first 2 products
    }));
    const industries = await Industry.insertMany(industriesWithProducts);
    console.log(`✓ Migrated ${industries.length} industries`);

    // Migrate Partners
    console.log('\nMigrating partners...');
    const partners = await Partner.insertMany(partnersData);
    console.log(`✓ Migrated ${partners.length} partners`);

    // Migrate Blog Posts (need an admin user as author)
    console.log('\nMigrating blog posts...');
    let adminUser = await UserProfile.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      adminUser = await UserProfile.create({
        email: 'admin@example.com',
        password_hash: 'temp', // This should be properly hashed in production
        full_name: 'Admin User',
        role: 'admin',
        email_verified: true
      });
      console.log('✓ Created admin user');
    }

    const blogPostsData = [
      {
        slug: 'satellite-data-agriculture',
        title: 'How Satellite Data is Revolutionizing Agriculture',
        excerpt: 'From crop health monitoring to yield prediction, discover how farmers are leveraging space technology.',
        content: 'The agricultural industry is experiencing a technological revolution...',
        author_id: adminUser._id,
        featured_image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop',
        tags: ['Agriculture', 'Technology', 'Sustainability'],
        status: 'published',
        published_at: new Date('2026-01-15')
      },
      {
        slug: 'sar-vs-optical-imagery',
        title: 'Understanding SAR vs Optical Imagery',
        excerpt: 'A comprehensive guide to choosing the right sensor type for your remote sensing applications.',
        content: 'When it comes to satellite imagery, two main sensor types dominate...',
        author_id: adminUser._id,
        featured_image_url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=600&fit=crop',
        tags: ['Education', 'SAR', 'Optical', 'Technology'],
        status: 'published',
        published_at: new Date('2026-01-10')
      }
    ];

    const blogPosts = await BlogPost.insertMany(blogPostsData);
    console.log(`✓ Migrated ${blogPosts.length} blog posts`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`- Products: ${products.length}`);
    console.log(`- Industries: ${industries.length}`);
    console.log(`- Partners: ${partners.length}`);
    console.log(`- Blog Posts: ${blogPosts.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run migration
migrateContent();
