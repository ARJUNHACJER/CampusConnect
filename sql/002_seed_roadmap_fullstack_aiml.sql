-- =====================================================================
-- CampusConnect · Career Roadmap feature
-- Migration 002: seed data — Full Stack Developer, AI/ML Engineer
-- Uses real, well-known documentation/learning resources (no invented URLs).
-- =====================================================================

do $$
declare
  v_roadmap_id uuid;
  v_phase_id uuid;
  v_topic_id uuid;
begin

  -- =====================================================================
  -- ROADMAP: Full Stack Developer
  -- =====================================================================
  insert into public.roadmaps (title, description, category, difficulty, estimated_duration, icon)
  values (
    'Full Stack Developer',
    'Go from web fundamentals to shipping and deploying complete full-stack applications, backend APIs, and databases.',
    'Full Stack',
    'Beginner',
    '5-6 months',
    'Layers'
  ) returning id into v_roadmap_id;

  -- Phase 1: Web Fundamentals
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Web Fundamentals', 'How the web works and the building blocks of every website.', 1)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Internet & Web Basics', 'How the internet, browsers, DNS, and HTTP actually work.',
    array['How the client-server model works','DNS and domain resolution','HTTP/HTTPS request-response cycle','What a browser does when you load a page'],
    array['Trace a request in your browser DevTools Network tab','Explain HTTP vs HTTPS to a classmate'],
    '2-3 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'How the Web Works', 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works', 'documentation', 'MDN overview of client-server architecture.', 1),
    (v_topic_id, 'HTTP overview', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', 'documentation', 'MDN guide to the HTTP protocol.', 2);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'HTML', 'Structure web content with semantic HTML.',
    array['Semantic elements','Forms and inputs','Accessibility basics','Tables and media embedding'],
    array['Build a semantic personal profile page','Build an accessible contact form'],
    '4-5 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'HTML basics', 'https://developer.mozilla.org/en-US/docs/Learn/HTML', 'documentation', 'MDN''s complete HTML learning path.', 1),
    (v_topic_id, 'freeCodeCamp Responsive Web Design', 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', 'course', 'Free interactive HTML/CSS curriculum.', 2);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'CSS', 'Style pages with modern CSS: box model, flexbox, grid.',
    array['Box model & selectors','Flexbox','CSS Grid','Custom properties (variables)'],
    array['Recreate a simple landing page layout with Flexbox','Build a photo gallery with CSS Grid'],
    '5-6 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'CSS basics', 'https://developer.mozilla.org/en-US/docs/Learn/CSS', 'documentation', 'MDN CSS learning path.', 1),
    (v_topic_id, 'CSS Grid Garden', 'https://cssgridgarden.com/', 'practice', 'Interactive game to learn CSS Grid.', 2);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Responsive Design', 'Make layouts adapt across devices.',
    array['Media queries','Mobile-first design','Responsive images','Viewport units'],
    array['Make a previous project fully responsive on mobile and tablet'],
    '2-3 days', 4) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Responsive design basics', 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design', 'documentation', 'MDN guide to responsive design techniques.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'JavaScript Fundamentals', 'Core JS: variables, functions, arrays, objects, DOM basics.',
    array['Variables & data types','Functions & scope','Arrays & objects','Control flow & loops'],
    array['Build a to-do list with vanilla JS','Solve 20 small JS exercises'],
    '10-12 days', 5) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'JavaScript guide', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', 'documentation', 'MDN''s official JavaScript guide.', 1),
    (v_topic_id, 'JavaScript.info', 'https://javascript.info/', 'article', 'Deep, modern JavaScript tutorial.', 2);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Git & GitHub', 'Version control fundamentals for working solo and in teams.',
    array['git init/add/commit/push','Branching & merging','Pull requests','Resolving conflicts'],
    array['Push a project to GitHub','Practice a feature-branch workflow with a PR'],
    '2-3 days', 6) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Git documentation', 'https://git-scm.com/doc', 'documentation', 'Official Git reference and book.', 1),
    (v_topic_id, 'GitHub Docs', 'https://docs.github.com/en/get-started', 'documentation', 'Official GitHub getting-started guides.', 2);

  -- Phase 2: Frontend Development
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Frontend Development', 'Build interactive, component-based UIs with React.', 2)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'DOM', 'Manipulate pages directly with the DOM API.',
    array['Selecting elements','Event listeners','Creating/removing nodes'],
    array['Build an interactive quiz with vanilla JS DOM manipulation'],
    '3-4 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Introduction to the DOM', 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction', 'documentation', 'MDN introduction to the DOM.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Modern JavaScript (ES6+)', 'Modern syntax used throughout real-world codebases.',
    array['Arrow functions','Destructuring & spread','Promises & async/await','Modules (import/export)'],
    array['Refactor an earlier vanilla JS project using ES6+ syntax'],
    '4-5 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Async JS', 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous', 'documentation', 'MDN guide to promises and async/await.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, prerequisites, estimated_time, order_index)
  values (v_phase_id, 'React', 'Build component-based UIs with React.',
    array['JSX','Components & props','Rendering lists & conditionals','Component composition'],
    array['Build a product listing UI from a static JSON array'],
    'Modern JavaScript (ES6+)',
    '8-10 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'React documentation', 'https://react.dev/learn', 'documentation', 'Official React learning guide.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, prerequisites, estimated_time, order_index)
  values (v_phase_id, 'React Hooks', 'Manage state and side effects in function components.',
    array['useState','useEffect','useContext','Custom hooks'],
    array['Build a counter','Build a to-do application','Build a small API-based React app'],
    'React',
    '6-8 days', 4) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Built-in React Hooks', 'https://react.dev/reference/react/hooks', 'documentation', 'Official hooks reference.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'State Management', 'Manage state across larger applications.',
    array['Lifting state up','Context API at scale','Intro to external state libraries'],
    array['Refactor the to-do app to use Context for global state'],
    '3-4 days', 5) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Managing State', 'https://react.dev/learn/managing-state', 'documentation', 'Official React guide to managing state.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'TypeScript', 'Add static typing to JavaScript and React projects.',
    array['Basic types & interfaces','Typing React props/state','Generics basics'],
    array['Convert a React component to TypeScript'],
    '5-6 days', 6) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'TypeScript Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html', 'documentation', 'Official TypeScript handbook.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Next.js', 'Production React framework with routing and SSR.',
    array['File-based routing','Server vs client components','Data fetching'],
    array['Rebuild a previous React project in Next.js'],
    '5-7 days', 7) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Next.js documentation', 'https://nextjs.org/docs', 'documentation', 'Official Next.js docs.', 1);

  -- Phase 3: Backend Development
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Backend Development', 'Build servers, APIs, and handle authentication.', 3)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Node.js', 'JavaScript runtime for building servers.',
    array['Modules & npm','Event loop basics','File system & async I/O'],
    array['Build a CLI tool with Node.js'],
    '4-5 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Node.js documentation', 'https://nodejs.org/en/docs', 'documentation', 'Official Node.js docs.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, prerequisites, estimated_time, order_index)
  values (v_phase_id, 'Express', 'Build web servers and APIs with Express.',
    array['Routing','Middleware','Error handling'],
    array['Build a JSON API for a notes app'],
    'Node.js',
    '4-5 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Express documentation', 'https://expressjs.com/en/guide/routing.html', 'documentation', 'Official Express routing guide.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'REST APIs', 'Design clean, resource-oriented HTTP APIs.',
    array['REST principles','Status codes','Versioning & pagination'],
    array['Design and document a REST API for a booking app'],
    '3-4 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'HTTP response status codes', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status', 'documentation', 'MDN reference for HTTP status codes.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Authentication', 'Verify who a user is.',
    array['Sessions vs tokens','JWTs','Password hashing'],
    array['Implement email/password signup and login'],
    '5-6 days', 4) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Supabase Auth docs', 'https://supabase.com/docs/guides/auth', 'documentation', 'Official Supabase authentication guide.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Authorization', 'Control what an authenticated user can do.',
    array['Role-based access control','Row Level Security concepts'],
    array['Add role-based route protection to your API'],
    '3-4 days', 5) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Supabase Row Level Security', 'https://supabase.com/docs/guides/database/postgres/row-level-security', 'documentation', 'Official guide to Postgres RLS in Supabase.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'API Security', 'Protect your API from common attacks.',
    array['Input validation','Rate limiting','CORS','OWASP API Top 10 basics'],
    array['Audit a previous project''s API for common vulnerabilities'],
    '3-4 days', 6) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'OWASP API Security Top 10', 'https://owasp.org/www-project-api-security/', 'documentation', 'Industry-standard API security risks reference.', 1);

  -- Phase 4: Databases
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Databases', 'Model, store, and query relational data.', 4)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'SQL', 'Core SQL query language.',
    array['SELECT/WHERE/JOIN','Aggregations','Subqueries'],
    array['Solve 15 SQL practice problems'],
    '5-6 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'SQLBolt', 'https://sqlbolt.com/', 'practice', 'Interactive SQL lessons and exercises.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'PostgreSQL', 'The relational database used by Supabase.',
    array['Data types','Indexes','Constraints'],
    array['Design and create tables for a small app'],
    '3-4 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'PostgreSQL documentation', 'https://www.postgresql.org/docs/', 'documentation', 'Official PostgreSQL manual.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Database Design', 'Model entities and relationships correctly.',
    array['Normalization','ER diagrams','Primary/foreign keys'],
    array['Design an ER diagram for a course-registration system'],
    '3-4 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Database design basics', 'https://www.postgresql.org/docs/current/tutorial-table.html', 'documentation', 'PostgreSQL tutorial on table design.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Relationships', 'One-to-many and many-to-many modeling.',
    array['One-to-many','Many-to-many via join tables','Cascading deletes'],
    array['Model a many-to-many "students enroll in courses" schema'],
    '2-3 days', 4) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Joins tutorial', 'https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-joins/', 'article', 'Explains SQL join types with examples.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Queries', 'Write efficient, real-world queries.',
    array['Query optimization basics','EXPLAIN plans','Common query patterns'],
    array['Optimize a slow query using EXPLAIN ANALYZE'],
    '2-3 days', 5) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Using EXPLAIN', 'https://www.postgresql.org/docs/current/using-explain.html', 'documentation', 'Official guide to reading query plans.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Supabase', 'Backend-as-a-service built on Postgres.',
    array['Supabase client SDK','Auth + database + storage','Realtime subscriptions'],
    array['Connect a React app to Supabase and perform CRUD operations'],
    '4-5 days', 6) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Supabase documentation', 'https://supabase.com/docs', 'documentation', 'Official Supabase docs.', 1);

  -- Phase 5: Projects
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Projects', 'Apply everything by building real projects.', 5)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'HTML/CSS Project', 'A fully static, responsive landing page.',
    array['Applying layout & responsive skills end-to-end'],
    array['Build and deploy a responsive landing page (e.g. on GitHub Pages)'],
    '3-4 days', 1) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'JavaScript Project', 'An interactive app using vanilla JS.',
    array['DOM manipulation at project scale'],
    array['Build a weather app using a public API'],
    '4-5 days', 2) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'React Project', 'A multi-page React application.',
    array['Component architecture at project scale','Routing'],
    array['Build a movie search app consuming a public API'],
    '6-7 days', 3) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Full-Stack Project', 'End-to-end app with auth, database, and API.',
    array['Wiring frontend, backend, and database together'],
    array['Build and deploy a full-stack task manager with auth'],
    '10-14 days', 4) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Portfolio Project', 'A polished project to showcase to recruiters.',
    array['Presentation, README quality, deployment polish'],
    array['Deploy your best project with a clean README and live demo link'],
    '3-4 days', 5) returning id into v_topic_id;

  -- Phase 6: Career Preparation
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Career Preparation', 'Get interview- and placement-ready.', 6)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'DSA', 'Data structures and algorithms for technical interviews.',
    array['Arrays, strings, hashmaps','Trees & graphs basics','Time/space complexity'],
    array['Solve 50 easy/medium problems on a practice platform'],
    '20-25 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'LeetCode', 'https://leetcode.com/', 'practice', 'Widely used platform for DSA interview practice.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Resume', 'A resume that passes recruiter screening.',
    array['Structuring experience & projects','Quantifying impact'],
    array['Write and review a one-page technical resume'],
    '2-3 days', 2) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'GitHub Profile', 'A GitHub profile that shows real work.',
    array['Pinning strong repos','Writing good READMEs','Commit hygiene'],
    array['Clean up and pin your top 4-6 repositories'],
    '1-2 days', 3) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Portfolio Website', 'A personal site showcasing your projects.',
    array['Presenting projects clearly','Basic personal branding'],
    array['Deploy a personal portfolio site'],
    '3-4 days', 4) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'LinkedIn', 'An optimized LinkedIn profile for recruiters.',
    array['Headline & summary writing','Networking basics'],
    array['Update your LinkedIn with recent projects and skills'],
    '1 day', 5) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Interview Preparation', 'Technical and behavioral interview practice.',
    array['Mock technical interviews','STAR method for behavioral questions'],
    array['Do 3 mock interviews with a peer'],
    '5-7 days', 6) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Placement Preparation', 'Company research and application strategy.',
    array['Researching target companies','Application tracking'],
    array['Build a target-company list and application tracker'],
    '2-3 days', 7) returning id into v_topic_id;


  -- =====================================================================
  -- ROADMAP: AI / ML Engineer
  -- =====================================================================
  insert into public.roadmaps (title, description, category, difficulty, estimated_duration, icon)
  values (
    'AI / ML Engineer',
    'Build a foundation in Python, math for ML, classical machine learning, and deep learning, then ship ML-powered projects.',
    'AI/ML',
    'Intermediate',
    '6-7 months',
    'BrainCircuit'
  ) returning id into v_roadmap_id;

  -- Phase 1: Foundations
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Programming & Math Foundations', 'Python and the math ML is built on.', 1)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Python for Data Science', 'Python fundamentals plus the scientific stack.',
    array['Core Python syntax','NumPy arrays','Pandas DataFrames'],
    array['Clean and analyze a public CSV dataset with Pandas'],
    '10-12 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'NumPy documentation', 'https://numpy.org/doc/stable/user/absolute_beginners.html', 'documentation', 'Official NumPy beginner guide.', 1),
    (v_topic_id, 'Pandas documentation', 'https://pandas.pydata.org/docs/getting_started/index.html', 'documentation', 'Official Pandas getting-started guide.', 2);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Linear Algebra for ML', 'The linear algebra used across ML algorithms.',
    array['Vectors & matrices','Matrix multiplication','Eigenvalues/eigenvectors (intuition)'],
    array['Implement matrix multiplication from scratch, then verify with NumPy'],
    '6-8 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, '3Blue1Brown: Essence of Linear Algebra', 'https://www.3blue1brown.com/topics/linear-algebra', 'video', 'Visual, intuitive linear algebra series.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Probability & Statistics', 'The statistics underlying ML models and evaluation.',
    array['Distributions','Mean/variance/std dev','Bayes'' theorem basics'],
    array['Analyze the distribution of a real dataset column'],
    '6-8 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Khan Academy: Statistics & Probability', 'https://www.khanacademy.org/math/statistics-probability', 'course', 'Free statistics course with exercises.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Data Visualization', 'Communicate patterns in data visually.',
    array['Matplotlib basics','Seaborn statistical plots'],
    array['Build 5 different chart types for one dataset'],
    '3-4 days', 4) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Matplotlib documentation', 'https://matplotlib.org/stable/tutorials/index.html', 'documentation', 'Official Matplotlib tutorials.', 1);

  -- Phase 2: Classical Machine Learning
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Classical Machine Learning', 'Supervised and unsupervised learning with scikit-learn.', 2)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Supervised Learning', 'Regression and classification fundamentals.',
    array['Linear & logistic regression','Decision trees','k-NN'],
    array['Train and evaluate a classifier on a public dataset'],
    '8-10 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'scikit-learn: Supervised learning', 'https://scikit-learn.org/stable/supervised_learning.html', 'documentation', 'Official scikit-learn supervised learning guide.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Unsupervised Learning', 'Clustering and dimensionality reduction.',
    array['k-means clustering','PCA'],
    array['Cluster customers from a sample retail dataset'],
    '5-6 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'scikit-learn: Clustering', 'https://scikit-learn.org/stable/modules/clustering.html', 'documentation', 'Official scikit-learn clustering guide.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Model Evaluation', 'Measure and improve model quality honestly.',
    array['Train/test split & cross-validation','Precision/recall/F1','Overfitting vs underfitting'],
    array['Cross-validate two models and compare metrics'],
    '4-5 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'scikit-learn: Model evaluation', 'https://scikit-learn.org/stable/modules/model_evaluation.html', 'documentation', 'Official guide to evaluation metrics.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Feature Engineering', 'Prepare and transform raw data for models.',
    array['Encoding categorical data','Scaling/normalization','Handling missing data'],
    array['Engineer features for a raw, messy dataset'],
    '4-5 days', 4) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'scikit-learn: Preprocessing', 'https://scikit-learn.org/stable/modules/preprocessing.html', 'documentation', 'Official preprocessing and feature engineering guide.', 1);

  -- Phase 3: Deep Learning
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Deep Learning', 'Neural networks with TensorFlow/PyTorch.', 3)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Neural Network Fundamentals', 'How neural networks learn.',
    array['Perceptrons','Backpropagation (intuition)','Activation functions'],
    array['Implement a basic neural network from scratch in NumPy'],
    '6-8 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, '3Blue1Brown: Neural Networks', 'https://www.3blue1brown.com/topics/neural-networks', 'video', 'Visual, intuitive neural network series.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, prerequisites, estimated_time, order_index)
  values (v_phase_id, 'TensorFlow / Keras', 'Building and training networks with a high-level framework.',
    array['Sequential/functional API','Training loops','Callbacks'],
    array['Train an image classifier on a small dataset'],
    'Neural Network Fundamentals',
    '6-8 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'TensorFlow tutorials', 'https://www.tensorflow.org/tutorials', 'documentation', 'Official TensorFlow tutorials.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'CNNs', 'Convolutional networks for images.',
    array['Convolution & pooling','Common architectures (intuition)'],
    array['Build a CNN image classifier'],
    '5-6 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'CNN tutorial (TensorFlow)', 'https://www.tensorflow.org/tutorials/images/cnn', 'documentation', 'Official image classification with CNNs tutorial.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'NLP Basics', 'Working with text data.',
    array['Tokenization','Word embeddings (intuition)','Text classification'],
    array['Build a sentiment classifier on text data'],
    '5-6 days', 4) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Hugging Face NLP course', 'https://huggingface.co/learn/nlp-course', 'course', 'Free, hands-on NLP course.', 1);

  -- Phase 4: MLOps & Deployment
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'MLOps & Deployment', 'Take models from notebooks to production.', 4)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Model Serving', 'Expose a trained model as an API.',
    array['Wrapping a model with FastAPI/Flask','Basic request/response handling'],
    array['Serve a trained model behind a REST endpoint'],
    '4-5 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'FastAPI documentation', 'https://fastapi.tiangolo.com/', 'documentation', 'Official FastAPI docs, commonly used for model serving.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Experiment Tracking', 'Track experiments, metrics, and model versions.',
    array['Logging metrics & parameters','Comparing experiment runs'],
    array['Track 3 training runs and compare results'],
    '2-3 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'MLflow documentation', 'https://mlflow.org/docs/latest/index.html', 'documentation', 'Official MLflow docs for experiment tracking.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Containerization Basics', 'Package ML services reliably with Docker.',
    array['Writing a Dockerfile','Building & running containers'],
    array['Containerize your model-serving API'],
    '3-4 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Docker documentation', 'https://docs.docker.com/get-started/', 'documentation', 'Official Docker getting-started guide.', 1);

  -- Phase 5: Projects & Career Preparation
  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Projects & Career Preparation', 'Portfolio projects and interview readiness.', 5)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'End-to-End ML Project', 'A complete project from raw data to a deployed model.',
    array['Full ML lifecycle in one project'],
    array['Take a dataset from cleaning through deployment as a demo app'],
    '10-14 days', 1) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Kaggle Practice', 'Competitive practice on real datasets.',
    array['Reading competition problem statements','Iterating on public leaderboards'],
    array['Submit to a beginner-friendly Kaggle competition'],
    '5-7 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Kaggle', 'https://www.kaggle.com/competitions', 'practice', 'Platform for ML datasets and competitions.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'ML Interview Preparation', 'Technical interview readiness for ML roles.',
    array['ML system design basics','Explaining model tradeoffs clearly'],
    array['Practice explaining 3 past projects end-to-end'],
    '5-7 days', 3) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Portfolio & Resume', 'Present ML work credibly to recruiters.',
    array['Writing ML-specific resume bullets','Presenting notebooks/projects clearly'],
    array['Publish 2-3 well-documented ML projects on GitHub'],
    '3-4 days', 4) returning id into v_topic_id;

end $$;
