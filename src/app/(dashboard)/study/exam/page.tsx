'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MathRenderer } from '@/components/shared/MathRenderer'
import { useLanguage } from '@/lib/i18n/useLanguage'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'
import Link from 'next/link'

interface Question {
  id: string
  content: {
    question_text: string
    question_text_sv?: string
    options: Array<{ id: string; text: string; text_sv?: string }>
    correct_answer: string
    explanation: string
    explanation_sv?: string
  }
  topic_id: string
  difficulty: string
}

type ExamMode = 'realistic' | 'free'
type ExamPhase = 'intro' | 'in_progress' | 'review' | 'results'

const areaConfig: Record<string, { fi: string; sv: string }> = {
  microeconomics: { fi: 'Mikrotaloustiede', sv: 'Mikroekonomi' },
  macroeconomics: { fi: 'Makrotaloustiede', sv: 'Makroekonomi' },
  statistics: { fi: 'Tilastotiede', sv: 'Statistik' },
  business: { fi: 'Liiketalous', sv: 'Företagsekonomi' },
}

export default function PracticeExamPage() {
  const { lang, t } = useLanguage()
  const [mode, setMode] = useState<ExamMode | null>(null)
  const [phase, setPhase] = useState<ExamPhase>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(180 * 60)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [questionCount, setQuestionCount] = useState(20)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Timer for realistic mode
  useEffect(() => {
    if (phase === 'in_progress' && mode === 'realistic') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setPhase('results')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [phase, mode])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createSupabaseBrowser()
      let query = supabase.from('questions').select('id, content, topic_id, difficulty').eq('type', 'mcq')

      if (selectedArea) {
        // Get topic IDs for area
        const { data: topics } = await supabase.from('topics').select('id').eq('area', selectedArea)
        if (topics) {
          query = query.in('topic_id', topics.map(t => t.id))
        }
      }

      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty', selectedDifficulty)
      }

      const { data } = await query

      if (data && data.length > 0) {
        // Shuffle and limit
        const shuffled = data.sort(() => Math.random() - 0.5)
        const limited = mode === 'realistic' ? shuffled.slice(0, 40) : shuffled.slice(0, questionCount)
        setQuestions(limited)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
    setLoading(false)
  }, [selectedArea, selectedDifficulty, questionCount, mode])

  const startExam = async () => {
    await fetchQuestions()
    if (mode === 'realistic') {
      setTimeLeft(180 * 60) // 3 hours
    }
    setPhase('in_progress')
  }

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const submitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('results')
  }

  const calculateResults = () => {
    let correct = 0
    let wrong = 0
    let unanswered = 0

    questions.forEach((q) => {
      const answer = answers[q.id]
      if (!answer) {
        unanswered++
      } else if (answer === q.content.correct_answer) {
        correct++
      } else {
        wrong++
      }
    })

    // Realistic scoring: +1 correct, -0.5 wrong, 0 unanswered
    const score = mode === 'realistic' ? correct - wrong * 0.5 : correct

    return { correct, wrong, unanswered, score, total: questions.length }
  }

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const getQuestionText = (q: Question) =>
    lang === 'sv' && q.content.question_text_sv ? q.content.question_text_sv : q.content.question_text

  const getOptionText = (opt: { id: string; text: string; text_sv?: string }) =>
    lang === 'sv' && opt.text_sv ? opt.text_sv : opt.text

  const getExplanationText = (q: Question) =>
    lang === 'sv' && q.content.explanation_sv ? q.content.explanation_sv : q.content.explanation

  const resetExam = () => {
    setPhase('intro')
    setMode(null)
    setQuestions([])
    setAnswers({})
    setCurrentQ(0)
    setTimeLeft(180 * 60)
    setShowResults(false)
  }

  // Intro: Mode selection
  if (phase === 'intro' && !mode) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === 'sv' ? 'Övningsprov' : 'Harjoituskoe'}
          </h1>
          <p className="text-gray-600 mt-1">
            {lang === 'sv' ? 'Välj provläge' : 'Valitse koetilanne'}
          </p>
        </div>

        <div className="space-y-4">
          {/* Realistic mode */}
          <button
            onClick={() => setMode('realistic')}
            className="w-full text-left bg-white border-2 rounded-xl p-6 hover:border-brand-500 transition-colors"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎯</span>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {lang === 'sv' ? 'Realistisk simulering' : 'Realistinen simulaatio'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {lang === 'sv'
                    ? '40 frågor, 3 timmar, poängsättning +1/-0.5 — exakt som det riktiga provet'
                    : '40 kysymystä, 3 tuntia, pisteytys +1/-0.5 — kuten oikea koe'}
                </p>
                <div className="flex gap-3 mt-3 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">40 {lang === 'sv' ? 'frågor' : 'kysymystä'}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">3h</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">+1 / -0.5</span>
                </div>
              </div>
            </div>
          </button>

          {/* Free practice mode */}
          <button
            onClick={() => setMode('free')}
            className="w-full text-left bg-white border-2 rounded-xl p-6 hover:border-brand-500 transition-colors"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">📝</span>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {lang === 'sv' ? 'Fri övning' : 'Vapaa harjoittelu'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {lang === 'sv'
                    ? 'Välj ämne, svårighetsgrad och antal frågor — ingen tidsgräns'
                    : 'Valitse aihe, vaikeustaso ja kysymysmäärä — ei aikarajaa'}
                </p>
                <div className="flex gap-3 mt-3 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{lang === 'sv' ? 'Valfritt antal' : 'Valinnainen määrä'}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{lang === 'sv' ? 'Ingen tidsgräns' : 'Ei aikarajaa'}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{lang === 'sv' ? 'Förklaringar' : 'Selitykset'}</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Intro: Configure exam
  if (phase === 'intro' && mode) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <button onClick={() => setMode(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
          ← {lang === 'sv' ? 'Tillbaka' : 'Takaisin'}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'realistic'
              ? (lang === 'sv' ? 'Realistisk simulering' : 'Realistinen simulaatio')
              : (lang === 'sv' ? 'Fri övning' : 'Vapaa harjoittelu')}
          </h1>
        </div>

        <div className="bg-white border rounded-xl p-6 mb-6">
          {mode === 'realistic' ? (
            <>
              <h2 className="font-semibold mb-4">{lang === 'sv' ? 'Provinformation' : 'Kokeen tiedot'}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500">{lang === 'sv' ? 'Frågor' : 'Kysymyksiä'}</div>
                  <div className="font-bold text-lg">40</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500">{lang === 'sv' ? 'Tid' : 'Aika'}</div>
                  <div className="font-bold text-lg">{lang === 'sv' ? '3 timmar' : '3 tuntia'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500">{lang === 'sv' ? 'Typ' : 'Tyyppi'}</div>
                  <div className="font-bold text-lg">{lang === 'sv' ? 'Flerval' : 'Monivalinta'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500">{lang === 'sv' ? 'Poäng' : 'Pisteytys'}</div>
                  <div className="font-bold text-lg">+1 / -0.5</div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-yellow-800 text-sm mb-1">
                  {lang === 'sv' ? 'Observera' : 'Huomio'}
                </h3>
                <p className="text-yellow-700 text-sm">
                  {lang === 'sv'
                    ? 'Fel svar ger -0.5 poäng, precis som i det riktiga provet. Att lämna en fråga obesvarad ger 0 poäng.'
                    : 'Väärästä vastauksesta saat -0.5 pistettä, kuten oikeassa kokeessa. Vastaamatta jättäminen antaa 0 pistettä.'}
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-semibold mb-4">{lang === 'sv' ? 'Anpassa övningen' : 'Muokkaa harjoittelua'}</h2>

              {/* Area filter */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 block mb-2">
                  {lang === 'sv' ? 'Ämnesområde' : 'Aihealue'}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedArea(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      !selectedArea ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang === 'sv' ? 'Alla' : 'Kaikki'}
                  </button>
                  {Object.entries(areaConfig).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedArea(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedArea === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {val[lang as 'fi' | 'sv']}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty filter */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 block mb-2">
                  {lang === 'sv' ? 'Svårighetsgrad' : 'Vaikeustaso'}
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'all', fi: 'Kaikki', sv: 'Alla' },
                    { value: 'easy', fi: 'Helppo', sv: 'Lätt' },
                    { value: 'medium', fi: 'Keskitaso', sv: 'Medel' },
                    { value: 'hard', fi: 'Vaikea', sv: 'Svår' },
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDifficulty(d.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedDifficulty === d.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {d[lang as 'fi' | 'sv']}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div>
                <label className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    {lang === 'sv' ? 'Antal frågor' : 'Kysymysten määrä'}
                  </span>
                  <span className="font-medium">{questionCount}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            </>
          )}
        </div>

        <button
          onClick={startExam}
          disabled={loading}
          className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 text-lg"
        >
          {loading
            ? (lang === 'sv' ? 'Laddar...' : 'Ladataan...')
            : mode === 'realistic'
            ? (lang === 'sv' ? 'Starta provet' : 'Aloita koe')
            : (lang === 'sv' ? 'Starta övning' : 'Aloita harjoittelu')}
        </button>
      </div>
    )
  }

  // In progress
  if (phase === 'in_progress' && questions.length > 0) {
    const q = questions[currentQ]
    const answeredCount = Object.keys(answers).length
    const userAnswer = answers[q.id]
    const isAnswered = !!userAnswer
    const isCorrect = userAnswer === q.content.correct_answer

    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-sm text-gray-500">{lang === 'sv' ? 'Fråga' : 'Kysymys'}</span>
            <span className="font-bold text-lg ml-1">
              {currentQ + 1}/{questions.length}
            </span>
          </div>
          {mode === 'realistic' && (
            <div className={`px-4 py-2 rounded-lg font-mono text-lg ${
              timeLeft < 600 ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
            }`}>
              {formatTime(timeLeft)}
            </div>
          )}
          <div className="text-sm text-gray-500">
            {answeredCount}/{questions.length} {lang === 'sv' ? 'besvarade' : 'vastattu'}
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="text-gray-900 leading-relaxed mb-6">
            <MathRenderer content={getQuestionText(q)} />
          </div>

          <div className="space-y-3">
            {q.content.options.map((opt, index) => {
              const optLabels = ['A', 'B', 'C', 'D']
              const isFreeAnswered = mode === 'free' && isAnswered
              const isThisCorrect = opt.id === q.content.correct_answer
              const isThisSelected = userAnswer === opt.id

              let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-colors'

              if (isFreeAnswered) {
                if (isThisCorrect) {
                  buttonClass += ' border-green-500 bg-green-50'
                } else if (isThisSelected && !isCorrect) {
                  buttonClass += ' border-red-500 bg-red-50'
                } else {
                  buttonClass += ' border-gray-200 opacity-60'
                }
              } else if (isThisSelected) {
                buttonClass += ' border-brand-500 bg-blue-50'
              } else {
                buttonClass += ' border-gray-200 hover:border-gray-300'
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => selectAnswer(q.id, opt.id)}
                  disabled={mode === 'free' && isAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600">
                      {optLabels[index]}
                    </div>
                    <div className="flex-grow">
                      <MathRenderer content={getOptionText(opt)} />
                    </div>
                    {isFreeAnswered && isThisCorrect && (
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isFreeAnswered && isThisSelected && !isCorrect && (
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Free mode: show explanation after answering */}
          {mode === 'free' && isAnswered && (
            <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
              <div className={`font-medium mb-2 ${isCorrect ? 'text-green-900' : 'text-blue-900'}`}>
                {isCorrect
                  ? `✓ ${lang === 'sv' ? 'Rätt svar!' : 'Oikea vastaus!'}`
                  : (lang === 'sv' ? 'Förklaring:' : 'Selitys:')}
              </div>
              <div className={`text-sm ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
                <MathRenderer content={getExplanationText(q)} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {lang === 'sv' ? 'Föregående' : 'Edellinen'}
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-700"
            >
              {lang === 'sv' ? 'Nästa' : 'Seuraava'}
            </button>
          ) : (
            <button
              onClick={submitExam}
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700"
            >
              {mode === 'realistic'
                ? (lang === 'sv' ? 'Lämna in prov' : 'Palauta koe')
                : (lang === 'sv' ? 'Visa resultat' : 'Näytä tulokset')}
            </button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-6 flex flex-wrap gap-1.5 justify-center">
          {questions.map((question, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded text-xs font-medium ${
                i === currentQ
                  ? 'bg-brand-600 text-white'
                  : answers[question.id]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Results
  if (phase === 'results') {
    const results = calculateResults()
    const percentage = Math.round((results.correct / results.total) * 100)

    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{percentage >= 70 ? '🎉' : percentage >= 50 ? '💪' : '📚'}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === 'sv' ? 'Provresultat' : 'Kokeen tulokset'}
          </h1>
          <div className="text-5xl font-bold text-brand-600 mb-1">
            {percentage}%
          </div>
          {mode === 'realistic' && (
            <p className="text-gray-600">
              {results.score} / {results.total} {lang === 'sv' ? 'poäng' : 'pistettä'}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{results.correct}</div>
            <div className="text-xs text-green-600">{lang === 'sv' ? 'Rätt' : 'Oikein'}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{results.wrong}</div>
            <div className="text-xs text-red-600">{lang === 'sv' ? 'Fel' : 'Väärin'}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{results.unanswered}</div>
            <div className="text-xs text-gray-600">{lang === 'sv' ? 'Obesvarade' : 'Vastaamatta'}</div>
          </div>
        </div>

        {/* Review answers toggle */}
        <button
          onClick={() => setShowResults(!showResults)}
          className="w-full bg-white border rounded-xl p-4 mb-4 text-left font-medium text-gray-900 flex items-center justify-between"
        >
          <span>{lang === 'sv' ? 'Granska svar' : 'Tarkasta vastaukset'}</span>
          <span>{showResults ? '▲' : '▼'}</span>
        </button>

        {showResults && (
          <div className="space-y-4 mb-6">
            {questions.map((q, i) => {
              const userAnswer = answers[q.id]
              const isCorrectAnswer = userAnswer === q.content.correct_answer
              const wasUnanswered = !userAnswer

              return (
                <div key={q.id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      wasUnanswered ? 'bg-gray-100 text-gray-500' : isCorrectAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-grow">
                      <div className="text-sm text-gray-900 mb-2">
                        <MathRenderer content={getQuestionText(q)} />
                      </div>
                      {!wasUnanswered && (
                        <div className="text-xs text-gray-500">
                          {lang === 'sv' ? 'Ditt svar' : 'Vastauksesi'}: {userAnswer} {isCorrectAnswer ? '✓' : '✗'}
                          {!isCorrectAnswer && ` — ${lang === 'sv' ? 'Rätt' : 'Oikea'}: ${q.content.correct_answer}`}
                        </div>
                      )}
                      {wasUnanswered && (
                        <div className="text-xs text-gray-400">
                          {lang === 'sv' ? 'Obesvarad' : 'Ei vastattu'} — {lang === 'sv' ? 'Rätt' : 'Oikea'}: {q.content.correct_answer}
                        </div>
                      )}
                      {(!isCorrectAnswer || wasUnanswered) && (
                        <div className="mt-2 text-xs text-blue-800 bg-blue-50 p-2 rounded">
                          <MathRenderer content={getExplanationText(q)} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={resetExam}
            className="flex-1 bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700"
          >
            {lang === 'sv' ? 'Nytt prov' : 'Uusi koe'}
          </button>
          <Link
            href="/study/subjects"
            className="flex-1 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 text-center"
          >
            {lang === 'sv' ? 'Studera vidare' : 'Opiskele lisää'}
          </Link>
        </div>
      </div>
    )
  }

  return null
}
