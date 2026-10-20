# Pam’s reading room

A responsive reading library with 156 initial entries, search, exact half-star rating filters, category/year/format filters, rating sorting, favorites, and JSON export. Categories are draft suggestions listed in CATEGORIES.md.

## Run

Node.js 22+:

```sh
npm ci
npm test
npm start
```

The app builds to dist/ and serves port 3000 (`PORT` overrides it). Netlify runs `npm run build` and publishes dist/. Only browser assets are served. Fonts use Google Fonts with local fallbacks. Book graphics are decorative typography.

## Shared library

Follow SUPABASE_SETUP.md for database setup, import, owner access, and Netlify configuration. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY at build time. Use only a public publishable/anon key, never an administrative key. With Supabase configured, visitors can browse; authorized owners can add/edit/delete. SQL row-level security enforces access independently of the UI. Browser-only edits do not override shared records.

Without either variable, the app remains a clearly labeled browser-local demo. Setting only one variable fails the build. New years are discovered from the library automatically. A future private mode is not implemented. Password recovery is available through Forgot password? after configuring Supabase redirect URLs and email delivery (see SUPABASE_SETUP.md). Refresh to see changes made by another device.

## Deployment

Pushes to main trigger the connected Netlify site. The address remains https://capable-swan-758c85.netlify.app/ unless renamed in Netlify. Database configuration and live authentication must be validated in the actual Supabase project before claiming shared setup is complete.
