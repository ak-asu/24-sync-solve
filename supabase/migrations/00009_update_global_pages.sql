-- ============================================================
-- WIAL Platform - Refresh Global Pages Content
-- Migration: 00009_update_global_pages
-- ============================================================
-- Replaces stale / empty content blocks for the home, about,
-- certification, and resources global pages with substantive,
-- accurate content aligned with WIAL's mission and methodology.
--
-- Strategy: DELETE then re-INSERT rather than ON CONFLICT DO NOTHING,
-- so stale or empty blocks created by earlier migrations are replaced.
-- ============================================================

-- ── Step 1: Remove all existing blocks for the four global pages ──

DELETE FROM content_blocks
WHERE page_id IN (
  SELECT id FROM pages
  WHERE chapter_id IS NULL
  AND slug IN ('home', 'about', 'certification', 'resources')
);

-- ── Step 2: Home page ─────────────────────────────────────────────

WITH home_page AS (
  SELECT id FROM pages WHERE chapter_id IS NULL AND slug = 'home'
)
INSERT INTO content_blocks (
  page_id, block_type, content, published_version,
  sort_order, is_visible, status, requires_approval
)
SELECT
  home_page.id,
  block_type::block_type,
  content,
  content AS published_version,
  sort_order,
  true,
  'published',
  block_type IN ('hero', 'cta', 'contact_form')
FROM home_page, (VALUES
  (
    'hero',
    '{"headline": "Transforming Leaders Through Action Learning", "subheadline": "WIAL certifies Action Learning coaches in 20+ countries, empowering organisations to solve complex challenges and build lasting leadership capacity.", "cta_primary_text": "Find a Coach", "cta_primary_href": "/coaches", "cta_secondary_text": "Get Certified", "cta_secondary_href": "/certification", "background_image_url": null}'::jsonb,
    0
  ),
  (
    'stats',
    '{"items": [{"label": "Countries", "value": "20+"}, {"label": "Certified Coaches", "value": "500+"}, {"label": "Organisations Served", "value": "1,000+"}, {"label": "Years of Impact", "value": "30+"}]}'::jsonb,
    1
  ),
  (
    'text',
    '{"heading": "What is Action Learning?", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Action Learning is a powerful process in which a small, diverse team works on a real, complex problem, takes action, and learns from the results. It is simultaneously a problem-solving methodology and one of the world''s most effective leadership development approaches."}]}, {"type": "paragraph", "content": [{"type": "text", "text": "The World Institute for Action Learning (WIAL) was founded by Dr. Michael Marquardt and is the global authority on Action Learning. WIAL''s structured methodology — built around insightful questioning, active listening, and reflective practice — is used by Fortune 500 companies, governments, NGOs, and universities on every continent."}]}]}}'::jsonb,
    2
  ),
  (
    'text',
    '{"heading": "Certification Levels", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "WIAL offers four progressive certification levels, each recognising increasing depth of expertise. All levels are competency-based and require documented coaching hours in real Action Learning sets."}]}, {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "CALC — Certified Action Learning Coach"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Entry-level credential for new practitioners. Requires 3 sets coached (approx. 20 hours) and completion of WIAL-accredited training."}]}, {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "PALC — Professional Action Learning Coach"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "For coaches with proven competency across diverse contexts. Requires 5 sets (approx. 40 hours) and a reflective portfolio."}]}, {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "SALC — Senior Action Learning Coach"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Recognises advanced mastery in complex, multicultural settings. Requires 8+ sets (approx. 70 hours), peer review, and contribution to the field."}]}, {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "MALC — Master Action Learning Coach"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "The highest WIAL designation. Awarded to coaches demonstrating extraordinary mastery, original scholarship, and sustained service to the global Action Learning community."}]}]}}'::jsonb,
    3
  ),
  (
    'cta',
    '{"heading": "Ready to Transform Your Organisation?", "subheading": "Join the global community of certified Action Learning coaches and practitioners making a difference in 20+ countries.", "button_text": "Find Your Coach", "button_href": "/coaches", "variant": "dark"}'::jsonb,
    4
  )
) AS blocks(block_type, content, sort_order);

