'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'
import { useLanguage } from '@/lib/i18n/useLanguage'

interface Post {
  id: string
  content: string
  created_at: string
  author: { display_name: string }
  upvote_count: number
}

interface ThreadDetail {
  id: string
  title: string
  content: string
  created_at: string
  view_count: number
  reply_count: number
  is_pinned: boolean
  author: { display_name: string }
  topics?: { name_fi: string; name_sv?: string }
}

export default function ThreadPage() {
  const { threadId } = useParams()
  const { lang, t } = useLanguage()
  const [thread, setThread] = useState<ThreadDetail | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const supabase = createSupabaseBrowser()

        const { data: threadData } = await supabase
          .from('forum_threads')
          .select('*, author:student_profiles(display_name), topics(name_fi, name_sv)')
          .eq('id', threadId)
          .single()

        if (threadData) {
          setThread(threadData)
          // Increment view count
          await supabase.from('forum_threads').update({ view_count: (threadData.view_count || 0) + 1 }).eq('id', threadId)
        }

        const { data: postsData } = await supabase
          .from('forum_posts')
          .select('*, author:student_profiles(display_name)')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true })

        if (postsData) setPosts(postsData)
      } catch (error) {
        console.error('Error fetching thread:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchThread()
  }, [threadId])

  const handleReply = async () => {
    if (!reply.trim()) return
    setPosting(true)
    try {
      const supabase = createSupabaseBrowser()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) return

      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()

      if (!profile) return

      const { data: newPost } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          author_id: profile.id,
          content: reply,
        })
        .select('*, author:student_profiles(display_name)')
        .single()

      if (newPost) {
        setPosts([...posts, newPost])
        setReply('')
        // Update reply count
        await supabase.from('forum_threads').update({ reply_count: (thread?.reply_count || 0) + 1 }).eq('id', threadId)
      }
    } catch (error) {
      console.error('Error posting reply:', error)
    }
    setPosting(false)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'fi-FI', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 text-center">
        <p className="text-gray-500">
          {lang === 'sv' ? 'Diskussionen hittades inte' : 'Keskustelua ei löytynyt'}
        </p>
        <Link href="/forum" className="text-brand-600 mt-4 inline-block">
          ← {lang === 'sv' ? 'Tillbaka till forumet' : 'Takaisin foorumille'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Back link */}
      <Link href="/forum" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1">
        ← {lang === 'sv' ? 'Tillbaka till forumet' : 'Takaisin foorumille'}
      </Link>

      {/* Thread header */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          {thread.is_pinned && <span>📌</span>}
          {thread.topics && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {lang === 'sv' && thread.topics.name_sv ? thread.topics.name_sv : thread.topics.name_fi}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">{thread.title}</h1>
        <p className="text-gray-700 whitespace-pre-wrap">{thread.content}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
          <span className="font-medium text-gray-600">{thread.author?.display_name}</span>
          <span>{formatDate(thread.created_at)}</span>
          <span>{thread.view_count || 0} {lang === 'sv' ? 'visningar' : 'katselua'}</span>
        </div>
      </div>

      {/* Replies */}
      <h2 className="font-semibold mb-4">
        {posts.length} {lang === 'sv' ? 'svar' : 'vastausta'}
      </h2>

      {posts.length > 0 ? (
        <div className="space-y-4 mb-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border rounded-xl p-5">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span className="font-medium text-gray-600">{post.author?.display_name}</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 mb-8">
          {lang === 'sv' ? 'Inga svar ännu. Var den första!' : 'Ei vielä vastauksia. Ole ensimmäinen!'}
        </div>
      )}

      {/* Reply form */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold mb-3">
          {lang === 'sv' ? 'Skriv ett svar' : 'Kirjoita vastaus'}
        </h3>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="w-full border rounded-lg p-3 min-h-[100px] text-sm resize-y"
          placeholder={lang === 'sv' ? 'Skriv ditt svar här...' : 'Kirjoita vastauksesi tähän...'}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleReply}
            disabled={posting || !reply.trim()}
            className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {posting
              ? (lang === 'sv' ? 'Skickar...' : 'Lähetetään...')
              : (lang === 'sv' ? 'Skicka svar' : 'Lähetä vastaus')}
          </button>
        </div>
      </div>
    </div>
  )
}
