import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { getDb } from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

const sortableFields = {
  newest: 'created_at DESC',
  priceAsc: 'price_sek ASC',
  priceDesc: 'price_sek DESC',
  mileageAsc: 'mileage_km ASC',
  mileageDesc: 'mileage_km DESC',
  modelYearDesc: 'model_year DESC'
};

const validationChain = [
  body('title').isString().notEmpty(),
  body('make').isString().notEmpty(),
  body('model').isString().notEmpty(),
  body('variant').optional({ nullable: true }).isString(),
  body('priceSek').isNumeric(),
  body('priceExVatSek').optional({ nullable: true }).isNumeric(),
  body('mileageKm').optional({ nullable: true }).isNumeric(),
  body('modelYear').optional({ nullable: true }).isNumeric(),
  body('bodyType').optional({ nullable: true }).isString(),
  body('drivetrain').optional({ nullable: true }).isString(),
  body('fuel').optional({ nullable: true }).isString(),
  body('transmission').optional({ nullable: true }).isString(),
  body('powerHp').optional({ nullable: true }).isNumeric(),
  body('color').optional({ nullable: true }).isString(),
  body('registrationNumber').optional({ nullable: true }).isString(),
  body('location').optional({ nullable: true }).isString(),
  body('dealerName').optional({ nullable: true }).isString(),
  body('isPublished').isBoolean(),
  body('description').optional({ nullable: true }).isString(),
  body('equipment').isArray(),
  body('images').isArray()
];

