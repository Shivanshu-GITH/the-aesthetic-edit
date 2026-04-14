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

const adminLoginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many admin login attempts, please try again in 15 minutes' },
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
const firebaseExchangeSchema = z.object({
  idToken: z.string().min(20),
});

const adminLoginSchema = z.object({
  password: z.string().min(1).max(200),
});

const router = express.Router(); 

const BCRYPT_HASH_PREFIX = /^\$2[aby]\$\d{2}\$/;

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
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  }); 
} 

const clearCookieOptions = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

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

router.post('/firebase/exchange', loginLimit, async (req, res) => {
  const validation = firebaseExchangeSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }

  const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!firebaseApiKey) {
    return res.status(500).json({ success: false, error: 'Firebase server API key is not configured' });
  }

  try {
    const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: validation.data.idToken }),
    });
    const verifyData = await verifyRes.json();

    const firebaseUser = verifyData?.users?.[0];
    if (!verifyRes.ok || !firebaseUser?.email || !firebaseUser?.localId) {
      return res.status(401).json({ success: false, error: 'Invalid Firebase session' });
    }

    const email = String(firebaseUser.email).toLowerCase().trim();
    const displayName = (firebaseUser.displayName || email.split('@')[0] || 'User').trim().slice(0, 100);
    const photo = firebaseUser.photoUrl ? String(firebaseUser.photoUrl) : null;
    const providerIds: string[] = Array.isArray(firebaseUser.providerUserInfo)
      ? firebaseUser.providerUserInfo.map((p: any) => p?.providerId).filter(Boolean)
      : [];
    const provider = providerIds.includes('google.com') ? 'google' : 'local';

    const existingRows = await sql`SELECT id, name, email, provider FROM users WHERE email = ${email} LIMIT 1`;
    let userToIssue: { id: string; name: string; email: string; provider: string; uid?: string; photo?: string };

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      await sql`
        UPDATE users
        SET name = ${displayName}, provider = ${provider}
        WHERE id = ${existing.id}
      `;
      userToIssue = { id: existing.id, uid: firebaseUser.localId, name: displayName, email, provider, photo: photo || undefined };
    } else {
      const randomPassword = await bcrypt.hash(uuidv4(), 12);
      await sql`
        INSERT INTO users (id, name, email, password, provider)
        VALUES (${firebaseUser.localId}, ${displayName}, ${email}, ${randomPassword}, ${provider})
      `;
      userToIssue = { id: firebaseUser.localId, uid: firebaseUser.localId, name: displayName, email, provider, photo: photo || undefined };
    }

    issueToken(res, userToIssue);
    return res.json({ success: true, data: { user: userToIssue } });
  } catch (error) {
    console.error('Firebase exchange error:', error);
    return res.status(500).json({ success: false, error: 'Failed to exchange Firebase session' });
  }
});

router.post('/logout', (req, res) => { 
  res.clearCookie('ae_token', clearCookieOptions); 
  res.json({ success: true }); 
}); 

router.post('/admin/login', adminLoginLimit, async (req, res) => {
  const validation = adminLoginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, error: validation.error.issues[0].message });
  }
  const { password } = validation.data;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const adminPasswordLegacy = process.env.ADMIN_PASSWORD?.trim();
  const allowLegacyAdminPassword = process.env.ALLOW_LEGACY_ADMIN_PASSWORD === 'true' || process.env.NODE_ENV !== 'production';

  if (!adminPasswordHash && !(allowLegacyAdminPassword && adminPasswordLegacy)) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' }); 
  }

  let isAdminValid = false;
  if (adminPasswordHash && BCRYPT_HASH_PREFIX.test(adminPasswordHash)) {
    isAdminValid = await bcrypt.compare(password, adminPasswordHash);
  } else if (allowLegacyAdminPassword && adminPasswordLegacy) {
    // Backward compatibility toggle for old deployments.
    isAdminValid = password.trim() === adminPasswordLegacy;
  }

  if (!isAdminValid) {
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
    path: '/',
    maxAge: 8 * 60 * 60 * 1000, 
  }); 
  res.json({ success: true }); 
}); 

router.post('/admin/logout', (req, res) => { 
  res.clearCookie('ae_admin_token', { ...clearCookieOptions, sameSite: 'strict' }); 
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
