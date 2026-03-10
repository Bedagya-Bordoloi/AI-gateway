import { FastifyInstance } from 'fastify';
import { cacheService } from '../services/cache';
import { routerService } from '../services/router';
import { StreamManager } from '../services/streaming';
import { loggerService } from '../services/logger';

export async function proxyRoutes(fastify: FastifyInstance) {
  fastify.post('/chat', async (request, reply) => {
    // --- MANUAL CORS HEADERS FOR STREAMING ---
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Defaulting to gemini-1.5-flash if no model is provided in the body
    const { messages, stream = false, model = "gemini-1.5-flash" } = request.body as any;
    
    // DEBUG: This will show in your terminal exactly what model is being used
    console.log(`Incoming request for model: ${model}`);

    const userPrompt = messages[messages.length - 1].content;
    const startTime = Date.now();

    // 1. Semantic Cache Check
    const cached = await cacheService.find(userPrompt);
    if (cached) {
      if (stream) {
        reply.raw.setHeader('Content-Type', 'text/event-stream');
        reply.raw.write(`data: ${JSON.stringify({ content: cached, cached: true })}\n\n`);
        reply.raw.write('data: [DONE]\n\n');
        return reply.raw.end();
      }
      return { content: cached, cached: true };
    }

    // 2. Call Gemini via Router
    const result = await routerService.getChatCompletion({ model, messages, stream });

    if (stream) {
      return StreamManager.handleGeminiStream(result, reply, (fullText) => {
        const latency = Date.now() - startTime;
        
        // Background logging
        cacheService.save(userPrompt, fullText);
        loggerService.logRequest({
          model: model, // Using the variable from the request
          prompt: userPrompt,
          response: fullText,
          tokensIn: Math.ceil(userPrompt.length / 4), 
          tokensOut: Math.ceil(fullText.length / 4),
          latencyMs: latency,
          cacheHit: false
        });
      });
    } else {
      const fullText = result as string;
      const latency = Date.now() - startTime;
      
      await cacheService.save(userPrompt, fullText);
      loggerService.logRequest({
        model: model, // Using the variable from the request
        prompt: userPrompt,
        response: fullText,
        tokensIn: Math.ceil(userPrompt.length / 4),
        tokensOut: Math.ceil(fullText.length / 4),
        latencyMs: latency,
        cacheHit: false
      });
      return { content: fullText };
    }
  });

  // Handle CORS preflight
  fastify.options('/chat', async (request, reply) => {
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return reply.code(204).send();
  });
}