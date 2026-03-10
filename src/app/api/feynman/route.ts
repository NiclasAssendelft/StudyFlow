import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'
import { callAgent } from '@/lib/agents/router'

const ASSESSMENT_SYSTEM = `You are the Assessment Agent for a Finnish university entry exam learning platform. You evaluate Feynman technique explanations.

Given a topic and a student's explanation, evaluate:
1. accuracy_score (0-100): How factually correct is the explanation?
2. completeness_score (0-100): Does it cover the key concepts?
3. clarity_score (0-100): Is it clear, simple, and well-structured?
4. overall_score (0-100): Weighted average (40% accuracy, 30% completeness, 30% clarity)

Also provide:
- correct_points: Array of things the student got right
- missing_points: Array of important things they didn't mention
- incorrect_points: Array of factual errors
- feedback_fi: 2-3 sentences of constructive feedback in Finnish

Return valid JSON only.`

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { topicId, explanation } = await request.json()

  // Get topic info
  const { data: topic } = await supabase
    .from('topics')
    .select('id, name_fi, name_en, feynman_prompt_fi')
    .eq('id', topicId)
    .single()

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  // Get student profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Call assessment agent
  const response = await callAgent(
    'assessment',
    ASSESSMENT_SYSTEM,
    [
      {
        role: 'user',
        content: `Topic: ${topic.name_fi} (${topic.name_en})\nPrompt: ${topic.feynman_prompt_fi}\n\nStudent's explanation:\n${explanation}`,
      },
    ],
    { maxTokens: 2000, temperature: 0.1 }
  )

  let feedback
  try {
    // @ts-expect-error response type
    const text = response.content[0].text
    feedback = JSON.parse(text)
  } catch {
    feedback = {
      accuracy_score: 50,
      completeness_score: 50,
      clarity_score: 50,
      overall_score: 50,
      correct_points: [],
      missing_points: ['Arviointi epäonnistui'],
      incorrect_points: [],
      feedback_fi: 'Arviointi ei onnistunut. Yritä uudelleen.',
    }
  }

  // Save attempt
  const { data: attempt } = await supabase
    .from('feynman_attempts')
    .insert({
      student_id: profile.id,
      topic_id: topicId,
      explanation_text: explanation,
      accuracy_score: feedback.accuracy_score,
      completeness_score: feedback.completeness_score,
      clarity_score: feedback.clarity_score,
      overall_score: feedback.overall_score,
      correct_points: feedback.correct_points,
      missing_points: feedback.missing_points,
      incorrect_points: feedback.incorrect_points,
      feedback_fi: feedback.feedback_fi,
    })
    .select()
    .single()

  // Update topic score if better
  if (feedback.overall_score) {
    await supabase.rpc('update_study_streak', { p_student_id: profile.id })
  }

  return NextResponse.json(feedback)
}
