'use client'

import { useState } from 'react'
import { PomodoroTimer } from '@/components/study/PomodoroTimer'

export default function PomodoroPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [topicName, setTopicName] = useState<string>('')
  const [completedToday, setCompletedToday] = useState(0)

  const handleSessionComplete = (sessionNumber: number) => {
    setCompletedToday(sessionNumber)
    // TODO: Save to API
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Pomodoro-ajastin</h1>
        <p className="text-gray-600 mt-1">
          25 minuuttia keskittynyttä opiskelua, 5 minuutin tauko
        </p>
      </div>

      {/* Topic selector */}
      {!selectedTopic && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-medium mb-3">Mitä opiskelet tänään?</h2>
          <p className="text-sm text-gray-500 mb-4">
            Valitse aihe tai aloita ilman — voit aina vaihtaa myöhemmin.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { id: '1.1', name: 'Kysyntä ja tarjonta' },
              { id: '2.1', name: 'BKT' },
              { id: '3.1', name: 'Kuvaileva tilastotiede' },
              { id: '4.2', name: 'Tilinpäätöksen perusteet' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTopic(t.id)
                  setTopicName(t.name)
                }}
                className="text-left p-3 rounded-lg border hover:border-brand-400 hover:bg-blue-50 text-sm transition-colors"
              >
                <span className="text-xs text-gray-400">{t.id}</span>
                <div className="font-medium">{t.name}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedTopic('general')}
            className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Aloita ilman aihetta →
          </button>
        </div>
      )}

      {/* Timer */}
      {selectedTopic && (
        <>
          <PomodoroTimer
            topicName={selectedTopic !== 'general' ? topicName : undefined}
            onSessionComplete={handleSessionComplete}
          />

          {/* Tips during focus */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-medium text-brand-700 mb-2">Vinkkejä keskittymiseen</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Laita puhelin lentokonetilaan</li>
              <li>• Sulje turhat välilehdet</li>
              <li>• Kirjoita muistiinpanoja käsin — se auttaa muistamaan</li>
              <li>• Jos mieleen tulee jotain muuta, kirjoita se ylös ja palaa siihen tauolla</li>
            </ul>
          </div>

          <button
            onClick={() => setSelectedTopic(null)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 block mx-auto"
          >
            Vaihda aihetta
          </button>
        </>
      )}
    </div>
  )
}
