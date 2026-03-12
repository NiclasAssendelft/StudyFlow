'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Topic {
  id: string
  area: string
  name_fi: string
  name_en: string
  exam_weight: number
  difficulty_level: string
  video_priority: boolean
  estimated_study_hours: number
}

const areaLabels: Record<string, { label: string; color: string }> = {
  microeconomics: { label: 'Mikrotaloustiede', color: 'bg-blue-100 text-blue-700' },
  macroeconomics: { label: 'Makrotaloustiede', color: 'bg-green-100 text-green-700' },
  statistics: { label: 'Tilastotiede', color: 'bg-purple-100 text-purple-700' },
  business: { label: 'Liiketalous', color: 'bg-orange-100 text-orange-700' },
}

const difficultyLabels: Record<string, { label: string; color: string }> = {
  easy: { label: 'Helppo', color: 'text-green-600' },
  medium: { label: 'Keskitaso', color: 'text-yellow-600' },
  hard: { label: 'Vaikea', color: 'text-red-600' },
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/topics${filter ? `?area=${filter}` : ''}`)
      .then((r) => r.json())
      .then((data) => {
        setTopics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [filter])

  const grouped = topics.reduce<Record<string, Topic[]>>((acc, t) => {
    if (!acc[t.area]) acc[t.area] = []
    acc[t.area].push(t)
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Aiheet</h1>
        <p className="text-gray-600 mt-1">27 aihetta neljässä osa-alueessa</p>
      </div>

      {/* Area filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !filter ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Kaikki
        </button>
        {Object.entries(areaLabels).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Ladataan aiheita...</div>
      ) : (
        Object.entries(grouped).map(([area, areaTopics]) => (
          <div key={area} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {areaLabels[area]?.label || area}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({areaTopics.length} aihetta)
              </span>
            </h2>
            <div className="grid gap-3">
              {areaTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/study/topics/${topic.id}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{topic.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${areaLabels[topic.area]?.color}`}>
                        {areaLabels[topic.area]?.label}
                      </span>
                      {topic.video_priority && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          🎥 Video
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">{topic.name_fi}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className={difficultyLabels[topic.difficulty_level]?.color}>
                        {difficultyLabels[topic.difficulty_level]?.label}
                      </span>
                      <span>Paino: {topic.exam_weight}%</span>
                      <span>~{topic.estimated_study_hours}h</span>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
