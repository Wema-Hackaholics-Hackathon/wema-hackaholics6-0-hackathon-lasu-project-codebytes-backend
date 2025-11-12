# Quick Start Guide

## Prerequisites

Before starting, ensure you have installed:

- Node.js 18+ (https://nodejs.org/)
- pnpm (run: `npm install -g pnpm`)
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- **Hugging Face API Key** (for sentiment analysis - https://huggingface.co/settings/tokens)

Alternatively, use Docker to run everything.

---

## Option 1: Full Docker Setup (Recommended for Quick Start)

This will run PostgreSQL, Redis, and the backend in containers:

```powershell
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Check service status
docker-compose ps

# Run database migrations (first time only)
docker-compose exec backend pnpm db:migrate

# Seed the database (first time only)
docker-compose exec backend pnpm db:seed

# Stop all services
docker-compose down
```

**Access:**

- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api-docs
- Health Check: http://localhost:4000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Option 2: Local Development

If you prefer running PostgreSQL and Redis separately:

### Step 1: Install Dependencies

```powershell
cd c:\Users\omega\Desktop\project\rt-cx-platform-backend
pnpm install
```

### Step 2: Setup Environment

```powershell
# Copy the example environment file
cp .env.example .env

# Open .env and update these REQUIRED values:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rt_cx
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
# FRONTEND_URL=http://localhost:3000

# ⚠️ IMPORTANT: Get your Hugging Face API key (REQUIRED for sentiment analysis)
# 1. Go to: https://huggingface.co/settings/tokens
# 2. Create a new token (read access is sufficient)
# 3. Add to .env:
# HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Note:** Free tier provides 1,000 requests/day. For production, consider the Pro tier ($9/mo) with 30,000 requests/month.

### Step 3: Start PostgreSQL & Redis

**Using Docker:**

```powershell
docker-compose up postgres redis -d
```

**Using Installed Services:**

```powershell
# Start PostgreSQL service
net start postgresql-x64-15

# Start Redis service
redis-server
```

### Step 4: Setup Database

```powershell
# Generate Prisma Client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed database with sample data
pnpm db:seed
```

### Step 5: Start Development Server

```powershell
pnpm dev
```

The server will:

- ✅ Connect to PostgreSQL database
- ✅ Connect to Redis for caching and queues
- ✅ Initialize background workers (sentiment analysis)
- ✅ Warm up NLP models (Hugging Face)
- ✅ Start Express server on port 4000
- ✅ Start WebSocket server (Socket.IO)

**Access:**

- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api-docs
- Health Check: http://localhost:4000/health

### Step 6: Open Prisma Studio (Optional)

View and edit database data visually:

```powershell
pnpm db:studio
```

Opens at: http://localhost:5555

---

## Verify Setup

### 1. Health Check

```powershell
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-11T...",
  "environment": "development"
}
```

### 2. Check API Documentation

Open in browser: http://localhost:4000/api-docs

You should see the Swagger UI with API documentation.

### 3. Test Database Connection

```powershell
# Open Prisma Studio
pnpm db:studio
```

You should see:

- 3 users (admin, manager, agent)
- 7 topics
- 5 feedback entries
- 2 alerts

---

## Default Login Credentials

After running the seed script, use these credentials:

| Role    | Email            | Password     |
| ------- | ---------------- | ------------ |
| Admin   | admin@rtcx.com   | Password123! |
| Manager | manager@rtcx.com | Password123! |
| Agent   | agent@rtcx.com   | Password123! |

---

## Common Commands

```powershell
# Development
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server
pnpm worker           # Start background workers separately (sentiment analysis)

# Database
pnpm db:migrate       # Run database migrations
pnpm db:generate      # Generate Prisma client
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Prisma Studio (database GUI)
pnpm db:push          # Push schema changes without migration
pnpm db:reset         # Reset database (caution: deletes all data)

# Testing & Quality
pnpm test             # Run tests with Vitest
pnpm test:ci          # Run tests in CI mode
pnpm test:coverage    # Run tests with coverage report
pnpm lint             # Lint code with ESLint
pnpm lint:fix         # Auto-fix lint issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
pnpm type-check       # TypeScript type checking

# Docker
docker-compose up -d                    # Start all services
docker-compose down                     # Stop all services
docker-compose logs -f backend          # View backend logs
docker-compose logs -f worker           # View worker logs
docker-compose exec backend pnpm dev    # Run command in container
```

---

## Troubleshooting

### Error: Cannot connect to database

**Solution:**

```powershell
# Check if PostgreSQL is running
docker-compose ps postgres

# Or if using local PostgreSQL
Get-Service postgresql-x64-15

# Verify DATABASE_URL in .env matches your setup
```

### Error: Cannot connect to Redis

**Solution:**

```powershell
# Check if Redis is running
docker-compose ps redis

# Or test Redis connection
redis-cli ping
# Should return: PONG
```

### Error: HUGGINGFACE_API_KEY is required

**Solution:**

```powershell
# Get your API key from Hugging Face
# 1. Visit: https://huggingface.co/settings/tokens
# 2. Create a new token (read access)
# 3. Add to .env file:
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Error: Model is loading / 503 Service Unavailable

**Solution:**

This is normal on first request. Hugging Face models need to warm up (15-20 seconds). The system will:

- Automatically retry with backoff
- Use fallback rule-based analysis if needed
- Models stay warm after first use

### Error: Module not found

**Solution:**

```powershell
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Error: Prisma Client not generated

**Solution:**

```powershell
pnpm db:generate
```

### Port 4000 already in use

**Solution:**

```powershell
# Change PORT in .env
PORT=4001

# Or kill process using port 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Background workers not processing jobs

**Solution:**

```powershell
# Check Redis connection
redis-cli ping

# View worker logs
docker-compose logs -f worker

# Or check BullMQ dashboard (if installed)
```

---

## Next Steps

Once the backend is running:

1. ✅ Review **IMPLEMENTATION_GUIDE.md** for detailed implementation status and next steps
2. ✅ Explore API documentation at http://localhost:4000/api-docs
3. ✅ Test authentication endpoints (register, login, refresh token)
4. ✅ Submit feedback and watch sentiment analysis happen in real-time
5. ✅ Check database schema and data in Prisma Studio
6. ✅ Monitor background workers processing sentiment analysis
7. ✅ Test WebSocket real-time events for live dashboard updates

### Key Features to Test:

- **Authentication**: Register, login, JWT tokens, role-based access
- **Feedback Collection**: Submit feedback across 7 channels (in-app, chatbot, voice, social media, email, support ticket, review)
- **Sentiment Analysis**: AI-powered sentiment detection using Hugging Face models
- **Real-time Updates**: WebSocket events for live dashboard
- **Alert System**: Automatic alerts for sentiment spikes and high-volume negative feedback
- **Dashboard Analytics**: Statistics, trends, emotions, topics

---

## Project Structure Overview

```
rt-cx-platform-backend/
├── src/                    # Source code
│   ├── config/            # Configuration (env, constants, swagger, nlp)
│   ├── controllers/       # Route handlers (auth, user, feedback, dashboard, alert, topic)
│   ├── services/          # Business logic (auth, user, feedback, sentiment, dashboard, alert, topic, websocket)
│   ├── middleware/        # Express middleware (auth, validation, error handling, rate limiting, logging)
│   ├── routes/            # API routes (auth, user, feedback, dashboard, alert, topic, demo)
│   ├── validators/        # Zod schemas for request validation
│   ├── workers/           # Background workers (sentiment analysis with BullMQ)
│   ├── types/             # TypeScript types and interfaces
│   ├── utils/             # Utility functions (jwt, password, logger, prisma, redis)
│   ├── app.ts             # Express app setup with Socket.IO
│   └── server.ts          # Server entry point with graceful shutdown
├── prisma/                # Database
│   ├── schema.prisma      # Schema definition (9 models)
│   ├── migrations/        # Database migrations
│   └── seed.ts            # Seed data (users, topics, feedback, alerts)
├── docs/                  # Documentation
│   ├── technical/         # Architecture, API contracts, stack details
│   └── non-technical/     # Project overview, approach, ideas
├── .env.example           # Environment template
├── docker-compose.yml     # Docker configuration (PostgreSQL, Redis, Backend, Worker)
├── Dockerfile             # Production Docker image
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript config
├── QUICKSTART.md          # This file
├── IMPLEMENTATION_GUIDE.md # Detailed implementation status
└── RAILWAY_DEPLOYMENT.md  # Railway deployment guide
```

### Core Components:

- **49 source files** across 7 feature areas
- **39+ API endpoints** (Auth, Users, Feedback, Dashboard, Alerts, Topics, Demo)
- **9 database models** (User, Session, Feedback, SentimentAnalysis, Topic, Alert, Dashboard, MetricsSnapshot, ApiUsage)
- **Real-time WebSocket** with room-based subscriptions
- **Background workers** for sentiment analysis with BullMQ
- **AI-powered sentiment** using Hugging Face models

---

## Getting Help

- Check **IMPLEMENTATION_GUIDE.md** for implementation details
- Review **PROJECT_SUMMARY.md** for project overview
- Explore existing documentation in `docs/technical/`
- View Swagger docs at http://localhost:4000/api-docs

Happy coding! 🚀
