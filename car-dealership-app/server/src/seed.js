import { ensureAdminUser } from './auth.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './config.js';
import { getDb, migrate } from './db.js';
import { v4 as uuid } from 'uuid';

async function seed() {
  await migrate();
  const admin = await ensureAdminUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const db = await getDb();

  const existing = await db.get('SELECT id FROM cars LIMIT 1');
  if (existing) {
    console.log('Cars already exist, skipping seed.');
    return;
  }

  const carId = uuid();
  const now = new Date().toISOString();
  await db.run(
    `INSERT INTO cars (id, title, make, model, variant, price_sek, price_ex_vat_sek, mileage_km, model_year, body_type, drivetrain, fuel, transmission, power_hp, color, registration_number, location, dealer_name, is_published, description, created_at, updated_at, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    carId,
    'Volkswagen T-Cross 1.0 TSI',
    'Volkswagen',
    'T-Cross',
    '1.0 TSI',
    204800,
    163840,
    1756,
    2023,
    'SUV',
    'FWD',
    'Petrol',
    'Manual',
    95,
    'Grey',
    'OSG06M',
    'Österåker',
    'Aftén Bil VW Åkersberga Begagnat',
    1,
    'A compact and stylish SUV with low mileage and economical ownership. The Volkswagen T-Cross 1.0 TSI offers a smooth driving experience, modern technology, and reliable performance – perfect for everyday driving.',
    now,
    now,
    admin.id,
    admin.id
  );

  const equipment = [
    '12V socket',
    'ABS brakes',
    'Air conditioning',
    'Driver airbag',
    'Passenger airbag (deactivatable)',
    'Anti-skid (ESP)',
    'Auto brake',
    'Auto-dimming rear mirror',
    'Hill-start assist',
    'Child locks',
    'Bluetooth (handsfree)',
    'Brake assist',
    'Central locking (remote)',
    'Split-folding rear seat',
    'Digital radio (DAB)'
  ];

  const images = [
    { url: '/public/cars/tcross-1.jpg', alt: 'Front view of Volkswagen T-Cross' },
    { url: '/public/cars/tcross-2.jpg', alt: 'Interior of Volkswagen T-Cross' },
    { url: '/public/cars/tcross-3.jpg', alt: 'Rear view of Volkswagen T-Cross' }
  ];

  const equipmentStmt = await db.prepare('INSERT INTO car_equipment (car_id, item) VALUES (?, ?)');
  for (const item of equipment) {
    await equipmentStmt.run(carId, item);
  }
  await equipmentStmt.finalize();

  const imageStmt = await db.prepare('INSERT INTO car_images (car_id, url, alt, position) VALUES (?, ?, ?, ?)');
  let index = 0;
  for (const img of images) {
    await imageStmt.run(carId, img.url, img.alt, index++);
  }
  await imageStmt.finalize();

  await db.run(
    `INSERT INTO car_revisions (car_id, updated_by, updated_at, change_summary) VALUES (?, ?, ?, ?)`,
    carId,
    admin.id,
    now,
    'Initial seed data'
  );

  console.log('Seed completed.');
}

seed().then(() => process.exit(0));
