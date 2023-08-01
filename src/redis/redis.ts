// const { promisify } = require('util');
import * as redis from 'redis';
// import promisify from 'util';
import dotenv from 'dotenv';

dotenv.config();
// Create a Redis client and configure the connection
const redisClient = redis.createClient({ url: process.env.REDIS_URL })

// Promisify Redis methods to use async/await
// const redisSetAsync = promisify(client.set).bind(client);
export { redisClient};
