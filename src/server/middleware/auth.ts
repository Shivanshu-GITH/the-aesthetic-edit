import { Request, Response, NextFunction } from 'express'; 
import jwt from 'jsonwebtoken'; 

export interface AuthenticatedRequest extends Request { 
  userId?: string; 
  userName?: string; 
  userEmail?: string; 
} 

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) { 
  const token = req.cookies?.ae_token; 
  if (!token) { 
    return res.status(401).json({ success: false, error: 'Not authenticated' }); 
  } 
  try { 
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any; 
    req.userId = payload.id; 
    req.userName = payload.name; 
    req.userEmail = payload.email; 
    next(); 
  } catch { 
    return res.status(401).json({ success: false, error: 'Invalid or expired session' }); 
  } 
} 

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) { 
  const token = req.cookies?.ae_token; 
  if (token) { 
    try { 
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any; 
      req.userId = payload.id; 
      req.userName = payload.name; 
      req.userEmail = payload.email; 
    } catch { 
      // ignore — unauthenticated is fine for optional 
    } 
  } 
  next(); 
} 
