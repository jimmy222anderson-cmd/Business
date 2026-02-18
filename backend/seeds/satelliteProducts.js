const SatelliteProduct = require('../models/SatelliteProduct');

const satelliteProducts = [
  // Maxar Products
  {
    name: 'WorldView-3',
    provider: 'Maxar Technologies',
    sensor_type: 'optical',
    resolution: 0.31,
    resolution_category: 'vhr',
    bands: ['RGB', 'NIR', 'Red-Edge', 'SWIR'],
    coverage: 'Global',
    availability: 'both',
    description: 'WorldView-3 provides very high-resolution multispectral imagery with 31cm panchromatic and 1.24m multispectral resolution. Features 8 multispectral bands including SWIR for enhanced material identification.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 13.1,
      revisit_time: 1,
      spectral_bands: 8,
      radiometric_resolution: 11
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 1
  },
  {
    name: 'WorldView-4',
    provider: 'Maxar Technologies',
    sensor_type: 'optical',
    resolution: 0.31,
    resolution_category: 'vhr',
    bands: ['RGB', 'NIR'],
    coverage: 'Global',
    availability: 'archive',
    description: 'WorldView-4 delivers 31cm panchromatic and 1.24m multispectral imagery. Decommissioned in 2019 but extensive archive available for historical analysis.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 13.1,
      revisit_time: 1,
      spectral_bands: 4,
      radiometric_resolution: 11
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 2
  },
  
  // Planet Labs Products
  {
    name: 'SkySat',
    provider: 'Planet Labs',
    sensor_type: 'optical',
    resolution: 0.50,
    resolution_category: 'vhr',
    bands: ['RGB', 'NIR'],
    coverage: 'Global',
    availability: 'both',
    description: 'SkySat constellation provides sub-meter resolution imagery with high revisit rates. Capable of capturing both still imagery and HD video from space.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 8,
      revisit_time: 1,
      spectral_bands: 4,
      radiometric_resolution: 11
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 3
  },
  {
    name: 'PlanetScope',
    provider: 'Planet Labs',
    sensor_type: 'optical',
    resolution: 3.0,
    resolution_category: 'high',
    bands: ['RGB', 'NIR'],
    coverage: 'Global',
    availability: 'both',
    description: 'PlanetScope constellation of 200+ satellites provides daily global coverage at 3m resolution. Ideal for monitoring change detection and time-series analysis.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 24.6,
      revisit_time: 1,
      spectral_bands: 4,
      radiometric_resolution: 12
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 4
  },
  
  // ICEYE Products
  {
    name: 'ICEYE SAR',
    provider: 'ICEYE',
    sensor_type: 'radar',
    resolution: 0.50,
    resolution_category: 'vhr',
    bands: ['X-band SAR'],
    coverage: 'Global',
    availability: 'both',
    description: 'ICEYE operates the world\'s largest SAR satellite constellation. Provides all-weather, day-and-night imaging with sub-meter resolution. Ideal for monitoring in any conditions.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 5,
      revisit_time: 1,
      spectral_bands: 1,
      radiometric_resolution: 16
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 5
  },
  
  // Sentinel Products (ESA)
  {
    name: 'Sentinel-2',
    provider: 'European Space Agency',
    sensor_type: 'optical',
    resolution: 10,
    resolution_category: 'medium',
    bands: ['RGB', 'NIR', 'Red-Edge', 'SWIR'],
    coverage: 'Global',
    availability: 'archive',
    description: 'Sentinel-2 provides free, open-access multispectral imagery at 10m resolution. Part of EU Copernicus program with 5-day revisit time. Excellent for agriculture, forestry, and land monitoring.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 290,
      revisit_time: 5,
      spectral_bands: 13,
      radiometric_resolution: 12
    },
    pricing_info: 'Free and open access',
    status: 'active',
    order: 6
  },
  {
    name: 'Sentinel-1',
    provider: 'European Space Agency',
    sensor_type: 'radar',
    resolution: 5,
    resolution_category: 'medium',
    bands: ['C-band SAR'],
    coverage: 'Global',
    availability: 'archive',
    description: 'Sentinel-1 provides free C-band SAR imagery for all-weather monitoring. Ideal for maritime surveillance, ice monitoring, and emergency response. 6-day revisit with two satellites.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 250,
      revisit_time: 6,
      spectral_bands: 1,
      radiometric_resolution: 16
    },
    pricing_info: 'Free and open access',
    status: 'active',
    order: 7
  },
  
  // Landsat Products (NASA/USGS)
  {
    name: 'Landsat 9',
    provider: 'NASA/USGS',
    sensor_type: 'optical',
    resolution: 30,
    resolution_category: 'medium',
    bands: ['RGB', 'NIR', 'SWIR', 'Thermal'],
    coverage: 'Global',
    availability: 'archive',
    description: 'Landsat 9 continues the 50+ year legacy of Earth observation. Provides free 30m multispectral and 100m thermal imagery. Essential for long-term environmental monitoring and change detection.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 185,
      revisit_time: 16,
      spectral_bands: 11,
      radiometric_resolution: 14
    },
    pricing_info: 'Free and open access',
    status: 'active',
    order: 8
  },
  {
    name: 'Landsat 8',
    provider: 'NASA/USGS',
    sensor_type: 'optical',
    resolution: 30,
    resolution_category: 'medium',
    bands: ['RGB', 'NIR', 'SWIR', 'Thermal'],
    coverage: 'Global',
    availability: 'archive',
    description: 'Landsat 8 provides continuous Earth observation since 2013. Free 30m resolution imagery with extensive archive. Widely used for agriculture, water resources, and climate research.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 185,
      revisit_time: 16,
      spectral_bands: 11,
      radiometric_resolution: 12
    },
    pricing_info: 'Free and open access',
    status: 'active',
    order: 9
  },
  
  // Additional Commercial Products
  {
    name: 'SPOT 6/7',
    provider: 'Airbus Defence and Space',
    sensor_type: 'optical',
    resolution: 1.5,
    resolution_category: 'high',
    bands: ['RGB', 'NIR'],
    coverage: 'Global',
    availability: 'both',
    description: 'SPOT 6/7 satellites provide 1.5m resolution imagery with wide area coverage. Ideal for mapping, urban planning, and regional monitoring applications.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 60,
      revisit_time: 1,
      spectral_bands: 4,
      radiometric_resolution: 12
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 10
  },
  {
    name: 'Pléiades Neo',
    provider: 'Airbus Defence and Space',
    sensor_type: 'optical',
    resolution: 0.30,
    resolution_category: 'vhr',
    bands: ['RGB', 'NIR', 'Red-Edge'],
    coverage: 'Global',
    availability: 'both',
    description: 'Pléiades Neo constellation delivers 30cm native resolution with daily revisit capability. Features deep blue and red-edge bands for enhanced analysis.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 14,
      revisit_time: 1,
      spectral_bands: 6,
      radiometric_resolution: 12
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 11
  },
  {
    name: 'KOMPSAT-3A',
    provider: 'SI Imaging Services',
    sensor_type: 'optical',
    resolution: 0.55,
    resolution_category: 'vhr',
    bands: ['RGB', 'NIR'],
    coverage: 'Global',
    availability: 'both',
    description: 'KOMPSAT-3A provides sub-meter resolution imagery from South Korea. Offers competitive pricing for high-resolution optical imagery with good coverage.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 12,
      revisit_time: 3,
      spectral_bands: 4,
      radiometric_resolution: 14
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 12
  },
  {
    name: 'SuperView-1',
    provider: 'China Siwei',
    sensor_type: 'optical',
    resolution: 0.50,
    resolution_category: 'vhr',
    bands: ['RGB', 'NIR'],
    coverage: 'Global',
    availability: 'both',
    description: 'SuperView-1 constellation provides 50cm resolution imagery with competitive pricing. Four-satellite constellation offers improved revisit times for monitoring applications.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 12,
      revisit_time: 2,
      spectral_bands: 4,
      radiometric_resolution: 10
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 13
  },
  {
    name: 'RADARSAT-2',
    provider: 'MDA',
    sensor_type: 'radar',
    resolution: 3,
    resolution_category: 'high',
    bands: ['C-band SAR'],
    coverage: 'Global',
    availability: 'both',
    description: 'RADARSAT-2 provides C-band SAR imagery with multiple polarization modes. Excellent for maritime monitoring, ice surveillance, and disaster management.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 500,
      revisit_time: 24,
      spectral_bands: 1,
      radiometric_resolution: 16
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 14
  },
  {
    name: 'TerraSAR-X',
    provider: 'Airbus Defence and Space',
    sensor_type: 'radar',
    resolution: 1,
    resolution_category: 'high',
    bands: ['X-band SAR'],
    coverage: 'Global',
    availability: 'both',
    description: 'TerraSAR-X delivers high-resolution X-band SAR imagery with 1m resolution. Ideal for infrastructure monitoring, urban mapping, and precise change detection.',
    sample_image_url: '/placeholder.svg',
    specifications: {
      swath_width: 10,
      revisit_time: 11,
      spectral_bands: 1,
      radiometric_resolution: 16
    },
    pricing_info: 'Contact for pricing',
    status: 'active',
    order: 15
  }
];

async function seedSatelliteProducts() {
  try {
    // Check if products already exist
    const existingCount = await SatelliteProduct.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} satellite products. Skipping seed.`);
      console.log('To re-seed, first delete existing products.');
      return;
    }

    // Insert all products
    const result = await SatelliteProduct.insertMany(satelliteProducts);
    console.log(`Successfully seeded ${result.length} satellite products`);
    
    // Display summary
    console.log('\nSeeded products by provider:');
    const byProvider = result.reduce((acc, product) => {
      acc[product.provider] = (acc[product.provider] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(byProvider).forEach(([provider, count]) => {
      console.log(`  ${provider}: ${count} products`);
    });
    
    console.log('\nSeeded products by sensor type:');
    const bySensor = result.reduce((acc, product) => {
      acc[product.sensor_type] = (acc[product.sensor_type] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(bySensor).forEach(([sensor, count]) => {
      console.log(`  ${sensor}: ${count} products`);
    });
    
  } catch (error) {
    console.error('Error seeding satellite products:', error);
    throw error;
  }
}

// Allow running directly or as module
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earth-intelligence')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedSatelliteProducts();
    })
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSatelliteProducts, satelliteProducts };
