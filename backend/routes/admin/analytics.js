const express = require('express');
const router = express.Router();
const ImageryRequest = require('../../models/ImageryRequest');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

/**
 * GET /api/admin/analytics/imagery-requests
 * Get analytics data for imagery requests
 * Admin only
 */
router.get('/imagery-requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get total requests count
    const totalRequests = await ImageryRequest.countDocuments();

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

    // Get requests over time (last 30 days, grouped by day)
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

    // Get popular products (from filters.providers)
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

    // Calculate average response time (time from request creation to first status change or completion)
    const responseTimeResult = await ImageryRequest.aggregate([
      {
        $match: {
          status_history: { $exists: true, $ne: [] }
        }
      },
      {
        $project: {
          created_at: 1,
          firstStatusChange: { $arrayElemAt: ['$status_history', 1] } // Index 1 because 0 is the initial 'pending' status
        }
      },
      {
        $match: {
          'firstStatusChange.changed_at': { $exists: true }
        }
      },
      {
        $project: {
          responseTimeHours: {
            $divide: [
              { $subtract: ['$firstStatusChange.changed_at', '$created_at'] },
              1000 * 60 * 60 // Convert milliseconds to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTimeHours' }
        }
      }
    ]);

    const avgResponseTime = responseTimeResult.length > 0 ? responseTimeResult[0].avgResponseTime : 0;

    // Calculate conversion rate (pending → approved/completed)
    // Count requests that have been approved or completed (these started as pending)
    const convertedCount = await ImageryRequest.countDocuments({
      status: { $in: ['approved', 'completed'] }
    });
    
    // Total requests (all start as pending)
    const totalRequestsForConversion = await ImageryRequest.countDocuments();

    const conversionRate = totalRequestsForConversion > 0 ? (convertedCount / totalRequestsForConversion) * 100 : 0;

    // Get requests by urgency
    const requestsByUrgency = await ImageryRequest.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          urgency: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { urgency: 1 }
      }
    ]);

    // Get requests by user type (guest vs registered users)
    const guestRequests = await ImageryRequest.countDocuments({ user_id: null });
    const registeredRequests = await ImageryRequest.countDocuments({ user_id: { $ne: null } });

    const requestsByUserType = [
      { userType: 'guest', count: guestRequests },
      { userType: 'registered', count: registeredRequests }
    ];

    res.json({
      totalRequests,
      requestsByStatus,
      requestsOverTime,
      popularProducts,
      avgAoiSize: Math.round(avgAoiSize * 100) / 100, // Round to 2 decimal places
      avgResponseTime: Math.round(avgResponseTime * 100) / 100, // Round to 2 decimal places (in hours)
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places (percentage)
      requestsByUrgency,
      requestsByUserType
    });
  } catch (error) {
    console.error('Error fetching imagery request analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
