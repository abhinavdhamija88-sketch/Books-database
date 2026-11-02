# Enable Kids’ Books on the existing website

The module is a separate public bookshelf beside Library. It uses the existing Supabase project, Pam’s existing login, and the existing Netlify environment variables. There are no new credentials or subscriptions.

## One-time database step

1. Open `supabase/kids-books.sql` in GitHub and use Copy raw file.
2. In the existing Supabase project, open SQL Editor → New query, paste the complete script, and Run.
3. Supabase may warn about destructive operations because the script replaces its own access policies. The complete script creates a new kids_books table and imports 67 entries; it does not remove tables, books, or existing user accounts, or alter the adult library. Run the full transaction, not just selected lines.
4. Wait for the latest Netlify deployment to publish, refresh the website, and select Kids’ Books.

Rerunning the import preserves existing rows and owner edits. It can restore an originally seeded row that an owner intentionally deleted, so use it for setup rather than routine maintenance.

## Validate the live app

- Signed out: confirm 67 initial entries, alphabetical title ordering, author search, and The Honeybee credited to Kirsten Hall and illustrator Isabelle Arsenault. Opening a book should allow viewing, not editing.
- Signed in as Pam: add a temporary kids’ book with author/notes. Refresh or open the kids tab in an incognito browser to confirm shared saving. Edit it, then delete the temporary record.
- Try entering an existing title. The duplicate warning requires explicit confirmation to record another copy. It catches exact normalized title matches, not every possible spelling variation.
- Confirm the Library tab still shows Pam’s reading collection and filters.
- If the new table does not yet exist, the kids tab offers an error and Retry without preventing the adult library from loading.

Database policies allow public reading and restrict all writes to accounts in the existing library_owners table. Signing in as an arbitrary nonowner does not permit editing.

## Data decisions

The 67 entries follow the agreed spelling corrections and accepted likely author matches, which are not a newly verified catalog lookup. The Honeybee credits Kirsten Hall and illustrator Isabelle Arsenault. Claris: Secret Ballet keeps an exact-title confirmation note. Little Star (You Are the Light) credits Lisa Edwards and illustrator Kat Kalindi. Team Supercrew is a single collection entry for now. Supplied Amazon links are stored as clean product URLs without tracking parameters.

Kids’ books retain leading articles in their titles; sorting ignores A, An, and The. There are no ratings or purchase dates. Books belong to Pam’s shared collection rather than individual grandchildren. A reserved optional recipients array supports multiple names later, but there is no name assignment UI yet and all initial entries are unassigned. Editing a record preserves existing recipient values.

## Routine maintenance

Pam uses Add book or opens a book to edit title, author, illustrator, optional Amazon link, and notes. Deleting requires confirmation. JSON export backs up this collection independently of the adult library. Book metadata changes can be made by the owner without a deployment.

## Developer checks

`npm ci`, `npm test`, and `npm run build` cover data and database authorization. `npm run test:browser` additionally needs system Chromium (default /usr/bin/chromium; override CHROMIUM_PATH). It launches its own server, tests demo and simulated cloud flows, and restores a demo build afterward. No live Supabase writes or emails are performed by these checks. Live project setup remains a separate verification step.
