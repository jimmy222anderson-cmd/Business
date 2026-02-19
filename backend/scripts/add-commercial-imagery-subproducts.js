/**
 * Script to add sub-products to Commercial Imagery product
 * Run with: node backend/scripts/add-commercial-imagery-subproducts.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const subProducts = [
  {
    name: 'VHR (Very High Resolution)',
    slug: 'vhr',
    description: 'Sub-meter resolution imagery for detailed analysis and precise measurements. Ideal for urban planning, infrastructure monitoring, and detailed asset inspection.',
    order: 1
  },
  {
    name: 'SAR (Synthetic Aperture Radar)',
    slug: 'sar',
    description: 'All-weather radar imagery that penetrates clouds and works day or night. Perfect for monitoring in challenging weather conditions and detecting ground deformation.',
    order: 2
  },
  {
    name: 'DOM (Digital Orthophoto Map)',
    slug: 'dom',
    description: 'Geometrically corrected aerial photographs with uniform scale. Essential for mapping, GIS applications, and creating accurate base maps.',
    order: 3
  },
  {
    name: 'DSM (Digital Surface Model)',
    slug: 'dsm',
    description: '3D surface elevation data including buildings, vegetation, and infrastructure. Critical for urban modeling, flood analysis, and line-of-sight studies.',
    order: 4
  },
  {
    name: 'DEM (Digital Elevation Model)',
    slug: 'dem',
    description: 'Bare earth terrain elevation data with vegetation and structures removed. Used for hydrological modeling, terrain analysis, and engineering applications.',
    order: 5
  },
  {
    name: 'IR (Infrared)',
    slug: 'ir',
    description: 'Infrared spectrum imagery for thermal analysis and vegetation health monitoring. Valuable for agriculture, environmental monitoring, and heat loss detection.',
    order: 6
  },
  {
    name: 'Hyperspectral',
    slug: 'hyperspectral',
    description: 'Multi-band spectral imaging for material identification and classification. Advanced applications in mineral exploration, precision agriculture, and environmental assessment.',
    order: 7
  }
];

async function addSubProducts() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earth-intelligence');
    console.log('Connected to MongoDB');

    // Find Commercial Imagery product
    console.log('\nSearching for Commercial Imagery product...');
    let product = await Product.findOne({ slug: 'commercial-imagery' });

    if (!product) {
      console.log('Commercial Imagery product not found. Creating it...');
      
      // Create Commercial Imagery product if it doesn't exist
      product = new Product({
        name: 'Commercial Imagery',
        slug: 'commercial-imagery',
        description: 'High-resolution satellite imagery from leading providers worldwide',
        longDescription: 'Access premium satellite imagery from the world\'s leading commercial providers. Our Commercial Imagery service offers a comprehensive range of high-resolution optical and radar imagery products, enabling detailed analysis and monitoring across diverse applications. From sub-meter resolution for urban planning to all-weather SAR for continuous monitoring, we provide the imagery solutions you need.',
        image: '/lovable-uploads/commercial-imagery.jpg',
        pricingBadge: 'Custom Pricing',
        category: 'imagery',
        status: 'active',
        order: 2,
        features: [
          {
            title: 'Multiple Resolutions',
            description: 'From sub-meter VHR to medium resolution imagery, choose the right detail level for your application',
            icon: 'zoom-in'
          },
          {
            title: 'All-Weather Capability',
            description: 'SAR imagery provides continuous monitoring regardless of cloud cover or lighting conditions',
            icon: 'cloud'
          },
          {
            title: 'Global Coverage',
            description: 'Access imagery from anywhere in the world with our extensive satellite constellation network',
            icon: 'globe'
          },
          {
            title: 'Multiple Formats',
            description: 'Receive data in various formats including orthophotos, elevation models, and spectral bands',
            icon: 'layers'
          },
          {
            title: 'Rapid Delivery',
            description: 'Fast turnaround times for both archive imagery and new tasking requests',
            icon: 'zap'
          },
          {
            title: 'Expert Support',
            description: 'Our team helps you select the right imagery products for your specific needs',
            icon: 'headphones'
          }
        ],
        useCases: [
          {
            title: 'Urban Planning',
            description: 'High-resolution imagery and 3D models for city development and infrastructure planning',
            industry: 'government'
          },
          {
            title: 'Agriculture Monitoring',
            description: 'Multispectral and infrared imagery for crop health assessment and precision farming',
            industry: 'agriculture'
          },
          {
            title: 'Disaster Response',
            description: 'Rapid imagery acquisition for damage assessment and emergency response coordination',
            industry: 'emergency-services'
          },
          {
            title: 'Environmental Monitoring',
            description: 'Track changes in land use, deforestation, and environmental conditions over time',
            industry: 'environmental'
          }
        ],
        specifications: [
          {
            key: 'Resolution Range',
            value: '0.3m to 30m',
            unit: ''
          },
          {
            key: 'Coverage',
            value: 'Global',
            unit: ''
          },
          {
            key: 'Revisit Time',
            value: 'Daily',
            unit: ''
          },
          {
            key: 'Data Formats',
            value: 'GeoTIFF, JPEG2000, HDF',
            unit: ''
          },
          {
            key: 'Delivery Time',
            value: '24-48 hours',
            unit: ''
          }
        ],
        subProducts: []
      });

      await product.save();
      console.log('✓ Commercial Imagery product created');
    } else {
      console.log('✓ Found Commercial Imagery product');
    }

    // Add sub-products
    console.log('\nAdding sub-products...');
    product.subProducts = subProducts;
    await product.save();

    console.log('✓ Successfully added sub-products:');
    subProducts.forEach((sp, index) => {
      console.log(`  ${index + 1}. ${sp.name} (${sp.slug})`);
    });

    console.log('\n✓ Script completed successfully!');
    console.log('\nSub-products added to Commercial Imagery:');
    console.log('- VHR (Very High Resolution)');
    console.log('- SAR (Synthetic Aperture Radar)');
    console.log('- DOM (Digital Orthophoto Map)');
    console.log('- DSM (Digital Surface Model)');
    console.log('- DEM (Digital Elevation Model)');
    console.log('- IR (Infrared)');
    console.log('- Hyperspectral');
    
    console.log('\nYou can now see these in:');
    console.log('1. Navigation dropdown: Products > Commercial Imagery');
    console.log('2. Product page: /products/commercial-imagery');
    console.log('3. Admin panel: /admin/products (edit Commercial Imagery)');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
addSubProducts();
