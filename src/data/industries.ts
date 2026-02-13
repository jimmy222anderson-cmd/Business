import { Industry } from '@/types';

// Industry data for all 8 industries
export const industries: Industry[] = [
  {
    id: 'financial-services',
    name: 'Financial Services',
    slug: 'financial-services',
    description:
      'Leverage satellite data for risk assessment, fraud detection, and market intelligence. Monitor economic indicators, track supply chains, and analyze infrastructure development to make informed investment decisions.',
    longDescription:
      'Financial institutions rely on satellite intelligence to gain competitive advantages in risk assessment, investment analysis, and market forecasting. Our comprehensive satellite data solutions enable banks, hedge funds, and insurance companies to monitor infrastructure development, track supply chain movements, and assess economic indicators from space. From monitoring construction projects for real estate investments to tracking oil tanker movements for commodity trading, satellite data provides unique insights that traditional data sources cannot match.',
    image: '/placeholder.svg',
    useCases: [
      {
        id: '1',
        title: 'Infrastructure monitoring for investment analysis',
        description: 'Track construction and development projects to assess investment opportunities and market trends',
      },
      {
        id: '2',
        title: 'Supply chain visibility and risk assessment',
        description: 'Monitor global logistics, port activity, and trade flows to identify supply chain disruptions',
      },
      {
        id: '3',
        title: 'Agricultural yield prediction for commodity trading',
        description: 'Forecast crop production and market trends using satellite-based vegetation indices',
      },
    ],
    relevantProducts: ['1', '2', '6'],
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    slug: 'agriculture',
    description:
      'Optimize crop management with precision agriculture insights. Monitor crop health, soil moisture, and weather patterns to maximize yields and reduce resource waste through data-driven farming practices.',
    longDescription:
      'Modern agriculture demands precision and efficiency. Our satellite-powered solutions enable farmers and agribusinesses to monitor crop health, optimize irrigation, and predict yields with unprecedented accuracy. By analyzing multispectral imagery, we detect crop stress before it becomes visible to the naked eye, allowing for timely interventions. Soil moisture monitoring helps optimize water usage, reducing costs and environmental impact. From small family farms to large agricultural corporations, our platform provides the insights needed to maximize productivity while minimizing resource consumption.',
    image: '/placeholder.svg',
    useCases: [
      {
        id: '1',
        title: 'Crop health monitoring and disease detection',
        description: 'Early identification of crop stress, disease, and pest infestations using multispectral analysis',
      },
      {
        id: '2',
        title: 'Irrigation optimization and water management',
        description: 'Efficient water usage based on real-time soil moisture data and weather forecasts',
      },
      {
        id: '3',
        title: 'Yield prediction and harvest planning',
        description: 'Accurate forecasting for better planning, logistics, and market positioning',
      },
    ],
    relevantProducts: ['1', '3', '9'],
  },
  {
    id: 'energy',
    name: 'Energy',
    slug: 'energy',
    description:
      'Monitor energy infrastructure, detect methane emissions, and optimize renewable energy sites. Track oil and gas operations, solar farm performance, and wind turbine efficiency with high-resolution satellite imagery.',
    longDescription:
      'The energy sector faces increasing pressure to operate efficiently while meeting environmental standards. Our satellite monitoring solutions help energy companies track infrastructure, detect emissions, and optimize operations. From monitoring pipeline integrity to detecting methane leaks, our platform provides critical insights for both traditional and renewable energy operations. Solar farm operators can assess panel performance, while wind energy companies can optimize turbine placement. Oil and gas companies benefit from continuous monitoring of remote facilities, ensuring safety and compliance.',
    image: '/placeholder.svg',
    useCases: [
      {
        id: '1',
        title: 'Pipeline and infrastructure monitoring',
        description: 'Detect leaks, unauthorized access, and structural issues across vast pipeline networks',
      },
      {
        id: '2',
        title: 'Methane emission detection and reporting',
        description: 'Environmental compliance monitoring using advanced spectral analysis',
      },
      {
        id: '3',
        title: 'Renewable energy site optimization',
        description: 'Solar and wind farm performance analysis and site selection',
      },
    ],
    relevantProducts: ['1', '2', '8'],
  },
  {
    id: 'mining',
    name: 'Mining',
    slug: 'mining',
    description:
      'Track mining operations, monitor environmental impact, and ensure regulatory compliance. Analyze stockpile volumes, detect unauthorized mining activities, and assess land rehabilitation progress.',
    longDescription:
      'Mining operations require constant monitoring for safety, efficiency, and environmental compliance. Our satellite solutions provide mining companies with accurate stockpile measurements, environmental impact assessments, and security monitoring. Track excavation progress, monitor tailings dams, and detect unauthorized mining activities in real-time. Our platform helps ensure regulatory compliance by documenting land rehabilitation efforts and monitoring water quality in surrounding areas. From exploration to closure, satellite data supports every phase of mining operations.',
    image: '/placeholder.svg',
    useCases: [
      {
        id: '1',
        title: 'Stockpile volume measurement and tracking',
        description: 'Accurate inventory management using 3D terrain modeling and change detection',
      },
      {
        id: '2',
        title: 'Environmental impact monitoring',
        description: 'Track deforestation, water quality, and land rehabilitation progress',
      },
      {
        id: '3',
        title: 'Illegal mining detection and prevention',
        description: 'Identify unauthorized activities and protect mineral rights',
      },
    ],
    relevantProducts: ['1', '2', '8'],
  },
  {
    id: 'construction',
    name: 'Construction',
    slug: 'construction',
    description:
      'Monitor construction progress, track site changes, and manage large-scale infrastructure projects. Verify contractor work, assess project timelines, and ensure quality control with regular satellite updates.',
    longDescription:
      'Construction and infrastructure projects benefit from continuous satellite monitoring throughout their lifecycle. Our platform enables project managers to track progress, verify contractor work, and identify potential delays before they impact timelines. From site preparation to final completion, satellite imagery provides an objective record of project development. Monitor multiple sites simultaneously, assess earthwork volumes, and ensure compliance with project specifications. Our solutions help reduce disputes, improve project management, and provide stakeholders with transparent progress updates.',
    image: '/placeholder.svg',
    useCases: [
      {
        id: '1',
        title: 'Construction progress monitoring',
        description: 'Track project milestones, timelines, and contractor performance',
      },
      {
        id: '2',
        title: 'Site change detection and verification',
        description: 'Validate contractor work, earthwork volumes, and compliance with plans',
      },
      {
        id: '3',
        title: 'Infrastructure planning and analysis',
        description: 'Site selection, feasibility studies, and environmental impact assessment',
      },
    ],
    relevantProducts: ['2', '4', '9'],
  },
  {
    id: 'government',
    name: 'Government',
    slug: 'government',
    description:
      'Support national security, disaster response, and urban planning initiatives. Monitor borders, assess natural disasters, track urban development, and coordinate emergency response with real-time satellite intelligence.',
    longDescription:
      'Government agencies require reliable, timely intelligence for national security, disaster response, and public services. Our satellite platform provides comprehensive monitoring capabilities for border security, disaster assessment, and urban planning. During natural disasters, rapid damage assessment helps coordinate emergency response and allocate resources effectively. Urban planners use satellite data to track city growth, monitor infrastructure development, and plan future expansion. From local municipalities to federal agencies, our solutions support informed decision-making and public safety.',
    image: '/placeholder.svg',
    useCases: [
      {
        id: '1',
        title: 'Disaster response and damage assessment',
        description: 'Rapid evaluation of affected areas for emergency response coordination',
      },
      {
        id: '2',
        title: 'Border security and monitoring',
        description: 'Surveillance of critical infrastructure and border regions',
      },
      {
        id: '3',
        title: 'Urban planning and development tracking',
        description: 'Monitor city growth, infrastructure development, and land use changes',
      },
    ],
    relevantProducts: ['2', '7', '8'],
  },
  {
    id: 'environment',
    name: 'Environment',
    slug: 'environment',
    description:
      'Monitor deforestation, track wildlife habitats, and assess climate change impacts. Analyze ecosystem health, detect illegal logging, and support conservation efforts with comprehensive environmental monitoring.',
    longDescription:
      'Environmental conservation requires accurate, consistent monitoring of ecosystems and natural resources. Our satellite solutions enable environmental organizations to track deforestation, monitor wildlife habitats, and assess climate change impacts at scale. Detect illegal logging activities, monitor protected areas, and document ecosystem changes over time. From tracking glacier retreat to monitoring coral reef health, satellite data provides the evidence needed to support conservation efforts and inform policy decisions. Our platform helps environmental scientists and conservation organizations protect our planet for future generations.',
    image: '/placeholder.svg',
    useCases: [
      {
        id: '1',
        title: 'Deforestation detection and monitoring',
        description: 'Track forest loss, degradation, and illegal logging activities',
      },
      {
        id: '2',
        title: 'Wildlife habitat assessment',
        description: 'Monitor ecosystem health, biodiversity, and habitat connectivity',
      },
      {
        id: '3',
        title: 'Climate change impact analysis',
        description: 'Track glaciers, sea levels, vegetation changes, and extreme weather events',
      },
    ],
    relevantProducts: ['3', '9', '1'],
  },
  {
    id: 'insurance',
    name: 'Insurance',
    slug: 'insurance',
    description:
      'Assess property risks, verify claims, and detect fraud with satellite imagery. Evaluate natural disaster damage, monitor insured assets, and streamline claims processing with accurate geospatial data.',
    longDescription:
      'Insurance companies face challenges in risk assessment, claims verification, and fraud detection. Our satellite solutions provide objective, timely data for underwriting, claims processing, and portfolio management. Assess property exposure to natural hazards, verify damage claims after disasters, and detect fraudulent claims through historical imagery analysis. From property and casualty to agricultural insurance, satellite data helps insurers make informed decisions, reduce losses, and improve customer service. Our platform enables faster claims processing and more accurate risk pricing.',
    image: '/placeholder.svg',
    useCases: [
      {
        id: '1',
        title: 'Property risk assessment and underwriting',
        description: 'Evaluate exposure to floods, wildfires, and other natural hazards',
      },
      {
        id: '2',
        title: 'Claims verification and fraud detection',
        description: 'Validate damage reports with pre- and post-event imagery',
      },
      {
        id: '3',
        title: 'Natural disaster damage assessment',
        description: 'Rapid evaluation of affected properties for claims processing',
      },
    ],
    relevantProducts: ['2', '8', '9'],
  },
];
