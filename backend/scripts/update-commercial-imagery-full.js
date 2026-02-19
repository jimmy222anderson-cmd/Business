/**
 * Script to update Commercial Imagery with complete sub-product data
 * Including images, long descriptions, features, and specifications
 * Run with: node backend/scripts/update-commercial-imagery-full.js YOUR_ADMIN_TOKEN
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

const subProductsData = [
  {
    name: 'VHR (Very High Resolution)',
    slug: 'vhr',
    description: 'Sub-meter resolution imagery for detailed analysis and precise measurements. Ideal for urban planning, infrastructure monitoring, and detailed asset inspection.',
    longDescription: 'Very High Resolution (VHR) satellite imagery provides unparalleled detail with sub-meter resolution, enabling precise measurements and detailed analysis of ground features. This advanced imaging technology captures objects as small as 30-50 centimeters, making it essential for applications requiring high accuracy.\n\nVHR imagery is particularly valuable for urban planning, where detailed building footprints and infrastructure layouts are critical. It enables accurate mapping of transportation networks, utility corridors, and land use patterns. The high level of detail also supports infrastructure monitoring, allowing engineers to detect structural changes, assess damage, and plan maintenance activities with confidence.\n\nIn the defense and security sector, VHR imagery provides tactical intelligence and situational awareness. It supports mission planning, target identification, and damage assessment with the precision required for critical operations.',
    image: '/uploads/products/commercial-imagery-vhr.jpg',
    order: 1,
    features: [
      {
        title: 'Sub-Meter Resolution',
        description: 'Capture details as small as 30-50 cm with exceptional clarity and precision',
        icon: 'target'
      },
      {
        title: 'High Accuracy',
        description: 'Precise geolocation and measurements for critical applications',
        icon: 'crosshair'
      },
      {
        title: 'Frequent Updates',
        description: 'Regular revisit times ensure access to current imagery',
        icon: 'refresh-cw'
      }
    ],
    specifications: [
      { key: 'Resolution', value: '0.3 - 0.5', unit: 'meters' },
      { key: 'Spectral Bands', value: 'Panchromatic + Multispectral', unit: '' },
      { key: 'Swath Width', value: '10 - 20', unit: 'km' },
      { key: 'Revisit Time', value: '1 - 3', unit: 'days' },
      { key: 'Positional Accuracy', value: '< 5', unit: 'meters CE90' }
    ]
  },
  {
    name: 'SAR (Synthetic Aperture Radar)',
    slug: 'sar',
    description: 'All-weather radar imagery that penetrates clouds and works day or night. Perfect for monitoring in challenging weather conditions and detecting ground deformation.',
    longDescription: 'Synthetic Aperture Radar (SAR) technology revolutionizes Earth observation by providing all-weather, day-and-night imaging capabilities. Unlike optical sensors, SAR uses microwave radiation to penetrate clouds, smoke, and darkness, ensuring continuous monitoring regardless of environmental conditions.\n\nSAR imagery is invaluable for applications requiring consistent data collection in regions with frequent cloud cover or during nighttime operations. The technology excels at detecting subtle ground movements, making it essential for monitoring infrastructure stability, landslide risks, and subsidence in mining areas.\n\nInterferometric SAR (InSAR) techniques enable millimeter-level precision in measuring ground deformation, supporting early warning systems for natural disasters and infrastructure monitoring. The technology is also widely used in maritime surveillance, ice monitoring, and oil spill detection, where its ability to detect surface texture changes provides critical intelligence.',
    image: '/uploads/products/commercial-imagery-sar.jpg',
    order: 2,
    features: [
      {
        title: 'All-Weather Capability',
        description: 'Penetrates clouds, rain, and darkness for continuous monitoring',
        icon: 'cloud-rain'
      },
      {
        title: 'Ground Deformation Detection',
        description: 'Millimeter-level precision in measuring surface changes',
        icon: 'activity'
      },
      {
        title: 'Day & Night Operation',
        description: 'Active sensor works independently of sunlight',
        icon: 'moon'
      }
    ],
    specifications: [
      { key: 'Resolution', value: '1 - 3', unit: 'meters' },
      { key: 'Frequency Band', value: 'X, C, L', unit: 'band' },
      { key: 'Polarization', value: 'Single, Dual, Quad', unit: '' },
      { key: 'Swath Width', value: '20 - 400', unit: 'km' },
      { key: 'Deformation Accuracy', value: '< 1', unit: 'mm' }
    ]
  },
  {
    name: 'DOM (Digital Orthophoto Map)',
    slug: 'dom',
    description: 'Geometrically corrected aerial photographs with uniform scale. Essential for mapping, GIS applications, and creating accurate base maps.',
    longDescription: 'Digital Orthophoto Maps (DOM) are geometrically corrected aerial or satellite images that maintain a uniform scale throughout the entire image. This correction process removes distortions caused by terrain relief and camera tilt, resulting in a planimetrically accurate representation that can be used for precise measurements.\n\nDOMs serve as fundamental base layers for Geographic Information Systems (GIS), providing a photorealistic backdrop for overlaying vector data, conducting spatial analysis, and creating thematic maps. The uniform scale ensures that distances and areas can be measured accurately anywhere in the image, making DOMs essential for cadastral mapping, urban planning, and land management.\n\nThe high visual quality of DOMs makes them ideal for public-facing applications, such as web mapping services and municipal planning portals. They provide an intuitive, easy-to-understand representation of the landscape that requires no specialized interpretation, making them accessible to both technical and non-technical users.',
    image: '/uploads/products/commercial-imagery-dom.jpg',
    order: 3,
    features: [
      {
        title: 'Geometric Accuracy',
        description: 'Uniform scale throughout the entire image for precise measurements',
        icon: 'ruler'
      },
      {
        title: 'GIS Integration',
        description: 'Perfect base layer for spatial analysis and mapping applications',
        icon: 'layers'
      },
      {
        title: 'Visual Clarity',
        description: 'High-quality photorealistic representation of terrain',
        icon: 'eye'
      }
    ],
    specifications: [
      { key: 'Ground Sample Distance', value: '0.1 - 0.5', unit: 'meters' },
      { key: 'Horizontal Accuracy', value: '< 1', unit: 'meter RMSE' },
      { key: 'Color Depth', value: '8-bit RGB', unit: '' },
      { key: 'Format', value: 'GeoTIFF, ECW, JPEG2000', unit: '' },
      { key: 'Coordinate System', value: 'Any standard CRS', unit: '' }
    ]
  },
  {
    name: 'DSM (Digital Surface Model)',
    slug: 'dsm',
    description: '3D surface elevation data including buildings, vegetation, and infrastructure. Critical for urban modeling, flood analysis, and line-of-sight studies.',
    longDescription: 'Digital Surface Models (DSM) represent the Earth\'s surface including all objects on it, such as buildings, trees, power lines, and other infrastructure. This comprehensive 3D representation is essential for applications requiring accurate modeling of the built and natural environment.\n\nDSMs are fundamental for urban planning and smart city initiatives, enabling 3D visualization of cityscapes, shadow analysis for solar panel placement, and assessment of building heights for zoning compliance. The data supports advanced applications like line-of-sight analysis for telecommunications tower placement and viewshed analysis for environmental impact assessments.\n\nIn flood risk management, DSMs provide critical input for hydraulic modeling, helping to predict water flow patterns and identify areas at risk of inundation. The inclusion of vegetation and structures in the model ensures that flow obstructions are accurately represented, leading to more reliable flood forecasts and better-informed mitigation strategies.',
    image: '/uploads/products/commercial-imagery-dsm.jpg',
    order: 4,
    features: [
      {
        title: '3D Surface Representation',
        description: 'Complete elevation data including all above-ground features',
        icon: 'box'
      },
      {
        title: 'Urban Modeling',
        description: 'Accurate building heights and infrastructure representation',
        icon: 'building'
      },
      {
        title: 'Flood Analysis',
        description: 'Critical input for hydraulic modeling and risk assessment',
        icon: 'droplet'
      }
    ],
    specifications: [
      { key: 'Vertical Accuracy', value: '0.5 - 2', unit: 'meters RMSE' },
      { key: 'Horizontal Resolution', value: '0.5 - 5', unit: 'meters' },
      { key: 'Point Density', value: '1 - 10', unit: 'points/m²' },
      { key: 'Format', value: 'GeoTIFF, LAS, LAZ', unit: '' },
      { key: 'Coverage', value: 'Buildings + Vegetation', unit: '' }
    ]
  },
  {
    name: 'DEM (Digital Elevation Model)',
    slug: 'dem',
    description: 'Bare earth terrain elevation data with vegetation and structures removed. Used for hydrological modeling, terrain analysis, and engineering applications.',
    longDescription: 'Digital Elevation Models (DEM) represent the bare earth surface with all vegetation, buildings, and other surface features removed. This "bare earth" representation is crucial for applications requiring accurate terrain modeling without the influence of temporary or removable features.\n\nDEMs are fundamental for hydrological modeling, providing the terrain data needed to simulate water flow, delineate watersheds, and predict drainage patterns. Engineers rely on DEMs for cut-and-fill calculations in road design, slope stability analysis, and site grading plans. The bare earth representation ensures that calculations are based on the actual ground surface rather than temporary features.\n\nIn environmental science, DEMs support terrain analysis for habitat modeling, erosion prediction, and landform classification. The data enables researchers to understand landscape evolution, identify geomorphological features, and assess terrain characteristics that influence ecological processes. DEMs are also essential for orthorectification of satellite imagery, ensuring that images are geometrically corrected based on actual ground elevation.',
    image: '/uploads/products/commercial-imagery-dem.jpg',
    order: 5,
    features: [
      {
        title: 'Bare Earth Surface',
        description: 'Vegetation and structures removed for accurate terrain representation',
        icon: 'mountain'
      },
      {
        title: 'Hydrological Modeling',
        description: 'Essential for watershed analysis and flow simulation',
        icon: 'waves'
      },
      {
        title: 'Engineering Applications',
        description: 'Cut-and-fill calculations, slope analysis, and site planning',
        icon: 'tool'
      }
    ],
    specifications: [
      { key: 'Vertical Accuracy', value: '0.3 - 1', unit: 'meter RMSE' },
      { key: 'Horizontal Resolution', value: '1 - 30', unit: 'meters' },
      { key: 'Point Density', value: '1 - 5', unit: 'points/m²' },
      { key: 'Format', value: 'GeoTIFF, ASCII Grid', unit: '' },
      { key: 'Vertical Datum', value: 'Any standard datum', unit: '' }
    ]
  },
  {
    name: 'IR (Infrared)',
    slug: 'ir',
    description: 'Infrared spectrum imagery for thermal analysis and vegetation health monitoring. Valuable for agriculture, environmental monitoring, and heat loss detection.',
    longDescription: 'Infrared (IR) imagery captures electromagnetic radiation beyond the visible spectrum, revealing information invisible to the human eye. Thermal infrared sensors detect heat emissions, enabling temperature mapping and thermal analysis, while near-infrared sensors are sensitive to vegetation health and water content.\n\nIn precision agriculture, near-infrared imagery is used to calculate vegetation indices like NDVI (Normalized Difference Vegetation Index), which quantifies plant health and vigor. Farmers use this information to optimize irrigation, detect crop stress early, and apply fertilizers precisely where needed, reducing costs and environmental impact.\n\nThermal infrared imagery has diverse applications in energy efficiency audits, where it identifies heat loss in buildings, and in industrial monitoring, where it detects equipment overheating before failures occur. Environmental scientists use thermal IR to monitor water temperature, track wildlife, and study urban heat islands. The technology is also valuable for emergency response, helping locate people in search and rescue operations and identifying hot spots in wildfires.',
    image: '/uploads/products/commercial-imagery-ir.jpg',
    order: 6,
    features: [
      {
        title: 'Thermal Analysis',
        description: 'Temperature mapping and heat loss detection',
        icon: 'thermometer'
      },
      {
        title: 'Vegetation Health',
        description: 'NDVI and other indices for crop monitoring',
        icon: 'leaf'
      },
      {
        title: 'Environmental Monitoring',
        description: 'Water temperature, wildlife tracking, and ecosystem analysis',
        icon: 'globe'
      }
    ],
    specifications: [
      { key: 'Spectral Range', value: 'NIR: 0.7-1.4 µm, TIR: 8-14 µm', unit: '' },
      { key: 'Thermal Resolution', value: '0.1 - 0.5', unit: '°C' },
      { key: 'Spatial Resolution', value: '1 - 100', unit: 'meters' },
      { key: 'Temperature Range', value: '-40 to +150', unit: '°C' },
      { key: 'Radiometric Resolution', value: '12 - 16', unit: 'bit' }
    ]
  },
  {
    name: 'Hyperspectral',
    slug: 'hyperspectral',
    description: 'Multi-band spectral imaging for material identification and classification. Advanced applications in mineral exploration, precision agriculture, and environmental assessment.',
    longDescription: 'Hyperspectral imaging captures data across hundreds of narrow, contiguous spectral bands, creating a detailed "spectral signature" for every pixel in the image. This rich spectral information enables precise material identification and classification based on the unique way different materials reflect and absorb electromagnetic radiation.\n\nIn mineral exploration, hyperspectral imagery identifies specific minerals and alteration zones associated with ore deposits, guiding exploration efforts and reducing costs. Geologists use the technology to map rock types, detect hydrothermal alteration, and identify areas with high mineral potential without extensive ground surveys.\n\nPrecision agriculture benefits from hyperspectral data through detailed crop health assessment, disease detection, and nutrient deficiency identification. The fine spectral resolution reveals subtle changes in plant physiology that are invisible to standard multispectral sensors, enabling early intervention and optimized crop management.\n\nEnvironmental applications include water quality monitoring, where hyperspectral sensors detect algal blooms, suspended sediments, and pollutants. The technology also supports biodiversity assessment by distinguishing between plant species and mapping invasive vegetation with high accuracy.',
    image: '/uploads/products/commercial-imagery-hyperspectral.jpg',
    order: 7,
    features: [
      {
        title: 'Material Identification',
        description: 'Precise classification based on spectral signatures',
        icon: 'search'
      },
      {
        title: 'Mineral Exploration',
        description: 'Detect alteration zones and identify mineral deposits',
        icon: 'gem'
      },
      {
        title: 'Advanced Agriculture',
        description: 'Early disease detection and nutrient deficiency mapping',
        icon: 'sprout'
      }
    ],
    specifications: [
      { key: 'Spectral Bands', value: '100 - 400', unit: 'bands' },
      { key: 'Spectral Range', value: '0.4 - 2.5', unit: 'µm' },
      { key: 'Spectral Resolution', value: '5 - 10', unit: 'nm' },
      { key: 'Spatial Resolution', value: '1 - 30', unit: 'meters' },
      { key: 'Radiometric Resolution', value: '12 - 16', unit: 'bit' }
    ]
  }
];

async function updateCommercialImagery() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('Error: Admin token required!');
      console.log('\nUsage:');
      console.log('node backend/scripts/update-commercial-imagery-full.js YOUR_ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Starting Commercial Imagery update...\n');
    
    // Get all products
    console.log('📡 Fetching products...');
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const products = await response.json();
    const commercialImagery = products.find(p => p.slug === 'commercial-imagery');

    if (!commercialImagery) {
      console.error('❌ Commercial Imagery product not found!');
      console.log('Please create it first in the admin panel.');
      process.exit(1);
    }

    console.log('✅ Found Commercial Imagery product');
    console.log(`   ID: ${commercialImagery._id}`);
    console.log(`   Name: ${commercialImagery.name}\n`);

    // Update product with enhanced sub-products
    console.log('📝 Updating with enhanced sub-products...\n');
    
    const updateResponse = await fetch(`${API_BASE_URL}/admin/products/${commercialImagery._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...commercialImagery,
        subProducts: subProductsData
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update product: ${error}`);
    }

    console.log('✅ Successfully updated Commercial Imagery with enhanced sub-products:\n');
    
    subProductsData.forEach((sp, index) => {
      console.log(`${index + 1}. ${sp.name}`);
      console.log(`   Slug: ${sp.slug}`);
      console.log(`   Image: ${sp.image}`);
      console.log(`   Features: ${sp.features.length}`);
      console.log(`   Specifications: ${sp.specifications.length}`);
      console.log(`   Description length: ${sp.longDescription.length} chars\n`);
    });

    console.log('✅ Update completed successfully!\n');
    console.log('📍 You can now view these at:');
    console.log('   1. Navigation: Products > Commercial Imagery');
    console.log('   2. Product page: /products/commercial-imagery');
    console.log('   3. Sub-product pages: /products/commercial-imagery/{slug}');
    console.log('   4. Admin panel: /admin/products (edit Commercial Imagery)\n');
    
    console.log('⚠️  Note: Images are set to placeholder paths.');
    console.log('   Upload actual images via admin panel for each sub-product.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
updateCommercialImagery();
