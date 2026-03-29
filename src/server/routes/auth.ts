import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = express.Router();

// Signup
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    const id = uuidv4();
    // In a real app, hash the password! (using plain text for this rapid prototype)
    db.prepare('INSERT INTO users (id, name, email, password, provider) VALUES (?, ?, ?, ?, ?)').run(id, name, email, password, 'local');
    
    const user = { id, name, email, provider: 'local' };
    res.status(201).json({ success: true, data: { user } });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT id, name, email, password FROM users WHERE email = ?').get(email) as any;

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, data: { user: { ...userWithoutPassword, provider: 'local' } } });
});

// Google Login/Signup
router.post('/google', (req, res) => {
  const { name, email, id: googleId } = req.body;

  if (!email || !googleId) {
    return res.status(400).json({ success: false, error: 'Email and Google ID are required' });
  }

  try {
    // Check if user already exists
    let user = db.prepare('SELECT id, name, email, provider FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      // Create new user if they don't exist
      const id = `google-${googleId}`;
      db.prepare('INSERT INTO users (id, name, email, provider) VALUES (?, ?, ?, ?)').run(id, name, email, 'google');
      user = { id, name, email, provider: 'google' };
    }

    res.json({ success: true, data: { user } });
  } catch (error: any) {
    console.error('Google auth error details:', error);
    res.status(500).json({ success: false, error: 'Google authentication failed' });
  }
});

// Get current user (simple mock)
router.get('/me', (req, res) => {
  const userId = req.headers['user-id'] as string;
  if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

  const user = db.prepare('SELECT id, name, email, provider FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  res.json({ success: true, data: { user } });
});

export default router;
