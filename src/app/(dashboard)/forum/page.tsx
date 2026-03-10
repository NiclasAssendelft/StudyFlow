'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name_fi: string
  slug: string
  description_fi: string
}

interface Thread {
  id: string
  title: string
  content: string
  view_count: number
  reply_count: number
  created_at: string
  category_id: string
  author: { display_name: string }
  topics?: { name_fi: string }
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/forum/categories').then((r) => r.json()),
      fetch('/api/forum/threads?limit=20').then((r) => r.json()),
    ]).then(([cats, threadsData]) => {
      setCategories(cats || [])
      setThreads(threadsData?.threads || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredThreads = activeCategory
    ? threads.filter((t) => t.category_id === activeCategory)
    : threads

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min sitten`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h sitten`
    const days = Math.floor(hours / 24)
    return `${days}pv sitten`
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foorumi</h1>
          <p className="text-gray-600 mt-1">Keskustele muiden kokelaiden kanssa</p>
        </div>
        <Link
          href="/forum/new"
          className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          Uusi keskustelu
        </Link>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            !activeCategory ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Kaikki
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              activeCategory === cat.id
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name_fi}
          </button>
        ))}
      </div>

      {/* Threads */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Ladataan...</div>
      ) : filteredThreads.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-xl">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-medium mb-1">Ei vielä keskusteluja</h3>
          <p className="text-gray-500 text-sm mb-4">Ole ensimmäinen ja aloita keskustelu!</p>
          <Link
            href="/forum/new"
            className="text-brand-600 font-medium hover:text-brand-700"
          >
            Luo uusi keskustelu →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/${thread.id}`}
              className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{thread.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{thread.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{thread.author?.display_name}</span>
                    <span>{timeAgo(thread.created_at)}</span>
                    {thread.topics && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {thread.topics.name_fi}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 ml-4">
                  <div className="text-center">
                    <div className="font-medium text-gray-600">{thread.reply_count}</div>
                    <div className="text-xs">vastauksia</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-600">{thread.view_count}</div>
                    <div className="text-xs">katselua</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
