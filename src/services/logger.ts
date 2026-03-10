import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRICING = {
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-1.5-pro': { input: 3.50, output: 10.50 },
};

export const loggerService = {
  async logRequest(data: {
    model: string;
    prompt: string;
    response: string;
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
    cacheHit: boolean;
  }) {
    const provider = data.model.includes('gpt') ? 'openai' : 'anthropic';
    const rates = PRICING[data.model as keyof typeof PRICING] || { input: 0.5, output: 1.5 };
    
    // Calculate cost: (tokens / 1,000,000) * rate
    const cost = ((data.tokensIn / 1_000_000) * rates.input) + 
                 ((data.tokensOut / 1_000_000) * rates.output);

    return await prisma.requestLog.create({
      data: { ...data, provider, cost },
    });
  }
};