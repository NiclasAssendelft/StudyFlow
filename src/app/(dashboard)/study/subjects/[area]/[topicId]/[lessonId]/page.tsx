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

interface Lesson {
  id: string
  title_fi: string
  content_fi: string
  video_url?: string
  video_title?: string
  estimated_minutes: number
}

interface Topic {
  id: string
  name_fi: string
  area: string
}

interface LessonNavItem {
  id: string
  title_fi: string
  lesson_order: number
  completed?: boolean
}

const areaConfig: Record<string, { label: string; icon: string; color: string }> = {
  microeconomics: { label: 'Mikrotaloustiede', icon: '📈', color: '#2563eb' },
  macroeconomics: { label: 'Makrotaloustiede', icon: '🌍', color: '#7c3aed' },
  statistics: { label: 'Tilastotiede', icon: '📊', color: '#059669' },
  business: { label: 'Liiketalous', icon: '💼', color: '#d97706' },
}

export default function LessonPage() {
  const params = useParams()
  const area = params.area as string
  const topicId = params.topicId as string
  const lessonId = params.lessonId as string
  const config = areaConfig[area]

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [allLessons, setAllLessons] = useState<LessonNavItem[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showPractice, setShowPractice] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [lastWasWrong, setLastWasWrong] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorContext, setTutorContext] = useState<any>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseBrowser()

        const [topicRes, lessonRes, lessonsRes, questionsRes] = await Promise.all([
          supabase.from('topics').select('id, name_fi, area').eq('id', topicId).single(),
          supabase.from('lessons').select('id, title_fi, content_fi, video_url, video_title, estimated_minutes').eq('id', lessonId).single(),
          supabase.from('lessons').select('id, title_fi, lesson_order').eq('topic_id', topicId).order('lesson_order'),
          supabase.from('questions').select('id, content, difficulty').eq('topic_id', topicId).eq('type', 'multiple_choice'),
        ])

        if (topicRes.data) setTopic(topicRes.data)
        if (lessonRes.data) setLesson(lessonRes.data)
        if (lessonsRes.data) setAllLessons(lessonsRes.data)
        if (questionsRes.data) setQuestions(questionsRes.data)
      } catch (error) {
        console.error('Error fetching lesson data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [lessonId, topicId])

  const handleQuestionAnswer = (correct: boolean) => {
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
    setLastWasWrong(!correct)

    if (!correct) {
      const q = questions[currentQuestionIndex]
      setTutorContext({
        question: q.content.question_fi,
        studentAnswer: 'Väärä vastaus',
        correctAnswer: q.content.correct_answer,
        explanation: q.content.explanation_fi,
        topicName: topic?.name_fi || '',
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
        .eq('user_id', userData.user.id)
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

      setCompleted(true)
    } catch (error) {
      console.error('Error marking lesson complete:', error)
    }
  }

  if (loading || !lesson || !topic || !config) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-500">Ladataan oppituntia...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const allAnswered = score.total >= questions.length && questions.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lesson Navigation */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <LessonNav
          lessons={allLessons}
          currentLessonId={lessonId}
          topicId={topicId}
          area={area}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/study/subjects" className="hover:text-gray-700">Oppiaineet</Link>
          <span>/</span>
          <Link href={`/study/subjects/${area}`} className="hover:text-gray-700">{config.label}</Link>
          <span>/</span>
          <Link href={`/study/subjects/${area}/${topicId}`} className="hover:text-gray-700">{topic.name_fi}</Link>
        </div>

        {/* Lesson Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title_fi}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{topic.id} — {topic.name_fi}</span>
            <span>~{lesson.estimated_minutes} min</span>
          </div>
        </div>

        {/* Video */}
        {lesson.video_url && (
          <div className="mb-8">
            <VideoPlayer url={lesson.video_url} title={lesson.video_title || lesson.title_fi} />
          </div>
        )}

        {/* Lesson Content with Math */}
        <div className="bg-white rounded-xl border p-8 mb-8">
          <MathRenderer content={lesson.content_fi} />
        </div>

        {/* Practice Section */}
        {questions.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowPractice(!showPractice)}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-between"
              style={{ backgroundColor: config.color }}
            >
              <span>Harjoittele ({questions.length} kysymystä)</span>
              <span>{showPractice ? '▲' : '▼'}</span>
            </button>

            {showPractice && (
              <div className="mt-6 space-y-6">
                {/* Score */}
                <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Edistyminen</span>
                  <span className="font-bold text-gray-900">
                    {score.correct} / {score.total} oikein
                    {score.total > 0 && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({Math.round((score.correct / score.total) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>

                {/* Current Question */}
                {currentQuestion && !allAnswered && (
                  <div>
                    <div className="text-xs text-gray-500 mb-3">
                      Kysymys {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <QuestionCard
                      key={currentQuestion.id}
                      question={currentQuestion}
                      onAnswer={handleQuestionAnswer}
                    />

                    {/* Ask Tutor + Next buttons */}
                    {score.total > currentQuestionIndex && (
                      <div className="mt-4 flex gap-3">
                        {lastWasWrong && (
                          <button
                            onClick={() => setTutorOpen(true)}
                            className="flex-1 border-2 border-blue-300 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                          >
                            Kysy tuutorilta miksi
                          </button>
                        )}
                        {currentQuestionIndex < questions.length - 1 && (
                          <button
                            onClick={handleNextQuestion}
                            className="flex-1 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: config.color }}
                          >
                            Seuraava kysymys
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* All done */}
                {allAnswered && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <p className="font-semibold text-green-900">
                      Harjoittelu valmis! {score.correct}/{questions.length} oikein
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
            completed ? 'bg-green-500' : 'hover:opacity-90'
          }`}
          style={completed ? undefined : { backgroundColor: config.color }}
        >
          {completed ? '✓ Valmis!' : '✓ Merkitse valmiiksi'}
        </button>
      </div>

      {/* Tutor Popup */}
      {tutorContext && (
        <TutorPopup
          isOpen={tutorOpen}
          onClose={() => setTutorOpen(false)}
          context={tutorContext}
        />
      )}
    </div>
  )
}
