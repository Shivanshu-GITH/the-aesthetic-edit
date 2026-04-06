import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import process from 'node:process';

export const adminLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminPassword = req.get('ADMIN_PASSWORD');
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};