-- ── Step 3: About page ────────────────────────────────────────────

WITH about_page AS (
  SELECT id FROM pages WHERE chapter_id IS NULL AND slug = 'about'
)
INSERT INTO content_blocks (
  page_id, block_type, content, published_version,
  sort_order, is_visible, status, requires_approval
)
SELECT
  about_page.id,
  block_type::block_type,
  content,
  content AS published_version,
  sort_order,
  true,
  'published',
  block_type IN ('hero', 'cta', 'contact_form')
FROM about_page, (VALUES
  (
    'hero',
    '{"headline": "About WIAL", "subheadline": "The World Institute for Action Learning is the global authority on Action Learning — a transformative methodology for leadership development and organisational problem-solving practised in 20+ countries."}'::jsonb,
    0
  ),
  (
    'text',
    '{"heading": "Our Mission", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "WIAL''s mission is to advance Action Learning worldwide as the premier methodology for developing leaders who can tackle complex challenges in a rapidly changing world. We certify coaches, develop practitioners, and connect a global community committed to learning through action."}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Founded by Dr. Michael Marquardt, WIAL draws on over 30 years of research and practice to set the global standard for Action Learning quality. Our certification programmes, professional community, and research initiatives ensure that Action Learning''s transformative power reaches organisations and individuals everywhere."}]}]}}'::jsonb,
    1
  ),
  (
    'text',
    '{"heading": "The Action Learning Methodology", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Action Learning brings together a small group of 4–8 people — drawn from different functions, levels, or organisations — to work on a real, urgent, complex problem. The WIAL methodology has six essential components:"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "A real problem "}, {"type": "text", "text": "that is important, complex, and has no obvious solution."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "An Action Learning set "}, {"type": "text", "text": "of 4–8 diverse members who are committed to solving the problem."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Insightful questioning "}, {"type": "text", "text": "and active listening as the primary mode of communication."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Taking action "}, {"type": "text", "text": "on the problem between and after sessions."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "A commitment to learning "}, {"type": "text", "text": "as individuals, as a team, and as an organisation."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "An Action Learning Coach "}, {"type": "text", "text": "who focuses the group on learning and ensures the process is followed with fidelity."}]}]}]}]}}'::jsonb,
    2
  ),
  (
    'stats',
    '{"heading": "Our Global Impact", "items": [{"label": "Countries", "value": "20+"}, {"label": "Certified Coaches", "value": "500+"}, {"label": "Organisations Served", "value": "1,000+"}, {"label": "Years of Research", "value": "30+"}]}'::jsonb,
    3
  ),
  (
    'text',
    '{"heading": "Our Global Community", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "WIAL operates through a network of regional chapters spanning every continent. Each chapter brings Action Learning to its local context — adapting delivery, supporting local coaches, and connecting practitioners — while maintaining the rigorous global standards that make WIAL certification meaningful worldwide."}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Our chapters are led by certified Senior and Master Action Learning Coaches who are deeply embedded in their regional leadership development ecosystems. Through chapters in the USA, UK, Nigeria, Brazil, Australia, and many more countries, WIAL ensures that world-class Action Learning is accessible wherever it is needed."}]}]}}'::jsonb,
    4
  )
) AS blocks(block_type, content, sort_order);

-- ── Step 4: Certification page ────────────────────────────────────

WITH cert_page AS (
  SELECT id FROM pages WHERE chapter_id IS NULL AND slug = 'certification'
)
INSERT INTO content_blocks (
  page_id, block_type, content, published_version,
  sort_order, is_visible, status, requires_approval
)
SELECT
  cert_page.id,
  block_type::block_type,
  content,
  content AS published_version,
  sort_order,
  true,
  'published',
  block_type IN ('hero', 'cta', 'contact_form')
