# Email Queue Documentation

## Overview

The email queue provides reliable, asynchronous email delivery with automatic retry logic. It's built using Bull (a Redis-based queue) and is optional - the system works without it.

## Benefits

- **Reliability**: Automatic retry on failures with exponential backoff
- **Performance**: Non-blocking email sending (doesn't slow down API responses)
- **Monitoring**: Track email job status and failures
- **Rate Limiting**: Control email sending rate
- **Scalability**: Handle high email volumes efficiently

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install bull redis
```

### 2. Install Redis

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### Windows
Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)

#### Docker
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 3. Configure Environment Variables

Add to your `.env` file:

```env
USE_EMAIL_QUEUE=true
REDIS_URL=redis://127.0.0.1:6379
```

For Redis with authentication:
```env
REDIS_URL=redis://:password@127.0.0.1:6379
```

For Redis Cloud or remote server:
```env
REDIS_URL=redis://username:password@host:port
```

## Usage

### In Your Code

The email queue is automatically used when `USE_EMAIL_QUEUE=true`. Use the `emailHelper` module instead of direct email service:

```javascript
// Instead of:
// const emailService = require('./services/email');

// Use:
const emailHelper = require('./services/emailHelper');

// Send emails (automatically queued if enabled)
await emailHelper.sendWelcomeEmail('user@example.com', 'John Doe');
await emailHelper.sendEmailVerification('user@example.com', 'John Doe', 'token123');
await emailHelper.sendPasswordResetEmail('user@example.com', 'John Doe', 'reset-token');
```

### Direct Queue Access

For advanced usage, you can access the queue directly:

```javascript
const { addEmailToQueue } = require('./queues/emailQueue');

// Add email to queue with custom options
await addEmailToQueue('welcome', 
  { email: 'user@example.com', name: 'John Doe' },
  { 
    delay: 5000, // Delay 5 seconds
    priority: 1, // Higher priority (lower number = higher priority)
    attempts: 5  // Override default retry attempts
  }
);
```

## Queue Management

### Admin API Endpoints

All endpoints require admin authentication.

#### Get Queue Statistics
```http
GET /api/admin/email-queue/stats
```

Response:
```json
{
  "waiting": 5,
  "active": 2,
  "completed": 150,
  "failed": 3,
  "delayed": 0,
  "total": 160
}
```

#### Get Failed Jobs
```http
GET /api/admin/email-queue/failed?start=0&end=10
```

Response:
```json
[
  {
    "id": "123",
    "type": "welcome",
    "data": { "email": "user@example.com", "name": "John" },
    "failedReason": "Connection timeout",
    "attemptsMade": 3,
    "timestamp": 1234567890,
    "processedOn": 1234567891,
    "finishedOn": 1234567892
  }
]
```

#### Retry Failed Job
```http
POST /api/admin/email-queue/retry/:jobId
```

#### Clear Completed Jobs
```http
DELETE /api/admin/email-queue/completed
```

#### Clear Failed Jobs
```http
DELETE /api/admin/email-queue/failed
```

#### Pause Queue
```http
POST /api/admin/email-queue/pause
```

#### Resume Queue
```http
POST /api/admin/email-queue/resume
```

### Command Line Management

You can also manage the queue programmatically:

```javascript
const emailQueue = require('./queues/emailQueue');

// Get statistics
const stats = await emailQueue.getQueueStats();
console.log(stats);

// Get failed jobs
const failed = await emailQueue.getFailedJobs(0, 10);
console.log(failed);

// Retry a failed job
await emailQueue.retryFailedJob('job-id-123');

// Clear completed jobs
await emailQueue.clearCompletedJobs();

// Pause queue
await emailQueue.pauseQueue();

// Resume queue
await emailQueue.resumeQueue();
```

## Configuration

### Queue Options

Default configuration in `emailQueue.js`:

```javascript
{
  attempts: 3,              // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',    // Exponential backoff
    delay: 1000             // Start with 1 second delay
  },
  removeOnComplete: true,   // Remove completed jobs
  removeOnFail: false       // Keep failed jobs for debugging
}
```

### Retry Strategy

Failed jobs are retried with exponential backoff:
- 1st retry: after 1 second
- 2nd retry: after 2 seconds
- 3rd retry: after 4 seconds

After 3 failed attempts, the job is marked as failed and kept for manual review.

### Custom Job Options

You can override default options per job:

```javascript
await addEmailToQueue('welcome', data, {
  attempts: 5,              // Retry 5 times instead of 3
  delay: 10000,             // Delay 10 seconds before processing
  priority: 1,              // Higher priority (1-10, lower = higher priority)
  timeout: 30000,           // Job timeout (30 seconds)
  removeOnComplete: false,  // Keep completed job
  jobId: 'custom-id-123'    // Custom job ID
});
```

## Monitoring

### Event Listeners

The queue emits events that you can listen to:

```javascript
const { emailQueue } = require('./queues/emailQueue');

emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
  // Send to monitoring service (Sentry, LogRocket, etc.)
});

emailQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled`);
});

emailQueue.on('error', (error) => {
  console.error('Queue error:', error);
});
```

### Bull Board (Optional)

For a visual dashboard, install Bull Board:

```bash
npm install @bull-board/express
```

Add to your server:

```javascript
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { emailQueue } = require('./queues/emailQueue');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(emailQueue)],
  serverAdapter: serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());
```

Access at: `http://localhost:3000/admin/queues`

## Troubleshooting

### Queue Not Working

1. **Check Redis connection**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Check environment variables**:
   ```bash
   echo $USE_EMAIL_QUEUE  # Should be 'true'
   echo $REDIS_URL        # Should be valid Redis URL
   ```

3. **Check Redis logs**:
   ```bash
   # macOS
   tail -f /usr/local/var/log/redis.log
   
   # Linux
   sudo journalctl -u redis -f
   ```

### Jobs Stuck in Queue

1. **Check active jobs**:
   ```javascript
   const stats = await emailQueue.getQueueStats();
   console.log('Active jobs:', stats.active);
   ```

2. **Check for stalled jobs**:
   - Jobs may stall if the worker crashes
   - Bull automatically detects and retries stalled jobs
   - Check logs for stalled job warnings

3. **Manually retry stalled jobs**:
   ```javascript
   const jobs = await emailQueue.getJobs(['active']);
   for (const job of jobs) {
     await job.retry();
   }
   ```

### High Memory Usage

1. **Clear completed jobs regularly**:
   ```javascript
   await emailQueue.clearCompletedJobs();
   ```

2. **Enable auto-cleanup**:
   ```javascript
   // In emailQueue.js
   defaultJobOptions: {
     removeOnComplete: true,  // Auto-remove completed jobs
     removeOnFail: 100        // Keep only last 100 failed jobs
   }
   ```

3. **Monitor Redis memory**:
   ```bash
   redis-cli info memory
   ```

### Failed Jobs Not Retrying

1. **Check retry configuration**:
   - Ensure `attempts` is set correctly
   - Check backoff configuration

2. **Check error logs**:
   - Some errors may not be retryable (e.g., invalid email address)
   - Check job failure reason

3. **Manually retry**:
   ```javascript
   await emailQueue.retryFailedJob('job-id');
   ```

## Best Practices

1. **Monitor failed jobs**: Set up alerts for failed jobs
2. **Regular cleanup**: Clear completed jobs periodically
3. **Rate limiting**: Use Bull's rate limiter for high volumes
4. **Error handling**: Log errors to monitoring service
5. **Graceful shutdown**: Close queue on app shutdown
6. **Redis persistence**: Enable Redis persistence for production
7. **Backup Redis**: Regular Redis backups for critical data
8. **Separate queues**: Use separate queues for different priorities
9. **Job timeouts**: Set reasonable timeouts for jobs
10. **Testing**: Test queue behavior in staging environment

## Production Deployment

### Redis Configuration

For production, use a managed Redis service:
- **AWS ElastiCache**: Managed Redis on AWS
- **Redis Cloud**: Official Redis cloud service
- **Heroku Redis**: Redis add-on for Heroku
- **DigitalOcean Managed Redis**: Redis on DigitalOcean

### Environment Variables

```env
# Production
USE_EMAIL_QUEUE=true
REDIS_URL=redis://:password@production-redis-host:6379
```

### Monitoring

Set up monitoring for:
- Queue length (waiting jobs)
- Failed job rate
- Processing time
- Redis memory usage
- Redis connection errors

### Scaling

For high volumes:
1. **Multiple workers**: Run multiple instances of your app
2. **Separate worker process**: Dedicated process for queue processing
3. **Redis cluster**: Use Redis cluster for high availability
4. **Rate limiting**: Implement rate limiting per email provider

### Security

1. **Redis authentication**: Always use password in production
2. **Network security**: Restrict Redis access to app servers only
3. **TLS/SSL**: Use encrypted Redis connections
4. **Admin endpoints**: Secure admin endpoints with authentication

## Additional Resources

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Redis Documentation](https://redis.io/documentation)
- [Bull Board](https://github.com/felixmosh/bull-board)
- [Email Best Practices](../docs/EMAIL_SETUP.md)
