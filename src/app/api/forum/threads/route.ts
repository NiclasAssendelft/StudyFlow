import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'

// List threads
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  let query = supabase
    .from('forum_threads')
    .select('*, author:student_profiles(display_name), topics(name_fi)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ threads: data })
}

// Create thread
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { categoryId, title, content, topicId } = await request.json()

  const { data, error } = await supabase
    .from('forum_threads')
    .insert({
      category_id: categoryId,
      author_id: profile.id,
      title,
      content,
      topic_id: topicId || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
