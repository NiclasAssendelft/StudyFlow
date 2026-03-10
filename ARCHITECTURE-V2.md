# StudyFlow V2 - Subject/Lesson Architecture

## New Database Tables

### `lessons` table
- id: uuid
- topic_id: text (FK to topics)
- title_fi: text
- title_en: text
- lesson_order: integer (1, 2, 3... within topic)
- content_fi: text (markdown with LaTeX support)
- content_en: text
- video_url: text (YouTube embed URL)
- video_title: text
- estimated_minutes: integer
- created_at: timestamptz

### `lesson_progress` table
- id: uuid
- student_id: uuid (FK to student_profiles)
- lesson_id: uuid (FK to lessons)
- completed: boolean
- completed_at: timestamptz
- score: integer (0-100, from questions)

### Modify `topics` table
- Add `icon` text column (emoji)
- Add `color` text column (hex color for area theming)

### Modify `student_profiles` table
- Add `show_pomodoro` boolean DEFAULT true
- Add `show_feynman` boolean DEFAULT true

## Page Structure

### /study/subjects (Area list)
- 4 cards: Mikrotaloustiede, Makrotaloustiede, Tilastotiede, Liiketaloustiede
- Each shows progress %, topic count, color-coded

### /study/subjects/[area] (Topic list within area)
- List of 6-7 topics per area
- Each shows: name, lesson count, progress bar, question count

### /study/subjects/[area]/[topicId] (Topic page with lessons)
- Topic header with description
- Lesson list (ordered):
  - Each lesson: video + text content + questions
  - Progress indicators (completed/not)

### /study/subjects/[area]/[topicId]/[lessonId] (Lesson page)
- Video player (YouTube embed) at top
- Markdown content with KaTeX math rendering below
- "Harjoittele" (Practice) button → opens Q&A section
- Q&A section:
  - Shows questions one at a time
  - Student selects answer
  - Immediate feedback: correct (green) or incorrect (red)
  - If wrong: explanation shown + "Kysy tuutorilta miksi" button
  - "Ask tutor why" → opens AI chat popup overlay
  - Score tracker at top

## Lessons per Topic (2-3 lessons each)

### Microeconomics (1.1-1.7)
- 1.1 Kysyntä ja tarjonta: L1 Basics, L2 Shifts
- 1.2 Markkinatasapaino: L1 Equilibrium, L2 Government intervention
- 1.3 Joustavuus: L1 Price elasticity, L2 Cross/income elasticity
- 1.4 Kuluttajan valinta: L1 Utility, L2 Budget constraints
- 1.5 Tuotantokustannukset: L1 Short-run costs, L2 Long-run costs
- 1.6 Markkinamuodot: L1 Perfect competition, L2 Monopoly/oligopoly
- 1.7 Markkinahäiriöt: L1 Externalities, L2 Public goods

### Macroeconomics (2.1-2.7)
- 2.1 BKT: L1 GDP calculation, L2 GDP components
- 2.2 Talouskasvu: L1 Growth factors, L2 Solow model basics
- 2.3 Työttömyys: L1 Types, L2 Phillips curve
- 2.4 Inflaatio: L1 Causes, L2 Effects and measurement
- 2.5 Rahapolitiikka: L1 Central banking, L2 ECB tools
- 2.6 Finanssipolitiikka: L1 Government spending, L2 Multiplier
- 2.7 Kansainvälinen kauppa: L1 Comparative advantage, L2 Trade policy

### Statistics (3.1-3.7)
- 3.1 Kuvaileva tilastotiede: L1 Central tendency, L2 Data visualization
- 3.2 Hajonta: L1 Variance/std dev, L2 Quartiles/boxplots
- 3.3 Todennäköisyyslaskenta: L1 Basic probability, L2 Conditional
- 3.4 Normaalijakauma: L1 Properties, L2 Z-scores
- 3.5 Korrelaatio/regressio: L1 Correlation, L2 Linear regression
- 3.6 Indeksit: L1 Price indices, L2 Laspeyres/Paasche
- 3.7 Diagrammit: L1 Chart types, L2 Interpretation skills

### Business (4.1-4.6)
- 4.1 Yritysmuodot: L1 Types, L2 Finnish specifics
- 4.2 Tilinpäätös: L1 Balance sheet, L2 Income statement
- 4.3 Kannattavuus: L1 Ratios, L2 Break-even
- 4.4 Markkinointi: L1 4P model, L2 Digital marketing
- 4.5 Johtaminen: L1 Leadership styles, L2 Organization
- 4.6 Yrittäjyys: L1 Starting a business, L2 Business plan

## Components Needed

### MathRenderer - renders LaTeX in markdown
### VideoPlayer - YouTube embed with responsive sizing
### QuestionCard - interactive MCQ with feedback
### TutorPopup - AI chat overlay for "ask why"
### LessonNav - navigation between lessons
### ProgressBar - topic/lesson completion tracking
