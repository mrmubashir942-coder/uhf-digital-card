import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, StoredUser } from '../db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'uhf_solutions_jwt_secret_key_prod_minimum_32_characters_long';

export interface AuthenticatedRequest extends Request {
  user?: StoredUser;
}

export function generateToken(user: StoredUser): string {
  return jwt.sign(
    {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await db.findUserById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    if (user.status === 'INACTIVE') {
      res.status(403).json({ error: 'This employee account is deactivated. Contact administrator.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    return;
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access forbidden: Administrator privileges required.' });
    return;
  }
  next();
}
