import { NextFunction, Request, Response, response } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from 'redis';
import AppError from '@shared/errors/AppError';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASS || undefined,
});

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ratelimit',
  points: 5, // Determina quantas requisições
  duration: 1, // o tempo de intervalo
  blockDuration: 30, // tempo de bloqueio
});

export default async function rateLimiter(
  request: Request,
  responde: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await limiter.consume(request.ip);
    return next();
  } catch (err) {
    throw new AppError('Too many requests', 429);
  }
}
