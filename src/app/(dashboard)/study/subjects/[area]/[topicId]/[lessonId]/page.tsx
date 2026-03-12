'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'
import { VideoPlayer } from '@/components/shared/VideoPlayer'
import { MathRenderer } from '@/components/shared/MathRenderer'
import { QuestionCard } from '@/components/study/QuestionCard'
import { TutorPopup } from '@/components/study/TutorPopup'
import { LessonNav } from '@/components/study/LessonNav'
import { LessonTaskCard } from '@/components/study/LessonTaskCard'
import { MathCalculator } from '@/components/study/MathCalculator'
import { useLanguage } from '@/lib/i18n/useLanguage'

interface Lesson {
  id: string
  title_fi: string
  title_sv?: string
  content_fi: string
  content_sv?: string
  video_url?: string
  video_url_sv?: string
  video_title?: string
  video_title_sv?: string
  estimated_minutes: number
}

interface Topic {
  id: string
  name_fi: string
  name_sv?: string
  area: string
}

interface LessonNavItem {
  id: string
  title_fi: string
  title_sv?: string
  lesson_order: number
  completed?: boolean
}

interface Task {
  id: string
  content: any
}

const areaConfig: Record<string, { fi: string; sv: string; icon: string; color: string }> = {
  microeconomics: { fi: 'Mikrotaloustiede', sv: 'Mikroekonomi', icon: '📈', color: '#2563eb' },
  macroeconomics: { fi: 'Makrotaloustiede', sv: 'Makroekonomi', icon: '🌍', color: '#7c3aed' },
  statistics: { fi: 'Tilastotiede', sv: 'Statistik', icon: '📊', color: '#059669' },
  business: { fi: 'Liiketalous', sv: 'Företagsekonomi', icon: '💼', color: '#d97706' },
}

