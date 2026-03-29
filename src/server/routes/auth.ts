import express, { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit'; 
import { z } from 'zod'; 
import db from '../db.js';

const loginLimit = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { success: false, error: 'Too many login attempts, please try again in 15 minutes' }, 
  standardHeaders: true, 
  legacyHeaders: false, 
}); 

const signupSchema = z.object({ 
  name: z.string().min(2).max(100), 
  email: z.string().email().max(200), 
  password: z.string().min(8).max(100), 
}); 

const loginSchema = z.object({ 
  email: z.string().email(), 
  password: z.string().min(1), 
}); 

const router = express.Router();

function issueToken(res: Response, user: { id: string; name: string; email: string; provider: string }) { 
  const token = jwt.sign( 
    { id: user.id, name: user.name, email: user.email }, 
    process.env.JWT_SECRET!, 
    { expiresIn: '7d' } 
  ); 
  res.cookie('ae_token', token, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  }); 
} 

// Signup
router.post('/signup', loginLimit, async (req, res) => {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues[0].message });
  }
  const { name, email, password } = result.data;

  try {
    const id = uuidv4();
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    db.prepare('INSERT INTO users (id, name, email, password, provider) VALUES (?, ?, ?, ?, ?)').run(id, name, email, hashedPassword, 'local');
    
    const user = { id, name, email, provider: 'local' };
    issueToken(res, user);
    res.status(201).json({ success: true, data: { user } });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code && error.code.includes('SQLITE_CONSTRAINT')) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// Login
router.post('/login', loginLimit, async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues[0].message });
  }
  const { email, password } = result.data;

  const user = db.prepare('SELECT id, name, email, password FROM users WHERE email = ?').get(email) as any;

  const isValid = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !isValid) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const { password: _, ...userWithoutPassword } = user;
  const userToIssue = { ...userWithoutPassword, provider: 'local' };
  issueToken(res, userToIssue);
  res.json({ success: true, data: { user: userToIssue } });
});

// Google Login/Signup
router.post('/google', (req, res) => { 
  return res.status(501).json({ 
    success: false, 
    error: 'Google authentication is not yet configured.' 
  }); 
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('ae_token');
  res.json({ success: true });
});

// Get current user
router.get('/me', (req, res) => {
  const token = (req as any).cookies?.ae_token; 
  if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' }); 
  try { 
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any; 
    const user = db.prepare('SELECT id, name, email, provider FROM users WHERE id = ?').get(payload.id); 
    if (!user) return res.status(404).json({ success: false, error: 'User not found' }); 
    res.json({ success: true, data: { user } }); 
  } catch { 
    res.status(401).json({ success: false, error: 'Invalid session' }); 
  } 
});

export default router;
