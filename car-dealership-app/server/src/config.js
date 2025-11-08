import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'car_dealer_token';
export const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123';
