# Pam’s reading room

A responsive prototype containing 156 reading entries from 2023–2026.

## Run

Requires Node.js 22 or later. No dependencies or credentials are needed.

```sh
npm start
```

The server listens on port 3000 (override with `PORT`). Run `npm test` for import, sorting, and filtering checks.

## Current capabilities

Search, year/rating/format filters, alphabetical sorting ignoring articles, editable half-star ratings and notes, extra favorites, and JSON export. Book artwork is decorative typography rather than official covers. Fonts use Google Fonts with local fallbacks.

Edits live in browser local storage and are not shared across devices. Export creates a JSON backup. This prototype does not yet implement owner authentication, shared database storage, deployment, privacy controls, or installable/offline app support. Add shared persistence and owner authorization before publishing an editable shared library. Public access can then be paired with optional private library access.

Some supplied titles are abbreviated or ambiguous and remain provisional. Data is in books.json; authors are not required.

## Netlify demo deployment

Import this GitHub repository into Netlify and use the `main` branch. The included netlify.toml sets the build command and publishes only the five browser assets from dist/. No environment variables are required. Netlify provides a public HTTPS address after deployment; later pushes redeploy automatically. Visitors can browse the seeded library, and their edits remain local to their own browser.
