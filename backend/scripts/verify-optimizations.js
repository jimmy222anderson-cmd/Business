/**
 * Verification script to check if all API performance optimizations are in place
 * This script checks files, dependencies, and code without requiring the server to run
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    log(`  Missing: ${filePath}`, 'yellow');
    return false;
  }
}

function checkFileContains(filePath, searchString, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const contains = content.includes(searchString);
    
    if (contains) {
      log(`✓ ${description}`, 'green');
      return true;
    } else {
      log(`✗ ${description}`, 'red');
      log(`  File exists but missing: "${searchString}"`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`✗ ${description}`, 'red');
    log(`  Error reading file: ${error.message}`, 'yellow');
    return false;
  }
}

function checkDependency(packageName) {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasDep = packageJson.dependencies && packageJson.dependencies[packageName];
    
    if (hasDep) {
      log(`✓ Dependency: ${packageName} (${packageJson.dependencies[packageName]})`, 'green');
      return true;
    } else {
      log(`✗ Dependency: ${packageName} not found in package.json`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Error checking dependency: ${error.message}`, 'red');
    return false;
  }
}

async function runVerification() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     API Performance Optimization Verification             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  // Check 1: Dependencies
  log('\n━━━ Check 1: Dependencies ━━━', 'blue');
  if (checkDependency('node-cache')) passed++; else failed++;
  if (checkDependency('compression')) passed++; else failed++;
  
  // Check 2: Cache Service
  log('\n━━━ Check 2: Cache Service ━━━', 'blue');
  if (checkFile('services/cacheService.js', 'Cache service file exists')) passed++; else failed++;
  if (checkFileContains('services/cacheService.js', 'class CacheService', 'Cache service class defined')) passed++; else failed++;
  if (checkFileContains('services/cacheService.js', 'generateProductCatalogKey', 'Product catalog key generator exists')) passed++; else failed++;
  if (checkFileContains('services/cacheService.js', 'invalidateProductCatalog', 'Cache invalidation method exists')) passed++; else failed++;
  
  // Check 3: Public Routes with Caching
  log('\n━━━ Check 3: Public Routes with Caching ━━━', 'blue');
  if (checkFile('routes/public/satelliteProducts.js', 'Public satellite products route exists')) passed++; else failed++;
  if (checkFileContains('routes/public/satelliteProducts.js', 'cacheService', 'Cache service imported')) passed++; else failed++;
  if (checkFileContains('routes/public/satelliteProducts.js', 'cacheService.get', 'Cache get used')) passed++; else failed++;
  if (checkFileContains('routes/public/satelliteProducts.js', 'cacheService.set', 'Cache set used')) passed++; else failed++;
  if (checkFileContains('routes/public/satelliteProducts.js', '.lean()', 'Query optimization (.lean) used')) passed++; else failed++;
  
  // Check 4: Admin Routes with Cache Invalidation
  log('\n━━━ Check 4: Admin Routes with Cache Invalidation ━━━', 'blue');
  if (checkFile('routes/admin/satelliteProducts.js', 'Admin satellite products route exists')) passed++; else failed++;
  if (checkFileContains('routes/admin/satelliteProducts.js', 'cacheService', 'Cache service imported')) passed++; else failed++;
  if (checkFileContains('routes/admin/satelliteProducts.js', 'invalidateProductCatalog', 'Cache invalidation on create')) passed++; else failed++;
  if (checkFileContains('routes/admin/satelliteProducts.js', 'invalidateProduct', 'Cache invalidation on update/delete')) passed++; else failed++;
  
  // Check 5: Database Indexes
  log('\n━━━ Check 5: Database Indexes ━━━', 'blue');
  if (checkFile('models/SatelliteProduct.js', 'SatelliteProduct model exists')) passed++; else failed++;
  if (checkFileContains('models/SatelliteProduct.js', '.index({ status: 1, resolution_category: 1, order: 1 })', 'Compound index 1 defined')) passed++; else failed++;
  if (checkFileContains('models/SatelliteProduct.js', '.index({ status: 1, sensor_type: 1, order: 1 })', 'Compound index 2 defined')) passed++; else failed++;
  if (checkFileContains('models/SatelliteProduct.js', '.index({ created_at: -1 })', 'Created_at index defined')) passed++; else failed++;
  
  if (checkFile('models/ImageryRequest.js', 'ImageryRequest model exists')) passed++; else failed++;
  if (checkFileContains('models/ImageryRequest.js', '.index({ status: 1, urgency: 1, created_at: -1 })', 'ImageryRequest compound index defined')) passed++; else failed++;
  if (checkFileContains('models/ImageryRequest.js', '.index({ user_id: 1, status: 1, created_at: -1 })', 'ImageryRequest user index defined')) passed++; else failed++;
  
  // Check 6: Compression Middleware
  log('\n━━━ Check 6: Compression Middleware ━━━', 'blue');
  if (checkFile('server.js', 'Server file exists')) passed++; else failed++;
  if (checkFileContains('server.js', "require('compression')", 'Compression module imported')) passed++; else failed++;
  if (checkFileContains('server.js', 'app.use(compression', 'Compression middleware used')) passed++; else failed++;
  if (checkFileContains('server.js', 'threshold: 1024', 'Compression threshold configured')) passed++; else failed++;
  
  // Check 7: Documentation
  log('\n━━━ Check 7: Documentation ━━━', 'blue');
  if (checkFile('docs/API_PERFORMANCE_OPTIMIZATIONS.md', 'Performance optimization documentation exists')) passed++; else failed++;
  if (checkFile('../docs/reports/frontend/TASK_24.2_API_PERFORMANCE_SUMMARY.md', 'Task summary exists')) passed++; else failed++;
  if (checkFile('../docs/reports/frontend/TESTING_CHECKLIST.md', 'Testing checklist exists')) passed++; else failed++;
  
  // Check 8: Test Scripts
  log('\n━━━ Check 8: Test Scripts ━━━', 'blue');
  if (checkFile('scripts/test-cache-service.js', 'Cache service test script exists')) passed++; else failed++;
  if (checkFile('scripts/test-api-performance.js', 'API performance test script exists')) passed++; else failed++;
  
  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Verification Summary                    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  log(`\n  Total checks: ${total}`);
  log(`  Passed: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`  Failed: ${failed}`, failed === 0 ? 'green' : 'red');
  log(`  Success rate: ${percentage}%`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✓ All optimizations are in place!', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Install dependencies: npm install', 'cyan');
    log('  2. Start the server: npm start', 'cyan');
    log('  3. Run cache tests: node scripts/test-cache-service.js', 'cyan');
    log('  4. Run API tests: node scripts/test-api-performance.js', 'cyan');
    log('  5. See docs/reports/frontend/TESTING_CHECKLIST.md for complete testing guide', 'cyan');
  } else {
    log('\n✗ Some optimizations are missing or incomplete.', 'red');
    log('  Please review the failed checks above.', 'yellow');
  }
  
  log('\n' + '═'.repeat(60), 'cyan');
  
  return failed === 0;
}

// Run verification
runVerification()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log('\n✗ Verification failed:', 'red');
    log(`  ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
