const Queue = require('bull');
const redis = require('redis');

const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null
};

// Create a named queue
const evaluationQueue = new Queue('resume-evaluation', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000 // 1s, 2s, 4s
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 200      // Keep last 200 failed jobs
    }
});

// Event listeners
evaluationQueue.on('error', (error) => {
    console.error('Bull Queue Error:', error);
});

evaluationQueue.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error ${err.message}`);
});

evaluationQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed successfully`);
});

module.exports = {
    evaluationQueue,
    redisConfig
};
