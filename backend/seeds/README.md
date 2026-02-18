# Database Seed Scripts

This directory contains seed scripts for populating the database with initial data.

## Available Seeds

### 1. Satellite Products (`satelliteProducts.js`)

Seeds the database with 15 popular satellite products from major providers.

**Providers included:**
- Maxar Technologies (WorldView-3, WorldView-4)
- Planet Labs (SkySat, PlanetScope)
- ICEYE (ICEYE SAR)
- European Space Agency (Sentinel-1, Sentinel-2)
- NASA/USGS (Landsat 8, Landsat 9)
- Airbus Defence and Space (SPOT 6/7, Pléiades Neo, TerraSAR-X)
- SI Imaging Services (KOMPSAT-3A)
- China Siwei (SuperView-1)
- MDA (RADARSAT-2)

**Coverage:**
- 11 optical sensors
- 4 radar sensors
- Resolution range: 0.3m to 30m
- Mix of commercial and free/open-access data

**Usage:**
```bash
npm run seed:satellites
```

**Features:**
- Checks if products already exist before seeding
- Provides detailed statistics after seeding
- Can be run standalone or imported as a module

### 2. Admin Users (`adminUsers.js`)

Seeds admin user accounts.

**Usage:**
```bash
npm run seed:admins
```

### 3. Content (`content.js`)

Seeds privacy policy and terms of service content.

**Usage:**
```bash
npm run seed:content
```

## Validation

Before seeding, you can validate the satellite product data structure:

```bash
node scripts/validate-satellite-seeds.js
```

This will:
- Verify all required fields are present
- Check enum values are valid
- Validate data types
- Check resolution categories match resolution values
- Display statistics about the seed data

## Re-seeding

The satellite products seed script will skip seeding if products already exist. To re-seed:

1. Delete existing products from the database
2. Run the seed script again

Or use MongoDB shell:
```javascript
db.satelliteproducts.deleteMany({})
```

## Adding New Products

To add new satellite products:

1. Edit `backend/seeds/satelliteProducts.js`
2. Add new product object to the `satelliteProducts` array
3. Follow the existing structure and validation rules
4. Run validation script to verify: `node scripts/validate-satellite-seeds.js`
5. Run seed script: `npm run seed:satellites`

### Product Schema

```javascript
{
  name: String,                    // Required: "Maxar WorldView-3"
  provider: String,                // Required: "Maxar Technologies"
  sensor_type: String,             // Required: "optical", "radar", or "thermal"
  resolution: Number,              // Required: in meters, e.g., 0.31
  resolution_category: String,     // Required: "vhr", "high", "medium", or "low"
  bands: [String],                 // Required: ["RGB", "NIR", "Red-Edge"]
  coverage: String,                // Required: "Global", "Regional"
  availability: String,            // Required: "archive", "tasking", or "both"
  description: String,             // Required: detailed description
  sample_image_url: String,        // Optional: defaults to '/placeholder.svg'
  specifications: {
    swath_width: Number,           // Optional: in km
    revisit_time: Number,          // Optional: in days
    spectral_bands: Number,        // Optional: number of bands
    radiometric_resolution: Number // Optional: in bits
  },
  pricing_info: String,            // Optional: defaults to 'Contact for pricing'
  status: String,                  // Optional: "active" or "inactive", defaults to "active"
  order: Number                    // Optional: display order, defaults to 0
}
```

### Resolution Categories

- **VHR (Very High Resolution)**: < 1m
- **High Resolution**: 1-5m
- **Medium Resolution**: 5-30m
- **Low Resolution**: > 30m

## Environment Variables

Ensure your `.env` file contains:

```
MONGODB_URI=mongodb://localhost:27017/earth-intelligence
```

Or for MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```
