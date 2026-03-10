import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'
import { calculateSM2, assessmentToQuality } from '@/lib/utils/spaced-repetition'

// Get cards due for review today
export async function GET(request: NextRequest) {
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

  const today = new Date().toISOString().split('T')[0]

  const { data: cards, error } = await supabase
    .from('spaced_repetition_cards')
    .select('*, topics(name_fi, name_en)')
    .eq('student_id', profile.id)
    .lte('next_review_date', today)
    .order('next_review_date', { ascending: true })
    .limit(30) // Cap at 30 cards per session

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    cards: cards || [],
    total_due: cards?.length || 0,
  })
}

// Review a card (update SM-2 values)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { cardId, assessment } = await request.json() as {
    cardId: string
    assessment: 'forgot' | 'hard' | 'good' | 'easy'
  }

  // Get current card
  const { data: card } = await supabase
    .from('spaced_repetition_cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  // Calculate new SM-2 values
  const quality = assessmentToQuality(assessment)
  const result = calculateSM2(
    quality,
    Number(card.easiness_factor),
    card.repetition_number,
    card.interval_days
  )

  // Update card
  const { data: updated, error } = await supabase
    .from('spaced_repetition_cards')
    .update({
      easiness_factor: result.easinessFactor,
      interval_days: result.intervalDays,
      repetition_number: result.repetitionNumber,
      next_review_date: result.nextReviewDate.toISOString().split('T')[0],
      last_review_date: new Date().toISOString().split('T')[0],
      last_quality: quality,
      total_reviews: card.total_reviews + 1,
      correct_reviews: quality >= 3 ? card.correct_reviews + 1 : card.correct_reviews,
    })
    .eq('id', cardId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
