# WIAL Global Multi-Site Platform — Team Sync&Solve

> 2026 ASU WiCS × Opportunity Hack Hackathon Project

## Quick Links

- [Hackathon Details](https://www.ohack.dev/hack/2026_spring_wics_asu)
- [DevPost Submission](https://wics-ohack-sp26-hackathon.devpost.com/)
- [Team Slack Channel](https://opportunity-hack.slack.com/app_redirect?channel=team-24-sync-solve)

## Team "Sync&Solve"

| Name | GitHub |
|------|--------|
| Debaleena Chakraborty | — |
| Shrey Bishnoi | — |
| Aakash Khepar | — |
| Bhavya Shah | — |

---

## Inspiration

WIAL supports coaches and chapters across 20+ countries, but their digital operations were fragmented: inconsistent chapter websites, hard-to-search coach data, and manual payment workflows. We were inspired by one core challenge: **how do you keep global brand consistency while giving each region local autonomy?** From the hackathon brief and the codebase, we focused on turning that into a practical, secure, and scalable platform for real chapter leaders and coaches.

---

## What It Does

Our platform delivers a **multi-site ecosystem for WIAL** with chapter-level flexibility and global governance:

- 🌐 **Global + chapter websites** with shared branding and local customization
- 🗺️ Dynamic chapter routing and chapter-specific pages
- 🔍 Public and chapter-specific **coach directories**
- 👤 Coach onboarding, verification, status management, and profile editing
- 📚 **Resource library** with search/filter, categorization, and completion tracking
- 📅 **Events management** (create/edit/publish), registration workflows, and chapter/global calendars
- 💳 **Payments via Stripe Checkout** with webhook verification, idempotent processing, and payment history
- 🛡️ **RBAC-driven admin experiences** for super admins, chapter leads, editors, and coaches
- ✏️ Content block editing, approvals, versioning, visibility toggles, and reordering
- 🔒 Audit logging and RLS-first data protection with Supabase

### AI Capabilities

AI features are implemented across branches and features:

| Feature | Technology |
|---------|-----------|
| AI-assisted chapter content generation (localized/culturally adapted draft copy) | OpenAI / Anthropic |
| AI-powered coach matching from natural-language intent | OpenAI embeddings |
| Semantic knowledge/resource search | pgvector + embeddings |
| Automated article ingestion: PDF parsing, summaries, relevance tags, multilingual summaries | Anthropic / Xenova Transformers |
| Webinar marketing generation (LinkedIn post, email draft, content outline) | OpenAI / Anthropic |
| Resource AI summary and promoter-copy caching | OpenAI |
| Video transcription pipeline with AI summary generation from transcripts | ElevenLabs |
| Chapter background music generation | ElevenLabs |

**Relevance scoring intuition:**

```
Overall Relevance ≈ α · SemanticSimilarity + β · TextMatch + γ · BusinessConstraints
```

Semantic vectors improve discovery across vocabulary/language differences; business constraints enforce chapter, role, and publication safety.

---

## How We Built It

Server-first architecture with strict TypeScript boundaries:

### Core Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| UI | HeroUI v3 + TailwindCSS v4 (React Aria, accessible) |
| Database | Supabase Postgres with RLS policies |
| Auth | Supabase Auth + role/permission checks |
| Payments | Stripe Checkout + webhooks |
| i18n | next-intl (localization-ready) |
| Rich Text | tiptap |
| Validation | Zod |
| Testing | Vitest + Playwright + axe-core |

### AI/ML Stack

| Technology | Usage |
|-----------|-------|
| OpenAI | Embeddings, content generation, semantic search |
| Anthropic | Chapter content and transcript-summary workflows |
| Xenova Transformers (`multilingual-e5-small`) | Multilingual embedding flows |
| pgvector | Vector search RPCs on Supabase |
| ElevenLabs | Speech-to-text, chapter audio generation |

---

## Challenges We Ran Into

- Designing a platform that is both globally standardized and regionally flexible
- Keeping strict security guarantees while enabling many admin workflows
- Making AI features useful, not gimmicky, and resilient to missing data
- Handling branch divergence (AISummarizer and linguistic) while preserving a coherent product narrative
- Integrating asynchronous systems (webhooks, cron reminders, content approvals) without duplication or race conditions
- Balancing rich UX with performance and accessibility expectations

---

## Accomplishments We're Proud Of

- ✅ End-to-end multi-site foundation with chapter-aware routing and governance
- ✅ Strong RBAC + RLS posture across critical data surfaces
- ✅ Real payment lifecycle with Stripe webhook verification and idempotency
- ✅ Production-style content operations: approvals, versioning, auditability
- ✅ Meaningful AI features tied to real user value:
  - Better coach discovery
  - Faster localized content creation
  - Usable research summarization and promotion
  - Video-to-summary knowledge acceleration
- ✅ Accessibility and testing treated as first-class quality gates

---

## What We Learned

- Global products need policy and architecture discipline as much as UI polish
- AI is most valuable when embedded into operational workflows (search, summarization, drafting), not isolated demos
- Data modeling for permissions and publication states is the backbone of trust
- Webhook and background-job reliability patterns are essential for real-world systems
- Branch experiments can accelerate innovation, but require strong integration planning

---

## What's Next

- Merge and unify branch AI features into one production-ready roadmap
- Expand multilingual UX and translation quality controls
- Strengthen cross-lingual coach matching with richer relevance feedback loops
- Add stronger chapter analytics and reporting exports
- Complete event ticketing/payment depth and chapter-level financial dashboards
- Improve operational observability (alerts, tracing, failure dashboards)
- Harden deployment and rollout with feature flags and progressive releases

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- Stripe account (test mode)
- OpenAI API key (for AI features)

### Setup

```bash
git clone https://github.com/ak-asu/24-sync-solve.git
cd 24-sync-solve
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

### Environment Variables

```bash
# Public
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=

# Secret (server-only)
SUPABASE_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Run Tests

```bash
npm run test          # unit + integration (Vitest)
npm run test:e2e      # end-to-end (Playwright)
```

---

## Submission Checklist

### 0 / Judging Criteria

- [ ] Review the [judging criteria](https://www.ohack.dev/about/judges#judging-criteria)

### 1 / DevPost

- [ ] Submit to [DevPost](https://wics-ohack-sp26-hackathon.devpost.com/) — see [YouTube Walkthrough](https://youtu.be/rsAAd7LXMDE)
- [ ] Demo video ≤ 4 minutes
- [ ] Link team on [ohack.dev team dashboard](https://www.ohack.dev/hack/2026_spring_wics_asu/manageteam)
- [ ] Link GitHub repo under "Try it out" on DevPost

### 2 / GitHub

- [ ] All team members added to the repo ([Walkthrough](https://youtu.be/kHs0jOewVKI))
- [ ] Repo is public
- [ ] MIT License present
- [ ] Detailed README ✅
