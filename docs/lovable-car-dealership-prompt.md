# 🚗 Lovable Prompt – Car Dealership Website

Build a **modern full-stack web application** for a **car dealership** that sells used cars in Sweden.

---

> **Implementation note:** Den färdiga implementationen finns i [`car-dealership-app/`](../car-dealership-app/) och matchar specifikationen nedan.

## 🎯 Goals & Overview

* The app has **two main routes**:
  * `/` → Public site showing all cars for sale.
  * `/admin` → Admin dashboard with login, where admins can add, edit, and delete cars and manage their details.
* Include a **sample seed car** (based on the Blocket ad below).
* All text, currency, and date formats should be localized for **Sweden (SEK, YYYY-MM-DD)**.

---

## 🌐 Public Website Features

### Routes

* `/` → Lists all available cars.
* `/cars/:id` → Displays full details for one car.

### Functionality

* Responsive design (mobile-first).
* Car cards grid with title, price, mileage, year, and fuel type.
* Filtering, searching, and sorting:
  * **Filters:** price range, mileage, year, fuel type, gearbox, drivetrain, body type, color, horsepower.
  * **Sorting:** newest first, lowest price, highest price, lowest mileage, newest model year.
* Pagination with 12 cars per page.
* Query parameters stored in the URL.
* Car detail page includes:
  * Photo gallery with thumbnails.
  * Technical specifications.
  * Equipment/features list.
  * Description text.
  * Contact form (name, email, phone, message).
  * “Add to favorites” (local storage).
  * “Compare” up to 3 cars.
  * “Share” link.
  * “Related cars” section (same make or body type).

---

## 🔐 Admin Portal

### Route

* `/admin` with email + password login.

### Features

* Manage (CRUD) all car entries.
* Add and edit:
  * Basic info (make, model, variant, title, price, year, etc.)
  * Technical specifications.
  * Equipment list (multiple checkboxes).
  * Upload multiple car images (drag & drop).
  * Rich text description editor (Markdown supported).
  * Toggle “Published” status.
* Data validation for all fields.
* Revisions log (updated by / updated at).
* Only authenticated users with `admin` role can access `/admin`.
* Logout functionality.

---

## 🧠 Data Model – `Car`

Each car should include the following fields (extend if needed):

| Field                    | Type              | Example / Description                            |
| ------------------------ | ----------------- | ------------------------------------------------ |
| `id`                     | UUID              | Unique identifier                                |
| `title`                  | string            | “Volkswagen T-Cross 1.0 TSI”                     |
| `make`                   | string            | “Volkswagen”                                     |
| `model`                  | string            | “T-Cross”                                        |
| `variant`                | string            | “1.0 TSI”                                        |
| `priceSek`               | number            | 204800                                           |
| `priceExVatSek`          | number (nullable) | 163840                                           |
| `mileageKm`              | number            | 1756                                             |
| `modelYear`              | number            | 2023                                             |
| `bodyType`               | enum              | SUV, Sedan, Hatchback, Coupe, etc.               |
| `drivetrain`             | enum              | FWD, RWD, AWD                                    |
| `fuel`                   | enum              | Petrol, Diesel, Hybrid, Plug-in Hybrid, Electric |
| `transmission`           | enum              | Manual, Automatic                                |
| `powerHp`                | number            | 95                                               |
| `color`                  | string            | “Grey”                                           |
| `registrationNumber`     | string            | “OSG06M”                                         |
| `location`               | string            | “Österåker”                                      |
| `dealerName`             | string            | “Aftén Bil VW Åkersberga Begagnat”               |
| `isPublished`            | boolean           | true                                             |
| `description`            | string (Markdown) | Text description of the car                      |
| `equipment`              | string[]          | List of features (see below)                     |
| `images`                 | [{ url, alt }]    | Car images                                       |
| `createdAt`, `updatedAt` | datetime          | ISO format                                       |
| `createdBy`, `updatedBy` | string            | user ID or email                                 |

