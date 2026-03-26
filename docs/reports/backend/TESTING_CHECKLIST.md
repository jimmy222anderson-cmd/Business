# API Performance Optimization - Testing Checklist

## Prerequisites

Before testing, ensure:
1. ✅ Dependencies are installed: `npm install` (in backend directory)
2. ✅ MongoDB is running and connected
3. ✅ Backend server is running: `npm start`
4. ✅ Sample satellite products are seeded in database

## Test 1: Cache Service Unit Tests

Run the cache service unit tests to verify caching functionality:

```bash
cd backend
node scripts/test-cache-service.js
```

**Expected Results:**
- ✅ All 17 tests should pass
- ✅ Cache set/get operations work correctly
- ✅ TTL expiration works
- ✅ Cache key generation works
- ✅ Cache invalidation works
- ✅ Statistics tracking works

## Test 2: API Performance Tests

Run the API performance tests to verify caching, compression, and query optimization:

```bash
cd backend
node scripts/test-api-performance.js
```

**Expected Results:**
- ✅ First request (uncached): 150-500ms
- ✅ Second request (cached): 5-50ms
- ✅ Compression enabled: `Content-Encoding: gzip` header present
- ✅ NFR-5 requirement met: Product catalog loads < 1 second
- ✅ Cache hit rate improvement: >80%

## Test 3: Manual API Testing with curl

### Test 3.1: Check Compression

```bash
# Request with compression support
curl -H "Accept-Encoding: gzip, deflate" -I http://localhost:3000/api/public/satellite-products
```

**Expected Headers:**
```
Content-Encoding: gzip
Content-Type: application/json; charset=utf-8
```

### Test 3.2: Measure Response Time (First Request - Cache Miss)

```bash
# First request (should be slower - cache miss)
curl -w "\nTime: %{time_total}s\n" http://localhost:3000/api/public/satellite-products
```

**Expected:**
- Response time: 0.15-0.5 seconds (150-500ms)
- Full product list returned

### Test 3.3: Measure Response Time (Second Request - Cache Hit)

```bash
# Second request (should be faster - cache hit)
curl -w "\nTime: %{time_total}s\n" http://localhost:3000/api/public/satellite-products
```

**Expected:**
- Response time: 0.005-0.05 seconds (5-50ms)
- Same product list returned
- **Significant improvement** from first request

### Test 3.4: Test Different Query Parameters

```bash
# Request with filters (new cache entry)
curl -w "\nTime: %{time_total}s\n" "http://localhost:3000/api/public/satellite-products?resolution_category=vhr"

# Repeat same filtered request (should be cached)
curl -w "\nTime: %{time_total}s\n" "http://localhost:3000/api/public/satellite-products?resolution_category=vhr"
```

**Expected:**
- First filtered request: 150-500ms (cache miss)
- Second filtered request: 5-50ms (cache hit)

### Test 3.5: Test Single Product Endpoint

```bash
# Get a product ID from the list first, then:
curl -w "\nTime: %{time_total}s\n" http://localhost:3000/api/public/satellite-products/[PRODUCT_ID]

# Repeat same request
curl -w "\nTime: %{time_total}s\n" http://localhost:3000/api/public/satellite-products/[PRODUCT_ID]
```

**Expected:**
- First request: 50-150ms (cache miss)
- Second request: 3-10ms (cache hit)

## Test 4: Database Index Verification

Connect to MongoDB and verify indexes are created:

```javascript
// In MongoDB shell or Compass
use your_database_name

// Check SatelliteProduct indexes
db.satelliteproducts.getIndexes()

// Check ImageryRequest indexes
db.imageryrequests.getIndexes()
```

**Expected SatelliteProduct Indexes:**
- `{ status: 1, resolution_category: 1, order: 1 }`
- `{ status: 1, sensor_type: 1, order: 1 }`
- `{ status: 1, availability: 1, order: 1 }`
- `{ resolution_category: 1 }`
- `{ sensor_type: 1 }`
- `{ provider: 1 }`
- `{ availability: 1 }`
- `{ status: 1, resolution: 1 }`
- `{ created_at: -1 }`
- `{ updated_at: -1 }`

**Expected ImageryRequest Indexes:**
- `{ user_id: 1, created_at: -1 }`
- `{ status: 1, created_at: -1 }`
- `{ created_at: -1 }`
- `{ email: 1 }`
- `{ status: 1, urgency: 1, created_at: -1 }`
- `{ user_id: 1, status: 1, created_at: -1 }`
- `{ aoi_coordinates: '2dsphere' }`

