-- Initial catalogue for Mouam's Hairstyle.
-- Safe to run once after creating the tables.

insert into public.services (id, name, category, description, price, image_url, size, length, active)
values
  (
    'knotless',
    'Knotless braids',
    'Knotless',
    'Des tresses légères et protectrices, personnalisées selon votre style.',
    85,
    'https://res.cloudinary.com/kzg6foiy/image/upload/v1794185187/mouams-hairstyle/v1dalofdyf9m9m69icot.jpg',
    'Moyenne',
    'Épaules',
    true
  ),
  (
    'boho',
    'Boho braids',
    'Braids',
    'Un mélange de tresses et de boucles pour une finition souple et aérienne.',
    120,
    'https://res.cloudinary.com/kzg6foiy/image/upload/v1794185179/mouams-hairstyle/rsdorkxm44z6kxk9avxp.jpg',
    'Fine',
    'Mi-dos',
    true
  ),
  (
    'fulani',
    'Fulani braids',
    'Tresses',
    'Une coiffure graphique et élégante avec des détails qui attirent le regard.',
    95,
    'https://res.cloudinary.com/kzg6foiy/image/upload/v1794185195/mouams-hairstyle/qq6y9ztpvukdm3hbdl61.jpg',
    'Moyenne',
    'Longues',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  size = excluded.size,
  length = excluded.length,
  active = excluded.active,
  updated_at = now();

insert into public.time_slots (time, is_blocked, sort_order)
values
  ('08:00', false, 0),
  ('10:30', true, 1),
  ('13:00', false, 2),
  ('15:30', false, 3),
  ('18:00', false, 4)
on conflict (time) do update set
  is_blocked = excluded.is_blocked,
  sort_order = excluded.sort_order;
