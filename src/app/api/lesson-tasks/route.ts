import { createSupabaseServer } from '@/lib/db/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lesson_id = searchParams.get('lesson_id')

    if (!lesson_id) {
      return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student profile
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('lesson_tasks')
      .select('*')
      .eq('lesson_id', lesson_id)
      .order('task_order')

    if (tasksError) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // If profile exists, also fetch responses
    let responses: any[] = []
    if (profile && tasks && tasks.length > 0) {
      const taskIds = tasks.map((t: any) => t.id)
      const { data: resps } = await supabase
        .from('lesson_task_responses')
        .select('*')
        .eq('student_id', profile.id)
        .in('task_id', taskIds)

      responses = resps || []
    }

    // Merge responses into tasks
    const tasksWithResponses = (tasks || []).map((task: any) => ({
      ...task,
      response: responses.find((r: any) => r.task_id === task.id) || null,
    }))

    return NextResponse.json(tasksWithResponses)
  } catch (error) {
    console.error('Error in GET /api/lesson-tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { task_id, answer, correct } = body

    if (!task_id) {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
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

    const { data: result, error: upsertError } = await supabase
      .from('lesson_task_responses')
      .upsert(
        {
          student_id: profile.id,
          task_id,
          answer: answer || '',
          correct: correct || false,
          attempted_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,task_id' }
      )
      .select()
      .single()

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in POST /api/lesson-tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
