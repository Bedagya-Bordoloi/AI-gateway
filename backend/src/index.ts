import Fastify from 'fastify';
import fastifyRedis from '@fastify/redis';
import fastifyRateLimit from '@fastify/rate-limit';
import prometheus from '@fastify/prometheus';
import { proxyRoutes } from './routes/proxy';
import { analyticsRoutes } from './routes/analytics';
import { authMiddleware } from './middleware/auth';
import { initQdrantCollection } from './services/cache';

const fastify = Fastify({ logger: true });

async function start() {
  try {
    // Redis
    await fastify.register(fastifyRedis, {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    // Rate limiting (very basic example – adjust per provider)
    await fastify.register(fastifyRateLimit, {
      max: 3500,
      timeWindow: '1 minute',
      keyGenerator: () => 'global', // or per-user / per-provider
    });

    // Prometheus metrics
    await fastify.register(prometheus, { endpoint: '/metrics' });

    // Init Qdrant collection
    await initQdrantCollection();

    // Global auth middleware
    fastify.addHook('preHandler', authMiddleware);

    // Routes
    fastify.register(proxyRoutes, { prefix: '/api' });
    fastify.register(analyticsRoutes, { prefix: '/api' });

    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Backend running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();