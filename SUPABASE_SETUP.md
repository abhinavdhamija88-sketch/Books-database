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

Pam can add books and update title, year, format, category, rating, favorites, or notes. Delete requires confirmation. The filters automatically include new years. Export library downloads all currently loaded shared records as JSON; keep backups periodically. Password resets are available through Owner sign in → Forgot password? after the URL and email-delivery setup below. Never place database admin keys in frontend configuration.

Old browser-only edits are not automatically imported into shared storage. Export any important old edits before enabling cloud mode, and apply them with the owner account afterward. Original 156 seed records are already included. Changes are fetched when the page loads; other viewers can refresh to see new edits. Simultaneous owner edits use last-write-wins behavior.

The library is intentionally public. Making it private later requires changing database read policies and removing the public static books.json seed, as well as the viewing flow. Hiding a UI element alone does not make it private.

## Password resets from the website

Owners can use Owner sign in → Forgot password?, enter their email, and open the emailed link. The link signs them into a recovery session and opens the new-password form. After they save, subsequent sign-ins use the new app password. The email-account password is never requested. Invalid/expired links prompt the user to request another email.

In Supabase Authentication → URL Configuration:

- Set Site URL to `https://capable-swan-758c85.netlify.app/`.
- Add `https://capable-swan-758c85.netlify.app/?reset=1` to Redirect URLs and save. If the site address changes, update these values as well. The app uses its current origin for recovery, so another deployed hostname must also be allowed explicitly.

Email delivery must be configured for Pam's address. Supabase's default sender restricts recipients to project team members and is rate limited; use custom SMTP under Authentication email settings for reliable delivery to an owner outside that team. Provider SMTP credentials belong only in Supabase, never Netlify's public app variables or source files. See https://supabase.com/docs/guides/auth/auth-smtp .

Test delivery with Pam's actual address, open the link, set a new password, sign out, and sign in with that password. Local browser tests use simulated Supabase responses; they do not validate production email delivery or the project's redirect configuration. An administrator can help recover the account through Supabase if email delivery is not yet configured.

## Category update

The nine original To review entries now have assigned categories. Visitors see the categories immediately; the first signed-in owner visit persists the replacements to Supabase. Only rows still marked To review are changed, preserving owner edits to other categories. New-book forms default to Literary & contemporary fiction and offer real categories only.
