/**
 * Integration Tests for Satellite Imagery Explorer
 *
 * Tests:
 * - API endpoints (public, user, admin)
 * - Database operations (CRUD for models)
 * - Email notifications (mocked)
 * - File upload/parsing (KML and GeoJSON)
 */

const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ─── Mock email services before requiring app ────────────────────────────────
jest.mock('../services/emailHelper', () => ({
  sendImageryRequestConfirmation: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendImageryRequestNotification: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendImageryRequestStatusUpdate: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendEmailVerification: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  USE_QUEUE: false,
}));

jest.mock('../services/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendImageryRequestConfirmation: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendImageryRequestNotification: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
  sendImageryRequestStatusUpdate: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
}));

// ─── Models ──────────────────────────────────────────────────────────────────
const SatelliteProduct = require('../models/SatelliteProduct');
const ImageryRequest = require('../models/ImageryRequest');
const SavedAOI = require('../models/SavedAOI');
const UserProfile = require('../models/UserProfile');

// ─── Test data helpers ────────────────────────────────────────────────────────
const TEST_JWT_SECRET = 'test-secret-key-for-integration-tests';


function makeProductData(overrides = {}) {
  return {
    name: 'Test Satellite Product',
    provider: 'Test Provider',
    sensor_type: 'optical',
    resolution: 0.5,
    resolution_category: 'vhr',
    bands: ['RGB', 'NIR'],
    coverage: 'Global',
    availability: 'both',
    description: 'A test satellite product for integration testing',
    status: 'active',
    ...overrides,
  };
}

function makeAOIData(overrides = {}) {
  return {
    aoi_type: 'polygon',
    aoi_coordinates: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    },
    aoi_area_km2: 100,
    aoi_center: { lat: 0.5, lng: 0.5 },
    ...overrides,
  };
}

function makeImageryRequestData(overrides = {}) {
  return {
    full_name: 'Integration Test User',
    email: 'integration@test.com',
    company: 'Test Corp',
    ...makeAOIData(),
    date_range: {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-31'),
    },
    filters: { resolution_category: ['vhr'], max_cloud_coverage: 20 },
    urgency: 'standard',
    ...overrides,
  };
}

function makeSavedAOIData(userId, overrides = {}) {
  return {
    user_id: userId,
    name: 'My Test AOI',
    description: 'A test area of interest',
    ...makeAOIData(),
    ...overrides,
  };
}

function generateToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
}


// ─── Global setup ─────────────────────────────────────────────────────────────
let mongoServer;
let app;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Disconnect any existing connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);

  // Override JWT_SECRET for tests
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  process.env.NODE_ENV = 'test';

  // Load app after env is set
  app = require('../server');
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 30000);

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  // Clear the in-memory cache so tests don't get stale cached responses
  try {
    const cacheService = require('../services/cacheService');
    cacheService.flush();
  } catch (e) {
    // ignore if cache service not available
  }
});

// ─── Helper: create users ─────────────────────────────────────────────────────
async function createUser(overrides = {}) {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await UserProfile.create({
    email: 'user@test.com',
    password_hash: passwordHash,
    full_name: 'Test User',
    role: 'user',
    ...overrides,
  });
  return user;
}

async function createAdmin(overrides = {}) {
  return createUser({ email: 'admin@test.com', full_name: 'Admin User', role: 'admin', ...overrides });
}


// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Public API: GET /api/public/satellite-products', () => {
  it('returns empty list when no products exist', async () => {
    const res = await request(app).get('/api/public/satellite-products');
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('returns only active products', async () => {
    await SatelliteProduct.create(makeProductData({ name: 'Active Product', status: 'active' }));
    await SatelliteProduct.create(makeProductData({ name: 'Inactive Product', status: 'inactive' }));

    const res = await request(app).get('/api/public/satellite-products');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Active Product');
  });

  it('supports pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await SatelliteProduct.create(makeProductData({ name: `Product ${i}` }));
    }

    const res = await request(app).get('/api/public/satellite-products?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.pagination.total).toBe(5);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('filters by resolution_category', async () => {
    await SatelliteProduct.create(makeProductData({ name: 'VHR Product', resolution_category: 'vhr' }));
    await SatelliteProduct.create(makeProductData({ name: 'High Product', resolution_category: 'high', resolution: 2 }));

    const res = await request(app).get('/api/public/satellite-products?resolution_category=vhr');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('VHR Product');
  });

  it('filters by sensor_type', async () => {
    await SatelliteProduct.create(makeProductData({ name: 'Optical', sensor_type: 'optical' }));
    await SatelliteProduct.create(makeProductData({ name: 'Radar', sensor_type: 'radar' }));

    const res = await request(app).get('/api/public/satellite-products?sensor_type=radar');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Radar');
  });
});

