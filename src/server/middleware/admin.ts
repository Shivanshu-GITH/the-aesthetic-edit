import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

export const adminLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = (req as any).cookies?.ae_admin_token;
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (payload.role !== 'admin') throw new Error('Not admin');
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};
