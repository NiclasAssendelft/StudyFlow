import { createSupabaseServer } from '@/lib/db/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const topic_id = searchParams.get('topic_id')
    const lesson_id = searchParams.get('lesson_id')

    // topic_id is required
    if (!topic_id) {
      return NextResponse.json(
        { error: 'topic_id query parameter is required' },
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

    if (lesson_id) {
      // Fetch single lesson with progress
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lesson_id)
        .eq('topic_id', topic_id)
        .single()

      if (lessonError || !lesson) {
        return NextResponse.json(
          { error: 'Lesson not found' },
          { status: 404 }
        )
      }

      // Fetch lesson progress
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lesson_id)
        .eq('student_id', student_id)
        .single()

      const result = {
        ...lesson,
        progress: progress || null,
      }

      return NextResponse.json(result)
    } else {
      // Fetch all lessons for topic with progress
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('topic_id', topic_id)
        .order('lesson_order', { ascending: true })

      if (lessonsError) {
        return NextResponse.json(
          { error: 'Failed to fetch lessons' },
          { status: 500 }
        )
      }

      // Fetch all progress records for these lessons
      const lesson_ids = lessons.map((l) => l.id)
      const { data: progressRecords = [], error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', student_id)
        .in('lesson_id', lesson_ids)

      if (progressError) {
        return NextResponse.json(
          { error: 'Failed to fetch progress' },
          { status: 500 }
        )
      }

      // Map progress to lessons
      const progressMap = new Map(progressRecords.map((p) => [p.lesson_id, p]))
      const result = lessons.map((lesson) => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || null,
      }))

      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Error in GET /api/lessons:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