describe('Public API: GET /api/public/satellite-products/:id', () => {
  it('returns a product by ID', async () => {
    const product = await SatelliteProduct.create(makeProductData());

    const res = await request(app).get(`/api/public/satellite-products/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(product.name);
  });

  it('returns 404 for non-existent product', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/public/satellite-products/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for inactive product', async () => {
    const product = await SatelliteProduct.create(makeProductData({ status: 'inactive' }));
    const res = await request(app).get(`/api/public/satellite-products/${product._id}`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid ObjectId', async () => {
    const res = await request(app).get('/api/public/satellite-products/not-a-valid-id');
    expect(res.status).toBe(400);
  });
});


describe('Public API: POST /api/public/imagery-requests', () => {
  const emailHelper = require('../services/emailHelper');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an imagery request and returns 201', async () => {
    const res = await request(app)
      .post('/api/public/imagery-requests')
      .send(makeImageryRequestData());

    expect(res.status).toBe(201);
    expect(res.body.request_id).toBeDefined();
    expect(res.body.message).toMatch(/submitted/i);
  });

  it('saves the request to the database', async () => {
    await request(app)
      .post('/api/public/imagery-requests')
      .send(makeImageryRequestData());

    const count = await ImageryRequest.countDocuments();
    expect(count).toBe(1);
  });

  it('sends confirmation and notification emails', async () => {
    await request(app)
      .post('/api/public/imagery-requests')
      .send(makeImageryRequestData());

    expect(emailHelper.sendImageryRequestConfirmation).toHaveBeenCalledTimes(1);
    expect(emailHelper.sendImageryRequestNotification).toHaveBeenCalledTimes(1);
  });

  it('sets status to pending by default', async () => {
    const res = await request(app)
      .post('/api/public/imagery-requests')
      .send(makeImageryRequestData());

    const saved = await ImageryRequest.findById(res.body.request_id);
    expect(saved.status).toBe('pending');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/public/imagery-requests')
      .send({ email: 'test@test.com' }); // missing many required fields

    expect(res.status).toBe(400);
  });

  it('associates request with authenticated user', async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request(app)
      .post('/api/public/imagery-requests')
      .set('Authorization', `Bearer ${token}`)
      .send(makeImageryRequestData());

    expect(res.status).toBe(201);
    const saved = await ImageryRequest.findById(res.body.request_id);
    expect(saved.user_id.toString()).toBe(user._id.toString());
  });

  it('allows guest submission without auth token', async () => {
    const res = await request(app)
      .post('/api/public/imagery-requests')
      .send(makeImageryRequestData());

    expect(res.status).toBe(201);
    const saved = await ImageryRequest.findById(res.body.request_id);
    expect(saved.user_id).toBeNull();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATED USER ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('User API: GET /api/user/saved-aois', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/user/saved-aois');
    expect(res.status).toBe(401);
  });

  it('returns empty list for new user', async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request(app)
      .get('/api/user/saved-aois')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.aois).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('returns only the authenticated user\'s AOIs', async () => {
    const user1 = await createUser({ email: 'user1@test.com' });
    const user2 = await createUser({ email: 'user2@test.com' });

    await SavedAOI.create(makeSavedAOIData(user1._id, { name: 'User1 AOI' }));
    await SavedAOI.create(makeSavedAOIData(user2._id, { name: 'User2 AOI' }));

    const token = generateToken(user1);
    const res = await request(app)
      .get('/api/user/saved-aois')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.aois).toHaveLength(1);
    expect(res.body.aois[0].name).toBe('User1 AOI');
  });
});

describe('User API: POST /api/user/saved-aois', () => {
  it('creates a saved AOI for authenticated user', async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request(app)
      .post('/api/user/saved-aois')
      .set('Authorization', `Bearer ${token}`)
      .send(makeAOIData({ name: 'My New AOI' }));

    expect(res.status).toBe(201);
    expect(res.body.aoi.name).toBe('My New AOI');
    expect(res.body.aoi.user_id.toString()).toBe(user._id.toString());
  });

  it('returns 400 for duplicate AOI name', async () => {
    const user = await createUser();
    const token = generateToken(user);

    await SavedAOI.create(makeSavedAOIData(user._id, { name: 'Duplicate Name' }));

    const res = await request(app)
      .post('/api/user/saved-aois')
      .set('Authorization', `Bearer ${token}`)
      .send(makeAOIData({ name: 'Duplicate Name' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/duplicate/i);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/user/saved-aois')
      .send(makeAOIData({ name: 'Test AOI' }));

    expect(res.status).toBe(401);
  });
});

describe('User API: DELETE /api/user/saved-aois/:id', () => {
  it('deletes a saved AOI belonging to the user', async () => {
    const user = await createUser();
    const token = generateToken(user);
    const aoi = await SavedAOI.create(makeSavedAOIData(user._id));

    const res = await request(app)
      .delete(`/api/user/saved-aois/${aoi._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    const deleted = await SavedAOI.findById(aoi._id);
    expect(deleted).toBeNull();
  });

  it('returns 404 when trying to delete another user\'s AOI', async () => {
    const user1 = await createUser({ email: 'user1@test.com' });
    const user2 = await createUser({ email: 'user2@test.com' });
    const aoi = await SavedAOI.create(makeSavedAOIData(user2._id));

    const token = generateToken(user1);
    const res = await request(app)
      .delete(`/api/user/saved-aois/${aoi._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});


describe('User API: GET /api/user/imagery-requests', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/user/imagery-requests');
    expect(res.status).toBe(401);
  });

  it('returns only the user\'s own requests', async () => {
    const user1 = await createUser({ email: 'user1@test.com' });
    const user2 = await createUser({ email: 'user2@test.com' });

    await ImageryRequest.create(makeImageryRequestData({ user_id: user1._id, email: 'user1@test.com' }));
    await ImageryRequest.create(makeImageryRequestData({ user_id: user2._id, email: 'user2@test.com' }));

    const token = generateToken(user1);
    const res = await request(app)
      .get('/api/user/imagery-requests')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.requests).toHaveLength(1);
    expect(res.body.requests[0].email).toBe('user1@test.com');
  });

  it('filters by status', async () => {
    const user = await createUser();
    await ImageryRequest.create(makeImageryRequestData({ user_id: user._id, status: 'pending' }));
    await ImageryRequest.create(makeImageryRequestData({ user_id: user._id, status: 'completed' }));

    const token = generateToken(user);
    const res = await request(app)
      .get('/api/user/imagery-requests?status=pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.requests).toHaveLength(1);
    expect(res.body.requests[0].status).toBe('pending');
  });
});

describe('User API: GET /api/user/imagery-requests/:id', () => {
  it('returns a specific request for the authenticated user', async () => {
    const user = await createUser();
    const req = await ImageryRequest.create(makeImageryRequestData({ user_id: user._id }));

    const token = generateToken(user);
    const res = await request(app)
      .get(`/api/user/imagery-requests/${req._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.request._id.toString()).toBe(req._id.toString());
  });

  it('returns 404 for another user\'s request', async () => {
    const user1 = await createUser({ email: 'user1@test.com' });
    const user2 = await createUser({ email: 'user2@test.com' });
    const req = await ImageryRequest.create(makeImageryRequestData({ user_id: user2._id }));

    const token = generateToken(user1);
    const res = await request(app)
      .get(`/api/user/imagery-requests/${req._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Admin API: GET /api/admin/satellite-products', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/admin/satellite-products');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request(app)
      .get('/api/admin/satellite-products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('returns all products including inactive for admin', async () => {
    await SatelliteProduct.create(makeProductData({ name: 'Active', status: 'active' }));
    await SatelliteProduct.create(makeProductData({ name: 'Inactive', status: 'inactive' }));

    const admin = await createAdmin();
    const token = generateToken(admin);

    const res = await request(app)
      .get('/api/admin/satellite-products')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
  });
});

describe('Admin API: POST /api/admin/satellite-products', () => {
  it('creates a new satellite product', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);

    const res = await request(app)
      .post('/api/admin/satellite-products')
      .set('Authorization', `Bearer ${token}`)
      .send(makeProductData({ name: 'New Admin Product' }));

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Admin Product');

    const count = await SatelliteProduct.countDocuments();
    expect(count).toBe(1);
  });

  it('returns 400 for missing required fields', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);

    const res = await request(app)
      .post('/api/admin/satellite-products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Incomplete Product' });

    expect(res.status).toBe(400);
  });

  it('returns 403 for non-admin user', async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request(app)
      .post('/api/admin/satellite-products')
      .set('Authorization', `Bearer ${token}`)
      .send(makeProductData());

    expect(res.status).toBe(403);
  });
});

describe('Admin API: PUT /api/admin/satellite-products/:id', () => {
  it('updates a satellite product', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);
    const product = await SatelliteProduct.create(makeProductData());

    const res = await request(app)
      .put(`/api/admin/satellite-products/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Product Name', status: 'inactive' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Product Name');
    expect(res.body.status).toBe('inactive');
  });

  it('returns 404 for non-existent product', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/admin/satellite-products/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('Admin API: DELETE /api/admin/satellite-products/:id', () => {
  it('deletes a satellite product', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);
    const product = await SatelliteProduct.create(makeProductData());

    const res = await request(app)
      .delete(`/api/admin/satellite-products/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    const deleted = await SatelliteProduct.findById(product._id);
    expect(deleted).toBeNull();
  });
});


describe('Admin API: GET /api/admin/imagery-requests', () => {
  it('returns all imagery requests for admin', async () => {
    await ImageryRequest.create(makeImageryRequestData({ email: 'a@test.com' }));
    await ImageryRequest.create(makeImageryRequestData({ email: 'b@test.com' }));

    const admin = await createAdmin();
    const token = generateToken(admin);

    const res = await request(app)
      .get('/api/admin/imagery-requests')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.requests).toHaveLength(2);
  });

  it('filters by status', async () => {
    await ImageryRequest.create(makeImageryRequestData({ status: 'pending' }));
    await ImageryRequest.create(makeImageryRequestData({ status: 'completed' }));

    const admin = await createAdmin();
    const token = generateToken(admin);

    const res = await request(app)
      .get('/api/admin/imagery-requests?status=pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.requests).toHaveLength(1);
    expect(res.body.requests[0].status).toBe('pending');
  });

  it('returns 403 for non-admin user', async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request(app)
      .get('/api/admin/imagery-requests')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe('Admin API: PUT /api/admin/imagery-requests/:id', () => {
  const emailHelper = require('../services/emailHelper');

  beforeEach(() => jest.clearAllMocks());

  it('updates request status and sends email notification', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);
    const req = await ImageryRequest.create(makeImageryRequestData({ status: 'pending' }));

    const res = await request(app)
      .put(`/api/admin/imagery-requests/${req._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'reviewing', admin_notes: 'Under review' });

    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('reviewing');
    expect(emailHelper.sendImageryRequestStatusUpdate).toHaveBeenCalledTimes(1);
  });

  it('updates quote amount and currency', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);
    const req = await ImageryRequest.create(makeImageryRequestData());

    const res = await request(app)
      .put(`/api/admin/imagery-requests/${req._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'quoted', quote_amount: 5000, quote_currency: 'USD' });

    expect(res.status).toBe(200);
    expect(res.body.request.quote_amount).toBe(5000);
    expect(res.body.request.quote_currency).toBe('USD');
  });

  it('returns 400 for invalid status', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);
    const req = await ImageryRequest.create(makeImageryRequestData());

    const res = await request(app)
      .put(`/api/admin/imagery-requests/${req._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid-status' });

    expect(res.status).toBe(400);
  });

  it('does not send email when status is unchanged', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);
    const req = await ImageryRequest.create(makeImageryRequestData({ status: 'pending' }));

    await request(app)
      .put(`/api/admin/imagery-requests/${req._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ admin_notes: 'Just adding notes, no status change' });

    expect(emailHelper.sendImageryRequestStatusUpdate).not.toHaveBeenCalled();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE OPERATIONS (CRUD)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Database: SatelliteProduct CRUD', () => {
  it('creates a product with all required fields', async () => {
    const data = makeProductData();
    const product = await SatelliteProduct.create(data);

    expect(product._id).toBeDefined();
    expect(product.name).toBe(data.name);
    expect(product.provider).toBe(data.provider);
    expect(product.status).toBe('active');
    expect(product.created_at).toBeDefined();
  });

  it('fails validation when required fields are missing', async () => {
    await expect(SatelliteProduct.create({ name: 'Incomplete' })).rejects.toThrow();
  });

  it('rejects invalid sensor_type', async () => {
    await expect(
      SatelliteProduct.create(makeProductData({ sensor_type: 'invalid' }))
    ).rejects.toThrow();
  });

  it('reads and updates a product', async () => {
    const product = await SatelliteProduct.create(makeProductData());
    const updated = await SatelliteProduct.findByIdAndUpdate(
      product._id,
      { name: 'Updated Name' },
      { new: true }
    );
    expect(updated.name).toBe('Updated Name');
  });

  it('deletes a product', async () => {
    const product = await SatelliteProduct.create(makeProductData());
    await SatelliteProduct.findByIdAndDelete(product._id);
    const found = await SatelliteProduct.findById(product._id);
    expect(found).toBeNull();
  });
});

describe('Database: ImageryRequest CRUD', () => {
  it('creates an imagery request with all required fields', async () => {
    const data = makeImageryRequestData();
    const req = await ImageryRequest.create(data);

    expect(req._id).toBeDefined();
    expect(req.status).toBe('pending');
    expect(req.full_name).toBe(data.full_name);
    expect(req.email).toBe(data.email);
  });

  it('tracks status changes in status_history', async () => {
    const req = await ImageryRequest.create(makeImageryRequestData());
    req.status = 'reviewing';
    await req.save();

    const updated = await ImageryRequest.findById(req._id);
    expect(updated.status_history.length).toBeGreaterThan(0);
    const lastEntry = updated.status_history[updated.status_history.length - 1];
    expect(lastEntry.status).toBe('reviewing');
  });

  it('rejects invalid urgency value', async () => {
    await expect(
      ImageryRequest.create(makeImageryRequestData({ urgency: 'super-urgent' }))
    ).rejects.toThrow();
  });

  it('rejects invalid status value', async () => {
    await expect(
      ImageryRequest.create(makeImageryRequestData({ status: 'unknown' }))
    ).rejects.toThrow();
  });
});

describe('Database: SavedAOI CRUD', () => {
  it('creates a saved AOI for a user', async () => {
    const user = await createUser();
    const data = makeSavedAOIData(user._id);
    const aoi = await SavedAOI.create(data);

    expect(aoi._id).toBeDefined();
    expect(aoi.user_id.toString()).toBe(user._id.toString());
    expect(aoi.name).toBe(data.name);
  });

  it('enforces unique name per user via route handler', async () => {
    const user = await createUser();
    await SavedAOI.create(makeSavedAOIData(user._id, { name: 'Unique Name' }));

    // The route handler checks for duplicate names before creating
    const token = generateToken(user);
    const res = await request(app)
      .post('/api/user/saved-aois')
      .set('Authorization', `Bearer ${token}`)
      .send(makeAOIData({ name: 'Unique Name' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/duplicate/i);
  });

  it('allows same name for different users', async () => {
    const user1 = await createUser({ email: 'u1@test.com' });
    const user2 = await createUser({ email: 'u2@test.com' });

    await SavedAOI.create(makeSavedAOIData(user1._id, { name: 'Shared Name' }));
    const aoi2 = await SavedAOI.create(makeSavedAOIData(user2._id, { name: 'Shared Name' }));

    expect(aoi2._id).toBeDefined();
  });

  it('deletes a saved AOI', async () => {
    const user = await createUser();
    const aoi = await SavedAOI.create(makeSavedAOIData(user._id));
    await SavedAOI.findByIdAndDelete(aoi._id);
    const found = await SavedAOI.findById(aoi._id);
    expect(found).toBeNull();
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL NOTIFICATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Email Notifications', () => {
  const emailHelper = require('../services/emailHelper');

  beforeEach(() => jest.clearAllMocks());

  it('sends confirmation email when imagery request is submitted', async () => {
    const res = await request(app)
      .post('/api/public/imagery-requests')
      .send(makeImageryRequestData({ email: 'notify@test.com', full_name: 'Notify User' }));

    expect(res.status).toBe(201);
    expect(emailHelper.sendImageryRequestConfirmation).toHaveBeenCalledWith(
      'notify@test.com',
      'Notify User',
      expect.objectContaining({ status: 'pending' })
    );
  });

  it('sends admin notification email when imagery request is submitted', async () => {
    await request(app)
      .post('/api/public/imagery-requests')
      .send(makeImageryRequestData());

    expect(emailHelper.sendImageryRequestNotification).toHaveBeenCalledTimes(1);
    expect(emailHelper.sendImageryRequestNotification).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending' })
    );
  });

  it('sends status update email when admin changes request status', async () => {
    const admin = await createAdmin();
    const token = generateToken(admin);
    const req = await ImageryRequest.create(makeImageryRequestData({ status: 'pending' }));

    await request(app)
      .put(`/api/admin/imagery-requests/${req._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });

    expect(emailHelper.sendImageryRequestStatusUpdate).toHaveBeenCalledWith(
      req.email,
      req.full_name,
      expect.objectContaining({ status: 'approved' }),
      'pending',
      'approved'
    );
  });

  it('does not fail request submission if email sending throws', async () => {
    emailHelper.sendImageryRequestConfirmation.mockRejectedValueOnce(new Error('SMTP error'));

    const res = await request(app)
      .post('/api/public/imagery-requests')
      .send(makeImageryRequestData());

    // Request should still succeed even if email fails
    expect(res.status).toBe(201);
  });
});


// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD / PARSING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('File Upload: POST /api/public/upload-aoi', () => {
  const GEOJSON_POLYGON = JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
        properties: { name: 'Test Area' },
      },
    ],
  });

  const GEOJSON_DIRECT = JSON.stringify({
    type: 'Polygon',
    coordinates: [[[10, 20], [11, 20], [11, 21], [10, 21], [10, 20]]],
  });

  const KML_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Test KML Area</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>0,0,0 1,0,0 1,1,0 0,1,0 0,0,0</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;

  it('parses a valid GeoJSON FeatureCollection', async () => {
    const res = await request(app)
      .post('/api/public/upload-aoi')
      .attach('file', Buffer.from(GEOJSON_POLYGON), {
        filename: 'test.geojson',
        contentType: 'application/geo+json',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.geometries).toHaveLength(1);
    expect(res.body.data.geometries[0].type).toBe('Polygon');
  });

  it('parses a direct GeoJSON geometry object', async () => {
    const res = await request(app)
      .post('/api/public/upload-aoi')
      .attach('file', Buffer.from(GEOJSON_DIRECT), {
        filename: 'area.geojson',
        contentType: 'application/geo+json',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.geometries).toHaveLength(1);
    expect(res.body.data.geometries[0].type).toBe('Polygon');
  });

  it('parses a valid KML file', async () => {
    const res = await request(app)
      .post('/api/public/upload-aoi')
      .attach('file', Buffer.from(KML_CONTENT), {
        filename: 'test.kml',
        contentType: 'application/vnd.google-earth.kml+xml',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.geometries.length).toBeGreaterThan(0);
  });

  it('strips altitude (z-coordinate) from KML coordinates', async () => {
    const res = await request(app)
      .post('/api/public/upload-aoi')
      .attach('file', Buffer.from(KML_CONTENT), {
        filename: 'test.kml',
        contentType: 'application/vnd.google-earth.kml+xml',
      });

    expect(res.status).toBe(200);
    const coords = res.body.data.geometries[0].coordinates[0];
    // Each coordinate should be [lng, lat] (2D only)
    coords.forEach(coord => {
      expect(coord).toHaveLength(2);
    });
  });

  it('returns 400 for invalid file type', async () => {
    const res = await request(app)
      .post('/api/public/upload-aoi')
      .attach('file', Buffer.from('not a geo file'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
  });

  it('returns 400 when no file is provided', async () => {
    const res = await request(app)
      .post('/api/public/upload-aoi');

    expect(res.status).toBe(400);
  });

  it('returns 400 for malformed GeoJSON', async () => {
    const res = await request(app)
      .post('/api/public/upload-aoi')
      .attach('file', Buffer.from('{ invalid json }'), {
        filename: 'bad.geojson',
        contentType: 'application/geo+json',
      });

    expect(res.status).toBe(400);
  });

  it('returns 400 for GeoJSON with no geometries', async () => {
    const emptyCollection = JSON.stringify({ type: 'FeatureCollection', features: [] });

    const res = await request(app)
      .post('/api/public/upload-aoi')
      .attach('file', Buffer.from(emptyCollection), {
        filename: 'empty.geojson',
        contentType: 'application/geo+json',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no valid geometries/i);
  });

  it('returns file metadata in response', async () => {
    const res = await request(app)
      .post('/api/public/upload-aoi')
      .attach('file', Buffer.from(GEOJSON_POLYGON), {
        filename: 'myarea.geojson',
        contentType: 'application/geo+json',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.originalFilename).toBe('myarea.geojson');
    expect(res.body.data.fileSize).toBeGreaterThan(0);
    expect(res.body.data.count).toBe(1);
  });
});