FROM cert_page, (VALUES
  (
    'hero',
    '{"headline": "Action Learning Certification", "subheadline": "Earn globally recognised credentials as an Action Learning coach. WIAL''s four certification levels provide a clear pathway from entry-level practice to master-level mastery, validated by the world''s leading Action Learning authority.", "cta_primary_text": "Apply Now", "cta_primary_href": "/about#contact", "cta_secondary_text": "Find a Coach", "cta_secondary_href": "/coaches"}'::jsonb,
    0
  ),
  (
    'text',
    '{"heading": "Why Get Certified?", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "WIAL certification is the international gold standard for Action Learning coaches. It signals to clients, employers, and colleagues that you have been rigorously assessed against global competency standards — not just trained in a methodology."}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Recognised by multinational corporations, governments, and leading universities worldwide"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Competency-based: assessed on real coaching practice, not just coursework"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Progressive: four levels that grow with your career, from first sets to master practitioner"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Global: valid across all WIAL chapters and recognised in 20+ countries"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Community: join 500+ certified coaches in a peer network spanning six continents"}]}]}]}]}}'::jsonb,
    1
  ),
  (
    'text',
    '{"heading": "Certification Levels", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Each level builds on the previous, deepening your competency and expanding your scope of practice. Certification requires documented coaching hours in real sets — not simulations."}]}, {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "CALC — Certified Action Learning Coach"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "The entry-level WIAL credential for practitioners who have completed accredited training and are beginning their coaching practice."}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Minimum 3 Action Learning sets coached (approx. 20 hours)"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Completion of WIAL-accredited coach training"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Demonstration of core Action Learning competencies"}]}]}]}, {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "PALC — Professional Action Learning Coach"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "For coaches who have built a practice and demonstrated consistent competency across diverse organisational contexts."}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Minimum 5 Action Learning sets coached (approx. 40 hours)"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Reflective portfolio demonstrating professional growth"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Evidence of coaching across different problem types and group compositions"}]}]}]}, {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "SALC — Senior Action Learning Coach"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Recognises advanced mastery in complex, multicultural, and high-stakes settings. SALC coaches often mentor emerging practitioners."}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Minimum 8 Action Learning sets coached (approx. 70+ hours)"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Peer review and assessment by certified SALC or MALC coaches"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Evidence of contribution to the field (writing, teaching, or mentoring)"}]}]}]}, {"type": "heading", "attrs": {"level": 3}, "content": [{"type": "text", "text": "MALC — Master Action Learning Coach"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "The highest WIAL certification, reserved for coaches who have made exceptional contributions to Action Learning theory, practice, and the global community."}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Extensive documented coaching portfolio across multiple organisations and sectors"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Original contribution to Action Learning knowledge (publications, curriculum, or research)"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Sustained mentoring of coaches at lower certification levels"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Assessment by WIAL Master coaches and board review"}]}]}]}]}}'::jsonb,
    2
  ),
  (
    'text',
    '{"heading": "How to Get Certified", "body": {"type": "doc", "content": [{"type": "orderedList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Complete accredited training. "}, {"type": "text", "text": "Attend a WIAL-accredited Action Learning Coach training programme delivered by a certified chapter or authorised partner."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Coach real sets. "}, {"type": "text", "text": "Apply your skills by coaching genuine Action Learning sessions in your organisation or as an external practitioner. Document each set with participant details and outcomes."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Build your portfolio. "}, {"type": "text", "text": "Compile a reflective portfolio demonstrating your competency development, the sets you have coached, and your professional growth."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Submit your application. "}, {"type": "text", "text": "Apply through your regional WIAL chapter or via WIAL Global. Your portfolio is reviewed by certified assessors."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Receive your credential. "}, {"type": "text", "text": "Upon approval, receive your WIAL certification and join the global register of certified coaches. Certification is valid for two years."}]}]}]}]}}'::jsonb,
    3
  ),
  (
    'text',
    '{"heading": "Recertification", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "All WIAL certifications are valid for two years. Recertification ensures that coaches remain current with evolving practice standards and continue growing their competency."}]}, {"type": "paragraph", "content": [{"type": "text", "text": "To recertify, you must demonstrate continued active practice (minimum sets coached in the cycle), complete ongoing professional development, and submit evidence of your continued contribution to Action Learning. WIAL chapter members receive recertification support and reminders through their local chapter."}]}]}}'::jsonb,
    4
  ),
  (
    'cta',
    '{"heading": "Start Your Certification Journey", "subheading": "Contact your regional WIAL chapter to enrol in accredited training and begin the path to WIAL certification.", "button_text": "Contact WIAL", "button_href": "/about#contact", "variant": "dark"}'::jsonb,
    5
  )
) AS blocks(block_type, content, sort_order);

