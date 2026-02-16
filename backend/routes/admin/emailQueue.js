/**
 * Email Queue Admin Routes
 * 
 * These routes provide admin access to monitor and manage the email queue.
 * All routes require admin authentication.
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../../middleware/auth');

// Try to load email queue (optional dependency)
let emailQueue;
try {
  emailQueue = require('../../queues/emailQueue');
} catch (error) {
  console.log('Email queue not available');
  emailQueue = null;
}

// Middleware to check if queue is available
function checkQueueAvailable(req, res, next) {
  if (!emailQueue) {
    return res.status(503).json({ 
      error: 'Email queue not available',
      message: 'Install Bull and Redis to use email queue features'
    });
  }
  next();
}

/**
 * GET /api/admin/email-queue/stats
 * Get email queue statistics
 */
router.get('/stats', requireAuth, requireAdmin, checkQueueAvailable, async (req, res) => {
  try {
    const stats = await emailQueue.getQueueStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting queue stats:', error);
    res.status(500).json({ error: 'Failed to get queue statistics' });
  }
});

/**
 * GET /api/admin/email-queue/failed
 * Get failed email jobs
 */
router.get('/failed', requireAuth, requireAdmin, checkQueueAvailable, async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const end = parseInt(req.query.end) || 10;
    
    const jobs = await emailQueue.getFailedJobs(start, end);
    
    // Format job data for response
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      type: job.data.type,
      data: job.data.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    }));
    
    res.json(formattedJobs);
  } catch (error) {
    console.error('Error getting failed jobs:', error);
    res.status(500).json({ error: 'Failed to get failed jobs' });
  }
});

/**
 * POST /api/admin/email-queue/retry/:jobId
 * Retry a failed email job
 */
router.post('/retry/:jobId', requireAuth, requireAdmin, checkQueueAvailable, async (req, res) => {
  try {
    const { jobId } = req.params;
    await emailQueue.retryFailedJob(jobId);
    res.json({ message: 'Job retry initiated', jobId });
  } catch (error) {
    console.error('Error retrying job:', error);
    res.status(500).json({ error: 'Failed to retry job' });
  }
});

/**
 * DELETE /api/admin/email-queue/completed
 * Clear completed jobs
 */
router.delete('/completed', requireAuth, requireAdmin, checkQueueAvailable, async (req, res) => {
  try {
    await emailQueue.clearCompletedJobs();
    res.json({ message: 'Completed jobs cleared' });
  } catch (error) {
    console.error('Error clearing completed jobs:', error);
    res.status(500).json({ error: 'Failed to clear completed jobs' });
  }
});

/**
 * DELETE /api/admin/email-queue/failed
 * Clear failed jobs
 */
router.delete('/failed', requireAuth, requireAdmin, checkQueueAvailable, async (req, res) => {
  try {
    await emailQueue.clearFailedJobs();
    res.json({ message: 'Failed jobs cleared' });
  } catch (error) {
    console.error('Error clearing failed jobs:', error);
    res.status(500).json({ error: 'Failed to clear failed jobs' });
  }
});

/**
 * POST /api/admin/email-queue/pause
 * Pause the email queue
 */
router.post('/pause', requireAuth, requireAdmin, checkQueueAvailable, async (req, res) => {
  try {
    await emailQueue.pauseQueue();
    res.json({ message: 'Queue paused' });
  } catch (error) {
    console.error('Error pausing queue:', error);
    res.status(500).json({ error: 'Failed to pause queue' });
  }
});

/**
 * POST /api/admin/email-queue/resume
 * Resume the email queue
 */
router.post('/resume', requireAuth, requireAdmin, checkQueueAvailable, async (req, res) => {
  try {
    await emailQueue.resumeQueue();
    res.json({ message: 'Queue resumed' });
  } catch (error) {
    console.error('Error resuming queue:', error);
    res.status(500).json({ error: 'Failed to resume queue' });
  }
});

module.exports = router;
