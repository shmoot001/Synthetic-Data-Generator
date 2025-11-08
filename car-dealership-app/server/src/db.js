import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPromise = open({
  filename: path.join(__dirname, '..', 'data', 'cars.db'),
  driver: sqlite3.Database
});

export async function getDb() {
  const db = await dbPromise;
  await db.exec('PRAGMA foreign_keys = ON');
  return db;
}

export async function migrate() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      variant TEXT,
      price_sek INTEGER NOT NULL,
      price_ex_vat_sek INTEGER,
      mileage_km INTEGER,
      model_year INTEGER,
      body_type TEXT,
      drivetrain TEXT,
      fuel TEXT,
      transmission TEXT,
      power_hp INTEGER,
      color TEXT,
      registration_number TEXT,
      location TEXT,
      dealer_name TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_by TEXT,
      updated_by TEXT,
      FOREIGN KEY(created_by) REFERENCES users(id),
      FOREIGN KEY(updated_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS car_equipment (
      car_id TEXT NOT NULL,
      item TEXT NOT NULL,
      PRIMARY KEY (car_id, item),
      FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS car_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id TEXT NOT NULL,
      url TEXT NOT NULL,
      alt TEXT,
      position INTEGER DEFAULT 0,
      FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS car_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT NOT NULL,
      change_summary TEXT,
      FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
    );
  `);
}
