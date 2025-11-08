import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { applyAuthCookie, clearAuthCookie, createToken, findUserByEmail, verifyToken } from '../auth.js';
import { SESSION_COOKIE_NAME } from '../config.js';

const router = Router();

router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isString().notEmpty().withMessage('Password required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);
    applyAuthCookie(res, token);
    return res.json({ id: user.id, email: user.email, role: user.role });
  }
);

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return res.status(200).json(null);
  }
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.json(null);
  }
  const { id, email, role, exp } = payload;
  return res.json({ id, email, role, exp });
});

export default router;
