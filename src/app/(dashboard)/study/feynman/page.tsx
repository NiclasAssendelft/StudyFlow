'use client'

import { useState, useEffect } from 'react'

interface Topic {
  id: string
  name_fi: string
  feynman_prompt_fi: string | null
  area: string
}

type FeynmanPhase = 'select' | 'explain' | 'evaluating' | 'feedback'

interface Feedback {
  accuracy_score: number
  completeness_score: number
  clarity_score: number
  overall_score: number
  correct_points: string[]
  missing_points: string[]
  incorrect_points: string[]
  feedback_fi: string
}

export default function FeynmanPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [explanation, setExplanation] = useState('')
  const [phase, setPhase] = useState<FeynmanPhase>('select')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then((data) => setTopics(data.filter((t: Topic) => t.feynman_prompt_fi)))
  }, [])

  const submitExplanation = async () => {
    if (!selectedTopic || !explanation.trim()) return
    setPhase('evaluating')

    try {
      const res = await fetch('/api/feynman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopic.id,
          explanation: explanation.trim(),
        }),
      })
      const data = await res.json()
      setFeedback(data)
      setPhase('feedback')
    } catch {
      setPhase('explain')
    }
  }

  const tryAgain = () => {
    setExplanation('')
    setPhase('explain')
    setFeedback(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Feynman-tekniikka</h1>
        <p className="text-gray-600 mt-1">
          Selitä aihe omin sanoin kuin opettaisit sen kaverillesi. Tekoäly arvioi ymmärryksesi.
        </p>
      </div>

      {/* How it works */}
      {phase === 'select' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
          <h3 className="font-medium text-brand-700 mb-2">Miten tämä toimii?</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Valitse aihe jonka haluat selittää</li>
            <li>Kirjoita selitys omin sanoin — kuin opettaisit sen jollekin</li>
            <li>Tekoäly arvioi selityksesi tarkkuuden, kattavuuden ja selkeyden</li>
            <li>Saat palautteen ja vinkkejä — yritä uudelleen kunnes hallitset!</li>
          </ol>
        </div>
      )}

      {/* Topic selection */}
      {phase === 'select' && (
        <div>
          <h2 className="font-semibold mb-4">Valitse aihe</h2>
          <div className="grid gap-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic)
                  setPhase('explain')
                }}
                className="text-left bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <span className="text-xs text-gray-400">{topic.id}</span>
                <h3 className="font-medium text-gray-900">{topic.name_fi}</h3>
                {topic.feynman_prompt_fi && (
                  <p className="text-sm text-gray-500 mt-1">{topic.feynman_prompt_fi}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Explanation writing */}
      {phase === 'explain' && selectedTopic && (
        <div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
            <h3 className="font-medium text-yellow-800 mb-1">Tehtävä</h3>
            <p className="text-yellow-900">
              {selectedTopic.feynman_prompt_fi || `Selitä "${selectedTopic.name_fi}" omin sanoin.`}
            </p>
          </div>

          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Kirjoita selityksesi tähän... Yritä käyttää mahdollisimman selkeää ja yksinkertaista kieltä, kuten selittäisit asian kaverillesi."
            rows={10}
            className="w-full border rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none mb-4"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {explanation.length} merkkiä — suositus: vähintään 100
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPhase('select')
                  setSelectedTopic(null)
                  setExplanation('')
                }}
                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Vaihda aihetta
              </button>
              <button
                onClick={submitExplanation}
                disabled={explanation.length < 30}
                className="bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                Arvioi selitykseni
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluating */}
      {phase === 'evaluating' && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 animate-pulse">🧠</div>
          <h2 className="text-lg font-semibold mb-2">Arvioidaan selitystäsi...</h2>
          <p className="text-gray-500">Tekoäly analysoi tarkkuutta, kattavuutta ja selkeyttä.</p>
        </div>
      )}

      {/* Feedback */}
      {phase === 'feedback' && feedback && (
        <div>
          {/* Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Tarkkuus', score: feedback.accuracy_score },
              { label: 'Kattavuus', score: feedback.completeness_score },
              { label: 'Selkeys', score: feedback.clarity_score },
              { label: 'Yhteensä', score: feedback.overall_score },
            ].map((s) => (
              <div key={s.label} className="bg-white border rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{Math.round(s.score)}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Written feedback */}
          <div className="bg-white border rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">Palaute</h3>
            <p className="text-gray-700 leading-relaxed">{feedback.feedback_fi}</p>
          </div>

          {/* Details */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {feedback.correct_points?.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-medium text-green-800 mb-2">Oikein</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {feedback.correct_points.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.missing_points?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Puuttuu</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {feedback.missing_points.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.incorrect_points?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-medium text-red-800 mb-2">Virheellistä</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {feedback.incorrect_points.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={tryAgain}
              className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700"
            >
              Yritä uudelleen
            </button>
            <button
              onClick={() => {
                setPhase('select')
                setSelectedTopic(null)
                setExplanation('')
                setFeedback(null)
              }}
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50"
            >
              Valitse toinen aihe
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
