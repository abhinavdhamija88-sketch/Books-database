-- Kids’ Books module: run once in the existing project SQL Editor.
-- Adds a separate table and imports 67 entries. Does not change the adult library.
-- Depends on is_library_owner() from the original setup.
begin;
create table if not exists public.kids_books (
 id text primary key,
 title text not null check (length(trim(title)) between 1 and 250),
 author text not null default '' check (length(author) <= 250),
 illustrator text not null default '' check (length(illustrator) <= 250),
 notes text not null default '' check (length(notes) <= 10000),
 amazon_url text not null default '' check (length(amazon_url) <= 2000 and (amazon_url = '' or amazon_url ~* '^https://[^[:space:]]+')),
 -- Optional future recipient labels: no names or assignment are required today.
 recipients text[] not null default '{}' check (cardinality(recipients) <= 100)
);
alter table public.kids_books enable row level security;
revoke all on public.kids_books from anon, authenticated;
grant select on public.kids_books to anon, authenticated;
grant insert, update, delete on public.kids_books to authenticated;
drop policy if exists kids_public_read on public.kids_books;
create policy kids_public_read on public.kids_books for select to anon, authenticated using (true);
drop policy if exists kids_owner_insert on public.kids_books;
create policy kids_owner_insert on public.kids_books for insert to authenticated with check ((select public.is_library_owner()));
drop policy if exists kids_owner_update on public.kids_books;
create policy kids_owner_update on public.kids_books for update to authenticated using ((select public.is_library_owner())) with check ((select public.is_library_owner()));
drop policy if exists kids_owner_delete on public.kids_books;
create policy kids_owner_delete on public.kids_books for delete to authenticated using ((select public.is_library_owner()));
insert into public.kids_books (id,title,author,illustrator,notes,amazon_url,recipients) values
('kids-001','I Promise I’ll Find You','Heather Ward','','','','{}'),
('kids-002','Alexander and the Terrible, Horrible, No Good, Very Bad Day','Judith Viorst','','','','{}'),
('kids-003','Edward and the Horse','Ann Rand','','','','{}'),
('kids-004','Katy and the Big Snow','Virginia Lee Burton','','','','{}'),
('kids-005','The Little Engine That Could','Watty Piper','','','','{}'),
('kids-006','What Do You Do With a Chance?','Kobi Yamada','','','','{}'),
('kids-007','Grumpy Monkey','Suzanne Lang','','','','{}'),
('kids-008','Click, Clack, Moo: Cows That Type','Doreen Cronin','','','','{}'),
('kids-009','Chicka Chicka Boom Boom','Bill Martin Jr. and John Archambault','','','','{}'),
('kids-010','Oh No, George!','Chris Haughton','','','','{}'),
('kids-011','Don’t Let the Pigeon Drive the Bus!','Mo Willems','','','','{}'),
('kids-012','What Do You Do With an Idea?','Kobi Yamada','','','','{}'),
('kids-013','Popsicle Pony','Jill Stover','','','','{}'),
('kids-014','No, David!','David Shannon','','','','{}'),
('kids-015','David Gets in Trouble','David Shannon','','','','{}'),
('kids-016','David Goes to School','David Shannon','','','','{}'),
('kids-017','Harold and the Purple Crayon','Crockett Johnson','','','','{}'),
('kids-018','The Snowy Day','Ezra Jack Keats','','','','{}'),
('kids-019','Duck! Rabbit!','Amy Krouse Rosenthal','','','','{}'),
('kids-020','Goodnight Moon','Margaret Wise Brown','','','','{}'),
('kids-021','Elmer','David McKee','','','','{}'),
('kids-022','Corduroy','Don Freeman','','','','{}'),
('kids-023','The Rainbow Fish','Marcus Pfister','','','','{}'),
('kids-024','Magic Boots','Scott Emerson and Howard Post','','','','{}'),
('kids-025','The Story of Ferdinand','Munro Leaf','','','','{}'),
('kids-026','Brown Bear, Brown Bear, What Do You See?','Bill Martin Jr.','','','','{}'),
('kids-027','If You Give a Mouse a Cookie','Laura Numeroff','','','','{}'),
('kids-028','Where the Wild Things Are','Maurice Sendak','','','','{}'),
('kids-029','Sheep in a Jeep','Nancy E. Shaw','','','','{}'),
('kids-030','Sylvester and the Magic Pebble','William Steig','','','','{}'),
('kids-031','Good Night, Gorilla','Peggy Rathmann','','','','{}'),
('kids-032','Love You Forever','Robert Munsch','','','','{}'),
('kids-033','Caps for Sale','Esphyr Slobodkina','','','','{}'),
('kids-034','Little Star (You Are the Light)','Lisa Edwards','Kat Kalindi','','https://www.amazon.com/dp/0593465210','{}'),
('kids-035','Llama Llama Jingle Bells','Anna Dewdney','','','','{}'),
('kids-036','Cuddle Bug','Nicola Edwards','','','','{}'),
('kids-037','Owl Babies','Martin Waddell','','','','{}'),
('kids-038','The Girl Who Loved Wild Horses','Paul Goble','','','','{}'),
('kids-039','Llama Llama Red Pajama','Anna Dewdney','','','','{}'),
('kids-040','Pancakes!','Lotta Nieminen','','','','{}'),
('kids-041','Spaghetti!','Lotta Nieminen','','','','{}'),
('kids-042','Tacos!','Lotta Nieminen','','','','{}'),
('kids-043','Whistle for Willie','Ezra Jack Keats','','','','{}'),
('kids-044','The Napping House','Audrey Wood','','','','{}'),
('kids-045','Giraffes Can’t Dance','Giles Andreae','','','','{}'),
('kids-046','Little Blue Truck’s Christmas','Alice Schertle','','','','{}'),
('kids-047','Our Little Adventure at Christmas','Tabitha Paige','','','','{}'),
('kids-048','Bear Stays Up for Christmas','Karma Wilson','','','','{}'),
('kids-049','Sleep Tight, Very Hungry Caterpillar','Eric Carle','','','','{}'),
('kids-050','I Love You to the Moon and Back','Amelia Hepworth','','','','{}'),
('kids-051','Where’s Spot?','Eric Hill','','','','{}'),
('kids-052','Time for Bed','Mem Fox','','','','{}'),
('kids-053','The Wide-Mouthed Frog','Keith Faulkner','','','','{}'),
('kids-054','See You Later, Alligator','Sally Hopgood','','','https://www.amazon.com/dp/1510704841','{}'),
('kids-055','Goodnight, Monkey','Joshua George','','','https://www.amazon.com/dp/1801051224','{}'),
('kids-056','Claris: The Chicest Mouse in Paris','Megan Hess','','','','{}'),
('kids-057','Claris: Secret Ballet','Megan Hess','','Exact title to confirm.','','{}'),
('kids-058','Silly Sally','Audrey Wood','','','','{}'),
('kids-059','Why We Need Aunts','Gregory E. Lang','','','','{}'),
('kids-060','Strega Nona','Tomie dePaola','','','','{}'),
('kids-061','Honeybee','','','Author details pending.','','{}'),
('kids-062','Eloise and Friends','Kay Thompson','','','https://www.amazon.com/dp/1481451588','{}'),
('kids-063','Olivia','Ian Falconer','','','','{}'),
('kids-064','Chrysanthemum','Kevin Henkes','','','','{}'),
('kids-065','Angelina Ballerina','Katharine Holabird','','','','{}'),
('kids-066','Team Supercrew','Julie Anne Penn and Darren Penn','','','','{}'),
('kids-067','Little Blue Truck’s Springtime','Alice Schertle','','','','{}')
on conflict (id) do nothing;
commit;
