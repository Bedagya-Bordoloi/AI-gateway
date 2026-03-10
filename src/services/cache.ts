import { QdrantClient } from '@qdrant/js-client-rest';
import { getLocalEmbedding } from './embedder';

const qdrant = new QdrantClient({ url: 'http://localhost:6333' });
const COLLECTION_NAME = "llm_cache";

export const cacheService = {
  async find(prompt: string): Promise<string | null> {
    const vector = await getLocalEmbedding(prompt);
    
    const results = await qdrant.search(COLLECTION_NAME, {
      vector: vector,
      limit: 1,
      score_threshold: 0.94 // High similarity threshold
    });

    return results.length > 0 ? (results[0].payload?.response as string) : null;
  },

  async save(prompt: string, response: string) {
    const vector = await getLocalEmbedding(prompt);
    await qdrant.upsert(COLLECTION_NAME, {
      points: [{
        id: crypto.randomUUID(),
        vector: vector,
        payload: { prompt, response, createdAt: new Date().toISOString() }
      }]
    });
  }
};