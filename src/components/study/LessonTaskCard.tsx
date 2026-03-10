'use client'

import { useState } from 'react'
import { MathRenderer } from '@/components/shared/MathRenderer'

interface LessonTask {
  id: string
  task_type: 'basic_answer' | 'math_calculation'
  task_order: number
  content: {
    question_fi: string
    question_sv?: string
    correct_answer: string
    hint_fi?: string
    hint_sv?: string
    explanation_fi?: string
    explanation_sv?: string
    difficulty?: number
  }
}

interface LessonTaskCardProps {
  task: LessonTask
  index: number
  lang: 'fi' | 'sv'
  onCorrect: () => void
  onWrong: (context: { question: string; correctAnswer: string; explanation: string }) => void
  onCalculatorNeeded?: () => void
  calculatorValue?: string
}

export function LessonTaskCard({
  task,
  index,
  lang,
  onCorrect,
  onWrong,
  onCalculatorNeeded,
  calculatorValue,
}: LessonTaskCardProps) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const question = lang === 'sv' && task.content.question_sv ? task.content.question_sv : task.content.question_fi
  const hint = lang === 'sv' && task.content.hint_sv ? task.content.hint_sv : task.content.hint_fi
  const explanation = lang === 'sv' && task.content.explanation_sv ? task.content.explanation_sv : task.content.explanation_fi

  const handleSubmit = async () => {
    if (!answer.trim()) return
    const normalizedAnswer = answer.trim().toLowerCase().replace(/\s+/g, ' ')
    const normalizedCorrect = task.content.correct_answer.trim().toLowerCase().replace(/\s+/g, ' ')

    // For math, also check numeric equality
    let isCorrect = normalizedAnswer === normalizedCorrect
    if (!isCorrect && task.task_type === 'math_calculation') {
      try {
        const numAnswer = parseFloat(normalizedAnswer)
        const numCorrect = parseFloat(normalizedCorrect)
        isCorrect = Math.abs(numAnswer - numCorrect) < 0.01
      } catch {}
    }

    setSubmitted(true)
    setCorrect(isCorrect)

    if (isCorrect) {
      onCorrect()
    } else {
      onWrong({
        question,
        correctAnswer: task.content.correct_answer,
        explanation: explanation || '',
      })
    }

    // Save response
    try {
      await fetch('/api/lesson-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: task.id,
          answer: answer.trim(),
          correct: isCorrect,
        }),
      })
    } catch {}
  }

  // Apply calculator value when it changes
  const handleUseCalculator = () => {
    if (calculatorValue) {
      setAnswer(calculatorValue)
    }
  }

  return (
    <div className={`bg-white rounded-xl border p-6 ${submitted ? (correct ? 'border-green-300' : 'border-red-300') : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-gray-500">
          {lang === 'sv' ? 'Uppgift' : 'Tehtävä'} {index + 1}
        </span>
        {task.task_type === 'math_calculation' && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {lang === 'sv' ? 'Beräkning' : 'Laskutehtävä'}
          </span>
        )}
      </div>

      <div className="mb-4">
        <MathRenderer content={question} />
      </div>

      {/* Hint */}
      {hint && !submitted && (
        <div className="mb-4">
          {showHint ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <MathRenderer content={hint} />
            </div>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="text-sm text-yellow-600 hover:text-yellow-700"
            >
              💡 {lang === 'sv' ? 'Visa ledtråd' : 'Näytä vihje'}
            </button>
          )}
        </div>
      )}

      {/* Answer input */}
      {!submitted ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={lang === 'sv' ? 'Skriv ditt svar...' : 'Kirjoita vastauksesi...'}
              className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {lang === 'sv' ? 'Svara' : 'Vastaa'}
            </button>
          </div>
          {task.task_type === 'math_calculation' && (
            <div className="flex gap-2">
              {onCalculatorNeeded && (
                <button
                  onClick={onCalculatorNeeded}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  🧮 {lang === 'sv' ? 'Öppna miniräknare' : 'Avaa laskin'}
                </button>
              )}
              {calculatorValue && (
                <button
                  onClick={handleUseCalculator}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  ← {lang === 'sv' ? 'Använd som svar' : 'Käytä vastauksena'} ({calculatorValue})
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-lg p-4 ${correct ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-medium text-sm ${correct ? 'text-green-700' : 'text-red-700'}`}>
            {correct
              ? (lang === 'sv' ? '✓ Rätt!' : '✓ Oikein!')
              : (lang === 'sv' ? '✗ Fel. Rätt svar: ' : '✗ Väärin. Oikea vastaus: ') + task.content.correct_answer}
          </p>
          {!correct && explanation && (
            <div className="mt-2 text-sm text-gray-600">
              <MathRenderer content={explanation} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
