-- Remove only rows created by supabase/seed-demo-data.sql.
-- Run in the Supabase SQL editor with the same database role used for seeding.
begin;

delete from public.certificates where certificate_id like 'TEST-CERT-%';
delete from public.quick_notes where title = 'TEST - Hackathon preparation';
delete from public.notifications where title in ('TEST - Registration pending', 'TEST - Results published', 'TEST - Certificate ready');
delete from public.schedule_entries where event_id like 'test-event-%';
delete from public.event_registrations where event_id like 'test-event-%';
delete from public.education_records where fields->>'collegeId' like 'TEST-CS2026-%';
delete from public.contact_info where emergency_phone = '1800-000-2026';
delete from public.career_profiles where goal = 'TEST - Become a product-focused software engineer';
delete from public.achievements where title = 'TEST - Campus Build Sprint finalist';
delete from public.social_links where github like 'https://github.com/test-campus-%';
delete from public.profile_sections where section_key = 'TEST - showcase';
do $$
begin
	if to_regclass('public.resumes') is not null then
		delete from public.resumes where resume_name = 'TEST - Software Engineering Resume';
	else
		raise notice 'Skipped resume cleanup: public.resumes does not exist.';
	end if;
end
$$;
delete from public.event_results where title like 'TEST - %';
delete from public.announcements where title like 'TEST - %';
delete from public.opportunities where source = 'demo' and source_id like 'test-%';
delete from public.events where id like 'test-event-%';

commit;

-- Safety verification: all of these should return zero.
select 'events' as section, count(*) from public.events where id like 'test-event-%'
union all select 'opportunities', count(*) from public.opportunities where source = 'demo' and source_id like 'test-%'
union all select 'announcements', count(*) from public.announcements where title like 'TEST - %'
union all select 'results', count(*) from public.event_results where title like 'TEST - %'
union all select 'certificates', count(*) from public.certificates where certificate_id like 'TEST-CERT-%';