---

## 🧩 API Endpoints (example)

| Method                 | Endpoint                           | Description |
| ---------------------- | ---------------------------------- | ----------- |
| `GET /api/cars`        | List all cars (with query filters) |             |
| `GET /api/cars/:id`    | Get car details                    |             |
| `POST /api/cars`       | Add new car (admin only)           |             |
| `PUT /api/cars/:id`    | Update car (admin only)            |             |
| `DELETE /api/cars/:id` | Delete car (admin only)            |             |

---

## 🧾 Example Seed Car (based on Blocket ad)

Use this as initial data in the database when the app starts.

**Car example:**

* `title`: Volkswagen T-Cross 1.0 TSI
* `make`: Volkswagen
* `model`: T-Cross
* `variant`: 1.0 TSI
* `priceSek`: 204800
* `priceExVatSek`: 163840
* `mileageKm`: 1756
* `modelYear`: 2023
* `bodyType`: SUV
* `drivetrain`: FWD
* `fuel`: Petrol
* `transmission`: Manual
* `powerHp`: 95
* `color`: Grey
* `registrationNumber`: OSG06M
* `location`: Österåker
* `dealerName`: Aftén Bil VW Åkersberga Begagnat
* `isPublished`: true
* `description`:
  “A compact and stylish SUV with low mileage and economical ownership. The Volkswagen T-Cross 1.0 TSI offers a smooth driving experience, modern technology, and reliable performance – perfect for everyday driving.”
* `equipment`:
  * 12V socket
  * ABS brakes
  * Air conditioning
  * Driver airbag
  * Passenger airbag (deactivatable)
  * Anti-skid (ESP)
  * Auto brake
  * Auto-dimming rear mirror
  * Hill-start assist
  * Child locks
  * Bluetooth (handsfree)
  * Brake assist
  * Central locking (remote)
  * Split-folding rear seat
  * Digital radio (DAB)
* `images`: placeholder URLs like `/public/cars/tcross-1.jpg`, `/tcross-2.jpg`, etc.
* `createdAt` / `updatedAt`: now
* `createdBy`: “seed”

---

## 💅 UX & UI Details

* Clean, modern design (use Tailwind, Bootstrap, or Material UI).
* `/` homepage:
  * Hero section with dealership name and “View Cars” button.
  * Grid of car cards with main image, price, and badges (e.g., “New Arrival” if created < 14 days).
* `/cars/:id` detail view:
  * Tabs for “Details”, “Equipment”, “Contact”.
  * Contact form with backend endpoint (no real email sending needed).
* `/admin`:
  * Simple table of cars with edit/delete buttons.
  * Form with validation and upload preview.
  * Toggle publish status.
* Show loading states and empty states (friendly messages like “No cars match your filters”).

---

## 🛠️ Technical Requirements

* Full CRUD with persistent database (SQLite, PostgreSQL, or MongoDB).
* Authentication using sessions or JWT (secure cookies).
* Secure password hashing.
* CORS and CSRF protection.
* Environment variables for secrets.
* README with setup instructions (run locally, seed, build, deploy).
* Optional: simple finance calculator (loan duration, interest rate → monthly cost).

---

## ✅ Acceptance Criteria

1. Public site lists cars with filtering, searching, and sorting.
2. Car detail page shows all info + contact form.
3. Admin can log in and fully manage car inventory.
4. At least one car (Volkswagen T-Cross) appears in the seeded database.
5. Fully responsive, fast, localized, documented, and SEO-friendly.

---

**Source of specifications:**

Seed data based on the Blocket ad: [Volkswagen T-Cross 1.0 TSI — Blocket listing](https://www.blocket.se/annons/stockholm/volkswagen_t_cross_1_0_tsi_billigt_agande_lagmil_pdc/1002272986)

---

Would you like a **shorter version** (for Lovable’s “Quick Prompt” input) or keep this **full detailed prompt** (for maximum feature generation)?
