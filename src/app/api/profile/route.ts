import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'

// Get profile
export async function GET() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// Update profile
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates = await request.json()

  // Only allow specific fields to be updated
  const allowedFields = [
    'display_name',
    'exam_date',
    'available_hours_per_week',
    'learning_style_preference',
    'pomodoro_focus_min',
    'pomodoro_break_min',
    'pomodoro_long_break_min',
    'target_score',
    'show_pomodoro',
    'show_feynman',
    'tutor_intensity',
    'language_preference',
  ]

  const safeUpdates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      safeUpdates[key] = updates[key]
    }
  }

  const { data, error } = await supabase
    .from('student_profiles')
    .update(safeUpdates)
    .eq('auth_user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
