'use client'

import { useState } from 'react'
import { MathRenderer } from '@/components/shared/MathRenderer'
import { useLanguage } from '@/lib/i18n/useLanguage'

interface QuestionOption {
  id: string
  text: string
  text_sv?: string
}

interface QuestionContent {
  question_text: string
  question_text_sv?: string
  options: QuestionOption[]
  correct_answer: string
  explanation: string
  explanation_sv?: string
}

interface QuestionCardProps {
  question: {
    id: string
    content: QuestionContent
    difficulty: string
  }
  onAnswer: (correct: boolean) => void
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const { lang, t } = useLanguage()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const correctAnswer = question.content.correct_answer
  const isCorrect = selectedAnswer === correctAnswer

  const questionText = lang === 'sv' && question.content.question_text_sv
    ? question.content.question_text_sv
    : question.content.question_text

  const explanationText = lang === 'sv' && question.content.explanation_sv
    ? question.content.explanation_sv
    : question.content.explanation

  const getOptionText = (option: QuestionOption) => {
    return lang === 'sv' && option.text_sv ? option.text_sv : option.text
  }

  const difficultyLabels = {
    fi: { easy: 'Helppo', medium: 'Keskitaso', hard: 'Vaikea' },
    sv: { easy: 'Lätt', medium: 'Medel', hard: 'Svår' },
  }

  const handleOptionClick = (id: string) => {
    if (isAnswered) return
    setSelectedAnswer(id)
    setIsAnswered(true)
    setShowExplanation(true)
    onAnswer(id === correctAnswer)
  }

  const getOptionButtonClass = (id: string) => {
    const baseClass = 'w-full p-4 text-left border-2 rounded-lg font-medium transition-all'

    if (!isAnswered) {
      return `${baseClass} border-gray-200 hover:border-brand-300 hover:bg-blue-50 cursor-pointer`
    }
    if (id === correctAnswer) {
      return `${baseClass} border-green-500 bg-green-50 text-green-900`
    }
    if (id === selectedAnswer && !isCorrect) {
      return `${baseClass} border-red-500 bg-red-50 text-red-900`
    }
    return `${baseClass} border-gray-200 opacity-60`
  }

  return (
    <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto">
      {/* Difficulty badge */}
      <div className="mb-6">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            question.difficulty === 'easy'
              ? 'bg-green-100 text-green-700'
              : question.difficulty === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {difficultyLabels[lang][question.difficulty as 'easy' | 'medium' | 'hard'] || question.difficulty}
        </span>
      </div>

      {/* Question */}
      <div className="mb-8">
        <div className="text-lg font-semibold text-gray-900 mb-4">
          <MathRenderer content={questionText} />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.content.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={isAnswered}
            className={getOptionButtonClass(option.id)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600">
                {OPTION_LABELS[index]}
              </div>
              <div className="flex-grow">
                <div className="text-left">
                  <MathRenderer content={getOptionText(option)} />
                </div>
              </div>
              {isAnswered && option.id === correctAnswer && (
                <div className="flex-shrink-0 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {isAnswered && option.id === selectedAnswer && !isCorrect && (
                <div className="flex-shrink-0 text-red-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <div className={`font-medium mb-2 ${isCorrect ? 'text-green-900' : 'text-blue-900'}`}>
            {isCorrect ? `✓ ${t('correctAnswer')}` : (lang === 'sv' ? 'Förklaring:' : 'Selitys:')}
          </div>
          <div className={`text-sm ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
            <MathRenderer content={explanationText} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {isAnswered && !isCorrect && (
          <button className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            {t('askTutorWhy')}
          </button>
        )}
        {isAnswered && (
          <button className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
            isCorrect ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}>
            {t('next')}
          </button>
        )}
      </div>
    </div>
  )
}