router.get(
  '/',
  [
    query('search').optional().isString(),
    query('priceMin').optional().isNumeric(),
    query('priceMax').optional().isNumeric(),
    query('mileageMin').optional().isNumeric(),
    query('mileageMax').optional().isNumeric(),
    query('modelYearMin').optional().isNumeric(),
    query('modelYearMax').optional().isNumeric(),
    query('fuel').optional().isString(),
    query('transmission').optional().isString(),
    query('drivetrain').optional().isString(),
    query('bodyType').optional().isString(),
    query('color').optional().isString(),
    query('powerMin').optional().isNumeric(),
    query('powerMax').optional().isNumeric(),
    query('make').optional().isString(),
    query('model').optional().isString(),
    query('sort').optional().isString(),
    query('page').optional().isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      search,
      priceMin,
      priceMax,
      mileageMin,
      mileageMax,
      modelYearMin,
      modelYearMax,
      fuel,
      transmission,
      drivetrain,
      bodyType,
      color,
      powerMin,
      powerMax,
      make,
      model,
      sort,
      page = 1
    } = req.query;

    const limit = 12;
    const offset = (Number(page) - 1) * limit;

    const filters = [];
    const params = [];

    if (!req.user) {
      filters.push('is_published = 1');
    }

    if (search) {
      filters.push('(title LIKE ? OR make LIKE ? OR model LIKE ? OR variant LIKE ? OR description LIKE ?)');
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern, pattern);
    }
    if (priceMin) {
      filters.push('price_sek >= ?');
      params.push(Number(priceMin));
    }
    if (priceMax) {
      filters.push('price_sek <= ?');
      params.push(Number(priceMax));
    }
    if (mileageMin) {
      filters.push('mileage_km >= ?');
      params.push(Number(mileageMin));
    }
    if (mileageMax) {
      filters.push('mileage_km <= ?');
      params.push(Number(mileageMax));
    }
    if (modelYearMin) {
      filters.push('model_year >= ?');
      params.push(Number(modelYearMin));
    }
    if (modelYearMax) {
      filters.push('model_year <= ?');
      params.push(Number(modelYearMax));
    }
    if (fuel) {
      filters.push('fuel = ?');
      params.push(fuel);
    }
    if (transmission) {
      filters.push('transmission = ?');
      params.push(transmission);
    }
    if (drivetrain) {
      filters.push('drivetrain = ?');
      params.push(drivetrain);
    }
    if (bodyType) {
      filters.push('body_type = ?');
      params.push(bodyType);
    }
    if (color) {
      filters.push('color = ?');
      params.push(color);
    }
    if (powerMin) {
      filters.push('power_hp >= ?');
      params.push(Number(powerMin));
    }
    if (powerMax) {
      filters.push('power_hp <= ?');
      params.push(Number(powerMax));
    }
    if (make) {
      filters.push('make = ?');
      params.push(make);
    }
    if (model) {
      filters.push('model = ?');
      params.push(model);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const orderBy = sortableFields[sort] || sortableFields.newest;

    const db = await getDb();
    const cars = await db.all(
      `SELECT * FROM cars ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      ...params,
      limit,
      offset
    );
    const total = await db.get(`SELECT COUNT(*) as count FROM cars ${whereClause}`, ...params);

    const enriched = await Promise.all(cars.map((car) => enrichCar(db, car)));

    res.json({
      data: enriched,
      pagination: {
        total: total.count,
        page: Number(page),
        pageSize: limit,
        totalPages: Math.ceil(total.count / limit)
      }
    });
  }
);

router.get(
  '/:id',
  param('id').isString(),
  async (req, res) => {
    const db = await getDb();
    const car = await db.get('SELECT * FROM cars WHERE id = ?', req.params.id);
    if (!car || (!car.is_published && !req.user)) {
      return res.status(404).json({ message: 'Car not found' });
    }
    const enriched = await enrichCar(db, car);
    res.json(enriched);
  }
);

router.get('/:id/revisions', requireAuth, requireAdmin, param('id').isString(), async (req, res) => {
  const db = await getDb();
  const revisions = await db.all(
    `SELECT r.*, u.email as updated_by_email FROM car_revisions r LEFT JOIN users u ON u.id = r.updated_by WHERE car_id = ? ORDER BY updated_at DESC`,
    req.params.id
  );
  res.json(revisions);
});

router.post('/', requireAuth, requireAdmin, validationChain, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const id = uuid();
  const now = new Date().toISOString();
  const db = await getDb();
  const {
    title,
    make,
    model,
    variant,
    priceSek,
    priceExVatSek,
    mileageKm,
    modelYear,
    bodyType,
    drivetrain,
    fuel,
    transmission,
    powerHp,
    color,
    registrationNumber,
    location,
    dealerName,
    isPublished,
    description,
    equipment,
    images
  } = req.body;

  await db.run(
    `INSERT INTO cars (id, title, make, model, variant, price_sek, price_ex_vat_sek, mileage_km, model_year, body_type, drivetrain, fuel, transmission, power_hp, color, registration_number, location, dealer_name, is_published, description, created_at, updated_at, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    title,
    make,
    model,
    variant,
    priceSek,
    priceExVatSek ?? null,
    mileageKm ?? null,
    modelYear ?? null,
    bodyType ?? null,
    drivetrain ?? null,
    fuel ?? null,
    transmission ?? null,
    powerHp ?? null,
    color ?? null,
    registrationNumber ?? null,
    location ?? null,
    dealerName ?? null,
    isPublished ? 1 : 0,
    description ?? '',
    now,
    now,
    req.user.id,
    req.user.id
  );

  await saveEquipmentAndImages(db, id, equipment, images);
  await recordRevision(db, id, req.user.id, 'Created car');

  const created = await db.get('SELECT * FROM cars WHERE id = ?', id);
  res.status(201).json(await enrichCar(db, created));
});

router.put('/:id', requireAuth, requireAdmin, param('id').isString(), validationChain, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const db = await getDb();
  const car = await db.get('SELECT * FROM cars WHERE id = ?', req.params.id);
  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }

  const now = new Date().toISOString();
  const {
    title,
    make,
    model,
    variant,
    priceSek,
    priceExVatSek,
    mileageKm,
    modelYear,
    bodyType,
    drivetrain,
    fuel,
    transmission,
    powerHp,
    color,
    registrationNumber,
    location,
    dealerName,
    isPublished,
    description,
    equipment,
    images
  } = req.body;

  await db.run(
    `UPDATE cars SET title=?, make=?, model=?, variant=?, price_sek=?, price_ex_vat_sek=?, mileage_km=?, model_year=?, body_type=?, drivetrain=?, fuel=?, transmission=?, power_hp=?, color=?, registration_number=?, location=?, dealer_name=?, is_published=?, description=?, updated_at=?, updated_by=? WHERE id = ?`,
    title,
    make,
    model,
    variant,
    priceSek,
    priceExVatSek ?? null,
    mileageKm ?? null,
    modelYear ?? null,
    bodyType ?? null,
    drivetrain ?? null,
    fuel ?? null,
    transmission ?? null,
    powerHp ?? null,
    color ?? null,
    registrationNumber ?? null,
    location ?? null,
    dealerName ?? null,
    isPublished ? 1 : 0,
    description ?? '',
    now,
    req.user.id,
    req.params.id
  );

  await db.run('DELETE FROM car_equipment WHERE car_id = ?', req.params.id);
  await db.run('DELETE FROM car_images WHERE car_id = ?', req.params.id);
  await saveEquipmentAndImages(db, req.params.id, equipment, images);
  await recordRevision(db, req.params.id, req.user.id, 'Updated car');

  const updated = await db.get('SELECT * FROM cars WHERE id = ?', req.params.id);
  res.json(await enrichCar(db, updated));
});

