import * as redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = redis.createClient({ url: process.env.REDIS_URL })

export { redisClient};
