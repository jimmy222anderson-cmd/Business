/**
 * Script to add industries with comprehensive data
 * Run with: node backend/scripts/add-industries.js YOUR_ADMIN_TOKEN
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN = process.argv[2];

const industries = [
  {
    name: 'Natural Resources',
    slug: 'natural-resources',
    description: 'Satellite imagery and geospatial analytics for sustainable management of natural resources including forests, water bodies, and mineral deposits.',
    longDescription: 'Our Natural Resources solutions leverage advanced satellite imagery and AI-powered analytics to help organizations monitor, manage, and protect vital natural resources. From forest health monitoring to water resource management and mineral exploration, our platform provides comprehensive insights for sustainable resource utilization. Track deforestation, assess water quality, identify mineral deposits, and monitor ecosystem health with precision and efficiency.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&q=80',
    useCases: [
      {
        title: 'Forest Monitoring',
        description: 'Track deforestation, forest health, and biomass estimation using multi-spectral satellite imagery and change detection algorithms.'
      },
      {
        title: 'Water Resource Management',
        description: 'Monitor water bodies, assess water quality, track reservoir levels, and identify potential water sources for sustainable management.'
      },
      {
        title: 'Mineral Exploration',
        description: 'Identify geological formations, detect mineral signatures, and optimize exploration activities using hyperspectral and radar imagery.'
      },
      {
        title: 'Wildlife Habitat Monitoring',
        description: 'Assess habitat quality, track vegetation changes, and support conservation efforts with regular satellite monitoring.'
      }
    ],
    status: 'active',
    order: 1
  },
  {
    name: 'Environment',
    slug: 'environment',
    description: 'Environmental monitoring and assessment solutions using satellite data for pollution tracking, ecosystem health, and climate change analysis.',
    longDescription: 'Our Environmental solutions provide comprehensive monitoring capabilities for tracking environmental changes, assessing ecosystem health, and supporting conservation efforts. Utilize satellite imagery to monitor air and water quality, track pollution sources, assess biodiversity, and analyze climate change impacts. Our platform combines multi-spectral imagery with advanced analytics to deliver actionable insights for environmental protection and sustainable development.',
    image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=1200&h=800&fit=crop&q=80',
    useCases: [
      {
        title: 'Pollution Monitoring',
        description: 'Track air and water pollution, identify emission sources, and monitor environmental compliance using satellite-based sensors.'
      },
      {
        title: 'Ecosystem Health Assessment',
        description: 'Evaluate vegetation health, monitor biodiversity hotspots, and assess ecosystem services with multi-temporal imagery analysis.'
      },
      {
        title: 'Climate Change Analysis',
        description: 'Monitor glacial retreat, sea level changes, temperature variations, and other climate indicators using long-term satellite data.'
      },
      {
        title: 'Coastal Zone Management',
        description: 'Track coastal erosion, monitor marine ecosystems, and assess coastal development impacts with high-resolution imagery.'
      }
    ],
    status: 'active',
    order: 2
  },
  {
    name: 'Energy and Transportation',
    slug: 'energy-and-transportation',
    description: 'Geospatial intelligence for energy infrastructure monitoring, pipeline surveillance, and transportation network optimization.',
    longDescription: 'Our Energy and Transportation solutions deliver critical insights for infrastructure monitoring, asset management, and network optimization. Monitor power grids, pipelines, and transportation networks with high-resolution satellite imagery. Detect infrastructure anomalies, plan optimal routes, assess right-of-way encroachments, and support maintenance operations. Our platform enables efficient management of energy and transportation assets while ensuring safety and reliability.',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=800&fit=crop&q=80',
    useCases: [
      {
        title: 'Pipeline Monitoring',
        description: 'Detect encroachments, monitor right-of-way, identify potential threats, and ensure pipeline integrity using regular satellite surveillance.'
      },
      {
        title: 'Power Grid Management',
        description: 'Monitor transmission lines, assess vegetation encroachment, detect infrastructure damage, and optimize maintenance schedules.'
      },
      {
        title: 'Transportation Planning',
        description: 'Analyze traffic patterns, plan new routes, assess infrastructure conditions, and optimize transportation networks with geospatial data.'
      },
      {
        title: 'Renewable Energy Site Selection',
        description: 'Identify optimal locations for solar and wind farms, assess terrain suitability, and monitor renewable energy installations.'
      }
    ],
    status: 'active',
    order: 3
  },
  {
    name: 'Disaster Management',
    slug: 'disaster-management',
    description: 'Rapid response and recovery solutions using satellite imagery for natural disaster assessment, emergency planning, and damage evaluation.',
    longDescription: 'Our Disaster Management solutions provide critical support for emergency response, damage assessment, and recovery operations. Access near-real-time satellite imagery to assess disaster impacts, coordinate relief efforts, and plan recovery activities. From floods and earthquakes to wildfires and hurricanes, our platform delivers rapid insights when every minute counts. Support pre-disaster planning, real-time monitoring during events, and post-disaster damage assessment with comprehensive geospatial intelligence.',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1200&h=800&fit=crop&q=80',
    useCases: [
      {
        title: 'Flood Mapping',
        description: 'Rapidly assess flood extent, identify affected areas, support evacuation planning, and monitor water recession using SAR and optical imagery.'
      },
      {
        title: 'Earthquake Damage Assessment',
        description: 'Evaluate structural damage, identify collapsed buildings, prioritize rescue operations, and support recovery planning with before-after analysis.'
      },
      {
        title: 'Wildfire Monitoring',
        description: 'Track fire progression, assess burn severity, monitor smoke plumes, and support firefighting operations with thermal and optical imagery.'
      },
      {
        title: 'Hurricane Impact Analysis',
        description: 'Assess storm damage, evaluate infrastructure impacts, support insurance claims, and coordinate recovery efforts with high-resolution imagery.'
      }
    ],
    status: 'active',
    order: 4
  },
  {
    name: 'Meteorology',
    slug: 'meteorology',
    description: 'Weather monitoring and forecasting solutions using satellite data for atmospheric analysis, climate modeling, and weather prediction.',
    longDescription: 'Our Meteorology solutions harness the power of satellite observations to enhance weather forecasting, climate analysis, and atmospheric research. Access multi-spectral imagery, thermal data, and atmospheric measurements to track weather patterns, monitor severe weather events, and improve forecast accuracy. Support operational meteorology, climate research, and weather-dependent decision making with comprehensive satellite-based atmospheric intelligence.',
    image: 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b?w=1200&h=800&fit=crop&q=80',
    useCases: [
      {
        title: 'Weather Forecasting',
        description: 'Enhance forecast accuracy with satellite-derived atmospheric data, cloud tracking, and temperature measurements for improved predictions.'
      },
      {
        title: 'Severe Weather Monitoring',
        description: 'Track storms, monitor cyclone development, assess precipitation patterns, and provide early warnings for severe weather events.'
      },
      {
        title: 'Climate Analysis',
        description: 'Analyze long-term climate trends, monitor atmospheric composition, track temperature anomalies, and support climate research initiatives.'
      },
      {
        title: 'Agricultural Weather Services',
        description: 'Provide crop-specific weather insights, monitor growing conditions, assess frost risk, and support precision agriculture with meteorological data.'
      }
    ],
    status: 'active',
    order: 5
  },
  {
    name: 'Land Use & Land Cover',
    slug: 'land-use-land-cover',
    description: 'Comprehensive land classification and monitoring solutions for urban planning, agriculture assessment, and environmental management.',
    longDescription: 'Our Land Use & Land Cover solutions provide detailed classification and monitoring of Earth\'s surface for urban planning, agricultural management, and environmental assessment. Utilize advanced machine learning algorithms and multi-temporal satellite imagery to map land cover types, track land use changes, monitor urban expansion, and assess agricultural productivity. Support sustainable development, resource management, and policy making with accurate and up-to-date land cover information.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop&q=80',
    useCases: [
      {
        title: 'Urban Planning',
        description: 'Map urban growth, analyze development patterns, assess infrastructure needs, and support smart city planning with detailed land use data.'
      },
      {
        title: 'Agricultural Monitoring',
        description: 'Classify crop types, assess field conditions, monitor agricultural expansion, and optimize land use for sustainable farming practices.'
      },
      {
        title: 'Deforestation Tracking',
        description: 'Monitor forest cover changes, detect illegal logging, assess reforestation efforts, and support conservation initiatives with change detection.'
      },
      {
        title: 'Wetland Mapping',
        description: 'Identify and monitor wetland areas, assess ecosystem health, track seasonal variations, and support wetland conservation efforts.'
      }
    ],
    status: 'active',
    order: 6
  }
];

async function addIndustries() {
  try {
    if (!ADMIN_TOKEN) {
      console.error('❌ Error: Admin token required!');
      console.log('\nUsage:');
      console.log('node backend/scripts/add-industries.js YOUR_ADMIN_TOKEN');
      process.exit(1);
    }

    console.log('🚀 Adding industries to the platform...\n');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const industry of industries) {
      try {
        console.log(`📝 Creating: ${industry.name}`);
        
        const response = await fetch(`${API_BASE_URL}/admin/industries`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(industry)
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to create ${industry.name}: ${error}`);
        }

        const created = await response.json();
        console.log(`   ✅ Created successfully (ID: ${created._id})`);
        console.log(`   📍 Slug: ${created.slug}`);
        console.log(`   📍 Use Cases: ${created.useCases.length}`);
        console.log('');
        
        successCount++;
        results.push({ name: industry.name, status: 'success', id: created._id });
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errorCount++;
        results.push({ name: industry.name, status: 'error', error: error.message });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${successCount}/${industries.length}`);
    console.log(`❌ Failed: ${errorCount}/${industries.length}\n`);

    if (successCount > 0) {
      console.log('✅ Created Industries:');
      results.filter(r => r.status === 'success').forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name} (${r.id})`);
      });
      console.log('');
    }

    if (errorCount > 0) {
      console.log('❌ Failed Industries:');
      results.filter(r => r.status === 'error').forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name}: ${r.error}`);
      });
      console.log('');
    }

    console.log('💡 Industries Added:');
    console.log('   1. Natural Resources - Forest monitoring, water management, mineral exploration');
    console.log('   2. Environment - Pollution tracking, ecosystem health, climate analysis');
    console.log('   3. Energy and Transportation - Pipeline monitoring, power grids, route planning');
    console.log('   4. Disaster Management - Flood mapping, earthquake assessment, wildfire tracking');
    console.log('   5. Meteorology - Weather forecasting, severe weather monitoring, climate analysis');
    console.log('   6. Land Use & Land Cover - Urban planning, agricultural monitoring, deforestation tracking\n');

    console.log('📍 Next Steps:');
    console.log('   - View industries at: http://localhost:8081/industries');
    console.log('   - Manage industries at: http://localhost:8081/admin/industries');
    console.log('   - Link products to industries in the admin panel\n');

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

// Run the script
addIndustries();
