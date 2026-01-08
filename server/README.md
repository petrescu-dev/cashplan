# Cashplan.io Backend Server

Backend server for the Cashplan.io budget planning application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for OAuth
   - Set a secure `SESSION_SECRET`
   - Configure other settings as needed

## Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on port 3001 (or the port specified in `.env`).

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

See [TESTING.md](TESTING.md) for detailed testing guide and best practices.

## Building

Build the TypeScript code:
```bash
npm run build
```

## Production

Run the production server:
```bash
npm start
```

## Project Structure

```
server/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── db/
│   │   ├── schema.sql        # Database schema
│   │   └── connection.ts     # SQLite connection
│   ├── models/
│   │   └── events.ts         # Event type definitions
│   ├── services/
│   │   └── calculator.ts     # Financial calculations
│   ├── routes/               # API routes (to be added)
│   │   ├── auth.ts
│   │   ├── plans.ts
│   │   └── events.ts
│   ├── middleware/
│   │   └── auth.ts           # Authentication middleware
│   └── utils/
│       └── userId.ts         # User ID utilities
├── data/                     # SQLite database files (auto-created)
├── dist/                     # Compiled JavaScript (auto-generated)
├── package.json
├── tsconfig.json
└── .env                      # Environment variables (create from .env.example)
```

## Features

- **Express Server**: RESTful API with TypeScript
- **SQLite Database**: Lightweight database with better-sqlite3
- **Google OAuth**: Authentication via Google SSO
- **Session Management**: Express sessions for auth state
- **Financial Calculator**: Complex financial calculations for various event types with plan-based start dates
- **CORS Support**: Configured for frontend integration
- **TypeScript**: Full type safety throughout the codebase
- **Database Migrations**: Automatic migration support for schema updates

## API Endpoints (Planned)

- `GET /api/health` - Health check endpoint
- `GET /api/plans` - List user's plans
- `POST /api/plans` - Create new plan
- `GET /api/plans/:id/events` - Get events for a plan
- `POST /api/plans/:id/events` - Create new event
- `PUT /api/plans/:id/events/:eventId` - Update event
- `DELETE /api/plans/:id/events/:eventId` - Delete event
- `GET /api/plans/:id/chart-data` - Get calculated liquidity/assets data
- `GET /auth/google` - Initiate Google SSO
- `GET /auth/google/callback` - Handle Google SSO callback
- `POST /auth/logout` - Logout
- `GET /api/user` - Get current user info

## Environment Variables

See `.env.example` for all available configuration options.

## Database

The SQLite database is automatically created and initialized on first run. The schema includes:

- `users` - Authenticated users (positive IDs)
- `plans` - User plans with start dates (supports both authenticated and unauthenticated users)
- `events` - Financial events (income, expense, mortgage, PCP, car loan, etc.)

### Plan Start Date

Each plan has a `start_date` field that determines the reference point for all financial calculations. The calculator uses this date as the baseline instead of the current date, allowing users to create plans for future scenarios or historical analysis.

## License

ISC

