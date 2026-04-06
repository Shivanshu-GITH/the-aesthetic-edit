import express, { Response } from 'express'; 
import { v4 as uuidv4 } from 'uuid'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import { rateLimit } from 'express-rate-limit'; 
import { z } from 'zod'; 
import sql from '../db.js'; 

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

router.post('/signup', loginLimit, async (req, res) => { 
  const result = signupSchema.safeParse(req.body); 
  if (!result.success) { 
    return res.status(400).json({ success: false, error: result.error.issues[0].message }); 
  } 
  const { name, email, password } = result.data; 
  try { 
    const id = uuidv4(); 
    const hashedPassword = await bcrypt.hash(password, 12); 
    await sql`INSERT INTO users (id, name, email, password, provider) VALUES (${id}, ${name}, ${email}, ${hashedPassword}, 'local')`; 
    const user = { id, name, email, provider: 'local' }; 
    issueToken(res, user); 
    res.status(201).json({ success: true, data: { user } }); 
  } catch (error: any) { 
    console.error('Signup error:', error); 
    if (error.code === '23505') { 
      return res.status(400).json({ success: false, error: 'Email already exists' }); 
    } 
    res.status(500).json({ success: false, error: 'Failed to create user' }); 
  } 
}); 

router.post('/login', loginLimit, async (req, res) => { 
  const result = loginSchema.safeParse(req.body); 
  if (!result.success) { 
    return res.status(400).json({ success: false, error: result.error.issues[0].message }); 
  } 
  const { email, password } = result.data; 
  try { 
    const rows = await sql`SELECT id, name, email, password FROM users WHERE email = ${email}`; 
    const user = rows[0]; 
    const isValid = user ? await bcrypt.compare(password, user.password) : false; 
    if (!user || !isValid) { 
      return res.status(401).json({ success: false, error: 'Invalid email or password' }); 
    } 
    const { password: _, ...userWithoutPassword } = user; 
    const userToIssue = { id: user.id, name: user.name, email: user.email, provider: 'local' }; 
    issueToken(res, userToIssue); 
    res.json({ success: true, data: { user: userToIssue } }); 
  } catch (error: any) { 
    console.error('Login error:', error); 
    res.status(500).json({ success: false, error: 'Login failed' }); 
  } 
}); 

router.post('/google', (req, res) => { 
  return res.status(501).json({ success: false, error: 'Google authentication is not yet configured.' }); 
}); 

router.post('/logout', (req, res) => { 
  res.clearCookie('ae_token'); 
  res.json({ success: true }); 
}); 

router.post('/admin/login', loginLimit, async (req, res) => { 
  const { password } = req.body; 
  if (!password || password !== process.env.ADMIN_PASSWORD) { 
    return res.status(401).json({ success: false, error: 'Invalid credentials' }); 
  } 
  const token = jwt.sign( 
    { role: 'admin', id: 'admin' }, 
    process.env.JWT_SECRET!, 
    { expiresIn: '8h' } 
  ); 
  res.cookie('ae_admin_token', token, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict', 
    maxAge: 8 * 60 * 60 * 1000, 
  }); 
  res.json({ success: true }); 
}); 

router.post('/admin/logout', (req, res) => { 
  res.clearCookie('ae_admin_token'); 
  res.json({ success: true }); 
}); 

router.get('/admin/me', async (req, res) => {
  const token = (req as any).cookies?.ae_admin_token;
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (payload.role !== 'admin') throw new Error('Not admin');
    res.json({ success: true, data: { role: 'admin' } });
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
});

router.get('/me', async (req, res) => { 
  const token = (req as any).cookies?.ae_token; 
  if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' }); 
  try { 
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any; 
    const rows = await sql`SELECT id, name, email, provider FROM users WHERE id = ${payload.id}`; 
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' }); 
    res.json({ success: true, data: { user: rows[0] } }); 
  } catch { 
    res.status(401).json({ success: false, error: 'Invalid session' }); 
  } 
}); 

export default router; 
