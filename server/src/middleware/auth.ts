import { Request, Response, NextFunction } from 'express';
import { generateUnauthenticatedUserId } from '../utils/userId';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
    interface User {
      id: number;
      email: string;
    }
  }
}

/**
 * Middleware to ensure every request has a userId
 * - For authenticated users: use user.id from session
 * - For unauthenticated users: generate/retrieve negative ID from session
 */
export const ensureUserId = (req: Request, _res: Response, next: NextFunction) => {
  // Check if user is authenticated via Passport
  if (req.isAuthenticated() && req.user) {
    req.userId = req.user.id;
    return next();
  }

  // For unauthenticated users, generate or retrieve negative ID from session
  if (!req.session.userId) {
    req.session.userId = generateUnauthenticatedUserId();
  }

  req.userId = req.session.userId;
  return next();
};

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.userId = req.user.id;
  return next();
};

/**
 * Middleware to check if user is authenticated (but don't require it)
 * Sets req.userId if authenticated
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    req.userId = req.user.id;
  }
  return next();
};

// Extend session to include userId for unauthenticated users
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

