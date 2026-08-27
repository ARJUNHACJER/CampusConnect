-- =====================================================================
-- CampusConnect · Career Roadmap feature
-- Migration 003: seed data — Data Analyst, Cloud Engineer, Cybersecurity
-- =====================================================================

do $$
declare
  v_roadmap_id uuid;
  v_phase_id uuid;
  v_topic_id uuid;
begin

  -- =====================================================================
  -- ROADMAP: Data Analyst
  -- =====================================================================
  insert into public.roadmaps (title, description, category, difficulty, estimated_duration, icon)
  values (
    'Data Analyst',
    'Learn to collect, clean, analyze, and visualize data, and communicate insights that drive decisions.',
    'Data',
    'Beginner',
    '4-5 months',
    'BarChart3'
  ) returning id into v_roadmap_id;

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Foundations', 'Spreadsheets, SQL, and statistics fundamentals.', 1)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Excel / Spreadsheets', 'Analyze data with formulas, pivot tables, and charts.',
    array['Formulas & functions','Pivot tables','Data validation & cleaning'],
    array['Build a pivot-table summary of a sample sales dataset'],
    '5-6 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Microsoft Excel help', 'https://support.microsoft.com/en-us/excel', 'documentation', 'Official Excel documentation and guides.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'SQL for Analysis', 'Query relational data to answer business questions.',
    array['SELECT/WHERE/JOIN/GROUP BY','Window functions','CTEs'],
    array['Answer 10 business questions with SQL against a sample database'],
    '6-8 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'SQLBolt', 'https://sqlbolt.com/', 'practice', 'Interactive SQL lessons and exercises.', 1),
    (v_topic_id, 'Mode SQL Tutorial', 'https://mode.com/sql-tutorial/', 'course', 'Analytics-focused SQL tutorial.', 2);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Statistics Fundamentals', 'Statistical reasoning for analysis.',
    array['Descriptive statistics','Distributions','Hypothesis testing basics'],
    array['Summarize and interpret a real dataset statistically'],
    '5-6 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Khan Academy: Statistics & Probability', 'https://www.khanacademy.org/math/statistics-probability', 'course', 'Free statistics course with exercises.', 1);

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Data Analysis with Python', 'Analyze and clean data programmatically.', 2)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Python Basics', 'Programming fundamentals for analysis.',
    array['Variables & control flow','Functions','Working with lists/dicts'],
    array['Solve 20 beginner Python exercises'],
    '6-8 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Python official tutorial', 'https://docs.python.org/3/tutorial/', 'documentation', 'Official Python tutorial.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Pandas', 'Clean, transform, and analyze tabular data.',
    array['DataFrames & Series','Filtering & grouping','Merging datasets'],
    array['Clean a messy real-world CSV end-to-end'],
    '6-8 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Pandas documentation', 'https://pandas.pydata.org/docs/getting_started/index.html', 'documentation', 'Official Pandas getting-started guide.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Data Visualization', 'Communicate findings visually.',
    array['Matplotlib/Seaborn charts','Choosing the right chart type'],
    array['Build a 5-chart analysis report from one dataset'],
    '4-5 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Seaborn documentation', 'https://seaborn.pydata.org/tutorial.html', 'documentation', 'Official Seaborn tutorial for statistical charts.', 1);

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'BI Tools & Dashboards', 'Build dashboards used in real businesses.', 3)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Power BI / Tableau', 'Build interactive dashboards.',
    array['Connecting data sources','Building visuals','Interactivity & filters'],
    array['Build an interactive sales dashboard'],
    '6-8 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Power BI documentation', 'https://learn.microsoft.com/en-us/power-bi/', 'documentation', 'Official Power BI documentation.', 1),
    (v_topic_id, 'Tableau Public training', 'https://public.tableau.com/en-us/s/resources', 'course', 'Free Tableau training resources.', 2);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Storytelling with Data', 'Present insights that drive decisions.',
    array['Structuring an analysis narrative','Avoiding misleading charts'],
    array['Present a dashboard findings summary to a peer'],
    '2-3 days', 2) returning id into v_topic_id;

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Projects & Career Preparation', 'Portfolio and interview readiness.', 4)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'End-to-End Analysis Project', 'A complete analysis from raw data to dashboard.',
    array['Full analysis lifecycle in one project'],
    array['Publish a full analysis: cleaning, SQL, visualization, dashboard'],
    '8-10 days', 1) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Resume & Portfolio', 'Present analysis work to recruiters.',
    array['Writing analyst-specific resume bullets'],
    array['Publish 2-3 case studies with dashboards/notebooks'],
    '3-4 days', 2) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Interview Preparation', 'Case-study and SQL interview practice.',
    array['Case-study frameworks','Live SQL problem solving'],
    array['Practice 5 analytics case-study questions'],
    '4-5 days', 3) returning id into v_topic_id;


  -- =====================================================================
  -- ROADMAP: Cloud Engineer
  -- =====================================================================
  insert into public.roadmaps (title, description, category, difficulty, estimated_duration, icon)
  values (
    'Cloud Engineer',
    'Learn cloud infrastructure, networking, containers, and CI/CD to design and operate scalable systems.',
    'Cloud',
    'Intermediate',
    '5-6 months',
    'Cloud'
  ) returning id into v_roadmap_id;

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'IT & Networking Fundamentals', 'The fundamentals every cloud engineer needs.', 1)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Linux Fundamentals', 'Operate and administer Linux servers.',
    array['Shell basics','File permissions','Process management'],
    array['Set up and administer a Linux VM from scratch'],
    '6-8 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Linux Journey', 'https://linuxjourney.com/', 'course', 'Free, structured Linux fundamentals course.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Networking Basics', 'Core networking concepts behind cloud infrastructure.',
    array['TCP/IP','DNS','Load balancing basics'],
    array['Diagram the request path for a typical web app'],
    '5-6 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Networking basics (Cloudflare Learning)', 'https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/', 'article', 'Accessible networking fundamentals.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Git & Version Control', 'Track infrastructure and application code changes.',
    array['git basics','Branching workflows'],
    array['Manage an infra-as-code repo with feature branches'],
    '2-3 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Git documentation', 'https://git-scm.com/doc', 'documentation', 'Official Git reference and book.', 1);

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Cloud Platforms', 'Core services on a major cloud provider.', 2)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Cloud Fundamentals (AWS/Azure/GCP)', 'Core compute, storage, and networking services.',
    array['Compute instances','Object storage','VPC/networking basics'],
    array['Deploy a simple web app on a free-tier cloud account'],
    '8-10 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'AWS Cloud Practitioner Essentials', 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', 'course', 'Official free AWS fundamentals training.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'IAM & Security Basics', 'Manage access safely in the cloud.',
    array['Users, roles, policies','Principle of least privilege'],
    array['Set up least-privilege IAM roles for a sample project'],
    '3-4 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'AWS IAM documentation', 'https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html', 'documentation', 'Official AWS IAM guide.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Infrastructure as Code', 'Define infrastructure declaratively.',
    array['Terraform basics','State management (intuition)'],
    array['Provision a VM and storage bucket using Terraform'],
    '6-8 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Terraform documentation', 'https://developer.hashicorp.com/terraform/docs', 'documentation', 'Official Terraform docs.', 1);

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Containers & Orchestration', 'Package and run applications at scale.', 3)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Docker', 'Package applications as containers.',
    array['Images & containers','Dockerfiles','Volumes & networking'],
    array['Containerize a sample web application'],
    '5-6 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Docker documentation', 'https://docs.docker.com/get-started/', 'documentation', 'Official Docker getting-started guide.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, prerequisites, estimated_time, order_index)
  values (v_phase_id, 'Kubernetes Basics', 'Orchestrate containers at scale.',
    array['Pods, deployments, services','kubectl basics'],
    array['Deploy a containerized app to a local Kubernetes cluster'],
    'Docker',
    '8-10 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Kubernetes documentation', 'https://kubernetes.io/docs/home/', 'documentation', 'Official Kubernetes documentation.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'CI/CD', 'Automate build, test, and deployment.',
    array['Pipeline stages','Automated testing in CI','Deployment strategies (intuition)'],
    array['Set up a CI pipeline that tests and deploys on push'],
    '5-6 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'GitHub Actions documentation', 'https://docs.github.com/en/actions', 'documentation', 'Official GitHub Actions CI/CD docs.', 1);

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Projects & Career Preparation', 'Portfolio and interview readiness.', 4)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'End-to-End Cloud Project', 'Deploy a full application with IaC and CI/CD.',
    array['Full cloud deployment lifecycle in one project'],
    array['Deploy an app with Terraform, Docker, and a CI/CD pipeline'],
    '10-12 days', 1) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Cloud Certification Prep', 'Validate skills with an entry-level certification.',
    array['Exam-format practice','Reviewing weak areas'],
    array['Take practice exams for an associate-level cloud certification'],
    '7-10 days', 2) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Interview Preparation', 'System-design and troubleshooting interview practice.',
    array['Basic system design','Explaining infrastructure decisions'],
    array['Practice designing a scalable architecture on a whiteboard'],
    '5-7 days', 3) returning id into v_topic_id;


  -- =====================================================================
  -- ROADMAP: Cybersecurity
  -- =====================================================================
  insert into public.roadmaps (title, description, category, difficulty, estimated_duration, icon)
  values (
    'Cybersecurity',
    'Build a foundation in networking and systems, then move into security fundamentals, offensive/defensive basics, and hands-on labs.',
    'Security',
    'Intermediate',
    '5-6 months',
    'ShieldCheck'
  ) returning id into v_roadmap_id;

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Foundations', 'Networking and systems knowledge security is built on.', 1)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Networking Fundamentals', 'Deep understanding of how networks operate.',
    array['OSI/TCP-IP models','Ports & protocols','Packet analysis basics'],
    array['Capture and analyze traffic with a packet analyzer'],
    '6-8 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Wireshark documentation', 'https://www.wireshark.org/docs/', 'documentation', 'Official docs for the Wireshark packet analyzer.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Operating Systems (Linux & Windows)', 'Administer and secure both major OS families.',
    array['Linux command line','Windows security basics','User & permission management'],
    array['Harden a Linux VM following a basic checklist'],
    '8-10 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Linux Journey', 'https://linuxjourney.com/', 'course', 'Free, structured Linux fundamentals course.', 1);

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Security Fundamentals', 'Core security concepts and principles.', 2)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Security Principles', 'The core concepts underlying all security work.',
    array['CIA triad','Threat modeling basics','Risk assessment'],
    array['Threat-model a simple web application'],
    '4-5 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'OWASP Top 10', 'https://owasp.org/www-project-top-ten/', 'documentation', 'Industry-standard list of critical web app security risks.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Cryptography Basics', 'How data is protected at rest and in transit.',
    array['Symmetric vs asymmetric encryption','Hashing','TLS basics'],
    array['Explain how HTTPS secures a request end-to-end'],
    '4-5 days', 2) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'Cryptography 101 (Khan Academy)', 'https://www.khanacademy.org/computing/computer-science/cryptography', 'course', 'Free introductory cryptography course.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Web Application Security', 'Common vulnerabilities in web apps.',
    array['SQL injection','XSS','CSRF'],
    array['Find and fix vulnerabilities in an intentionally vulnerable app'],
    '6-8 days', 3) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'OWASP Juice Shop', 'https://owasp.org/www-project-juice-shop/', 'tool', 'Intentionally vulnerable app for practicing web security.', 1);

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Offensive & Defensive Basics', 'Hands-on security practice.', 3)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Ethical Hacking Basics', 'Understand how attackers think, legally and ethically.',
    array['Reconnaissance basics','Vulnerability scanning','Reporting findings'],
    array['Complete a beginner room on a legal hacking practice platform'],
    '6-8 days', 1) returning id into v_topic_id;
  insert into public.roadmap_resources (topic_id, title, url, resource_type, description, order_index) values
    (v_topic_id, 'TryHackMe', 'https://tryhackme.com/', 'practice', 'Guided, legal hands-on cybersecurity labs.', 1);

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Security Monitoring', 'Detect and respond to suspicious activity.',
    array['Logging basics','Intrusion detection concepts'],
    array['Review logs from a sample incident and identify anomalies'],
    '4-5 days', 2) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Incident Response Basics', 'Respond to security incidents methodically.',
    array['Incident response lifecycle','Basic containment strategies'],
    array['Write an incident response plan for a sample scenario'],
    '3-4 days', 3) returning id into v_topic_id;

  insert into public.roadmap_phases (roadmap_id, title, description, order_index)
  values (v_roadmap_id, 'Projects & Career Preparation', 'Portfolio and interview readiness.', 4)
  returning id into v_phase_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Home Lab Project', 'A hands-on lab environment to demonstrate skills.',
    array['Setting up a segmented practice network'],
    array['Build and document a home lab with a vulnerable target VM'],
    '5-7 days', 1) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Security Certification Prep', 'Validate skills with an entry-level certification.',
    array['Exam-format practice','Reviewing weak domains'],
    array['Take practice exams for an entry-level security certification'],
    '10-14 days', 2) returning id into v_topic_id;

  insert into public.roadmap_topics (phase_id, title, description, what_youll_learn, practice_tasks, estimated_time, order_index)
  values (v_phase_id, 'Interview Preparation', 'Scenario-based security interview practice.',
    array['Explaining past labs/projects clearly','Scenario-based Q&A practice'],
    array['Practice 5 scenario-based security interview questions'],
    '4-5 days', 3) returning id into v_topic_id;

end $$;
