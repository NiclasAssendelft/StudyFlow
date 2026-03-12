'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'
import { useLanguage } from '@/lib/i18n/useLanguage'

const areaConfig: Record<string, { fi: string; sv: string; icon: string; color: string }> = {
  microeconomics: { fi: 'Mikrotaloustiede', sv: 'Mikroekonomi', icon: '📈', color: '#2563eb' },
  macroeconomics: { fi: 'Makrotaloustiede', sv: 'Makroekonomi', icon: '🌍', color: '#7c3aed' },
  statistics: { fi: 'Tilastotiede', sv: 'Statistik', icon: '📊', color: '#059669' },
  business: { fi: 'Liiketalous', sv: 'Företagsekonomi', icon: '💼', color: '#d97706' },
}

interface TopicProgress {
  topicId: string
  topicName: string
  topicNameSv?: string
  area: string
  totalLessons: number
  completedLessons: number
  avgScore: number
}

interface RecentLesson {
  lessonId: string
  lessonTitle: string
  lessonTitleSv?: string
  topicId: string
  area: string
  completedAt: string
  score: number
}

export default function DashboardPage() {
  const { lang, t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
  const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([])
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [totalLessons, setTotalLessons] = useState(0)
  const [overallScore, setOverallScore] = useState(0)
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null)
  const [continueLesson, setContinueLesson] = useState<{
    lessonId: string
    lessonTitle: string
    lessonTitleSv?: string
    topicId: string
    area: string
  } | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) return

        // Get profile
        const { data: profileData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('auth_user_id', userData.user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          if (profileData.exam_date) {
            const examDate = new Date(profileData.exam_date)
            const today = new Date()
            const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            setDaysUntilExam(diff > 0 ? diff : 0)
          }
        }

        // Get all topics
        const { data: topics } = await supabase
          .from('topics')
          .select('id, name_fi, name_sv, area')

        // Get all lessons
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, title_fi, title_sv, topic_id')

        // Get lesson progress for this student
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed, completed_at, score')
          .eq('student_id', profileData?.id)

        if (topics && lessons && progress) {
          const completedSet = new Set(progress.filter(p => p.completed).map(p => p.lesson_id))
          setTotalCompleted(completedSet.size)
          setTotalLessons(lessons.length)

          // Overall average score
          const scores = progress.filter(p => p.score != null).map(p => p.score)
          if (scores.length > 0) {
            setOverallScore(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length))
          }

          // Topic progress
          const topicMap = new Map<string, TopicProgress>()
          for (const topic of topics) {
            const topicLessons = lessons.filter(l => l.topic_id === topic.id)
            const completedTopicLessons = topicLessons.filter(l => completedSet.has(l.id))
            const topicScores = progress
              .filter(p => topicLessons.some(l => l.id === p.lesson_id) && p.score != null)
              .map(p => p.score)

            topicMap.set(topic.id, {
              topicId: topic.id,
              topicName: topic.name_fi,
              topicNameSv: topic.name_sv,
              area: topic.area,
              totalLessons: topicLessons.length,
              completedLessons: completedTopicLessons.length,
              avgScore: topicScores.length > 0
                ? Math.round(topicScores.reduce((a, b) => a + b, 0) / topicScores.length)
                : 0,
            })
          }
          setTopicProgress(Array.from(topicMap.values()))

          // Recent lessons (last 5 completed)
          const sorted = [...progress]
            .filter(p => p.completed && p.completed_at)
            .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
            .slice(0, 5)

          const recent: RecentLesson[] = sorted.map(p => {
            const lesson = lessons.find(l => l.id === p.lesson_id)
            const topic = lesson ? topics.find(t => t.id === lesson.topic_id) : null
            return {
              lessonId: p.lesson_id,
              lessonTitle: lesson?.title_fi || '',
              lessonTitleSv: lesson?.title_sv,
              topicId: topic?.id || '',
              area: topic?.area || '',
              completedAt: p.completed_at,
              score: p.score || 0,
            }
          })
          setRecentLessons(recent)

          // Find next uncompleted lesson to continue
          const sortedLessons = lessons.sort((a, b) => {
            if (a.topic_id < b.topic_id) return -1
            if (a.topic_id > b.topic_id) return 1
            return 0
          })

          // Find first uncompleted lesson from the most recently worked topic
          if (sorted.length > 0) {
            const lastLesson = lessons.find(l => l.id === sorted[0].lesson_id)
            if (lastLesson) {
              const topicLessons = sortedLessons.filter(l => l.topic_id === lastLesson.topic_id)
              const nextInTopic = topicLessons.find(l => !completedSet.has(l.id))
              if (nextInTopic) {
                const topic = topics.find(t => t.id === nextInTopic.topic_id)
                setContinueLesson({
                  lessonId: nextInTopic.id,
                  lessonTitle: nextInTopic.title_fi,
                  lessonTitleSv: nextInTopic.title_sv,
                  topicId: nextInTopic.topic_id,
                  area: topic?.area || '',
                })
              }
            }
          }

          // If no continue lesson, find first uncompleted anywhere
          if (!continueLesson) {
            const firstUncompleted = sortedLessons.find(l => !completedSet.has(l.id))
            if (firstUncompleted) {
              const topic = topics.find(t => t.id === firstUncompleted.topic_id)
              setContinueLesson({
                lessonId: firstUncompleted.id,
                lessonTitle: firstUncompleted.title_fi,
                lessonTitleSv: firstUncompleted.title_sv,
                topicId: firstUncompleted.topic_id,
                area: topic?.area || '',
              })
            }
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [lang])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 flex items-center justify-center">
        <div className="space-y-4">
          <div className="h-12 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse"></div>
          <div className="h-4 w-40 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const weakTopics = topicProgress
    .filter(tp => tp.avgScore > 0)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3)

  const strongTopics = topicProgress
    .filter(tp => tp.avgScore > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)

  const progressPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0

  // Area progress
  const areaProgress = Object.entries(areaConfig).map(([key, config]) => {
    const areaTopics = topicProgress.filter(tp => tp.area === key)
    const areaTotal = areaTopics.reduce((sum, tp) => sum + tp.totalLessons, 0)
    const areaCompleted = areaTopics.reduce((sum, tp) => sum + tp.completedLessons, 0)
    return {
      key,
      ...config,
      total: areaTotal,
      completed: areaCompleted,
      percent: areaTotal > 0 ? Math.round((areaCompleted / areaTotal) * 100) : 0,
    }
  })

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header with gradient text */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
            {lang === 'sv' ? 'Välkommen tillbaka!' : 'Tervetuloa takaisin!'}
            {profile?.display_name && ` ${profile.display_name}`}
          </h1>
          <p className="text-slate-600 text-lg max-w-xl">
            {daysUntilExam !== null
              ? (lang === 'sv'
                  ? `${daysUntilExam} dagar till provet.`
                  : `${daysUntilExam} päivää kokeeseen.`)
              : (lang === 'sv'
                  ? 'Ställ in ditt provdatum i inställningarna.'
                  : 'Aseta koepäivä asetuksista.')}
            {' '}
            <span className="font-semibold">
              {lang === 'sv' ? 'Fortsätt där du slutade.' : 'Jatka siitä mihin jäit.'}
            </span>
          </p>
        </div>

        {/* Quick-start: Continue where you left off */}
        {continueLesson && (
          <Link
            href={`/study/subjects/${continueLesson.area}/${continueLesson.topicId}/${continueLesson.lessonId}`}
            className="block group relative mb-10 md:mb-12 overflow-hidden"
          >
            <div className="glass-brand rounded-2xl p-6 md:p-8 text-white relative z-10 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-fuchsia-600/20 group-hover:from-indigo-600/30 group-hover:to-fuchsia-600/30 transition-all duration-300"></div>
              <div className="relative z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-sm opacity-90 font-medium mb-1 tracking-wide">
                    {lang === 'sv' ? 'Fortsätt studera' : 'Jatka opiskelua'}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1">
                    {lang === 'sv' && continueLesson.lessonTitleSv
                      ? continueLesson.lessonTitleSv
                      : continueLesson.lessonTitle}
                  </div>
                  <div className="text-sm opacity-80 font-medium">
                    {areaConfig[continueLesson.area]?.[lang as 'fi' | 'sv']}
                  </div>
                </div>
                <div className="flex-shrink-0 hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors duration-300">
                  <ArrowIcon />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12">
          <StatCard
            label={lang === 'sv' ? 'Lektioner klara' : 'Oppitunteja suoritettu'}
            value={`${totalCompleted}/${totalLessons}`}
            icon="📖"
            subtext={`${progressPercent}%`}
            delay="0ms"
          />
          <StatCard
            label={lang === 'sv' ? 'Genomsnittspoäng' : 'Keskipistemäärä'}
            value={overallScore > 0 ? `${overallScore}%` : '—'}
            icon="🎯"
            subtext={overallScore >= 70 ? '✓' : ''}
            delay="100ms"
          />
          <StatCard
            label={lang === 'sv' ? 'Ämnesområden' : 'Aihealueet'}
            value={`${areaProgress.filter(a => a.percent === 100).length}/4`}
            icon="📚"
            subtext={lang === 'sv' ? 'klara' : 'valmiit'}
            delay="200ms"
          />
          <StatCard
            label={lang === 'sv' ? 'Dagar till prov' : 'Päivää kokeeseen'}
            value={daysUntilExam !== null ? `${daysUntilExam}` : '—'}
            icon="📅"
            subtext={daysUntilExam !== null && daysUntilExam < 30
              ? (lang === 'sv' ? 'Snart!' : 'Pian!')
              : ''}
            delay="300ms"
          />
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Area progress */}
          <div className="card animate-fade-in">
            <h2 className="font-semibold text-lg text-slate-900 mb-6">
              {lang === 'sv' ? 'Framsteg per område' : 'Edistyminen aihealueittain'}
            </h2>
            <div className="space-y-4">
              {areaProgress.map((area) => (
                <Link
                  key={area.key}
                  href={`/study/subjects/${area.key}`}
                  className="group block"
                >
                  <div className="rounded-xl p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-fuchsia-50">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `${area.color}15` }}>
                        {area.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-slate-900">
                            {area[lang as 'fi' | 'sv']}
                          </span>
                          <span className="text-sm font-medium text-slate-500">
                            {area.completed}/{area.total}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill transition-all duration-500"
                            style={{
                              width: `${area.percent}%`,
                              background: `linear-gradient(90deg, ${area.color}, ${area.color}dd)`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Topic mastery: weakest + strongest */}
          <div className="card animate-fade-in">
            <h2 className="font-semibold text-lg text-slate-900 mb-6">
              {lang === 'sv' ? 'Dina ämnen' : 'Aiheesi'}
            </h2>

            {weakTopics.length > 0 ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                    {lang === 'sv' ? 'Behöver övning' : 'Harjoittelua vaativat'}
                  </h3>
                  <div className="space-y-2">
                    {weakTopics.map((tp) => (
                      <Link
                        key={tp.topicId}
                        href={`/study/subjects/${tp.area}/${tp.topicId}`}
                        className="block group/topic"
                      >
                        <TopicBar
                          name={lang === 'sv' && tp.topicNameSv ? tp.topicNameSv : tp.topicName}
                          score={tp.avgScore}
                          color="red"
                        />
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                    {lang === 'sv' ? 'Starkaste' : 'Vahvimmat'}
                  </h3>
                  <div className="space-y-2">
                    {strongTopics.map((tp) => (
                      <Link
                        key={tp.topicId}
                        href={`/study/subjects/${tp.area}/${tp.topicId}`}
                        className="block group/topic"
                      >
                        <TopicBar
                          name={lang === 'sv' && tp.topicNameSv ? tp.topicNameSv : tp.topicName}
                          score={tp.avgScore}
                          color="green"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-slate-500">
                  {lang === 'sv'
                    ? 'Slutför lektioner för att se dina styrkor och svagheter'
                    : 'Suorita oppitunteja nähdäksesi vahvuutesi ja heikkoutesi'}
                </p>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card animate-fade-in">
            <h2 className="font-semibold text-lg text-slate-900 mb-6">
              {lang === 'sv' ? 'Snabbåtgärder' : 'Pikatoiminnot'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction
                href="/study/subjects"
                icon="📚"
                label={lang === 'sv' ? 'Ämnen' : 'Oppiaineet'}
              />
              <QuickAction
                href="/study/exam"
                icon="📝"
                label={lang === 'sv' ? 'Övningsprov' : 'Harjoituskoe'}
              />
              <QuickAction
                href="/chat"
                icon="🤖"
                label={lang === 'sv' ? 'Fråga handledaren' : 'Kysy tuutorilta'}
              />
              <QuickAction
                href="/study/plan"
                icon="📅"
                label={lang === 'sv' ? 'Studieplan' : 'Opiskelusuunnitelma'}
              />
              <QuickAction
                href="/study/pomodoro"
                icon="🍅"
                label="Pomodoro"
              />
              <QuickAction
                href="/forum"
                icon="💬"
                label={lang === 'sv' ? 'Forum' : 'Foorumi'}
              />
              <QuickAction
                href="/achievements"
                icon="🏆"
                label={lang === 'sv' ? 'Prestationer' : 'Saavutukset'}
              />
            </div>
          </div>

          {/* Recent activity */}
          <div className="card animate-fade-in">
            <h2 className="font-semibold text-lg text-slate-900 mb-6">
              {lang === 'sv' ? 'Senaste aktivitet' : 'Viimeaikainen toiminta'}
            </h2>
            {recentLessons.length > 0 ? (
              <div className="space-y-3">
                {recentLessons.map((rl, idx) => (
                  <Link
                    key={rl.lessonId}
                    href={`/study/subjects/${rl.area}/${rl.topicId}/${rl.lessonId}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-fuchsia-50 group/activity"
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-2 h-2 rounded-full bg-slate-300 group-hover/activity:bg-indigo-500 transition-colors duration-300"></div>
                    </div>

                    {/* Score badge */}
                    <div className="relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-all duration-300 group-hover/activity:scale-110" style={{ backgroundColor: areaConfig[rl.area]?.color || '#6b7280' }}>
                      {rl.score}%
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {lang === 'sv' && rl.lessonTitleSv ? rl.lessonTitleSv : rl.lessonTitle}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(rl.completedAt).toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'fi-FI')}
                      </div>
                    </div>

                    {/* Completion checkmark */}
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center transition-all duration-300 group-hover/activity:bg-green-200">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🏁</div>
                <p className="text-slate-500 mb-4">
                  {lang === 'sv'
                    ? 'Ingen aktivitet ännu. Börja studera!'
                    : 'Ei vielä toimintaa. Aloita opiskelu!'}
                </p>
                <Link
                  href="/study/subjects"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  {lang === 'sv' ? 'Börja studera' : 'Aloita opiskelu'}
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-components
function StatCard({
  label,
  value,
  icon,
  subtext,
  delay = '0ms',
}: {
  label: string
  value: string
  icon: string
  subtext?: string
  delay?: string
}) {
  const colorMap: Record<string, string> = {
    '📖': '#4f46e5',
    '🎯': '#ec4899',
    '📚': '#0891b2',
    '📅': '#f59e0b',
  }

  const bgColor = colorMap[icon] || '#6366f1'

  return (
    <div
      className="stat-card animate-slide-up"
      style={{ animationDelay: delay } as React.CSSProperties}
    >
      <div className="stat-card-inner">
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${bgColor}15` }}
          >
            {icon}
          </div>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)` }}>
            {value}
          </div>
          {subtext && <span className="text-sm font-medium text-slate-500">{subtext}</span>}
        </div>
      </div>
    </div>
  )
}

function TopicBar({
  name,
  score,
  color,
}: {
  name: string
  score: number
  color: string
}) {
  const colorGradient = color === 'red'
    ? 'linear-gradient(90deg, #ef4444, #f87171)'
    : 'linear-gradient(90deg, #22c55e, #86efac)'

  const dotColor = color === 'red' ? 'bg-red-500' : 'bg-green-500'

  return (
    <div className="rounded-lg p-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-fuchsia-50">
      <div className="flex items-center gap-3 mb-2">
        <div className={`flex-shrink-0 w-2 h-2 rounded-full ${dotColor} transition-transform duration-300 group-hover/topic:scale-125`}></div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-900 truncate">{name}</span>
            <span className="font-semibold text-slate-700 flex-shrink-0">{score}%</span>
          </div>
        </div>
      </div>
      <div className="progress-bar ml-5">
        <div
          className="progress-fill transition-all duration-500 rounded-full"
          style={{
            width: `${score}%`,
            background: colorGradient,
          }}
        />
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  const iconColorMap: Record<string, string> = {
    '📚': '#4f46e5',
    '📝': '#8b5cf6',
    '🤖': '#0891b2',
    '📅': '#f59e0b',
    '🍅': '#ef4444',
    '💬': '#06b6d4',
    '🏆': '#f97316',
  }

  const bgColor = iconColorMap[icon] || '#6366f1'

  return (
    <Link
      href={href}
      className="card-interactive group flex flex-col items-center justify-center gap-2 p-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${bgColor}15` }}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{label}</span>
    </Link>
  )
}

function ArrowIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}
