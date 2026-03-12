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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('loading')}</p>
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === 'sv' ? 'Välkommen tillbaka!' : 'Tervetuloa takaisin!'}
          {profile?.display_name && ` ${profile.display_name}`}
        </h1>
        <p className="text-gray-600 mt-1">
          {daysUntilExam !== null
            ? (lang === 'sv'
                ? `${daysUntilExam} dagar till provet.`
                : `${daysUntilExam} päivää kokeeseen.`)
            : (lang === 'sv'
                ? 'Ställ in ditt provdatum i inställningarna.'
                : 'Aseta koepäivä asetuksista.')}
          {' '}
          {lang === 'sv' ? 'Fortsätt där du slutade.' : 'Jatka siitä mihin jäit.'}
        </p>
      </div>

      {/* Quick-start: Continue where you left off */}
      {continueLesson && (
        <Link
          href={`/study/subjects/${continueLesson.area}/${continueLesson.topicId}/${continueLesson.lessonId}`}
          className="block bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 mb-8 text-white hover:from-brand-700 hover:to-brand-800 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80 mb-1">
                {lang === 'sv' ? 'Fortsätt studera' : 'Jatka opiskelua'}
              </div>
              <div className="text-xl font-bold">
                {lang === 'sv' && continueLesson.lessonTitleSv
                  ? continueLesson.lessonTitleSv
                  : continueLesson.lessonTitle}
              </div>
              <div className="text-sm opacity-80 mt-1">
                {areaConfig[continueLesson.area]?.[lang as 'fi' | 'sv']}
              </div>
            </div>
            <div className="text-3xl">→</div>
          </div>
        </Link>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={lang === 'sv' ? 'Lektioner klara' : 'Oppitunteja suoritettu'}
          value={`${totalCompleted}/${totalLessons}`}
          icon="📖"
          subtext={`${progressPercent}%`}
        />
        <StatCard
          label={lang === 'sv' ? 'Genomsnittspoäng' : 'Keskipistemäärä'}
          value={overallScore > 0 ? `${overallScore}%` : '—'}
          icon="🎯"
          subtext={overallScore >= 70 ? '✓' : ''}
        />
        <StatCard
          label={lang === 'sv' ? 'Ämnesområden' : 'Aihealueet'}
          value={`${areaProgress.filter(a => a.percent === 100).length}/4`}
          icon="📚"
          subtext={lang === 'sv' ? 'klara' : 'valmiit'}
        />
        <StatCard
          label={lang === 'sv' ? 'Dagar till prov' : 'Päivää kokeeseen'}
          value={daysUntilExam !== null ? `${daysUntilExam}` : '—'}
          icon="📅"
          subtext={daysUntilExam !== null && daysUntilExam < 30
            ? (lang === 'sv' ? 'Snart!' : 'Pian!')
            : ''}
        />
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Area progress */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">
            {lang === 'sv' ? 'Framsteg per område' : 'Edistyminen aihealueittain'}
          </h2>
          <div className="space-y-4">
            {areaProgress.map((area) => (
              <Link
                key={area.key}
                href={`/study/subjects/${area.key}`}
                className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{area.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">
                        {area[lang as 'fi' | 'sv']}
                      </span>
                      <span className="text-gray-500">
                        {area.completed}/{area.total}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${area.percent}%`,
                          backgroundColor: area.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Topic mastery: weakest + strongest */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">
            {lang === 'sv' ? 'Dina ämnen' : 'Aiheesi'}
          </h2>

          {weakTopics.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  {lang === 'sv' ? 'Behöver övning' : 'Harjoittelua vaativat'}
                </h3>
                {weakTopics.map((tp) => (
                  <Link
                    key={tp.topicId}
                    href={`/study/subjects/${tp.area}/${tp.topicId}`}
                    className="block hover:bg-gray-50 rounded-lg p-1 -mx-1 transition-colors"
                  >
                    <TopicBar
                      name={lang === 'sv' && tp.topicNameSv ? tp.topicNameSv : tp.topicName}
                      score={tp.avgScore}
                      color="red"
                    />
                  </Link>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  {lang === 'sv' ? 'Starkaste' : 'Vahvimmat'}
                </h3>
                {strongTopics.map((tp) => (
                  <Link
                    key={tp.topicId}
                    href={`/study/subjects/${tp.area}/${tp.topicId}`}
                    className="block hover:bg-gray-50 rounded-lg p-1 -mx-1 transition-colors"
                  >
                    <TopicBar
                      name={lang === 'sv' && tp.topicNameSv ? tp.topicNameSv : tp.topicName}
                      score={tp.avgScore}
                      color="green"
                    />
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm">
                {lang === 'sv'
                  ? 'Slutför lektioner för att se dina styrkor och svagheter'
                  : 'Suorita oppitunteja nähdäksesi vahvuutesi ja heikkoutesi'}
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">
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
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">
            {lang === 'sv' ? 'Senaste aktivitet' : 'Viimeaikainen toiminta'}
          </h2>
          {recentLessons.length > 0 ? (
            <div className="space-y-3">
              {recentLessons.map((rl) => (
                <Link
                  key={rl.lessonId}
                  href={`/study/subjects/${rl.area}/${rl.topicId}/${rl.lessonId}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold`}
                    style={{ backgroundColor: areaConfig[rl.area]?.color || '#6b7280' }}>
                    {rl.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {lang === 'sv' && rl.lessonTitleSv ? rl.lessonTitleSv : rl.lessonTitle}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(rl.completedAt).toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'fi-FI')}
                    </div>
                  </div>
                  <span className="text-green-500 text-sm">✓</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🏁</div>
              <p className="text-sm">
                {lang === 'sv'
                  ? 'Ingen aktivitet ännu. Börja studera!'
                  : 'Ei vielä toimintaa. Aloita opiskelu!'}
              </p>
              <Link
                href="/study/subjects"
                className="inline-block mt-3 text-brand-600 font-medium text-sm hover:text-brand-700"
              >
                {lang === 'sv' ? 'Börja studera →' : 'Aloita opiskelu →'}
              </Link>
            </div>
          )}
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
}: {
  label: string
  value: string
  icon: string
  subtext?: string
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtext && <span className="text-sm text-gray-400">{subtext}</span>}
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
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 truncate mr-2">{name}</span>
        <span className="font-medium flex-shrink-0">{score}%</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            color === 'red' ? 'bg-red-400' : 'bg-green-400'
          }`}
          style={{ width: `${score}%` }}
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
  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
