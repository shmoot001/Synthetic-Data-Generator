# Car Dealership Application

A modern full-stack web application for managing and showcasing used cars in Sweden. The project delivers both a responsive public website and an authenticated admin portal, aligned with the Lovable car dealership specification.

## Features

### Public Website
- Home page with hero section, featured statistics, and filterable/sortable car grid
- Car detail view with image gallery, technical specifications, markdown description, equipment list, related cars, and contact form
- Favorites and compare drawers stored in local storage with up to three cars in comparison
- Share functionality, responsive layout, and Swedish localisation (SEK currency, sv-SE dates)

### Admin Portal
- Email/password authentication with secure cookies and hashed passwords
- Inventory dashboard with CRUD actions, publish toggles, and revision history
- Car editor supporting equipment checklist, markdown descriptions, and image gallery management

### API & Data Layer
- RESTful API powered by Express and SQLite with parameterised filtering, sorting, and pagination
- CSRF protection via double-submit token header, JWT-based authentication, and robust input validation
- Seed script provisioning an admin user and the Volkswagen T-Cross example vehicle

## Project Structure

```
car-dealership-app/
├── client/   # React + Vite frontend with Tailwind CSS
├── server/   # Express API + SQLite persistence
└── README.md
```

## Getting Started

1. **Install dependencies**
   ```bash
   cd car-dealership-app
   npm install
   ```

2. **Create environment configuration**
   ```bash
   cp server/.env.example server/.env
   # update secrets as needed
   ```

3. **Seed the database**
   ```bash
   npm run seed
   ```

4. **Run the development servers**
   ```bash
   npm run dev
   ```
   - API: http://localhost:4000
   - Web: http://localhost:3000

5. **Production build**
   ```bash
   npm run build
   ```
   The compiled frontend lives in `client/dist`. Serve it via your preferred static host and connect it to the Express API.

## Admin Access

The default admin credentials are sourced from environment variables:

- `ADMIN_EMAIL` (default: `admin@example.com`)
- `ADMIN_PASSWORD` (default: `changeme123`)

Update these values in `server/.env` before deploying to production.

## API Overview

| Method | Endpoint              | Description                                |
| ------ | --------------------- | ------------------------------------------ |
| GET    | `/api/cars`           | List cars with filters, sorting, pagination |
| GET    | `/api/cars/:id`       | Retrieve a single car with media + badges   |
| POST   | `/api/cars`           | Create a car (admin only)                   |
| PUT    | `/api/cars/:id`       | Update a car (admin only)                   |
| DELETE | `/api/cars/:id`       | Remove a car (admin only)                   |
| GET    | `/api/cars/:id/revisions` | Revision history (admin only)           |
| POST   | `/api/cars/:id/contact`   | Create a contact request                |
| POST   | `/api/auth/login`     | Authenticate admin user                     |
| POST   | `/api/auth/logout`    | Destroy session cookie                      |
| GET    | `/api/auth/me`        | Return the current authenticated user       |
| GET    | `/api/csrf`           | Retrieve CSRF token for mutating requests   |

## Testing Notes

- The project uses lightweight runtime validation (Express Validator) and manual QA steps. Add automated tests as needed.
- SQLite database resides at `server/data/cars.db`. Delete the file to reset.

## Deployment Tips

- Serve the `client/dist` folder behind a CDN and proxy API calls to the Express server.
- Configure HTTPS and secure cookies in production (`NODE_ENV=production`).
- Regularly rotate JWT and CSRF secrets via environment variables.

## License

MIT © Synthetic-Data-Generator maintainers