-- ── Step 5: Resources page ────────────────────────────────────────

WITH resources_page AS (
  SELECT id FROM pages WHERE chapter_id IS NULL AND slug = 'resources'
)
INSERT INTO content_blocks (
  page_id, block_type, content, published_version,
  sort_order, is_visible, status, requires_approval
)
SELECT
  resources_page.id,
  block_type::block_type,
  content,
  content AS published_version,
  sort_order,
  true,
  'published',
  block_type IN ('hero', 'cta', 'contact_form')
FROM resources_page, (VALUES
  (
    'hero',
    '{"headline": "Resources & Library", "subheadline": "Research, practitioner guides, webinars, and tools to deepen your Action Learning practice — curated by WIAL and the global coaching community."}'::jsonb,
    0
  ),
  (
    'text',
    '{"heading": "Research & Publications", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "WIAL supports a rich body of research and academic publishing on Action Learning theory and practice:"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Action Learning: Research & Practice "}, {"type": "text", "text": "— the peer-reviewed journal dedicated to Action Learning, published in association with WIAL."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "\"Action Learning: How the World''s Top Companies Are Re-creating Their Leaders\" "}, {"type": "text", "text": "— Dr. Michael Marquardt''s foundational text for WIAL''s approach."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "\"Optimizing the Power of Action Learning\" "}, {"type": "text", "text": "— WIAL''s core practitioner guide covering set design, problem scoping, and coach competencies."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Case studies from WIAL-certified coaches working in government, corporate, healthcare, and education sectors across 20+ countries."}]}]}]}]}}'::jsonb,
    1
  ),
  (
    'text',
    '{"heading": "Practitioner Guides", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Practical resources developed by WIAL and the global coach community:"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Set Design Toolkit "}, {"type": "text", "text": "— frameworks for scoping problems, composing sets, and contracting with sponsors."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Questioning Frameworks "}, {"type": "text", "text": "— question hierarchies and prompts aligned to WIAL''s competency model."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Virtual Action Learning Guide "}, {"type": "text", "text": "— adapting WIAL''s methodology for remote and hybrid set delivery."}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "Stakeholder Engagement Playbook "}, {"type": "text", "text": "— how to brief sponsors, participants, and champions for maximum set impact."}]}]}]}]}}'::jsonb,
    2
  ),
  (
    'text',
    '{"heading": "Webinars & Learning Sessions", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "WIAL and regional chapters host regular webinars, workshops, and community calls. Topics include advanced coaching techniques, cross-cultural Action Learning, virtual facilitation, and peer coaching practice."}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Check your regional chapter''s events page for upcoming sessions, or contact WIAL Global to access recorded content from past webinars."}]}]}}'::jsonb,
    3
  ),
  (
    'text',
    '{"heading": "Tools & Templates", "body": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Ready-to-use instruments for coaches and programme designers:"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Session planning and debrief templates"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Participant self-assessment forms (aligned to WIAL competency model)"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Problem statement scoping canvas"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Action tracking and accountability log"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Programme evaluation and ROI measurement framework"}]}]}]}]}}'::jsonb,
    4
  ),
  (
    'cta',
    '{"heading": "Contribute to the Library", "subheading": "Are you a certified coach with a case study, guide, or tool worth sharing? WIAL welcomes community contributions that advance Action Learning practice.", "button_text": "Contact WIAL", "button_href": "/about#contact", "variant": "light"}'::jsonb,
    5
  )
) AS blocks(block_type, content, sort_order);
