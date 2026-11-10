-- Avoid recursive profile policies during admin login.
-- An authenticated user only needs to read their own role row.

drop policy if exists "profiles_read_own_or_admin" on public.profiles;

create policy "profiles_read_own"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));
