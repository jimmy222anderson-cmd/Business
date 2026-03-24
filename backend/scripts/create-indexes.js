require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const path = require('path');

const models = [
  '../models/ImageryRequest',
  '../models/SatelliteProduct',
  '../models/FavoriteLocation',
  '../models/SavedAOI',
  '../models/UserProfile',
  '../models/Content',
  '../models/BlogPost',
  '../models/Partner',
  '../models/Industry',
  '../models/DemoBooking',
  '../models/QuoteRequest',
  '../models/ContactInquiry',
  '../models/NewsletterSubscription',
  '../models/Product',
  '../models/ProductInquiry',
];

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    for (const rel of models) {
      const model = require(path.join(__dirname, rel));
      if (model && typeof model.syncIndexes === 'function') {
        await model.syncIndexes();
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

run();
