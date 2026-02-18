/**
 * Validation script for satellite product seed data
 * Verifies data structure without requiring database connection
 */

const { satelliteProducts } = require('../seeds/satelliteProducts');

// Validation rules based on SatelliteProduct model
const validSensorTypes = ['optical', 'radar', 'thermal'];
const validResolutionCategories = ['vhr', 'high', 'medium', 'low'];
const validAvailability = ['archive', 'tasking', 'both'];
const validStatus = ['active', 'inactive'];

function validateProduct(product, index) {
  const errors = [];
  
  // Required fields
  if (!product.name) errors.push('Missing name');
  if (!product.provider) errors.push('Missing provider');
  if (!product.sensor_type) errors.push('Missing sensor_type');
  if (product.resolution === undefined) errors.push('Missing resolution');
  if (!product.resolution_category) errors.push('Missing resolution_category');
  if (!product.bands || product.bands.length === 0) errors.push('Missing or empty bands array');
  if (!product.coverage) errors.push('Missing coverage');
  if (!product.availability) errors.push('Missing availability');
  if (!product.description) errors.push('Missing description');
  
  // Enum validations
  if (product.sensor_type && !validSensorTypes.includes(product.sensor_type)) {
    errors.push(`Invalid sensor_type: ${product.sensor_type}`);
  }
  if (product.resolution_category && !validResolutionCategories.includes(product.resolution_category)) {
    errors.push(`Invalid resolution_category: ${product.resolution_category}`);
  }
  if (product.availability && !validAvailability.includes(product.availability)) {
    errors.push(`Invalid availability: ${product.availability}`);
  }
  if (product.status && !validStatus.includes(product.status)) {
    errors.push(`Invalid status: ${product.status}`);
  }
  
  // Type validations
  if (product.resolution !== undefined && (typeof product.resolution !== 'number' || product.resolution < 0)) {
    errors.push('Resolution must be a positive number');
  }
  if (!Array.isArray(product.bands)) {
    errors.push('Bands must be an array');
  }
  
  // Specifications validation
  if (product.specifications) {
    const specs = product.specifications;
    if (specs.swath_width !== undefined && (typeof specs.swath_width !== 'number' || specs.swath_width < 0)) {
      errors.push('swath_width must be a positive number');
    }
    if (specs.revisit_time !== undefined && (typeof specs.revisit_time !== 'number' || specs.revisit_time < 0)) {
      errors.push('revisit_time must be a positive number');
    }
    if (specs.spectral_bands !== undefined && (typeof specs.spectral_bands !== 'number' || specs.spectral_bands < 0)) {
      errors.push('spectral_bands must be a positive number');
    }
    if (specs.radiometric_resolution !== undefined && (typeof specs.radiometric_resolution !== 'number' || specs.radiometric_resolution < 0)) {
      errors.push('radiometric_resolution must be a positive number');
    }
  }
  
  return errors;
}

function validateResolutionCategory(product) {
  const { resolution, resolution_category } = product;
  
  // VHR: <1m, High: 1-5m, Medium: 5-30m, Low: >30m
  if (resolution < 1 && resolution_category !== 'vhr') {
    return `Resolution ${resolution}m should be category 'vhr', not '${resolution_category}'`;
  }
  if (resolution >= 1 && resolution < 5 && resolution_category !== 'high' && resolution_category !== 'vhr') {
    return `Resolution ${resolution}m should be category 'high' or 'vhr', not '${resolution_category}'`;
  }
  if (resolution >= 5 && resolution < 30 && resolution_category !== 'medium') {
    return `Resolution ${resolution}m should be category 'medium', not '${resolution_category}'`;
  }
  if (resolution >= 30 && resolution_category !== 'medium' && resolution_category !== 'low') {
    return `Resolution ${resolution}m should be category 'medium' or 'low', not '${resolution_category}'`;
  }
  
  return null;
}

console.log('Validating satellite product seed data...\n');

let hasErrors = false;
const stats = {
  total: satelliteProducts.length,
  byProvider: {},
  bySensorType: {},
  byResolutionCategory: {},
  byAvailability: {}
};

satelliteProducts.forEach((product, index) => {
  const errors = validateProduct(product, index);
  const resolutionWarning = validateResolutionCategory(product);
  
  if (errors.length > 0) {
    hasErrors = true;
    console.log(`❌ Product ${index + 1} (${product.name || 'unnamed'}):`);
    errors.forEach(error => console.log(`   - ${error}`));
    console.log();
  }
  
  if (resolutionWarning) {
    console.log(`⚠️  Product ${index + 1} (${product.name}):`);
    console.log(`   - ${resolutionWarning}`);
    console.log();
  }
  
  // Collect statistics
  stats.byProvider[product.provider] = (stats.byProvider[product.provider] || 0) + 1;
  stats.bySensorType[product.sensor_type] = (stats.bySensorType[product.sensor_type] || 0) + 1;
  stats.byResolutionCategory[product.resolution_category] = (stats.byResolutionCategory[product.resolution_category] || 0) + 1;
  stats.byAvailability[product.availability] = (stats.byAvailability[product.availability] || 0) + 1;
});

if (!hasErrors) {
  console.log('✅ All products passed validation!\n');
}

console.log('=== Seed Data Statistics ===\n');
console.log(`Total products: ${stats.total}\n`);

console.log('By Provider:');
Object.entries(stats.byProvider).sort((a, b) => b[1] - a[1]).forEach(([provider, count]) => {
  console.log(`  ${provider}: ${count}`);
});

console.log('\nBy Sensor Type:');
Object.entries(stats.bySensorType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\nBy Resolution Category:');
Object.entries(stats.byResolutionCategory).forEach(([category, count]) => {
  console.log(`  ${category}: ${count}`);
});

console.log('\nBy Availability:');
Object.entries(stats.byAvailability).forEach(([availability, count]) => {
  console.log(`  ${availability}: ${count}`);
});

console.log('\n=== Product List ===\n');
satelliteProducts.forEach((product, index) => {
  console.log(`${index + 1}. ${product.name} (${product.provider})`);
  console.log(`   Resolution: ${product.resolution}m (${product.resolution_category})`);
  console.log(`   Type: ${product.sensor_type} | Availability: ${product.availability}`);
  console.log(`   Bands: ${product.bands.join(', ')}`);
  console.log();
});

if (hasErrors) {
  console.log('❌ Validation failed with errors');
  process.exit(1);
} else {
  console.log('✅ Validation completed successfully');
  process.exit(0);
}
