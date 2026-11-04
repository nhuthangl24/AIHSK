# Classnia AI (华语考官 AI)
### Standardized AI Chinese Speaking Assessment SaaS Platform

Classnia AI is a brand-new, production-ready SaaS platform for AI-powered oral Chinese language proficiency assessment. The platform enables learners, educators, and language institutions to conduct authentic, full-length spoken Mandarin examinations with an adaptive AI Examiner and receive psychometrically grounded, multi-dimensional diagnostic reports.

---

## 🌟 Key Features

### 1. 5-Stage Standardized AI Examiner
- **Examiner Li (考官李老师)**: Speaks natural, standard Putonghua (Simplified Mandarin) and conducts structured oral interviews.
- **5-Stage Examination Framework**:
  - **Stage 1 (Warm-up & Introduction / 问候与自我介绍)**: Tests audio clarity, confirms candidate readiness, elicits introductory background.
  - **Stage 2 (Daily Life & Routines / 日常生活与兴趣)**: Probes daily habits, study routines, and personal hobbies.
  - **Stage 3 (Thematic Topic Presentation / 主题阐述与表达)**: Presents cultural, tech, or societal themes requiring structured argumentation.
  - **Stage 4 (In-Depth Probing & Reasoning / 深入追问与思辨)**: Probes candidate assertions, tests complex discourse markers and counterarguments.
  - **Stage 5 (Conclusion & Wrap-up / 考试总结与致谢)**: Concludes the exam session and triggers the asynchronous scoring pipeline.
- **Full Conversation Context**: Scoring is never based on isolated fragments; it evaluates the whole dialogue trajectory.

### 2. Deterministic 7-Dimension Psychometric Scoring Engine
Evaluates complete transcripts against 7 weighted linguistic dimensions:
1. **Pronunciation & Mandarin Tones** (Weight: 20%) — Vowel clarity, tone sandhi (三声变调), retroflex initials (zh, ch, sh).
2. **Fluency & Speech Cadence** (Weight: 20%) — Pace, pause distribution at syntactic boundaries, hesitation reduction.
3. **Vocabulary Range & Appropriateness** (Weight: 15%) — HSK tier distribution, lexical variety, idiomatic expressions (成语).
4. **Grammar & Syntax Accuracy** (Weight: 15%) — Word order, connective pairs (因为...所以, 虽然...但是), 把字句, aspect particles.
5. **Discourse Coherence** (Weight: 10%) — Logical transitions, paragraph structuring, thematic consistency.
6. **Listening Comprehension** (Weight: 10%) — Question relevance and addressing multi-part prompts.
7. **Interactive Sustained Dialogue** (Weight: 10%) — Back-and-forth conversational agility and elaboration depth.

### 3. Comprehensive Diagnostic Reports
- Overall score (0-100), CEFR Estimate (A1-C2), and Unofficial HSK Estimate (HSK 1-6).
- Verbatim transcript citations supporting every score dimension.
- Concrete grammar correction tables (`Original` &rarr; `Corrected` &rarr; `Rule` &rarr; `Example`).
- Vocabulary elevation tables (`Colloquial` &rarr; `Elevated Written Register` &rarr; `Connotation`).
- Pronunciation & Tone Sandhi diagnostics.
- Personalized 4-week learning roadmap with targeted exercises.
- Complete conversation transcript viewer with embedded audio logs.
- Print / PDF export layout.

