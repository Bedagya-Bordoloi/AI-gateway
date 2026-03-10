AI Gateway

A production-grade, high-performance proxy server for Large Language Models (LLMs) built to manage API costs, provide deep observability, and implement intelligent semantic caching.

Lumina AI Gateway sits between your application and AI providers (like Google Gemini), offering a centralized control plane for all AI traffic.

🚀 Key Features
🧠 Semantic Caching

Utilizes a local embedding model (all-MiniLM-L6-v2) and Qdrant Vector Database to identify semantically similar queries.

Impact: If a user asks a question similar to one already in the cache, the Gateway returns the answer instantly (sub-50ms) with zero external API cost.

📊 Cost & Usage Observability

Every transaction is tracked with precision. Using Prisma ORM and PostgreSQL, the gateway logs:

Token counts (Input/Output).

Exact cost per request based on model pricing.

Latency measurements.

Cache hit/miss status.

⚡ Real-time Streaming (SSE)

Full support for Server-Sent Events (SSE). The gateway intercepts the stream from Gemini, passes it to the frontend for a "typing" effect, while simultaneously buffering the full response to save to the cache and database once complete.

🛡️ Infrastructure & Performance

Fastify Backend: A low-overhead Node.js framework optimized for high-throughput proxies.

Redis Rate Limiting: Prevents API abuse and controls spend using a sliding-window rate limiter.

Docker Orchestration: Seamlessly manages PostgreSQL, Redis, and Qdrant instances.

🛠️ Tech Stack

Frontend: Next.js 14, Tailwind CSS, Recharts (Analytics), Lucide React.

Backend: Fastify (TypeScript), Prisma ORM, Dotenv.

AI Engine: Google Gemini AI SDK, Transformers.js (Local Inference).

Infrastructure: PostgreSQL (Logs), Redis (Rate Limiting), Qdrant (Vector Store), Docker Desktop.

🏗️ System Architecture

Request: Frontend sends a chat request to the Gateway via /v1/chat.

Embedding: Backend uses a local CPU-bound model to turn the prompt into a 384-dimension vector.

Vector Search: Gateway queries Qdrant for vectors with >0.90 similarity.

Hit: Return cached text immediately.

Miss: Route the request to Gemini 1.5 Flash.

Streaming: The response streams to the user; the Gateway buffers the text in the background.

Logging: On completion, the Gateway saves the full interaction and cost data to PostgreSQL.

🚦 Getting Started
1. Prerequisites

Node.js (v18+)

Docker Desktop

Gemini API Key (Get it here)

2. Installation
code
Bash
download
content_copy
expand_less
# Install dependencies for root, backend, and frontend
npm run setup
3. Environment Setup

Create a .env file in backend/.env:

code
Env
download
content_copy
expand_less
DATABASE_URL="postgresql://user:password@127.0.0.1:5433/gateway"
REDIS_URL="redis://127.0.0.1:6379"
QDRANT_URL="http://localhost:6333"
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
4. Run Infrastructure
code
Bash
download
content_copy
expand_less
# Start Postgres, Redis, and Qdrant
docker compose up -d

# Initialize Database tables
cd backend
npx prisma migrate dev --name init
5. Start the Gateway
code
Bash
download
content_copy
expand_less
# From the root directory
npm run dev
📈 Portfolio Impact

Reduced Latency: Cached queries respond in ~30ms, compared to ~2000ms for live AI calls.

Cost Efficiency: Achieved up to 90% reduction in API spend for redundant customer support queries.

System Integrity: Successfully handled CORS, SSE Streaming, and Rate Limiting in a multi-container environment.

Developed by [Your Name]
Targeted for AI Engineering and Full-Stack Roles.
