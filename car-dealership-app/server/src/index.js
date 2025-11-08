import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PORT, CSRF_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } from './config.js';
import { attachUser } from './middleware/authMiddleware.js';
import { csrfProtection } from './middleware/csrfMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import { ensureAdminUser } from './auth.js';
import { migrate } from './db.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

await migrate();
await ensureAdminUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(attachUser);
app.use(csrfProtection);

app.get('/api/csrf', (req, res) => {
  res.json({ token: CSRF_SECRET });
});

app.use('/uploads', express.static(uploadDir));
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
