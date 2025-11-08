import { CSRF_SECRET } from '../config.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export function csrfProtection(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }
  const headerToken = req.headers['x-csrf-token'];
  if (!headerToken || headerToken !== CSRF_SECRET) {
    return res.status(403).json({ message: 'CSRF token saknas eller är ogiltigt' });
  }
  return next();
}
