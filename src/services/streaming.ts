import { FastifyReply } from 'fastify';

export class StreamManager {
  static async handleGeminiStream(
    stream: any, 
    reply: FastifyReply, 
    onDone: (fullText: string) => void
  ) {
    let fullText = "";
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    
    try {
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
      
        // Match the frontend's expected format: { content: "..." }
        reply.raw.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
      }
    } catch (error) {
      console.error("Streaming error:", error);
    }

    reply.raw.write('data: [DONE]\n\n');
    reply.raw.end();
    
    onDone(fullText);
  }
}