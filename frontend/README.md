# Cashplan.io Frontend

A budget planning web application built with React, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 + Material UI 7
- **Charts**: AG Charts Community 13
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

## Project Structure

```
src/
├── components/       # Reusable React components
│   └── forms/       # Event-specific form components
├── pages/           # Page components (Frontpage, PlanPage)
├── services/        # API client and services
│   └── api.ts      # Axios-based API client
├── types/           # TypeScript type definitions
│   └── index.ts    # Event, Plan, User types
├── utils/           # Utility functions
├── App.tsx          # Main app component with routing
└── main.tsx         # React entry point
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Features

- User authentication via Google SSO
- Plan management (create, view, edit plans)
- Financial event tracking (income, expenses, mortgages, PCP, car loans)
- Interactive charts showing liquidity and assets over time
- Responsive design for mobile and desktop

## API Integration

The frontend communicates with the backend API through the `services/api.ts` client, which handles:
- Plan CRUD operations
- Event management
- Chart data retrieval
- User authentication

## Development Notes

- All API calls use `withCredentials: true` for session management
- Type-safe API client with TypeScript interfaces
- Tailwind CSS v4 with PostCSS integration
- Material UI components for consistent design
