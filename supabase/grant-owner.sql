-- First create Pam's user under Authentication → Users → Add user → Create new user.
-- Replace the example email below with that user's email, then run this in SQL Editor.
-- Do not share the user's password or put it in this script.
do $$
declare owner_id uuid;
begin
 select id into owner_id from auth.users where lower(email) = lower('REPLACE_WITH_PAMS_EMAIL');
 if owner_id is null then
  raise exception 'No matching user. Create the user and replace the example email first.';
 end if;
 insert into public.library_owners(user_id) values(owner_id) on conflict do nothing;
end $$;