## Test 5: Cache Invalidation Testing

### Test 5.1: Verify Cache Invalidation on Product Update

1. Get product list (should be cached):
```bash
curl http://localhost:3000/api/public/satellite-products
```

2. Update a product via admin API (requires authentication):
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Product Name"}' \
  http://localhost:3000/api/admin/satellite-products/[PRODUCT_ID]
```

3. Get product list again (should fetch fresh data):
```bash
curl http://localhost:3000/api/public/satellite-products
```

**Expected:**
- Updated product should appear in the list
- Cache was invalidated and refreshed

### Test 5.2: Verify Cache Invalidation on Product Creation

1. Create a new product via admin API
2. Get product list
3. New product should appear immediately (cache was invalidated)

### Test 5.3: Verify Cache Invalidation on Product Deletion

1. Delete a product via admin API
2. Get product list
3. Deleted product should not appear (cache was invalidated)

## Test 6: Query Performance Testing

Use MongoDB's explain() to verify indexes are being used:

```javascript
// In MongoDB shell
db.satelliteproducts.find({ 
  status: 'active', 
  resolution_category: 'vhr' 
}).sort({ order: 1 }).explain('executionStats')
```

**Expected:**
- `executionStats.executionSuccess: true`
- `winningPlan.inputStage.stage: "IXSCAN"` (index scan, not collection scan)
- `executionStats.totalDocsExamined` should be close to `executionStats.nReturned`
- `executionStats.executionTimeMillis` should be < 50ms

## Test 7: Compression Ratio Testing

Compare response sizes with and without compression:

```bash
# Without compression
curl -H "Accept-Encoding: identity" http://localhost:3000/api/public/satellite-products > uncompressed.json
ls -lh uncompressed.json

# With compression (save compressed response)
curl -H "Accept-Encoding: gzip" http://localhost:3000/api/public/satellite-products --compressed > compressed.json
ls -lh compressed.json
```

**Expected:**
- Uncompressed: ~50-100 KB (for 20 products)
- Compressed: ~8-15 KB (for 20 products)
- Compression ratio: 70-90% reduction

## Test 8: Load Testing (Optional)

Use Apache Bench or similar tool to test under load:

```bash
# Install Apache Bench (ab) if not already installed
# Then run:
ab -n 1000 -c 10 http://localhost:3000/api/public/satellite-products
```

**Expected:**
- Requests per second: >100 (with caching)
- Mean response time: <100ms (with caching)
- No failed requests

## Success Criteria

✅ **All tests pass** with the following metrics:

1. **Caching:**
   - Cache hit rate: >80% after warm-up
   - Cached response time: <50ms
   - Uncached response time: <500ms

2. **Compression:**
   - All JSON responses are gzip compressed
   - Compression ratio: 70-90%

3. **Database Indexes:**
   - All indexes are created correctly
   - Queries use indexes (IXSCAN, not COLLSCAN)
   - Query execution time: <50ms

4. **Performance Requirements:**
   - NFR-5 met: Product catalog loads in <1 second ✅
   - Average response time: <250ms
   - 95th percentile: <500ms

5. **Cache Invalidation:**
   - Cache is invalidated on product create/update/delete
   - Fresh data is returned after invalidation

## Troubleshooting

### Issue: Tests fail with "ECONNREFUSED"
**Solution:** Ensure backend server is running on port 3000

### Issue: Cache tests fail
**Solution:** Ensure node-cache is installed: `npm install`

### Issue: Indexes not created
**Solution:** Restart MongoDB connection or manually create indexes

### Issue: Compression not working
**Solution:** Check that compression middleware is loaded before routes in server.js

### Issue: Slow query performance
**Solution:** 
1. Verify indexes are created: `db.collection.getIndexes()`
2. Check query is using indexes: `.explain('executionStats')`
3. Ensure `.lean()` is used in queries

## Next Steps After Testing

If all tests pass:
1. ✅ Mark task 24.2 as complete
2. ✅ Deploy to staging environment
3. ✅ Monitor cache hit rates in production
4. ✅ Set up performance monitoring alerts
5. ✅ Consider Redis for distributed caching (future improvement)

## Documentation

For detailed implementation information, see:
- `backend/docs/API_PERFORMANCE_OPTIMIZATIONS.md` - Complete documentation
- `TASK_24.2_API_PERFORMANCE_SUMMARY.md` - Implementation summary
- `backend/services/cacheService.js` - Cache service code
