'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/useLanguage'

interface Category {
  id: string
  name_fi: string
  name_sv?: string
  slug: string
  description_fi: string
  description_sv?: string
}

interface Thread {
  id: string
  title: string
  content: string
  view_count: number
  reply_count: number
  created_at: string
  category_id: string
  is_pinned: boolean
  author: { display_name: string }
  topics?: { name_fi: string; name_sv?: string }
}

export default function ForumPage() {
  const { lang, t } = useLanguage()
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
    if (mins < 60) return lang === 'sv' ? `${mins} min sedan` : `${mins} min sitten`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return lang === 'sv' ? `${hours}h sedan` : `${hours}h sitten`
    const days = Math.floor(hours / 24)
    return lang === 'sv' ? `${days}d sedan` : `${days}pv sitten`
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === 'sv' ? 'Forum' : 'Foorumi'}
          </h1>
          <p className="text-gray-600 mt-1">
            {lang === 'sv' ? 'Diskutera med andra studerande' : 'Keskustele muiden kokelaiden kanssa'}
          </p>
        </div>
        <Link
          href="/forum/new"
          className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          {lang === 'sv' ? 'Ny diskussion' : 'Uusi keskustelu'}
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
          {lang === 'sv' ? 'Alla' : 'Kaikki'}
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
            {lang === 'sv' && cat.name_sv ? cat.name_sv : cat.name_fi}
          </button>
        ))}
      </div>

      {/* Threads */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">{t('loading')}</div>
      ) : filteredThreads.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-xl">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-medium mb-1">
            {lang === 'sv' ? 'Inga diskussioner ännu' : 'Ei vielä keskusteluja'}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {lang === 'sv' ? 'Var den första och starta en diskussion!' : 'Ole ensimmäinen ja aloita keskustelu!'}
          </p>
          <Link
            href="/forum/new"
            className="text-brand-600 font-medium hover:text-brand-700"
          >
            {lang === 'sv' ? 'Skapa ny diskussion →' : 'Luo uusi keskustelu →'}
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
                  <div className="flex items-center gap-2">
                    {thread.is_pinned && <span className="text-sm">📌</span>}
                    <h3 className="font-medium text-gray-900">{thread.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 mt-1">{thread.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{thread.author?.display_name}</span>
                    <span>{timeAgo(thread.created_at)}</span>
                    {thread.topics && (
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {lang === 'sv' && thread.topics.name_sv ? thread.topics.name_sv : thread.topics.name_fi}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 ml-4">
                  <div className="text-center">
                    <div className="font-medium text-gray-600">{thread.reply_count || 0}</div>
                    <div className="text-xs">{lang === 'sv' ? 'svar' : 'vastauksia'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-600">{thread.view_count || 0}</div>
                    <div className="text-xs">{lang === 'sv' ? 'visningar' : 'katselua'}</div>
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
