'use client'

import { useState } from 'react'

interface Question {
  id: string
  content: {
    question_fi: string
    options: Array<{ label: string; text_fi: string }>
    correct_answer: string
    explanation_fi: string
  }
  topic_id: string
  difficulty: string
}

type ExamPhase = 'intro' | 'in_progress' | 'review' | 'results'

export default function PracticeExamPage() {
  const [phase, setPhase] = useState<ExamPhase>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(180 * 60) // 3 hours in seconds
  const [loading, setLoading] = useState(false)

  const startExam = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/exam/start', { method: 'POST' })
      const data = await res.json()
      setQuestions(data.questions || [])
      setPhase('in_progress')
    } catch {
      // Fallback with placeholder
    }
    setLoading(false)
  }

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const submitExam = async () => {
    setPhase('results')
    // TODO: Send to assessment API
  }

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}:${m.toString().padStart(2, '0')}`
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Harjoituskoe</h1>
          <p className="text-gray-600 mt-1">
            Simuloi oikea Valintakoe F -koetilanne
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Kokeen tiedot</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Kysymyksiä</div>
              <div className="font-bold text-lg">40</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Aika</div>
              <div className="font-bold text-lg">3 tuntia</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Tyyppi</div>
              <div className="font-bold text-lg">Monivalinta</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Pisteytys</div>
              <div className="font-bold text-lg">+1 / -0.5</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h3 className="font-medium text-yellow-800 text-sm mb-1">Huomio</h3>
            <p className="text-yellow-700 text-sm">
              Väärästä vastauksesta saat -0.5 pistettä, kuten oikeassa kokeessa.
              Vastaamatta jättäminen antaa 0 pistettä. Harkitse tarkkaan!
            </p>
          </div>
        </div>

        <button
          onClick={startExam}
          disabled={loading}
          className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 text-lg"
        >
          {loading ? 'Ladataan koetta...' : 'Aloita harjoituskoe'}
        </button>
      </div>
    )
  }

  if (phase === 'in_progress' && questions.length > 0) {
    const q = questions[currentQ]
    const answeredCount = Object.keys(answers).length

    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header with timer */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-sm text-gray-500">Kysymys</span>
            <span className="font-bold text-lg ml-1">
              {currentQ + 1}/{questions.length}
            </span>
          </div>
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-mono text-lg">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-500">
            {answeredCount}/{questions.length} vastattu
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <p className="text-gray-900 leading-relaxed mb-6">
            {q.content.question_fi}
          </p>

          <div className="space-y-3">
            {q.content.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => selectAnswer(q.id, opt.label)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  answers[q.id] === opt.label
                    ? 'border-brand-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium mr-2">{opt.label})</span>
                {opt.text_fi}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Edellinen
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-700"
            >
              Seuraava
            </button>
          ) : (
            <button
              onClick={submitExam}
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700"
            >
              Palauta koe
            </button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-6 flex flex-wrap gap-1.5 justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded text-xs font-medium ${
                i === currentQ
                  ? 'bg-brand-600 text-white'
                  : answers[questions[i].id]
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

  if (phase === 'results') {
    const total = questions.length
    const answered = Object.keys(answers).length
    const mockScore = Math.round(answered * 0.65 * 10) / 10

    return (
      <div className="max-w-2xl mx-auto px-6 py-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h1 className="text-2xl font-bold mb-2">Kokeen tulokset</h1>
        <div className="text-5xl font-bold text-brand-600 mb-2">
          {Math.round((mockScore / total) * 100)}%
        </div>
        <p className="text-gray-600 mb-8">
          {mockScore} / {total} pistettä
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              setPhase('intro')
              setQuestions([])
              setAnswers({})
              setCurrentQ(0)
            }}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700"
          >
            Uusi harjoituskoe
          </button>
        </div>
      </div>
    )
  }

  return null
}
