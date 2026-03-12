import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/db/supabase-server'

// GET: Fetch gamification stats for current user
export async function GET() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, xp, current_streak, longest_streak, last_activity_date')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Fetch earned badges
  const { data: earnedBadges } = await supabase
    .from('student_badges')
    .select('badge_id, earned_at, badges(id, name_fi, name_sv, description_fi, description_sv, icon, category)')
    .eq('student_id', profile.id)
    .order('earned_at', { ascending: false })

  // Fetch all badges
  const { data: allBadges } = await supabase
    .from('badges')
    .select('*')
    .order('requirement_value')

  // Fetch recent XP log
  const { data: recentXp } = await supabase
    .from('xp_log')
    .select('amount, source, created_at')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({
    xp: profile.xp || 0,
    currentStreak: profile.current_streak || 0,
    longestStreak: profile.longest_streak || 0,
    lastActivityDate: profile.last_activity_date,
    earnedBadges: earnedBadges || [],
    allBadges: allBadges || [],
    recentXp: recentXp || [],
  })
}

// POST: Record activity (lesson complete, question correct, etc.)
export async function POST(request: Request) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('id, xp, current_streak, longest_streak, last_activity_date')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const body = await request.json()
  const { action, referenceId } = body

  // XP amounts per action
  const xpAmounts: Record<string, number> = {
    lesson_complete: 25,
    task_correct: 10,
    question_correct: 5,
    exam_complete: 50,
  }

  const xpAmount = xpAmounts[action] || 0
  if (xpAmount === 0) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const newXp = (profile.xp || 0) + xpAmount

  // Update streak
  const today = new Date().toISOString().split('T')[0]
  const lastDate = profile.last_activity_date
  let newStreak = profile.current_streak || 0
  let longestStreak = profile.longest_streak || 0

  if (lastDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastDate === yesterdayStr) {
      newStreak += 1
    } else if (!lastDate) {
      newStreak = 1
    } else {
      newStreak = 1 // Streak broken
    }

    if (newStreak > longestStreak) {
      longestStreak = newStreak
    }
  }

  // Update profile
  await supabase
    .from('student_profiles')
    .update({
      xp: newXp,
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
    })
    .eq('id', profile.id)

  // Log XP
  await supabase.from('xp_log').insert({
    student_id: profile.id,
    amount: xpAmount,
    source: action,
    reference_id: referenceId || null,
  })

  // Check for new badges
  const newBadges: string[] = []

  // Get earned badge IDs
  const { data: existing } = await supabase
    .from('student_badges')
    .select('badge_id')
    .eq('student_id', profile.id)

  const earnedIds = new Set((existing || []).map((b: any) => b.badge_id))

  // Check streak badges
  const streakBadges = ['streak_3', 'streak_7', 'streak_14', 'streak_30']
  const streakValues = [3, 7, 14, 30]
  for (let i = 0; i < streakBadges.length; i++) {
    if (newStreak >= streakValues[i] && !earnedIds.has(streakBadges[i])) {
      newBadges.push(streakBadges[i])
    }
  }

  // Check XP badges
  const xpBadges = ['xp_100', 'xp_500', 'xp_1000', 'xp_5000']
  const xpValues = [100, 500, 1000, 5000]
  for (let i = 0; i < xpBadges.length; i++) {
    if (newXp >= xpValues[i] && !earnedIds.has(xpBadges[i])) {
      newBadges.push(xpBadges[i])
    }
  }

  // Check lesson badges
  if (action === 'lesson_complete') {
    const { count } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', profile.id)
      .eq('completed', true)

    const lessonBadges = ['lessons_5', 'lessons_20', 'lessons_50']
    const lessonValues = [5, 20, 50]
    for (let i = 0; i < lessonBadges.length; i++) {
      if ((count || 0) >= lessonValues[i] && !earnedIds.has(lessonBadges[i])) {
        newBadges.push(lessonBadges[i])
      }
    }
  }

  // Check exam badge
  if (action === 'exam_complete' && !earnedIds.has('exam_first')) {
    newBadges.push('exam_first')
  }

  // Award new badges
  if (newBadges.length > 0) {
    const inserts = newBadges.map((badgeId) => ({
      student_id: profile.id,
      badge_id: badgeId,
    }))
    await supabase.from('student_badges').insert(inserts)

    // Award bonus XP for badges
    const badgeXp = newBadges.length * 20
    await supabase
      .from('student_profiles')
      .update({ xp: newXp + badgeXp })
      .eq('id', profile.id)

    for (const badgeId of newBadges) {
      await supabase.from('xp_log').insert({
        student_id: profile.id,
        amount: 20,
        source: 'badge_earned',
        reference_id: badgeId,
      })
    }
  }

  return NextResponse.json({
    xp: newXp + (newBadges.length * 20),
    xpEarned: xpAmount,
    currentStreak: newStreak,
    longestStreak: longestStreak,
    newBadges,
  })
}
