# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# Appointment Booking System – Web Engineering Project

## Project Description
This project is a web application for booking appointment slots for a professor’s office hours.

There are two roles:

- **Students**
  - view available slots
  - book appointment slots
  - view their own bookings using their student ID
  - cancel bookings

- **Admin**
  - log in via Supabase Auth
  - create single slots
  - create recurring availabilities
  - block and unblock slots
  - delete slots
  - view all bookings in a table

## Technologies Used
- **Nuxt**
- **Supabase**
  - database
  - authentication
- JavaScript
- HTML / CSS
- Chat GPT

## Project Structure
- `app/pages/index.vue` – landing page with role selection
- `app/pages/student.vue` – student page
- `app/pages/admin-login.vue` – admin login
- `app/pages/admin.vue` – admin area
- `app/middleware/admin.js` – route protection for the admin area
- `app/utils/formatters.js` – shared date and time formatting helpers

## Local Development
Run the following commands inside the `frontend` folder:

npm install
npm run dev


The project will then be available at:
`http://localhost:3000`

## Environment Variables

A `.env` file is required for local development.

Example:

```env
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_ANON_KEY=...
```

For submission, the file `.env.submit` is included.

## Static Build

The project can be statically generated with:

npx nuxi generate


The generated static build is located in:
`dist`

## Submission Notes

* `.env` is not committed
* `.env.submit` contains the Supabase values required for evaluation
* the static build is generated into `dist`

## Optional Extension

An additional optional feature was implemented:

* **Recurring availabilities**

Admins can automatically generate multiple slots for:

* a selected date range
* selected weekdays
* a selected time range
* a selected interval

## Testing Notes

### Student

* select the student role on the landing page
* book an available slot
* load personal bookings using a student ID
* cancel a booking

### Admin

* log in via `/admin-login`
* create, block, unblock, or delete slots
* create recurring availabilities
* review all bookings in the table
