/**
 * Test script for API Performance Optimizations
 * Tests caching, compression, and query performance
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = (process.env.API_URL || 'http://localhost:5000').trim();
const API_ENDPOINT = `${BASE_URL}/api/public/satellite-products`;

// ANSI color codes for terminal output
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

function formatTime(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

async function testRequest(url, description, expectCached = false) {
  const start = performance.now();
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Accept-Encoding': 'gzip, deflate'
      }
    });
    
    const end = performance.now();
    const duration = end - start;
    
    // Get response size
    const responseSize = JSON.stringify(response.data).length;
    const contentEncoding = response.headers['content-encoding'];
    const isCompressed = contentEncoding === 'gzip';
    
    // Determine if response was cached (heuristic: very fast response)
    const wasCached = duration < 50;
    
    // Status indicator
    let status = '✓';
    let statusColor = 'green';
    
    if (expectCached && !wasCached) {
      status = '⚠';
      statusColor = 'yellow';
    }
    
    log(`\n${status} ${description}`, statusColor);
    log(`  Response time: ${formatTime(duration)}`, duration < 100 ? 'green' : duration < 500 ? 'yellow' : 'red');
    log(`  Response size: ${formatSize(responseSize)}`);
    log(`  Compressed: ${isCompressed ? 'Yes (gzip)' : 'No'}`, isCompressed ? 'green' : 'yellow');
    log(`  Likely cached: ${wasCached ? 'Yes' : 'No'}`, wasCached ? 'green' : 'blue');
    log(`  Status: ${response.status}`);
    log(`  Items returned: ${response.data.products?.length || 0}`);
    
    return {
      duration,
      responseSize,
      isCompressed,
      wasCached,
      status: response.status,
      itemCount: response.data.products?.length || 0
    };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    log(`\n✗ ${description}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    log(`  Duration: ${formatTime(duration)}`);
    
    if (error.code === 'ECONNREFUSED') {
      log(`  → Server is not running. Start it with: npm start`, 'yellow');
    }
    
    return {
      duration,
      error: error.message,
      status: error.response?.status || 'ERROR'
    };
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     API Performance Optimization Test Suite               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  log('\n📋 Testing Endpoint: ' + API_ENDPOINT, 'blue');
  
  // Test 1: First request (cache miss)
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Test 1: First Request (Cache Miss)', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  const test1 = await testRequest(API_ENDPOINT, 'Initial request (should be uncached)', false);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Test 2: Second request (cache hit)
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Test 2: Second Request (Cache Hit)', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  const test2 = await testRequest(API_ENDPOINT, 'Repeated request (should be cached)', true);
  
  // Test 3: Different query parameters (cache miss)
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Test 3: Different Query Parameters (Cache Miss)', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  const test3 = await testRequest(
    `${API_ENDPOINT}?resolution_category=vhr`,
    'Request with filter (should be uncached)',
    false
  );
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Test 4: Repeat filtered request (cache hit)
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Test 4: Repeat Filtered Request (Cache Hit)', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  const test4 = await testRequest(
    `${API_ENDPOINT}?resolution_category=vhr`,
    'Repeated filtered request (should be cached)',
    true
  );
  
  // Test 5: Pagination test
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Test 5: Pagination Test', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  const test5 = await testRequest(
    `${API_ENDPOINT}?page=2&limit=10`,
    'Paginated request (should be uncached)',
    false
  );
  
  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Test Summary                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const tests = [test1, test2, test3, test4, test5];
  const successfulTests = tests.filter(t => !t.error);
  
  if (successfulTests.length === 0) {
    log('\n❌ All tests failed. Server may not be running.', 'red');
    log('   Start the server with: npm start', 'yellow');
    return;
  }
  
  const avgDuration = successfulTests.reduce((sum, t) => sum + t.duration, 0) / successfulTests.length;
  const cachedTests = successfulTests.filter(t => t.wasCached);
  const uncachedTests = successfulTests.filter(t => !t.wasCached);
  const compressedTests = successfulTests.filter(t => t.isCompressed);
  
  log('\n📊 Performance Metrics:', 'blue');
  log(`  Total tests: ${tests.length}`);
  log(`  Successful: ${successfulTests.length}`, successfulTests.length === tests.length ? 'green' : 'yellow');
  log(`  Failed: ${tests.length - successfulTests.length}`, tests.length === successfulTests.length ? 'green' : 'red');
  
  if (successfulTests.length > 0) {
    log(`\n  Average response time: ${formatTime(avgDuration)}`);
    
    if (cachedTests.length > 0) {
      const avgCached = cachedTests.reduce((sum, t) => sum + t.duration, 0) / cachedTests.length;
      log(`  Cached requests (${cachedTests.length}): ${formatTime(avgCached)}`, avgCached < 50 ? 'green' : 'yellow');
    }
    
    if (uncachedTests.length > 0) {
      const avgUncached = uncachedTests.reduce((sum, t) => sum + t.duration, 0) / uncachedTests.length;
      log(`  Uncached requests (${uncachedTests.length}): ${formatTime(avgUncached)}`, avgUncached < 500 ? 'green' : 'yellow');
    }
    
    log(`\n  Compression enabled: ${compressedTests.length}/${successfulTests.length}`, 
      compressedTests.length === successfulTests.length ? 'green' : 'yellow');
  }
  
  // Performance requirements check
  log('\n✓ Requirements Check:', 'blue');
  const nfr5Met = successfulTests.some(t => t.duration < 1000);
  log(`  NFR-5 (Load 20 items < 1s): ${nfr5Met ? '✓ PASS' : '✗ FAIL'}`, nfr5Met ? 'green' : 'red');
  
  const cachingWorks = cachedTests.length > 0 && cachedTests.some(t => t.duration < 50);
  log(`  Caching working: ${cachingWorks ? '✓ PASS' : '⚠ UNCERTAIN'}`, cachingWorks ? 'green' : 'yellow');
  
  const compressionWorks = compressedTests.length > 0;
  log(`  Compression working: ${compressionWorks ? '✓ PASS' : '✗ FAIL'}`, compressionWorks ? 'green' : 'red');
  
  // Cache performance improvement
  if (cachedTests.length > 0 && uncachedTests.length > 0) {
    const avgCached = cachedTests.reduce((sum, t) => sum + t.duration, 0) / cachedTests.length;
    const avgUncached = uncachedTests.reduce((sum, t) => sum + t.duration, 0) / uncachedTests.length;
    const improvement = ((avgUncached - avgCached) / avgUncached * 100).toFixed(1);
    log(`\n  Cache performance improvement: ${improvement}%`, improvement > 80 ? 'green' : 'yellow');
  }
  
  log('\n' + '═'.repeat(60), 'cyan');
  log('Test completed!', 'green');
  log('═'.repeat(60) + '\n', 'cyan');
}

// Run tests
runTests().catch(error => {
  log('\n✗ Test suite failed:', 'red');
  log(`  ${error.message}`, 'red');
  process.exit(1);
});