### 4. Role-Based Access Control (4 Distinct Roles)
1. **Learner (学生)**: Take spoken assessments, view score trends, access personalized feedback roadmaps, upgrade subscription.
2. **Teacher (教师)**: Manage classroom cohorts, generate class join codes, assign oral examinations with due dates, review student audio & transcripts, export gradebooks.
3. **Organization Admin (机构管理员)**: Multi-tenant tenant portal, license seat allocation, departmental oversight, institutional analytics.
4. **Platform Super Admin (系统管理员)**: Telemetry overview, user account governance, assessment template & rubric versioning, AI provider configuration, worker job queues.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, Server Components, Route Handlers, Server Actions)
- **Language**: TypeScript Strict Mode
- **Styling**: Tailwind CSS + Custom Design System (Chinese lacquer slate & imperial cinnabar aesthetic)
- **UI Components**: shadcn/ui foundation with customized accessible primitives
- **Icons**: Lucide Icons
- **Database**: Firebase Firestore & Persistent Assessment Store (Zero-PostgreSQL)
- **Authentication**: Firebase Authentication & Classnia SSO (hsk_session_token) + Secure JWT sessions via `jose`
- **Object Storage**: S3-compatible storage abstraction with fallback local filesystem storage
- **Background Processing**: Asynchronous worker pipeline (`BackgroundJob` model)
- **Testing**: Vitest unit and integration test suite

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js >= 18
- Firebase project configured (Firestore & Firebase Auth)

### 2. Installation
```bash
git clone <repo-url>
cd AIHSK
npm install
```

### 3. Database Initialization & Migrations
```bash
# Push schema to PostgreSQL database
npm run db:push

# Seed plans, rubrics, templates, and demo accounts
npm run db:seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Tests
```bash
npm run test
```

### 6. Production Build
```bash
npm run build
npm run start
```

---

## 🔑 Pre-Configured Demo Accounts

Use any of the seeded demo accounts to inspect the application across all four roles:

| Role | Email | Password | Dashboard URL |
|---|---|---|---|
| **Learner (Alex Chen)** | `learner@aihsk.com` | `Password123!` | `/dashboard` |
| **Teacher (Prof. Zhang)** | `teacher@aihsk.com` | `Password123!` | `/teacher` |
| **Org Admin (Director Wang)** | `admin@oriental-edu.com` | `Password123!` | `/organization` |
| **Super Admin (Administrator)** | `superadmin@aihsk.com` | `Password123!` | `/admin` |

*Tip: The `/login` page features one-click buttons to instantly fill in any of these demo credentials.*

---

## 🛡️ Applied Agent Skills

During the architecture and implementation phases, the following official engineering skills were installed, inspected, and strictly applied:

1. **Anthropic Frontend Design (`anthropics/skills/frontend-design`)**:
   - Designed a distinct visual identity grounded in Chinese calligraphy and lacquer aesthetics (ink slate `#0F172A`, imperial cinnabar `#E11D48`, jade `#059669`, warm porcelain `#F8FAFC`).
   - Eliminated generic AI boilerplate (avoided cliché terracotta/cream combinations and acid-green accents).
   - Applied editorial typography scales with bilingual system font fallbacks.

2. **UI/UX Pro Max (`nextlevelbuilder/ui-ux-pro-max-skill`)**:
   - Implemented strict design tokens for spacing, radius, accessible contrast ratios (WCAG AAA compliant text).
   - Responsive layouts optimized for mobile microphone interactions (touch targets &ge; 44px).
   - Clear empty states, loading indicators, and soundwave animation states.

3. **Vercel React Best Practices (`vercel-labs/agent-skills/vercel-react-best-practices`)**:
   - Clean Server and Client component boundaries.
   - Elimination of request waterfalls via `Promise.all` in data fetching.
   - Dynamic server route declarations (`export const dynamic = "force-dynamic"`) for cookie-dependent protected views.

4. **Vercel Web Design Guidelines (`vercel-labs/agent-skills/web-design-guidelines`)**:
   - Semantic HTML5 landmark tags (`<header>`, `<main>`, `<aside>`, `<footer>`, `<section>`).
   - Accessible ARIA roles for progress meters and live recording indicators.
   - Visible focus states and keyboard navigation.

---

## 📄 License & Disclaimer

Classnia AI is an independent software product. It provides formative educational estimates aligned with CEFR and HSK proficiency rubrics. Classnia AI is not affiliated with, licensed by, or an official representative of Chinese Testing International (CTI) or the Ministry of Education of China.
