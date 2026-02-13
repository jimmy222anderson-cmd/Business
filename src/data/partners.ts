import { Partner } from '@/types';

// Partner data organized by category
export const partners: Partner[] = [
  // Satellite providers
  {
    id: 'maxar',
    name: 'Maxar Technologies',
    logo: '/placeholder.svg',
    description: 'Leading provider of high-resolution satellite imagery with 30cm resolution capabilities.',
    website: 'https://www.maxar.com',
    category: 'satellite',
  },
  {
    id: 'planet',
    name: 'Planet Labs',
    logo: '/placeholder.svg',
    description: 'Daily global imagery from a constellation of 200+ satellites.',
    website: 'https://www.planet.com',
    category: 'satellite',
  },
  {
    id: 'iceye',
    name: 'ICEYE',
    logo: '/placeholder.svg',
    description: 'SAR satellite imagery with all-weather, day-night capabilities.',
    website: 'https://www.iceye.com',
    category: 'satellite',
  },
  {
    id: 'airbus',
    name: 'Airbus Defence and Space',
    logo: '/placeholder.svg',
    description: 'European leader in satellite imagery and geospatial services.',
    website: 'https://www.airbus.com',
    category: 'satellite',
  },
  
  // Data providers
  {
    id: 'nasa',
    name: 'NASA',
    logo: '/placeholder.svg',
    description: 'Open satellite data from Landsat and other government missions.',
    website: 'https://www.nasa.gov',
    category: 'data',
  },
  {
    id: 'esa',
    name: 'European Space Agency',
    logo: '/placeholder.svg',
    description: 'Sentinel satellite data and Copernicus program access.',
    website: 'https://www.esa.int',
    category: 'data',
  },
  {
    id: 'usgs',
    name: 'USGS',
    logo: '/placeholder.svg',
    description: 'US Geological Survey Earth observation data and archives.',
    website: 'https://www.usgs.gov',
    category: 'data',
  },
  {
    id: 'exactearth',
    name: 'exactEarth',
    logo: '/placeholder.svg',
    description: 'Global AIS data for maritime vessel tracking and intelligence.',
    website: 'https://www.exactearth.com',
    category: 'data',
  },
  
  // Technology partners
  {
    id: 'aws',
    name: 'Amazon Web Services',
    logo: '/placeholder.svg',
    description: 'Cloud infrastructure and data processing capabilities.',
    website: 'https://aws.amazon.com',
    category: 'technology',
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud',
    logo: '/placeholder.svg',
    description: 'AI/ML tools and geospatial data processing platform.',
    website: 'https://cloud.google.com',
    category: 'technology',
  },
  {
    id: 'esri',
    name: 'Esri',
    logo: '/placeholder.svg',
    description: 'GIS software and mapping technology integration.',
    website: 'https://www.esri.com',
    category: 'technology',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Azure',
    logo: '/placeholder.svg',
    description: 'Enterprise cloud services and AI capabilities.',
    website: 'https://azure.microsoft.com',
    category: 'technology',
  },
  
  // Client partners
  {
    id: 'world-bank',
    name: 'World Bank',
    logo: '/placeholder.svg',
    description: 'Global development and infrastructure monitoring projects.',
    website: 'https://www.worldbank.org',
    category: 'client',
  },
  {
    id: 'un',
    name: 'United Nations',
    logo: '/placeholder.svg',
    description: 'Humanitarian response and sustainable development initiatives.',
    website: 'https://www.un.org',
    category: 'client',
  },
  {
    id: 'noaa',
    name: 'NOAA',
    logo: '/placeholder.svg',
    description: 'Weather forecasting and climate monitoring applications.',
    website: 'https://www.noaa.gov',
    category: 'client',
  },
  {
    id: 'fortune-500',
    name: 'Fortune 500 Companies',
    logo: '/placeholder.svg',
    description: 'Leading corporations across multiple industries.',
    category: 'client',
  },
];

// Helper function to get partners by category
export const getPartnersByCategory = (category: Partner['category']) => {
  return partners.filter((partner) => partner.category === category);
};

// Category labels for display
export const categoryLabels: Record<Partner['category'], string> = {
  satellite: 'Satellite Providers',
  data: 'Data Providers',
  technology: 'Technology Partners',
  client: 'Client Partners',
};
