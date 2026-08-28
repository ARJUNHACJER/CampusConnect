-- CampusConnect demo data only.
-- Run after the existing schema/migrations (including 001_opportunities.sql,
-- 002_features.sql, 003_external_opportunities.sql and 005_schedule_certificates.sql).
-- This script never creates auth.users and never updates existing rows.

begin;

-- Shared event showcase: upcoming, ongoing, completed and cancelled.
insert into public.events
  (id, title, description, category, date, start_time, end_time, venue, organizer,
   banner, status, eligibility, department, max_participants, registration_deadline,
   rules, highlights, prize_info)
values
  ('test-event-001', 'TEST - Andhra TechVerse Hackathon', 'A 24-hour student build sprint focused on practical campus technology.', 'Hackathon', '2026-09-12', '09:00', '18:00', 'Innovation Lab', 'TEST - Computer Science Club', 'techverse-demo', 'published', 'All UG students', 'Computer Science', 120, '2026-09-09', 'Teams of 2 to 4; disclose third-party APIs.', 'Mentor desk, review checkpoints and demo day.', 'INR 50,000 total prizes'),
  ('test-event-002', 'TEST - AI for Public Good Workshop', 'Hands-on model evaluation and responsible AI workshop for student teams.', 'Workshop', '2026-08-28', '09:00', '23:00', 'AI Research Lab', 'TEST - AI Student Chapter', 'ai-workshop-demo', 'ongoing', 'All students', 'All Departments', 80, '2026-08-27', 'Bring a laptop and complete the pre-read.', 'Faculty mentors and guided lab exercises.', 'Participation certificates'),
  ('test-event-003', 'TEST - Campus Product Showcase', 'A judged showcase of student products, prototypes and social-impact projects.', 'Seminar', '2026-04-18', '14:00', '17:00', 'Main Auditorium', 'TEST - Innovation Cell', 'showcase-demo', 'completed', 'All students', 'All Departments', 300, '2026-04-14', 'Five-minute presentation followed by Q&A.', 'Alumni jury and project feedback clinic.', 'Top 3 teams receive grants'),
  ('test-event-004', 'TEST - Monsoon Sports League', 'Inter-department badminton and table-tennis league.', 'Sports', '2026-07-20', '07:00', '16:00', 'University Sports Complex', 'TEST - Sports Committee', 'sports-demo', 'cancelled', 'All students', 'All Departments', 200, '2026-07-15', 'Medical fitness declaration required.', 'Department leaderboard and fair-play award.', 'Trophies for finalists'),
  ('test-event-005', 'TEST - Cloud Career Panel', 'Alumni panel on cloud engineering, platform teams and entry-level careers.', 'Seminar', '2026-10-03', '15:00', '17:00', 'Business School Hall', 'TEST - Career Development Centre', 'cloud-panel-demo', 'published', 'Final-year students', 'Information Technology', 150, '2026-09-30', 'Questions must be submitted during registration.', 'Resume review desk after the panel.', 'No prize'),
  ('test-event-006', 'TEST - Green Campus Design Jam', 'A one-day design jam for low-cost sustainability improvements on campus.', 'Technical', '2026-11-07', '10:00', '18:00', 'Design Studio', 'TEST - Sustainability Cell', 'green-design-demo', 'draft', 'All UG students', 'Civil', 60, '2026-11-03', 'Teams of 3; use the supplied campus brief.', 'Site walk and prototype critique.', 'INR 15,000 seed grant')
on conflict (id) do nothing;

insert into public.announcements (title, description, category, priority, publish_date, attachment, status)
select v.title, v.description, v.category, v.priority, v.publish_date, null, v.status
from (values
  ('TEST - Hackathon registrations are open', 'Register your team for the Andhra TechVerse build sprint by 9 September.', 'Events', 'High', '2026-08-22'::date, 'published'),
  ('TEST - AI workshop is live today', 'The AI for Public Good lab is running in the AI Research Lab until 11 PM.', 'Workshop', 'High', '2026-08-28'::date, 'published'),
  ('TEST - Showcase results published', 'The Campus Product Showcase jury results are now available.', 'Results', 'Normal', '2026-04-20'::date, 'published'),
  ('TEST - Sports League postponed', 'The Monsoon Sports League is cancelled due to venue maintenance.', 'Sports', 'High', '2026-07-18'::date, 'published'),
  ('TEST - Career panel call for questions', 'Submit questions for the Cloud Career Panel before 30 September.', 'Careers', 'Normal', '2026-09-01'::date, 'draft'),
  ('TEST - Library weekend hours', 'The library will remain open during the Green Campus Design Jam weekend.', 'Campus', 'Low', '2026-10-30'::date, 'published')
) as v(title, description, category, priority, publish_date, status)
where not exists (select 1 from public.announcements a where a.title = v.title);

