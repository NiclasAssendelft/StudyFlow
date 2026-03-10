'use client'

import { useState, useEffect } from 'react'

interface Card {
  id: string
  front_fi: string
  back_fi: string
  topic_id: string
  topics?: { name_fi: string }
  easiness_factor: number
  interval_days: number
  repetition_number: number
}

type ReviewState = 'loading' | 'front' | 'back' | 'empty' | 'done'

export default function SpacedRepetitionPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [state, setState] = useState<ReviewState>('loading')
  const [reviewed, setReviewed] = useState(0)
  const [correct, setCorrect] = useState(0)

  useEffect(() => {
    fetch('/api/spaced-repetition')
      .then((r) => r.json())
      .then((data) => {
        if (data.cards?.length > 0) {
          setCards(data.cards)
          setState('front')
        } else {
          setState('empty')
        }
      })
      .catch(() => setState('empty'))
  }, [])

  const currentCard = cards[currentIndex]

  const handleAssessment = async (assessment: 'forgot' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return

    // Send review to API
    await fetch('/api/spaced-repetition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: currentCard.id, assessment }),
    })

    setReviewed((r) => r + 1)
    if (assessment !== 'forgot') setCorrect((c) => c + 1)

    // Next card
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1)
      setState('front')
    } else {
      setState('done')
    }
  }

  if (state === 'loading') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center text-gray-500">
        Ladataan muistikortteja...
      </div>
    )
  }

  if (state === 'empty') {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-xl font-semibold mb-2">Ei kerrattavaa tänään!</h1>
        <p className="text-gray-600">
          Kaikki muistikortit on kerrattu. Palaa huomenna tai opiskele uutta materiaalia.
        </p>
      </div>
    )
  }

  if (state === 'done') {
    const percentage = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-semibold mb-2">Kertaus valmis!</h1>
        <div className="text-3xl font-bold text-brand-600 mb-2">{percentage}%</div>
        <p className="text-gray-600 mb-4">
          {reviewed} korttia kerrattu, {correct} oikein
        </p>
        <div className="bg-gray-100 rounded-full h-3 max-w-xs mx-auto overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Kertaus</h1>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-white border-2 rounded-2xl p-8 min-h-[250px] flex flex-col items-center justify-center text-center mb-6">
        {currentCard?.topics && (
          <span className="text-xs text-gray-400 mb-3">
            {currentCard.topics.name_fi}
          </span>
        )}

        {state === 'front' ? (
          <>
            <p className="text-lg font-medium text-gray-900 mb-8">
              {currentCard?.front_fi}
            </p>
            <button
              onClick={() => setState('back')}
              className="bg-brand-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              Näytä vastaus
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-2">{currentCard?.front_fi}</p>
            <div className="w-12 border-t my-3" />
            <p className="text-lg text-gray-900 leading-relaxed">
              {currentCard?.back_fi}
            </p>
          </>
        )}
      </div>

      {/* Assessment buttons */}
      {state === 'back' && (
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleAssessment('forgot')}
            className="py-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Unohdin
          </button>
          <button
            onClick={() => handleAssessment('hard')}
            className="py-3 rounded-lg bg-orange-50 text-orange-700 text-sm font-medium hover:bg-orange-100 transition-colors"
          >
            Vaikea
          </button>
          <button
            onClick={() => handleAssessment('good')}
            className="py-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
          >
            Hyvä
          </button>
          <button
            onClick={() => handleAssessment('easy')}
            className="py-3 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Helppo
          </button>
        </div>
      )}
    </div>
  )
}
