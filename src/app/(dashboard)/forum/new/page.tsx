'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name_fi: string
}

export default function NewThreadPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/forum/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data || [])
        if (data?.length) setCategoryId(data[0].id)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !categoryId) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, title: title.trim(), content: content.trim() }),
      })
      const data = await res.json()
      if (data.id) {
        router.push(`/forum/${data.id}`)
      }
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Uusi keskustelu</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_fi}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Otsikko</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="Mistä haluat keskustella?"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Viesti</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full border rounded-lg px-3 py-3 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="Kirjoita viestisi..."
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Peruuta
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Julkaistaan...' : 'Julkaise'}
          </button>
        </div>
      </form>
    </div>
  )
}
