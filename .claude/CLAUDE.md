# StudyFlow Project Memory

## User Preferences
- **Always ask permission before deleting files**
- **Be precise** — when told to do something (e.g. replace English videos with Finnish), actually DO it, don't just set up the infrastructure and skip the data work
- Don't mention book names "Kort matematik 5" or "Samhällslära 2" anywhere in the app — subjects are merged seamlessly
- User's own AI tutor description is the gold standard for strict tutor mode

## Project Overview
- **What**: Finnish/Swedish university entrance exam (Valintakoe F / Hanken) learning platform
- **Stack**: Next.js 15.5.10, TypeScript, Tailwind CSS, Supabase (PostgreSQL), Vercel
- **Live URL**: https://study-flow-five-gamma.vercel.app
- **GitHub repo**: NiclasAssendelft/StudyFlow (auto-deploys to Vercel on push)

## Key Infrastructure
- **Supabase project**: ocokoemfmdodzftqbjim
- **Supabase URL**: https://ocokoemfmdodzftqbjim.supabase.co
- **Vercel team**: niclasassendelfts-projects (team_4K1THEF7ovS39l1m5mOb9I53)
- **Vercel project**: study-flow (prj_cqRuKXAvd3OjXkizuFV1nrHRyDcz)

## Database Schema Notes
- `student_profiles` uses `auth_user_id` (NOT `user_id`) to reference auth.users
- `student_profiles` also has: `xp`, `current_streak`, `longest_streak`, `last_activity_date`
- `topics.id` is TEXT (e.g. "1.1", "3.8")
- `lessons.id` is UUID (auto-generated)
- `topics` has NOT NULL on `name_en` — always include when inserting
- `lessons` has NOT NULL on `title_en` — always include when inserting
- Bilingual columns added: `topics.name_sv`, `lessons.title_sv/content_sv/video_url_sv/video_title_sv`
- `lesson_tasks` and `lesson_task_responses` tables exist with RLS
- `badges`, `student_badges`, `xp_log` tables for gamification with RLS
- Question type in DB is `mcq` (NOT `multiple_choice`)
- Question content schema: `{question_text, question_text_sv, options: [{id, text, text_sv}], correct_answer, explanation, explanation_sv}`

## Current DB State (as of March 2026)
- 37 topics (6 new: 3.8-3.11 statistics, 2.8-2.9 macroeconomics)
- 66 lessons with Finnish content + LaTeX math
- 270 MCQ questions — all 33 topics have 8+ questions with fi+sv translations
- 102 lesson tasks (basic_answer + math_calculation) covering all 66 lessons
- All topics have name_sv, all lessons have title_sv + content_sv
- All 66 lessons have Finnish YouTube videos (video_url, video_title)
- All 66 lessons have Swedish YouTube videos (video_url_sv, video_title_sv)
- 16 badge definitions across 5 categories (streak, xp, lesson, exam, special)

## Design System — "StudyFlow Aurora" v2.0
- **Theme**: Modern glassmorphism with gradient accents and animated backgrounds
- **Colors**: Brand (indigo #4f46e5), Accent (fuchsia #d946ef), Surface (slate scale)
- **Glass classes**: `glass` (bg-white/70 backdrop-blur-xl), `glass-dark`, `glass-brand`, `glass-subtle`
- **Card classes**: `card` (rounded-2xl shadow-soft), `card-hover` (lift on hover), `card-interactive` (clickable)
- **Button classes**: `btn-primary` (gradient indigo), `btn-secondary` (white + border), `btn-ghost`
- **Text effects**: `text-gradient` (indigo-fuchsia gradient text), `text-gradient-brand`
- **Progress**: `progress-bar` + `progress-fill` (gradient fill)
- **Backgrounds**: `bg-mesh` (radial gradient mesh), `bg-animated-gradient` (moving gradient)
- **Animations**: float, float-slow, pulse-soft, gradient-shift, slide-up, fade-in, scale-in, shimmer, blob, glow
- **Shadows**: shadow-glass, shadow-soft, shadow-neon
- **Stat cards**: `stat-card` + `stat-card-inner` (gradient border effect)
- **Chips**: `chip-brand`, `chip-success`, `chip-warning`
- **Input**: `input` class with backdrop blur and focus ring
- **Design system reference**: `src/lib/design-system.ts` (DESIGN_SYSTEM constant + UI_AGENT_SYSTEM_PROMPT)

## Completed Features
- Area > Topic > Lesson page hierarchy with dynamic routes
- i18n system: LanguageContext + translations.ts + useLanguage hook (shared state)
- Onboarding: language selection step (fi/sv) — fully bilingual, glassmorphism design
- Settings: language selector + tutor intensity (strict/balanced/gentle), glass cards
- AI tutor: 3 personality modes x 2 languages in system prompts
- Lesson tasks system: LessonTaskCard + MathCalculator components + API
- Bilingual content pages (all subject pages use useLanguage)
- Sidebar uses labelKey with t() for translations, glassmorphism backdrop blur
- Finnish YouTube videos for all 66 lessons
- Swedish YouTube videos for all 66 lessons
- Swedish content (content_sv) for all 66 lessons
- Swedish question translations for all 270 questions
- Lesson tasks for all 66 lessons (102 tasks total)
- **Dashboard** — glassmorphism stat cards, gradient continue card, animated blobs, area progress with gradient bars, topic mastery, quick actions, recent activity
- **Practice exam** — two modes: realistic (40q, 3h timer, +1/-0.5 scoring) and free (configurable), glass cards, gradient UI
- **Study plan** — exam date input, hours/week slider, auto-generated weekly plan
- **Forum** — bilingual, thread list + thread detail with replies
- **Mobile-friendliness** — responsive sidebar with hamburger menu, glass mobile header, responsive padding
- **Auth** — login/signup with split-screen animated gradient + glass forms, onboarding glassmorphism, redirect param
- **Gamification** — XP system, daily streaks, 16 badges, achievements page with gradient badges, XP history
- **Gamification API integration** — lesson completion, task correct, question correct, and exam completion all call /api/gamification
- **UI Design System** — "StudyFlow Aurora" v2.0 with glassmorphism, gradients, animations, design-system.ts reference

## Bug Fixes Applied
- Lesson page: fixed `type: 'multiple_choice'` → `'mcq'` in questions query
- Lesson page: fixed `.eq('user_id', ...)` → `.eq('auth_user_id', ...)` in profile query

## PENDING Work
- **Review video quality** — some video mappings are approximate
- **Deploy to Vercel** — push code to GitHub for auto-deploy

## Component Patterns
- All shared components use **named exports** (not default)
- Supabase browser client: `createSupabaseBrowser()` from `@/lib/db/supabase-browser`
- Supabase server client: `createSupabaseServer()` from `@/lib/db/supabase-server`
- KaTeX for math: ReactMarkdown + remarkMath + rehypeKatex
- QuestionCard onAnswer returns boolean (not index)
- Sidebar receives `mobileOpen` and `onMobileClose` props from layout
- Dashboard layout has mobile header with hamburger menu (glass styling)
- Auth pages have local `lang` state toggle (not LanguageContext since they're outside dashboard)
- Design system: import { DESIGN_SYSTEM, UI_AGENT_SYSTEM_PROMPT } from '@/lib/design-system'
