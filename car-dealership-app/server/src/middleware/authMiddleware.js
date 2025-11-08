import { SESSION_COOKIE_NAME } from '../config.js';
import { verifyToken } from '../auth.js';

export function requireAuth(req, res, next) {
  const token = req.cookies[SESSION_COOKIE_NAME];
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.user = payload;
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

export function attachUser(req, res, next) {
  const token = req.cookies[SESSION_COOKIE_NAME];
  const payload = token ? verifyToken(token) : null;
  if (payload) {
    req.user = payload;
  }
  next();
}
