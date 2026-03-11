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

## Key Infrastructure
- **Supabase project**: ocokoemfmdodzftqbjim
- **Supabase URL**: https://ocokoemfmdodzftqbjim.supabase.co
- **Vercel team**: niclasassendelfts-projects (team_4K1THEF7ovS39l1m5mOb9I53)
- **Vercel project**: study-flow (prj_cqRuKXAvd3OjXkizuFV1nrHRyDcz)

## Database Schema Notes
- `student_profiles` uses `auth_user_id` (NOT `user_id`) to reference auth.users
- `topics.id` is TEXT (e.g. "1.1", "3.8")
- `lessons.id` is UUID (auto-generated)
- `topics` has NOT NULL on `name_en` — always include when inserting
- `lessons` has NOT NULL on `title_en` — always include when inserting
- Bilingual columns added: `topics.name_sv`, `lessons.title_sv/content_sv/video_url_sv/video_title_sv`
- `lesson_tasks` and `lesson_task_responses` tables exist with RLS

## Current DB State (as of March 2026)
- 37 topics (6 new: 3.8-3.11 statistics, 2.8-2.9 macroeconomics)
- 66 lessons with Finnish content + LaTeX math
- 222 MCQ questions with full Finnish + Swedish translations
- 102 lesson tasks (basic_answer + math_calculation) covering all 66 lessons
- All topics have name_sv, all lessons have title_sv + content_sv
- All 66 lessons have Finnish YouTube videos (video_url, video_title)
- All 66 lessons have Swedish YouTube videos (video_url_sv, video_title_sv)
- Key Finnish video source: Timo Kuosmanen "Taloustieteen perusteet" playlist for economics
- Swedish videos sourced from various Swedish-language educational channels

## Completed Features
- Area > Topic > Lesson page hierarchy with dynamic routes
- i18n system: translations.ts + useLanguage hook
- Onboarding: language selection step (fi/sv)
- Settings: language selector + tutor intensity (strict/balanced/gentle)
- AI tutor: 3 personality modes x 2 languages in system prompts
- Lesson tasks system: LessonTaskCard + MathCalculator components + API
- Bilingual content pages (all 4 subject pages use useLanguage)
- Sidebar uses labelKey with t() for translations
- Finnish YouTube videos for all 66 lessons
- Swedish YouTube videos for all 66 lessons
- Swedish content (content_sv) for all 66 lessons
- Swedish question translations for all 222 questions
- Lesson tasks for all 66 lessons (102 tasks total)

## PENDING Work
- **Review video quality** — some video mappings are approximate (closest match for niche topics). User may want to manually review and swap specific videos.
- **No code changes pending** — all recent work was database content only, no deployment needed

## Component Patterns
- All shared components use **named exports** (not default)
- Supabase browser client: `createSupabaseBrowser()` from `@/lib/db/supabase-browser`
- Supabase server client: `createSupabaseServer()` from `@/lib/db/supabase-server`
- KaTeX for math: ReactMarkdown + remarkMath + rehypeKatex
- QuestionCard onAnswer returns boolean (not index)
