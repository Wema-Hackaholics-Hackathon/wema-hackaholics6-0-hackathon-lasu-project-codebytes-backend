# RT-CX Platform 

Real-time Customer Experience Platform Frontend

---

## Team Members - Codebytes

- [Tijani Sheu Ahmad](https://github.com/ahmaddev-codes)
- [Burhan Idowu Babatunde](https://github.com/oreiwatsuyoi)
- [Elijah Samuel Opeyemi](https://github.com/Samuel0008)

## 🚀 Live Demo

- **Live Application**: [Your deployed frontend URL - Vercel/Netlify]
- **Backend API**: https://rt-cx-platform-backend-production.up.railway.app/
- **API Documentation**: https://rt-cx-platform-backend-production.up.railway.app/api-docs
- **Backend Repository**: https://github.com/ahmaddev-codes/rt-cx-platform-backend
- **Recorded Demo**: [Link to your Loom demo video]

## 🎯 The Problem

**How might we** help businesses capture and respond to customer feedback in real-time to improve customer satisfaction and retention?

Traditional customer feedback systems are slow, fragmented across multiple channels, and lack real-time insights. By the time businesses analyze feedback, customer sentiment issues have already escalated, leading to churn and lost revenue.

## ✨ Our Solution

**RT-CX Platform** is an intelligent real-time customer experience monitoring system that captures feedback from multiple channels (in-app surveys, chatbot logs, voice transcripts, social media), analyzes sentiment using AI-powered natural language processing, and delivers actionable insights through live dashboards.

Key features:

- **Real-time sentiment analysis** with emotion detection and topic modeling
- **Multi-channel feedback aggregation** from various customer touchpoints
- **Live dashboard** with WebSocket-powered updates
- **Smart alerts** for sentiment spikes and critical feedback
- **Role-based access control** for teams (Admin, Manager, Agent)

## 🛠️ Tech Stack

- **Frontend**: [React/Next.js, Tailwind CSS, TypeScript]
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache/Queue**: Redis + BullMQ for background jobs
- **Real-time**: Socket.IO for WebSocket communication
- **AI/APIs**: [Google Gemini API / OpenAI / Hugging Face for sentiment analysis]
- **Auth**: JWT + bcrypt
- **Deployment**: [Railway / Vercel / Fly.io]

---

## Features

- **Multi-Channel Feedback Collection**: In-app surveys, chatbot logs, voice transcripts, social media
- **AI-Powered Sentiment Analysis**: Emotion detection, topic modeling, trend analysis
- **Real-Time Dashboard**: WebSocket-powered live updates
- **Smart Alerts**: Automated notifications for sentiment spikes
- **Role-Based Access Control**: Admin, Manager, and Agent roles
- **RESTful API**: Versioned, documented endpoints

## ⚙️ How to Set Up and Run Locally

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- pnpm (package manager)

### Installation Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Wema-Hackaholics-Hackathon/wema-hackaholics6-0-hackathon-lasu-project-codebytes-backend.git
   cd wema-hackaholics6-0-hackathon-lasu-project-codebytes-backend
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Set up environment variables**:

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your configuration
   # Add your database URL, Redis URL, JWT secret, and AI API keys
   ```

4. **Set up the database**:

   ```bash
   # Run migrations
   pnpm db:migrate

   # Generate Prisma client
   pnpm db:generate

   # Seed the database with sample data
   pnpm db:seed
   ```

5. **Start the development server**:

   ```bash
   pnpm dev
   ```

   Server will start at `http://localhost:4000`

6. **Access API Documentation**:
   - Swagger UI: `http://localhost:4000/api-docs`
   - Health Check: `http://localhost:4000/health`

### Docker Setup

```powershell
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## Project Structure

```
src/
├── config/           # Configuration (env, constants, swagger)
├── controllers/      # Route handlers
├── services/         # Business logic
├── repositories/     # Data access layer
├── middleware/       # Express middleware
├── routes/           # API routes
├── types/            # TypeScript types
├── utils/            # Helper functions
├── workers/          # Background jobs
├── app.ts            # Express app setup
└── server.ts         # Entry point

prisma/
├── schema.prisma     # Database schema
├── migrations/       # Database migrations
└── seed.ts           # Seed data
```

## API Documentation

Once the server is running, visit:

- Swagger UI: `http://localhost:4000/api-docs`
- Health Check: `http://localhost:4000/health`

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm format` - Format code
- `pnpm db:migrate` - Run database migrations
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:seed` - Seed database
- `pnpm db:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for all available configuration options.

## Testing

```powershell
# Run all tests
pnpm test

# Run tests in CI mode
pnpm test:ci

# Run specific test file
pnpm test src/services/sentiment.test.ts
```

## Deployment

See [docs/technical/deployment.md](docs/technical/deployment.md) for deployment guides for:

- Railway
- Fly.io
- AWS ECS
- Google Cloud Run

## Documentation

- [Architecture](docs/technical/architecture.md)
- [API Contracts](docs/technical/api-contracts.md)
- [Backend Stack](docs/technical/backend-stack.md)
- [Local Development](docs/technical/local-development.md)

## License

ISC
