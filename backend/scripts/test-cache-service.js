/**
 * Unit test for Cache Service
 * Tests cache functionality without requiring server to be running
 */

// Check if node-cache is installed
try {
  require('node-cache');
} catch (error) {
  console.error('\x1b[31m✗ node-cache is not installed\x1b[0m');
  console.log('\x1b[33m  Run: npm install\x1b[0m');
  process.exit(1);
}

const cacheService = require('../services/cacheService');

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

function assert(condition, message) {
  if (condition) {
    log(`✓ ${message}`, 'green');
    return true;
  } else {
    log(`✗ ${message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║           Cache Service Unit Tests                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Basic set and get
  log('\n━━━ Test 1: Basic Set and Get ━━━', 'blue');
  cacheService.set('test-key', 'test-value');
  const value = cacheService.get('test-key');
  if (assert(value === 'test-value', 'Can set and get a value')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 2: Get non-existent key
  log('\n━━━ Test 2: Get Non-existent Key ━━━', 'blue');
  const nonExistent = cacheService.get('non-existent-key');
  if (assert(nonExistent === undefined, 'Returns undefined for non-existent key')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 3: Delete key
  log('\n━━━ Test 3: Delete Key ━━━', 'blue');
  cacheService.set('delete-test', 'value');
  cacheService.del('delete-test');
  const deleted = cacheService.get('delete-test');
  if (assert(deleted === undefined, 'Can delete a key')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 4: Cache with TTL
  log('\n━━━ Test 4: Cache with TTL ━━━', 'blue');
  cacheService.set('ttl-test', 'value', 1); // 1 second TTL
  const immediate = cacheService.get('ttl-test');
  if (assert(immediate === 'value', 'Value exists immediately after set')) {
    passed++;
  } else {
    failed++;
  }
  
  // Wait for TTL to expire
  log('  Waiting 1.5 seconds for TTL to expire...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 1500));
  const expired = cacheService.get('ttl-test');
  if (assert(expired === undefined, 'Value expires after TTL')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 5: Generate product catalog key
  log('\n━━━ Test 5: Generate Product Catalog Key ━━━', 'blue');
  const key1 = cacheService.generateProductCatalogKey({
    resolution_category: 'vhr',
    sensor_type: 'optical',
    page: 1,
    limit: 20
  });
  const key2 = cacheService.generateProductCatalogKey({
    resolution_category: 'vhr',
    sensor_type: 'optical',
    page: 1,
    limit: 20
  });
  const key3 = cacheService.generateProductCatalogKey({
    resolution_category: 'high',
    sensor_type: 'optical',
    page: 1,
    limit: 20
  });
  
  if (assert(key1 === key2, 'Same query parameters generate same key')) {
    passed++;
  } else {
    failed++;
  }
  
  if (assert(key1 !== key3, 'Different query parameters generate different keys')) {
    passed++;
  } else {
    failed++;
  }
  
  log(`  Generated key: ${key1}`, 'cyan');
  
  // Test 6: Cache statistics
  log('\n━━━ Test 6: Cache Statistics ━━━', 'blue');
  cacheService.flush(); // Clear cache
  
  // Generate some cache activity
  cacheService.set('stat-test-1', 'value1');
  cacheService.set('stat-test-2', 'value2');
  cacheService.get('stat-test-1'); // Hit
  cacheService.get('stat-test-2'); // Hit
  cacheService.get('non-existent'); // Miss
  
  const stats = cacheService.getStats();
  log(`  Hits: ${stats.hits}`, 'cyan');
  log(`  Misses: ${stats.misses}`, 'cyan');
  log(`  Sets: ${stats.sets}`, 'cyan');
  log(`  Keys: ${stats.keys}`, 'cyan');
  log(`  Hit ratio: ${(stats.hits_ratio * 100).toFixed(1)}%`, 'cyan');
  
  if (assert(stats.hits >= 2, 'Tracks cache hits')) {
    passed++;
  } else {
    failed++;
  }
  
  if (assert(stats.misses >= 1, 'Tracks cache misses')) {
    passed++;
  } else {
    failed++;
  }
  
  if (assert(stats.sets >= 2, 'Tracks cache sets')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 7: Invalidate product catalog
  log('\n━━━ Test 7: Invalidate Product Catalog ━━━', 'blue');
  cacheService.flush(); // Clear cache
  
  // Set some product catalog entries
  cacheService.set('products:vhr:optical:all:order:asc:1:20', { data: 'test1' });
  cacheService.set('products:high:radar:all:order:asc:1:20', { data: 'test2' });
  cacheService.set('other:key', { data: 'test3' });
  
  cacheService.invalidateProductCatalog();
  
  const prod1 = cacheService.get('products:vhr:optical:all:order:asc:1:20');
  const prod2 = cacheService.get('products:high:radar:all:order:asc:1:20');
  const other = cacheService.get('other:key');
  
  if (assert(prod1 === undefined && prod2 === undefined, 'Invalidates all product catalog entries')) {
    passed++;
  } else {
    failed++;
  }
  
  if (assert(other !== undefined, 'Does not invalidate non-product entries')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 8: Invalidate specific product
  log('\n━━━ Test 8: Invalidate Specific Product ━━━', 'blue');
  cacheService.flush(); // Clear cache
  
  cacheService.set('product:123', { id: '123', name: 'Test Product' });
  cacheService.set('products:all:all:all:order:asc:1:20', { data: 'catalog' });
  
  cacheService.invalidateProduct('123');
  
  const product = cacheService.get('product:123');
  const catalog = cacheService.get('products:all:all:all:order:asc:1:20');
  
  if (assert(product === undefined, 'Invalidates specific product')) {
    passed++;
  } else {
    failed++;
  }
  
  if (assert(catalog === undefined, 'Also invalidates catalog when product changes')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 9: Multiple delete
  log('\n━━━ Test 9: Delete Multiple Keys ━━━', 'blue');
  cacheService.set('multi-1', 'value1');
  cacheService.set('multi-2', 'value2');
  cacheService.set('multi-3', 'value3');
  
  const deletedCount = cacheService.delMultiple(['multi-1', 'multi-2']);
  
  if (assert(deletedCount === 2, 'Deletes multiple keys')) {
    passed++;
  } else {
    failed++;
  }
  
  const remaining = cacheService.get('multi-3');
  if (assert(remaining === 'value3', 'Does not delete unspecified keys')) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 10: Flush all
  log('\n━━━ Test 10: Flush All Cache ━━━', 'blue');
  cacheService.set('flush-test-1', 'value1');
  cacheService.set('flush-test-2', 'value2');
  
  cacheService.flush();
  
  const flushed1 = cacheService.get('flush-test-1');
  const flushed2 = cacheService.get('flush-test-2');
  
  if (assert(flushed1 === undefined && flushed2 === undefined, 'Flushes all cache entries')) {
    passed++;
  } else {
    failed++;
  }
  
  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Test Summary                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const total = passed + failed;
  log(`\n  Total tests: ${total}`);
  log(`  Passed: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`  Failed: ${failed}`, failed === 0 ? 'green' : 'red');
  log(`  Success rate: ${((passed / total) * 100).toFixed(1)}%`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✓ All tests passed! Cache service is working correctly.', 'green');
  } else {
    log('\n✗ Some tests failed. Please review the cache service implementation.', 'red');
  }
  
  log('\n' + '═'.repeat(60), 'cyan');
  
  return failed === 0;
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log('\n✗ Test suite crashed:', 'red');
    log(`  ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
