export const config = {
  SIMILARITY_THRESHOLD: 0.85,
  CACHE_TTL_SECONDS: 3600 * 24, // 24 hours
  MIN_PROMPT_LENGTH_FOR_CACHE: 80,
  TIME_SENSITIVE_PATTERNS: [
    /now/i,
    /today/i,
    /current time/i,
    /what time is it/i,
    /weather/i,
  ],
  EMBEDDING_MODEL: 'Xenova/all-MiniLM-L6-v2',
  PROVIDER_COST_PER_1K_TOKENS: {
    'gpt-4o-mini': 0.00015,
    'claude-3-haiku': 0.00025,
  } as Record<string, number>,
};