insert into public.event_results (event_id, title, details, status, published_at)
select v.event_id, v.title, v.details::jsonb, v.status, v.published_at
from (values
  ('test-event-003', 'TEST - Campus Product Showcase Results', '[{"rank":1,"name":"TEST - Team Aaru","award":"Winner","project":"SevaSetu"},{"rank":2,"name":"TEST - Team Vistara","award":"Runner-up","project":"FarmLink"},{"rank":3,"name":"TEST - Team Neer","award":"Participant","project":"JalWatch"}]', 'published', '2026-04-20T12:00:00+00'::timestamptz),
  ('test-event-001', 'TEST - Andhra TechVerse Preliminary Results', '[{"rank":1,"name":"TEST - Team Konaseema","award":"Winner"},{"rank":2,"name":"TEST - Team Godavari","award":"Runner-up"},{"rank":3,"name":"TEST - Team Coastal","award":"Participant"}]', 'draft', null)
) as v(event_id, title, details, status, published_at)
where not exists (select 1 from public.event_results r where r.title = v.title);

insert into public.opportunities
  (title, type, organization, description, location, mode, skills, eligibility, stipend,
   deadline, apply_url, source, source_id, image_url, is_external, is_active, status)
values
  ('TEST - Software Engineering Intern', 'internship', 'Razorpay', 'Build reliable payment experiences with a product engineering team.', 'Bengaluru', 'hybrid', array['JavaScript','React','SQL'], 'Engineering students graduating in 2027', 'INR 45,000/month', '2026-09-20', 'https://razorpay.com/jobs', 'demo', 'test-opportunity-001', null, false, true, 'published'),
  ('TEST - Data Science Graduate Intern', 'internship', 'Flipkart', 'Work on experimentation and forecasting problems using real marketplace data.', 'Bengaluru', 'onsite', array['Python','Pandas','Statistics'], 'Pre-final-year students', 'INR 50,000/month', '2026-10-05', 'https://www.flipkartcareers.com', 'demo', 'test-opportunity-002', null, false, true, 'published'),
  ('TEST - Smart India Hackathon Practice Track', 'hackathon', 'Ministry of Education Innovation Cell', 'A practice track for teams preparing civic-tech prototypes.', 'Remote', 'remote', array['Problem Solving','Git','Prototyping'], 'All enrolled college students', 'Prizes and mentorship', '2026-09-30', 'https://www.sih.gov.in', 'demo', 'test-opportunity-003', null, false, true, 'published'),
  ('TEST - Women in Tech Scholarship', 'scholarship', 'Google India', 'Scholarship and mentorship support for women pursuing technology degrees.', 'India', 'remote', array['Leadership','Technology'], 'Women in engineering or computer science', 'INR 1,00,000 grant', '2026-10-15', 'https://buildyourfuture.withgoogle.com', 'demo', 'test-opportunity-004', null, false, true, 'published'),
  ('TEST - Product Design Fellowship', 'fellowship', 'Razorpay Design', 'A guided fellowship covering research, interaction design and product critique.', 'Mumbai', 'hybrid', array['Figma','User Research','Prototyping'], 'Students with a design portfolio', 'INR 35,000/month', '2026-09-25', 'https://razorpay.com/jobs', 'demo', 'test-opportunity-006', null, false, true, 'closing_soon'),
  ('TEST - Embedded Systems Challenge', 'hackathon', 'Texas Instruments India', 'Solve an embedded systems challenge with mentor feedback and a component kit.', 'Bengaluru', 'onsite', array['C','Embedded C','Microcontrollers'], 'EC, EE and ECE students', 'INR 25,000 prizes', '2026-12-01', 'https://careers.ti.com', 'demo', 'test-opportunity-007', null, false, true, 'published'),
  ('TEST - Research Excellence Fellowship', 'fellowship', 'IIT Madras Research Park', 'Short research fellowship for students exploring applied engineering questions.', 'Chennai', 'onsite', array['Research','Technical Writing','Python'], 'UG and PG students', 'INR 20,000/month', '2026-08-10', 'https://researchpark.iitm.ac.in', 'demo', 'test-opportunity-008', null, false, false, 'expired')
