import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'] as string;
  if (!apiKey || apiKey !== process.env.GATEWAY_API_KEY) {
    reply.code(401).send({ error: 'Unauthorized - invalid or missing API key' });
    return;
  }
}