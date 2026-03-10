import { createSupabaseServer } from '@/lib/db/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lesson_id = searchParams.get('lesson_id')
    const topic_id = searchParams.get('topic_id')

    // At least one parameter is required
    if (!lesson_id && !topic_id) {
      return NextResponse.json(
        { error: 'Either lesson_id or topic_id query parameter is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    const student_id = profile.id

    let query = supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', student_id)

    if (lesson_id) {
      query = query.eq('lesson_id', lesson_id)
    } else if (topic_id) {
      // Join with lessons to filter by topic_id
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('topic_id', topic_id)

      if (lessonsError) {
        return NextResponse.json(
          { error: 'Failed to fetch lessons' },
          { status: 500 }
        )
      }

      const lesson_ids = lessons.map((l) => l.id)
      query = query.in('lesson_id', lesson_ids)
    }

    const { data: progressRecords, error: progressError } = await query

    if (progressError) {
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    return NextResponse.json(progressRecords)
  } catch (error) {
    console.error('Error in GET /api/lesson-progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lesson_id, completed, score } = body

    // Validate required fields
    if (!lesson_id) {
      return NextResponse.json(
        { error: 'lesson_id is required' },
        { status: 400 }
      )
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'completed must be a boolean' },
        { status: 400 }
      )
    }

    if (score !== undefined && (typeof score !== 'number' || score < 0 || score > 100)) {
      return NextResponse.json(
        { error: 'score must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    const student_id = profile.id

    // Prepare update data
    const updateData: any = {
      student_id,
      lesson_id,
    }

    if (completed !== undefined) {
      updateData.completed = completed
      if (completed) {
        updateData.completed_at = new Date().toISOString()
      }
    }

    if (score !== undefined) {
      updateData.score = score
    }

    // Upsert lesson progress
    const { data: result, error: upsertError } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          student_id,
          lesson_id,
          ...updateData,
        },
        {
          onConflict: 'student_id,lesson_id',
        }
      )
      .select()
      .single()

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error in POST /api/lesson-progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
