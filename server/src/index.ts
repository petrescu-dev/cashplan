import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes will be added here
// app.use('/auth', authRoutes);
// app.use('/api/plans', plansRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from frontend build (in production)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback to index.html for SPA routing
app.get('*', (_req: Request, res: Response) => {
  console.log('Serving index.html from:', frontendDistPath);
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

