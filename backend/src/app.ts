import 'dotenv/config'; 
import Fastify from 'fastify';
import cors from '@fastify/cors';
import redis from '@fastify/redis';
import { proxyRoutes } from './routes/proxy';
import { analyticsRoutes } from './routes/analytics';

const app = Fastify({ 
  logger: { transport: { target: 'pino-pretty' } } 
});

async function bootstrap() {
  // --- UPDATED CORS CONFIGURATION ---
  await app.register(cors, { 
    origin: "*", // Allows localhost:3000 to talk to port 3001
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });

  await app.register(redis, { url: process.env.REDIS_URL });

  console.log("⏳ Waiting for infra to stabilize...");
  await new Promise(res => setTimeout(res, 2000));

  app.addHook('preHandler', async (req, reply) => {
    const key = `rate-limit:${req.ip}`;
    try {
      const count = await app.redis.incr(key);
      if (count === 1) await app.redis.expire(key, 60);
      if (count > 100) return reply.code(429).send({ error: 'Rate limit exceeded' });
    } catch (err) {
      app.log.error(err as Error, "Redis Error");
    }
  });

  // Registering routes with v1 prefix
  await app.register(proxyRoutes, { prefix: '/v1' });
  await app.register(analyticsRoutes, { prefix: '/v1' });

  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log("🚀 Gateway Live at http://localhost:3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
bootstrap();