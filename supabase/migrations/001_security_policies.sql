-- Mouam's Hairstyle: Row Level Security policies
-- Execute this file in Supabase SQL Editor after creating the application tables.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.time_slots enable row level security;
alter table public.reviews enable row level security;
alter table public.profiles enable row level security;

-- Services: visitors can see active services; admins manage the catalogue.
create policy "services_public_read_active"
on public.services
for select
to anon, authenticated
using (active = true or public.is_admin());

create policy "services_admin_insert"
on public.services
for insert
to authenticated
with check (public.is_admin());

create policy "services_admin_update"
on public.services
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "services_admin_delete"
on public.services
for delete
to authenticated
using (public.is_admin());

-- Appointments: anyone can submit a request; only admins can read or manage it.
create policy "appointments_public_insert"
on public.appointments
for insert
to anon, authenticated
with check (
  length(trim(name)) between 1 and 120
  and length(trim(whatsapp)) between 3 and 40
  and length(trim(service)) between 1 and 160
  and status = 'En attente'
);

create policy "appointments_admin_read"
on public.appointments
for select
to authenticated
using (public.is_admin());

create policy "appointments_admin_update"
on public.appointments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "appointments_admin_delete"
on public.appointments
for delete
to authenticated
using (public.is_admin());

-- Time slots: visitors see available slots; admins manage all slots.
create policy "time_slots_public_read_available"
on public.time_slots
for select
to anon, authenticated
using (not is_blocked or public.is_admin());

create policy "time_slots_admin_insert"
on public.time_slots
for insert
to authenticated
with check (public.is_admin());

create policy "time_slots_admin_update"
on public.time_slots
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "time_slots_admin_delete"
on public.time_slots
for delete
to authenticated
using (public.is_admin());

-- Reviews: visitors may submit hidden reviews; only approved reviews are public.
create policy "reviews_public_read_approved"
on public.reviews
for select
to anon, authenticated
using (approved = true or public.is_admin());

create policy "reviews_public_insert_pending"
on public.reviews
for insert
to anon, authenticated
with check (
  approved = false
  and length(trim(name)) between 1 and 120
  and length(trim(service)) between 1 and 160
  and length(trim(comment)) between 1 and 2000
  and rating between 1 and 5
);

create policy "reviews_admin_update"
on public.reviews
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "reviews_admin_delete"
on public.reviews
for delete
to authenticated
using (public.is_admin());

-- Profiles: a user can read only their own profile; admins can manage profiles.
create policy "profiles_read_own_or_admin"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) or public.is_admin());

create policy "profiles_self_insert_as_user"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()) and role = 'user');

create policy "profiles_admin_insert"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_admin_delete"
on public.profiles
for delete
to authenticated
using (public.is_admin());
