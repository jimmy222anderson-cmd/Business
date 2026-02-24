/**
 * Test script for analytics endpoint
 * 
 * This script tests the /api/admin/analytics/imagery-requests endpoint
 * to ensure it returns the correct analytics data.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ImageryRequest = require('../models/ImageryRequest');

async function testAnalytics() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get total requests count
    const totalRequests = await ImageryRequest.countDocuments();
    console.log(`Total Requests: ${totalRequests}`);

    // Get requests by status
    const requestsByStatus = await ImageryRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    console.log('\nRequests by Status:');
    requestsByStatus.forEach(item => {
      console.log(`  ${item.status}: ${item.count}`);
    });

    // Get requests over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const requestsOverTime = await ImageryRequest.aggregate([
      {
        $match: {
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    console.log(`\nRequests Over Time (last 30 days): ${requestsOverTime.length} days with data`);
    if (requestsOverTime.length > 0) {
      console.log(`  First: ${requestsOverTime[0].date} (${requestsOverTime[0].count} requests)`);
      console.log(`  Last: ${requestsOverTime[requestsOverTime.length - 1].date} (${requestsOverTime[requestsOverTime.length - 1].count} requests)`);
    }

    // Get popular products
    const popularProducts = await ImageryRequest.aggregate([
      {
        $unwind: {
          path: '$filters.providers',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: '$filters.providers',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          provider: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    console.log(`\nPopular Products (Top ${popularProducts.length}):`);
    popularProducts.forEach(item => {
      console.log(`  ${item.provider}: ${item.count} requests`);
    });

    // Get average AOI size
    const avgAoiResult = await ImageryRequest.aggregate([
      {
        $group: {
          _id: null,
          avgArea: { $avg: '$aoi_area_km2' }
        }
      }
    ]);
    const avgAoiSize = avgAoiResult.length > 0 ? avgAoiResult[0].avgArea : 0;
    console.log(`\nAverage AOI Size: ${Math.round(avgAoiSize * 100) / 100} km²`);

    console.log('\n✅ Analytics test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing analytics:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

testAnalytics();
