import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'

// Start a new Pomodoro session
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { topicId, format, focusDurationMin, breakDurationMin } = await request.json()

  // Get student profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, pomodoro_focus_min, pomodoro_break_min')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { data: session, error } = await supabase
    .from('pomodoro_sessions')
    .insert({
      student_id: profile.id,
      topic_id: topicId,
      format: format || 'text',
      focus_duration_min: focusDurationMin || profile.pomodoro_focus_min,
      break_duration_min: breakDurationMin || profile.pomodoro_break_min,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(session)
}

// Complete a Pomodoro session
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, status, distractionCount } = await request.json()

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .update({
      status: status || 'completed',
      completed_at: new Date().toISOString(),
      distraction_count: distractionCount || 0,
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update student's total study hours
  if (data && status === 'completed') {
    const hours = (data.focus_duration_min || 25) / 60
    await supabase.rpc('increment_study_hours', {
      p_student_id: data.student_id,
      p_hours: hours,
    })
  }

  return NextResponse.json(data)
}
