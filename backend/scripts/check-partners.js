require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Partner = require('../models/Partner');

async function checkPartners() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const partners = await Partner.find();
    console.log(`\nFound ${partners.length} partners:\n`);
    
    partners.forEach(partner => {
      console.log(`- ${partner.name}`);
      console.log(`  ID: ${partner._id}`);
      console.log(`  Logo: ${partner.logo}`);
      console.log(`  Category: ${partner.category}`);
      console.log(`  Website: ${partner.website || 'N/A'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPartners();
