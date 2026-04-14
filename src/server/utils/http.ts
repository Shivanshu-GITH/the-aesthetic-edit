import { Response } from 'express';
import { z } from 'zod';

export function sendInternalError(res: Response, fallbackMessage = 'Something went wrong') {
  return res.status(500).json({ success: false, error: fallbackMessage });
}

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
