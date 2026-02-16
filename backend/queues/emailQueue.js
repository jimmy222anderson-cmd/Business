/**
 * Email Queue Implementation
 * 
 * This module implements an email queue using Bull for reliable email delivery.
 * Benefits:
 * - Retry failed emails automatically
 * - Handle email sending asynchronously
 * - Monitor email job status
 * - Rate limiting and throttling
 * 
 * Installation:
 *   npm install bull redis
 * 
 * Requirements:
 *   - Redis server running (local or remote)
 *   - REDIS_URL environment variable set
 * 
 * Usage:
 *   const { addEmailToQueue } = require('./queues/emailQueue');
 *   await addEmailToQueue('welcome', { email: 'user@example.com', name: 'John' });
 */

const Bull = require('bull');
const emailService = require('../services/email');

// Create email queue
// Redis connection from environment variable or default to localhost
const emailQueue = new Bull('email', process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential', // Exponential backoff: 1s, 2s, 4s
      delay: 1000 // Initial delay of 1 second
    },
    removeOnComplete: true, // Remove completed jobs to save memory
    removeOnFail: false // Keep failed jobs for debugging
  }
});

/**
 * Process email jobs
 * This function is called for each job in the queue
 */
emailQueue.process(async (job) => {
  const { type, data } = job.data;
  
  console.log(`Processing email job: ${type} (ID: ${job.id})`);
  
  try {
    switch (type) {
      case 'welcome':
        await emailService.sendWelcomeEmail(data.email, data.name);
        break;
        
      case 'emailVerification':
        await emailService.sendEmailVerification(data.email, data.name, data.verificationToken);
        break;
        
      case 'passwordReset':
        await emailService.sendPasswordResetEmail(data.email, data.name, data.resetToken);
        break;
        
      case 'passwordChanged':
        await emailService.sendPasswordChangedEmail(data.email, data.name);
        break;
        
      case 'demoConfirmation':
        await emailService.sendDemoConfirmation(data.email, data.name, data.bookingId);
        break;
        
      case 'demoNotification':
        await emailService.sendDemoNotification(data.booking);
        break;
        
      case 'contactConfirmation':
        await emailService.sendContactConfirmation(data.email, data.name);
        break;
        
      case 'contactNotification':
        await emailService.sendContactNotification(data.inquiry);
        break;
        
      case 'quoteRequestConfirmation':
        await emailService.sendQuoteRequestConfirmation(data.email, data.name, data.quoteRequestId);
        break;
        
      case 'quoteRequestNotification':
        await emailService.sendQuoteRequestNotification(data.quoteRequest);
        break;
        
      case 'quote':
        await emailService.sendQuoteEmail(data.email, data.name, data.quoteDetails);
        break;
        
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
    
    console.log(`✅ Email sent successfully: ${type} (ID: ${job.id})`);
    return { success: true, type };
    
  } catch (error) {
    console.error(`❌ Email failed: ${type} (ID: ${job.id})`, error.message);
    throw error; // Re-throw to trigger retry
  }
});

/**
 * Add email to queue
 * @param {string} type - Email type
 * @param {Object} data - Email data
 * @param {Object} options - Job options (optional)
 * @returns {Promise<Object>} - Job object
 */
async function addEmailToQueue(type, data, options = {}) {
  try {
    const job = await emailQueue.add(
      { type, data },
      {
        ...options,
        // Add job ID for tracking
        jobId: options.jobId || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    );
    
    console.log(`📧 Email queued: ${type} (ID: ${job.id})`);
    return job;
    
  } catch (error) {
    console.error(`Failed to queue email: ${type}`, error);
    throw error;
  }
}

/**
 * Get queue statistics
 * @returns {Promise<Object>} - Queue stats
 */
async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount()
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
}

/**
 * Get failed jobs
 * @param {number} start - Start index
 * @param {number} end - End index
 * @returns {Promise<Array>} - Failed jobs
 */
async function getFailedJobs(start = 0, end = 10) {
  return await emailQueue.getFailed(start, end);
}

/**
 * Retry failed job
 * @param {string} jobId - Job ID
 * @returns {Promise<void>}
 */
async function retryFailedJob(jobId) {
  const job = await emailQueue.getJob(jobId);
  if (job) {
    await job.retry();
    console.log(`🔄 Retrying job: ${jobId}`);
  } else {
    throw new Error(`Job not found: ${jobId}`);
  }
}

/**
 * Clear completed jobs
 * @returns {Promise<void>}
 */
async function clearCompletedJobs() {
  await emailQueue.clean(0, 'completed');
  console.log('🧹 Cleared completed jobs');
}

/**
 * Clear failed jobs
 * @returns {Promise<void>}
 */
async function clearFailedJobs() {
  await emailQueue.clean(0, 'failed');
  console.log('🧹 Cleared failed jobs');
}

/**
 * Pause queue
 * @returns {Promise<void>}
 */
async function pauseQueue() {
  await emailQueue.pause();
  console.log('⏸️  Queue paused');
}

/**
 * Resume queue
 * @returns {Promise<void>}
 */
async function resumeQueue() {
  await emailQueue.resume();
  console.log('▶️  Queue resumed');
}

/**
 * Close queue connection
 * @returns {Promise<void>}
 */
async function closeQueue() {
  await emailQueue.close();
  console.log('🔌 Queue connection closed');
}

// Event listeners for monitoring
emailQueue.on('completed', (job, result) => {
  console.log(`✅ Job completed: ${job.id}`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err.message);
  
  // Log to external monitoring service (e.g., Sentry, LogRocket)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(err, { extra: { jobId: job.id, jobData: job.data } });
  // }
});

emailQueue.on('stalled', (job) => {
  console.warn(`⚠️  Job stalled: ${job.id}`);
});

emailQueue.on('error', (error) => {
  console.error('❌ Queue error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing email queue...');
  await closeQueue();
  process.exit(0);
});

module.exports = {
  emailQueue,
  addEmailToQueue,
  getQueueStats,
  getFailedJobs,
  retryFailedJob,
  clearCompletedJobs,
  clearFailedJobs,
  pauseQueue,
  resumeQueue,
  closeQueue
};
