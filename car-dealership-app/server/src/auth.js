import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { JWT_SECRET, SESSION_COOKIE_NAME } from './config.js';
import { getDb } from './db.js';

const TOKEN_EXPIRY = '12h';

export function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function findUserByEmail(email) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase());
}

export async function createUser({ email, password, role = 'admin' }) {
  const db = await getDb();
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuid();
  await db.run(
    `INSERT INTO users (id, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    email.toLowerCase(),
    passwordHash,
    role,
    now,
    now
  );
  return { id, email: email.toLowerCase(), role, created_at: now, updated_at: now };
}

export async function ensureAdminUser({ email, password }) {
  const existing = await findUserByEmail(email);
  if (!existing) {
    return createUser({ email, password, role: 'admin' });
  }
  return existing;
}

export function applyAuthCookie(res, token) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME);
}
