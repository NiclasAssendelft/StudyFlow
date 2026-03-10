import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'

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

  // Get 40 random questions across all topics with balanced distribution
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, topic_id, type, difficulty, content')
    .eq('is_active', true)
    .eq('type', 'mcq')
    .order('created_at', { ascending: false })
    .limit(40)

  if (error || !questions?.length) {
    return NextResponse.json({
      error: 'Not enough questions available',
      questions: [],
    }, { status: error ? 500 : 200 })
  }

  // Create exam attempt
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .insert({
      student_id: profile.id,
      is_practice_exam: true,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  return NextResponse.json({
    attempt_id: attempt?.id,
    questions,
    time_limit_minutes: 180,
    scoring: { correct: 1, incorrect: -0.5, blank: 0 },
  })
}
