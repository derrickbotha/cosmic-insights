/**
 * Redis Client Configuration
 * Centralized Redis connection for session management, caching, and pub/sub
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis configuration from environment
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
};

// Create main Redis client
const redisClient = new Redis(redisConfig);

// Event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connected', { host: redisConfig.host, port: redisConfig.port });
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (error) => {
  logger.error('Redis client error:', error);
});

redisClient.on('close', () => {
  logger.warn('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

// Create separate client for pub/sub (cannot use same client for both)
const redisPubClient = redisClient.duplicate();
const redisSubClient = redisClient.duplicate();

/**
 * Graceful shutdown
 */
const closeRedis = async () => {
  logger.info('Closing Redis connections...');
  await Promise.all([
    redisClient.quit(),
    redisPubClient.quit(),
    redisSubClient.quit()
  ]);
  logger.info('Redis connections closed');
};

// Handle process termination
process.on('SIGTERM', closeRedis);
process.on('SIGINT', closeRedis);

module.exports = {
  redisClient,
  redisPubClient,
  redisSubClient,
  closeRedis
};