on conflict (source, source_id) do nothing;

-- The `job` type was added by 003_external_opportunities.sql. Keep this seed
-- usable on databases that have only the older opportunities migration.
do $$
begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'opportunities'
      and c.conname = 'opportunities_type_check'
      and pg_get_constraintdef(c.oid) like '%job%'
  ) then
    insert into public.opportunities
      (title, type, organization, description, location, mode, skills, eligibility, stipend,
       deadline, apply_url, source, source_id, image_url, is_external, is_active, status)
    values
      ('TEST - Cloud Support Associate', 'job', 'Amazon Web Services India', 'Entry-level cloud support role with structured technical training.', 'Hyderabad', 'onsite', array['Linux','Networking','AWS'], 'Final-year students and recent graduates', 'INR 8-12 LPA', '2026-11-01', 'https://www.amazon.jobs', 'demo', 'test-opportunity-005', null, false, true, 'published')
    on conflict (source, source_id) do nothing;
  else
    raise notice 'Skipped TEST - Cloud Support Associate: apply 003_external_opportunities.sql to enable type job.';
  end if;
end
$$;

-- Auth-linked demo rows use only already-existing accounts explicitly named as
-- test/demo accounts. No auth user is created or changed by this script.
create temporary table demo_users on commit drop as
select id as user_id, coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as full_name, email,
       row_number() over (order by created_at, id) as user_no
from auth.users
where email ilike '%test%' or email ilike '%demo%';

insert into public.event_registrations
  (user_id, event_id, event_title, event_date, status, event_category, event_venue, event_organizer, event_banner, start_time, end_time, action_count)
select d.user_id, v.event_id, v.event_title, e.date, v.status, e.category, e.venue, e.organizer, e.banner, e.start_time, e.end_time, 1
from demo_users d
cross join (values
  ('test-event-001','TEST - Andhra TechVerse Hackathon','pending'),
  ('test-event-003','TEST - Campus Product Showcase','attended'),
  ('test-event-004','TEST - Monsoon Sports League','rejected'),
  ('test-event-005','TEST - Cloud Career Panel','waitlisted')
) v(event_id, event_title, status)
join public.events e on e.id = v.event_id
where d.user_no <= 4
on conflict (user_id, event_id) do nothing;

insert into public.schedule_entries (user_id, event_id, event_title, event_date, start_time, end_time, event_venue)
select d.user_id, e.id, e.title, e.date, e.start_time, e.end_time, e.venue
from demo_users d
join public.events e on e.id in ('test-event-001', 'test-event-005')
where d.user_no <= 2
on conflict (user_id, event_id) do nothing;

insert into public.notifications (user_id, type, title, body, related_id, read_at)
select d.user_id, v.type, v.title, v.body, v.related_id, v.read_at
from demo_users d
cross join (values
  ('registration','TEST - Registration pending','Your registration for TEST - Andhra TechVerse Hackathon is awaiting approval.','test-event-001',null::timestamptz),
  ('result','TEST - Results published','TEST - Campus Product Showcase results are now available.','test-event-003','2026-04-20T13:00:00+00'::timestamptz),
  ('certificate','TEST - Certificate ready','Your TEST - Campus Product Showcase certificate is ready to view.','test-event-003',null::timestamptz)
) v(type, title, body, related_id, read_at)
where d.user_no <= 3
and not exists (select 1 from public.notifications n where n.user_id = d.user_id and n.title = v.title);

