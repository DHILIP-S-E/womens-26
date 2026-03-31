# Health Tracking Application - Backend

A production-ready health tracking backend built with Node.js, Express, TypeScript, and Prisma.

## Project Structure

```
src/
├── controllers/     # Route handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── index.ts        # Application entry point

prisma/
└── schema.prisma   # Database schema

dist/               # Compiled JavaScript output
```

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your database URL and other settings
```

3. Set up the database:
```bash
npm run prisma:migrate
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

### Production

Start the production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## API Endpoints

### Health Check
- `GET /health` - Server health status

Additional endpoints will be implemented in subsequent phases.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Development**: ts-node, nodemon

## Next Steps

1. Configure PostgreSQL database connection
2. Implement Prisma schema with all models
3. Create authentication services and endpoints
4. Implement health tracking services
5. Add API validation and error handling
