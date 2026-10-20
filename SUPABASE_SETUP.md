# Connect Pam’s reading room

The website keeps its existing Netlify address. Complete these steps in order; no secret keys are needed in Netlify or chat.

1. In Supabase, open SQL Editor → New query. Paste the complete contents of `supabase/setup.sql` and Run. This creates row-level security policies and imports 156 books. Rerunning it preserves existing rows rather than overwriting edits.
2. Open Authentication → Users → Add user → Create new user. Enter Pam’s email and a strong password, enable Auto Confirm User, and create the user. Share her password privately. There is no public account signup in the app. Disable “Allow new users to sign up” in the authentication settings if this project is only for the reading room.
3. Open `supabase/grant-owner.sql`, replace `REPLACE_WITH_PAMS_EMAIL` with her email, then run it in SQL Editor. Only explicitly listed owner accounts can add, update, or delete books. An arbitrary signed-in account cannot edit. Additional owners require this same administrative step.
4. In Supabase Project Settings → Data API, copy the Project URL. Under Settings → API Keys, copy the publishable key (`sb_publishable_…`); a legacy `anon` key also works. Never use `sb_secret_…`, `service_role`, or the database password.
5. In Netlify, open this site's Project configuration → Environment variables. Add `SUPABASE_URL` with `https://vqbrhcskkyzrxsikesdj.supabase.co` and `SUPABASE_PUBLISHABLE_KEY` with the publishable key. These are public browser configuration, protected by database authorization rather than secrecy. Include them for the production build.
6. Under Deploys, trigger a new deployment. The build generates the browser bundle with those settings. Once configured, connection errors are shown rather than silently switching to demo data.
7. Visit the site signed out: browse and open a book; editing controls should be disabled. Sign in using Owner sign in. Add a temporary book, edit it, then open the link in an incognito window and confirm the changes appear. Delete the temporary book and sign out. Verify visitors cannot add or edit. This live validation is required before calling setup complete.

## Maintenance and recovery

Pam can add books and update title, year, format, category, rating, favorites, or notes. Delete requires confirmation. The filters automatically include new years. Export library downloads all currently loaded shared records as JSON; keep backups periodically. Password resets for this first version are handled by the Supabase project administrator; there is no in-app recovery flow yet. Never place database admin keys in frontend configuration.

Old browser-only edits are not automatically imported into shared storage. Export any important old edits before enabling cloud mode, and apply them with the owner account afterward. Original 156 seed records are already included. Changes are fetched when the page loads; other viewers can refresh to see new edits. Simultaneous owner edits use last-write-wins behavior.

The library is intentionally public. Making it private later requires changing database read policies and removing the public static books.json seed, as well as the viewing flow. Hiding a UI element alone does not make it private.