export default function LessonPage() {
  const params = useParams()
  const area = params.area as string
  const topicId = params.topicId as string
  const lessonId = params.lessonId as string
  const { lang, t, loading: langLoading } = useLanguage()
  const config = areaConfig[area]

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [allLessons, setAllLessons] = useState<LessonNavItem[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [showPractice, setShowPractice] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [lastWasWrong, setLastWasWrong] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorContext, setTutorContext] = useState<any>(null)
  const [completed, setCompleted] = useState(false)
  const [taskScore, setTaskScore] = useState({ correct: 0, total: 0 })
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorValue, setCalculatorValue] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseBrowser()

        const [topicRes, lessonRes, lessonsRes, questionsRes, tasksRes] = await Promise.all([
          supabase.from('topics').select('id, name_fi, name_sv, area').eq('id', topicId).single(),
          supabase.from('lessons').select('id, title_fi, title_sv, content_fi, content_sv, video_url, video_url_sv, video_title, video_title_sv, estimated_minutes').eq('id', lessonId).single(),
          supabase.from('lessons').select('id, title_fi, title_sv, lesson_order').eq('topic_id', topicId).order('lesson_order'),
          supabase.from('questions').select('id, content, difficulty').eq('topic_id', topicId).eq('type', 'mcq'),
          supabase.from('lesson_tasks').select('*').eq('lesson_id', lessonId),
        ])

        if (topicRes.data) setTopic(topicRes.data)
        if (lessonRes.data) setLesson(lessonRes.data)
        if (lessonsRes.data) setAllLessons(lessonsRes.data)
        if (questionsRes.data) setQuestions(questionsRes.data)
        if (tasksRes.data) setTasks(tasksRes.data)
      } catch (error) {
        console.error('Error fetching lesson data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lessonId, topicId, lang])

  const handleQuestionAnswer = (correct: boolean) => {
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
    setLastWasWrong(!correct)

    if (correct) {
      fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'question_correct', referenceId: questions[currentQuestionIndex]?.id }),
      })
    }

    if (!correct) {
      const q = questions[currentQuestionIndex]
      setTutorContext({
        question: lang === 'sv' && q.content.question_text_sv ? q.content.question_text_sv : q.content.question_text,
        studentAnswer: t('wrongAnswer'),
        correctAnswer: q.content.correct_answer,
        explanation: lang === 'sv' && q.content.explanation_sv ? q.content.explanation_sv : q.content.explanation,
        topicName: lang === 'sv' && topic?.name_sv ? topic.name_sv : topic?.name_fi || '',
      })
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setLastWasWrong(false)
    }
  }

  const handleMarkComplete = async () => {
    try {
      const supabase = createSupabaseBrowser()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user || !lesson) return

      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()

      if (!profile) return

      await supabase.from('lesson_progress').upsert(
        {
          student_id: profile.id,
          lesson_id: lesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
          score: questions.length > 0 ? Math.round((score.correct / Math.max(score.total, 1)) * 100) : 100,
        },
        { onConflict: 'student_id,lesson_id' }
      )

      // Record gamification: lesson complete
      await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lesson_complete', referenceId: lesson.id }),
      })

      setCompleted(true)
    } catch (error) {
      console.error('Error marking lesson complete:', error)
    }
  }

  if (loading || langLoading || !lesson || !topic || !config) {
    return (
      <div className="min-h-screen bg-mesh p-8 flex items-center justify-center">
        <p className="text-surface-500">{t('loadingLesson')}</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const allAnswered = score.total >= questions.length && questions.length > 0

  return (
    <div className="min-h-screen bg-mesh">
      {/* Lesson Navigation */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4 md:pt-6">
        <LessonNav
          lessons={allLessons}
          currentLessonId={lessonId}
          topicId={topicId}
          area={area}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <Link href="/study/subjects" className="hover:text-surface-600">{t('subjects')}</Link>
          <span>/</span>
          <Link href={`/study/subjects/${area}`} className="hover:text-surface-600">{config[lang as 'fi' | 'sv']}</Link>
          <span>/</span>
          <Link href={`/study/subjects/${area}/${topicId}`} className="hover:text-surface-600">{lang === 'sv' && topic.name_sv ? topic.name_sv : topic.name_fi}</Link>
        </div>

        {/* Lesson Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">{lang === 'sv' && lesson.title_sv ? lesson.title_sv : lesson.title_fi}</h1>
          <div className="flex items-center gap-4 text-sm text-surface-500">
            <span>{topic.id} — {lang === 'sv' && topic.name_sv ? topic.name_sv : topic.name_fi}</span>
            <span>~{lesson.estimated_minutes} {t('min')}</span>
          </div>
        </div>

        {/* Video */}
        {(lang === 'sv' && lesson.video_url_sv) || lesson.video_url ? (
          <div className="mb-8">
            <VideoPlayer url={lang === 'sv' && lesson.video_url_sv ? lesson.video_url_sv : lesson.video_url} title={lang === 'sv' && lesson.video_title_sv ? lesson.video_title_sv : lesson.video_title || lesson.title_fi} />
          </div>
        ) : null}

        {/* Lesson Content with Math */}
        <div className="glass p-8 mb-8">
          <MathRenderer content={lang === 'sv' && lesson.content_sv ? lesson.content_sv : lesson.content_fi} />
        </div>

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gradient mb-4">
              {t('tasks')} ({tasks.length})
            </h2>
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <LessonTaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  lang={lang}
                  onCorrect={() => {
                    setTaskScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }))
                    fetch('/api/gamification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'task_correct', referenceId: task.id }),
                    })
                  }}
                  onWrong={(ctx) => {
                    setTaskScore(prev => ({ ...prev, total: prev.total + 1 }))
                    setTutorContext(ctx)
                    setTutorOpen(true)
                  }}
                  onCalculatorNeeded={() => setShowCalculator(true)}
                  calculatorValue={calculatorValue}
                />
              ))}
            </div>
            {showCalculator && (
              <div className="fixed bottom-4 right-4 z-50">
                <MathCalculator
                  lang={lang}
                  onUseResult={(val) => { setCalculatorValue(val); setShowCalculator(false) }}
                  onClose={() => setShowCalculator(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* Practice Section */}
        {questions.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowPractice(!showPractice)}
              className="btn-primary w-full flex items-center justify-between"
            >
              <span>{t('practice')} ({questions.length} {t('questions')})</span>
              <span>{showPractice ? '▲' : '▼'}</span>
            </button>

            {showPractice && (
              <div className="mt-6 space-y-6">
                {/* Score */}
                <div className="card p-4 flex items-center justify-between">
                  <span className="text-sm text-surface-600">{t('progress')}</span>
                  <span className="font-bold text-surface-900">
                    {score.correct} / {score.total} {t('correct')}
                    {score.total > 0 && (
                      <span className="text-sm font-normal text-surface-500 ml-2">
                        ({Math.round((score.correct / score.total) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>

                {/* Current Question */}
                {currentQuestion && !allAnswered && (
                  <div>
                    <div className="text-xs text-surface-500 mb-3">
                      {t('question')} {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div className="card p-6">
                      <QuestionCard
                        key={currentQuestion.id}
                        question={currentQuestion}
                        onAnswer={handleQuestionAnswer}
                      />
                    </div>

                    {/* Ask Tutor + Next buttons */}
                    {score.total > currentQuestionIndex && (
                      <div className="mt-4 flex gap-3">
                        {lastWasWrong && (
                          <button
                            onClick={() => setTutorOpen(true)}
                            className="btn-secondary flex-1"
                          >
                            {t('askTutorWhy')}
                          </button>
                        )}
                        {currentQuestionIndex < questions.length - 1 && (
                          <button
                            onClick={handleNextQuestion}
                            className="btn-primary flex-1"
                          >
                            {t('nextQuestion')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* All done */}
                {allAnswered && (
                  <div className="card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 p-6 text-center">
                    <p className="font-semibold text-green-900">
                      {t('practiceComplete')}! {score.correct}/{questions.length} {t('correct')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mark Complete */}
        <button
          onClick={handleMarkComplete}
          disabled={completed}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all ${
            completed ? 'bg-green-500' : 'btn-primary'
          }`}
        >
          {completed ? t('completed') : t('markComplete')}
        </button>
      </div>

      {/* Tutor Popup */}
      {tutorContext && (
        <TutorPopup
          isOpen={tutorOpen}
          onClose={() => setTutorOpen(false)}
          context={tutorContext}
          lang={lang}
        />
      )}
    </div>
  )
}