insert into public.quick_notes (user_id, title, content, category, is_pinned)
select user_id, 'TEST - Hackathon preparation', 'Confirm team members, API disclosures and final demo checklist.', 'Events', user_no = 1
from demo_users
where user_no <= 3
and not exists (select 1 from public.quick_notes q where q.user_id = demo_users.user_id and q.title = 'TEST - Hackathon preparation');

insert into public.education_records (user_id, education_type, fields, is_current)
select user_id, 'engineering', jsonb_build_object('collegeId', 'TEST-CS2026-' || lpad(user_no::text, 3, '0'), 'branch', 'Computer Science', 'year', '3rd Year'), true
from demo_users
where user_no <= 3
and not exists (select 1 from public.education_records e where e.user_id = demo_users.user_id and e.education_type = 'engineering' and e.is_current);

insert into public.contact_info (user_id, college_email, city, state, country, emergency_name, emergency_phone)
select user_id, email, 'Kakinada', 'Andhra Pradesh', 'India', 'TEST - Campus Help Desk', '1800-000-2026'
from demo_users
where user_no <= 3
on conflict (user_id) do nothing;

insert into public.career_profiles (user_id, goal, roles, industry, looking_for, preferred_location)
select user_id, 'TEST - Become a product-focused software engineer', array['Software Engineer','Full Stack Developer'], 'Technology', array['Internship','Mentorship'], 'Bengaluru or Remote'
from demo_users where user_no <= 3
on conflict (user_id) do nothing;

insert into public.achievements (user_id, kind, title, description, date)
select user_id, 'hackathon', 'TEST - Campus Build Sprint finalist', 'Demo achievement for the student showcase profile.', '2026-04-20'
from demo_users where user_no <= 3
and not exists (select 1 from public.achievements a where a.user_id = demo_users.user_id and a.title = 'TEST - Campus Build Sprint finalist');

insert into public.social_links (user_id, github, linkedin, website)
select user_id, 'https://github.com/test-campus-' || user_no, 'https://www.linkedin.com/in/test-campus-' || user_no, 'https://demo.campusconnect.example/student/' || user_no
from demo_users where user_no <= 3
on conflict (user_id) do nothing;

insert into public.profile_sections (user_id, section_key, data)
select user_id, 'TEST - showcase', jsonb_build_object('headline', 'TEST - Student showcase profile', 'focus', 'Campus innovation')
from demo_users where user_no <= 3
on conflict (user_id, section_key) do nothing;

do $$
begin
  if to_regclass('public.resumes') is not null then
    insert into public.resumes (user_id, resume_name, template, resume_data, completion_percentage)
    select user_id, 'TEST - Software Engineering Resume', 'modern', jsonb_build_object('summary', 'TEST - Computer science student building accessible campus tools.', 'skills', array['React','Python','SQL']), 72
    from demo_users where user_no <= 2
    and not exists (select 1 from public.resumes r where r.user_id = demo_users.user_id and r.resume_name = 'TEST - Software Engineering Resume');
  else
    raise notice 'Skipped TEST resumes: public.resumes does not exist. Apply sql/resumes.sql to enable this module.';
  end if;
end
$$;

insert into public.certificates
  (certificate_id, event_id, event_name, student_id, recipient_name, type, issue_date, status, template)
select 'TEST-CERT-' || lpad(d.user_no::text, 3, '0'), 'test-event-003', 'TEST - Campus Product Showcase', d.user_id, 'TEST - ' || d.full_name,
       case when d.user_no = 1 then 'winner' when d.user_no = 2 then 'runner_up' else 'participation' end,
       '2026-04-20', case when d.user_no = 3 then 'generated' else 'published' end, 'classic'
from demo_users d
where d.user_no <= 3
on conflict (certificate_id) do nothing;

commit;

-- Verification queries (run separately if preferred).
select status, count(*) as demo_events from public.events where id like 'test-event-%' group by status order by status;
select type, count(*) as demo_opportunities from public.opportunities where source = 'demo' and source_id like 'test-%' group by type order by type;
select 'announcements' as section, count(*) from public.announcements where title like 'TEST - %'
union all select 'results', count(*) from public.event_results where title like 'TEST - %'
union all select 'demo auth users', count(*) from auth.users where email ilike '%test%' or email ilike '%demo%';