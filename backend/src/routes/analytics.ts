import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get('/stats', async () => {
    const logs = await prisma.requestLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' }
    });

    const totalCost = logs.reduce((acc, log) => acc + log.cost, 0);
    const cacheHitRate = (logs.filter(l => l.cacheHit).length / logs.length) * 100;

    // Grouping for a chart (last 7 days)
    const dailyStats = await prisma.$queryRaw`
      SELECT DATE(timestamp) as date, SUM(cost) as cost
      FROM "RequestLog"
      GROUP BY DATE(timestamp)
      ORDER BY DATE(timestamp) ASC
      LIMIT 7
    `;

    return { totalCost, cacheHitRate, dailyStats, recentLogs: logs };
  });
}