-- ============================================================================
-- CampusConnect — Seed real nationwide emergency helpline numbers
--
-- Populates `emergency_contacts` (created in 002_features.sql) with REAL,
-- public, all-India emergency / helpline numbers so students have working
-- emergency contacts out of the box. Admins can edit, deactivate, or add
-- campus-specific contacts on top of these through the admin Emergency panel.
--
-- Idempotent: only seeds when the table is empty, so it won't duplicate rows
-- or clobber contacts an admin has already configured. Safe to re-run.
--
-- Run in the Supabase SQL editor or via `supabase db push`. Apply
-- 002_features.sql first.
-- ============================================================================

insert into public.emergency_contacts (name, category, description, phone, email, location, availability, priority, active)
select * from (values
  ('National Emergency Number', 'security', 'Single all-in-one emergency number for police, fire, and medical help across India.', '112', null, 'Nationwide', '24/7', 1, true),
  ('Police', 'security', 'Police control room for crime, safety, and security emergencies.', '100', null, 'Nationwide', '24/7', 2, true),
  ('Fire Brigade', 'security', 'Fire and rescue services for fire-related emergencies.', '101', null, 'Nationwide', '24/7', 3, true),
  ('Ambulance (Emergency Medical)', 'medical', 'Free 24/7 emergency ambulance and medical response service.', '108', null, 'Nationwide', '24/7', 1, true),
  ('Medical Helpline', 'medical', 'Medical and maternal/child health helpline.', '102', null, 'Nationwide', '24/7', 2, true),
  ('KIRAN Mental Health Helpline', 'student-support', 'Government mental-health support: stress, anxiety, depression, and crisis counselling.', '1800-599-0019', null, 'Nationwide', '24/7', 1, true),
  ('UGC Anti-Ragging Helpline', 'student-support', 'National anti-ragging helpline for students facing ragging or harassment.', '1800-180-5522', 'helpline@antiragging.in', 'Nationwide', '24/7', 2, true),
  ('Women Helpline', 'student-support', 'Support for women in distress, including harassment and safety concerns.', '1091', null, 'Nationwide', '24/7', 3, true),
  ('Cyber Crime Helpline', 'campus-services', 'Report online fraud, cyberbullying, and other cyber crimes.', '1930', null, 'Nationwide', '24/7', 1, true),
  ('Childline (Under 18)', 'campus-services', 'Emergency helpline for children and minors in distress.', '1098', null, 'Nationwide', '24/7', 2, true)
) as seed(name, category, description, phone, email, location, availability, priority, active)
where not exists (select 1 from public.emergency_contacts);

notify pgrst, 'reload schema';
