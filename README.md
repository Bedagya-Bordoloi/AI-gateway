# AI Gateway

A production-grade, high-performance proxy server for Large Language Models (LLMs) built to manage API costs, provide deep observability, and implement intelligent semantic caching.

**AI Gateway** sits between your application and AI providers (like Google Gemini), offering a centralized control plane for all AI traffic.

## 🚀 Key Features

### 🧠 Semantic Caching
Utilizes a local embedding model (`all-MiniLM-L6-v2`) and **Qdrant** Vector Database to identify semantically similar queries.

- **Impact**: If a user asks a question similar to one already in the cache, the Gateway returns the answer instantly (**sub-50ms**) with **zero external API cost**.

### 📊 Cost & Usage Observability
Every transaction is tracked with precision. Using **Prisma ORM** and **PostgreSQL**, the gateway logs:

- Token counts (Input / Output)
- Exact cost per request based on model pricing
- Latency measurements
- Cache hit / miss status

### ⚡ Real-time Streaming (SSE)
Full support for Server-Sent Events (SSE).  
The gateway:

- intercepts the stream from Gemini
- passes it to the frontend for a "typing" effect
- simultaneously buffers the full response
- saves it to cache + database once complete

### 🛡️ Infrastructure & Performance

- **Fastify** Backend – low-overhead Node.js framework optimized for high-throughput proxies
- **Redis** Rate Limiting – sliding-window limiter to prevent abuse and control spend
- **Docker** Orchestration – cleanly manages PostgreSQL, Redis, and Qdrant instances

## 🛠️ Tech Stack

| Layer          | Technologies                                      |
|----------------|---------------------------------------------------|
| Frontend       | Next.js 14, Tailwind CSS, Recharts, Lucide React  |
| Backend        | Fastify (TypeScript), Prisma ORM, Dotenv          |
| AI Engine      | Google Gemini AI SDK, Transformers.js (local)     |
| Infrastructure | PostgreSQL, Redis, Qdrant, Docker Desktop         |

## 🏗️ System Architecture

1. **Request**  
   Frontend → `/v1/chat` → Gateway

2. **Embedding**  
   Backend uses local CPU model → 384-dim vector

3. **Vector Search**  
   Gateway queries Qdrant for vectors with **>0.90** similarity  
   - **Hit** → return cached text immediately  
   - **Miss** → route to Gemini 1.5 Flash

4. **Streaming**  
   Response streams to user  
   Gateway buffers text in background

5. **Logging**  
   On completion → save full interaction + cost data to PostgreSQL

## 🚦 Getting Started

### 1. Prerequisites

- Node.js v18 or newer
- Docker Desktop
- Google Gemini API Key [](https://makersuite.google.com/)

### 2. Installation

```bash
# Install dependencies (root + backend + frontend)
npm run setup
```

### 3. Environment Setup

Create a file named `.env` inside the `backend/` folder with the following content:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@127.0.0.1:5433/gateway"

# Redis connection
REDIS_URL="redis://127.0.0.1:6379"

# Qdrant vector database
QDRANT_URL="http://localhost:6333"

# Google Gemini API key (required)
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE
```

### 4. Run Infrastructure

```bash
# Start Postgres, Redis, Qdrant
docker compose up -d

# Initialize database tables
cd backend
npx prisma migrate dev --name init
```

### 5. Start the Gateway

```bash
# From root directory
npm run dev
```

## 📈 Portfolio Impact

 - **Reduced Latency:** Cached queries → ~30 ms (vs ~2000 ms live)
 - **Cost Efficiency:** Up to 90% reduction in API spend for redundant customer support queries
 - **System Integrity:** Cleanly handled CORS, SSE streaming, rate limiting in multi-container setup

--------------------------------------------------------------------------------------------------------------------------------

Developed by **BEDAGYA BORDOLOI**
Targeted for *AI Engineering and Full-Stack roles*
