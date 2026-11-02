-- Run once in the existing Supabase SQL Editor to update the live record.
-- Preserve any notes Pam has added since the import.
update public.kids_books
set title = 'The Honeybee',
    author = 'Kirsten Hall',
    illustrator = 'Isabelle Arsenault',
    notes = case when notes = 'Author details pending.' then '' else notes end
where id = 'kids-061'
returning title, author, illustrator;
