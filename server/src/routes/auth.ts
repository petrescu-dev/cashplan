import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from '../db/connection';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * Initialize Passport Google OAuth Strategy
 * Must be called after environment variables are loaded
 */
export const initializePassport = () => {
  // Configure Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
      },
      (_accessToken, _refreshToken, profile, done) => {
        try {
          console.log('GoogleStrategy profile:', profile);
          // Extract email from profile
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }
          
          // Check if user exists
          const checkStmt = db.prepare('SELECT * FROM users WHERE email = ?');
          let user = checkStmt.get(email) as { id: number; email: string } | undefined;
          
          if (!user) {
            // Create new user
            const insertStmt = db.prepare('INSERT INTO users (email) VALUES (?)');
            const result = insertStmt.run(email);
            
            user = {
              id: result.lastInsertRowid as number,
              email,
            };
          }
          
          return done(null, user);
        } catch (error) {
          console.error('Error in GoogleStrategy:', error);
          return done(error);
        }
      }
    )
  );
  
  // Serialize user for session
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser((id: number, done) => {
    try {
      const stmt = db.prepare('SELECT id, email FROM users WHERE id = ?');
      const user = stmt.get(id) as { id: number; email: string } | undefined;
      
      if (!user) {
        return done(new Error('User not found'));
      }
      
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
    
    console.log('✓ Google OAuth strategy initialized');
  } else {
    console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
  }
};

/**
 * GET /auth/google
 * Initiate Google SSO
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * GET /auth/google/callback
 * Handle Google SSO callback
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173',
  }),
  (_req: Request, res: Response): void => {
    // Successful authentication
    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  }
);

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', (req: Request, res: Response): void => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        res.status(500).json({ error: 'Failed to destroy session' });
        return;
      }
      
      res.json({ message: 'Logged out successfully' });
    });
  });
});

/**
 * GET /api/user
 * Get current user info (requires authentication)
 */
router.get('/user', optionalAuth, (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    return res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        isAuthenticated: true,
      },
    });
  }
  
  // Return unauthenticated user info
  return res.json({
    user: {
      id: req.session.userId || null,
      email: null,
      isAuthenticated: false,
    },
  });
});

export default router;