router.delete('/:id', requireAuth, requireAdmin, param('id').isString(), async (req, res) => {
  const db = await getDb();
  const car = await db.get('SELECT * FROM cars WHERE id = ?', req.params.id);
  if (!car) {
    return res.status(404).json({ message: 'Car not found' });
  }
  await recordRevision(db, req.params.id, req.user.id, 'Deleted car');
  await db.run('DELETE FROM cars WHERE id = ?', req.params.id);
  res.status(204).send();
});

router.post(
  '/:id/contact',
  param('id').isString(),
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('phone').optional({ nullable: true }).isString(),
  body('message').optional({ nullable: true }).isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const db = await getDb();
    const car = await db.get('SELECT * FROM cars WHERE id = ?', req.params.id);
    if (!car || (!car.is_published && !req.user)) {
      return res.status(404).json({ message: 'Car not found' });
    }
    const now = new Date().toISOString();
    const { name, email, phone, message } = req.body;
    await db.run(
      `INSERT INTO contact_requests (car_id, name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      req.params.id,
      name,
      email,
      phone ?? null,
      message ?? '',
      now
    );
    res.status(201).json({ success: true });
  }
);

async function saveEquipmentAndImages(db, carId, equipment = [], images = []) {
  const equipmentStmt = await db.prepare('INSERT INTO car_equipment (car_id, item) VALUES (?, ?)');
  for (const item of equipment) {
    await equipmentStmt.run(carId, item);
  }
  await equipmentStmt.finalize();

  const imageStmt = await db.prepare(
    'INSERT INTO car_images (car_id, url, alt, position) VALUES (?, ?, ?, ?)'
  );
  let index = 0;
  for (const img of images) {
    await imageStmt.run(carId, img.url, img.alt ?? '', index++);
  }
  await imageStmt.finalize();
}

async function enrichCar(db, car) {
  const equipment = await db.all('SELECT item FROM car_equipment WHERE car_id = ? ORDER BY item', car.id);
  const images = await db.all(
    'SELECT id, url, alt, position FROM car_images WHERE car_id = ? ORDER BY position ASC',
    car.id
  );
  const publishedAgo = dayjs(car.created_at);
  const isNewArrival = dayjs().diff(publishedAgo, 'day') <= 14;
  return {
    id: car.id,
    title: car.title,
    make: car.make,
    model: car.model,
    variant: car.variant,
    priceSek: car.price_sek,
    priceExVatSek: car.price_ex_vat_sek,
    mileageKm: car.mileage_km,
    modelYear: car.model_year,
    bodyType: car.body_type,
    drivetrain: car.drivetrain,
    fuel: car.fuel,
    transmission: car.transmission,
    powerHp: car.power_hp,
    color: car.color,
    registrationNumber: car.registration_number,
    location: car.location,
    dealerName: car.dealer_name,
    isPublished: Boolean(car.is_published),
    description: car.description,
    createdAt: car.created_at,
    updatedAt: car.updated_at,
    createdBy: car.created_by,
    updatedBy: car.updated_by,
    equipment: equipment.map((row) => row.item),
    images: images.map((img) => ({ id: img.id, url: img.url, alt: img.alt, position: img.position })),
    badges: {
      newArrival: isNewArrival
    }
  };
}

async function recordRevision(db, carId, userId, changeSummary) {
  await db.run(
    `INSERT INTO car_revisions (car_id, updated_by, updated_at, change_summary) VALUES (?, ?, ?, ?)`,
    carId,
    userId,
    new Date().toISOString(),
    changeSummary
  );
}

export default router;
