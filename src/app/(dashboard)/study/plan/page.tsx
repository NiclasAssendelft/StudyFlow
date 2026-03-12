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
  id: string
  name_fi: string
  name_sv?: string
  area: string
  totalLessons: number
  completedLessons: number
  avgScore: number
}

export default function StudyPlanPage() {
  const { lang, t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [examDate, setExamDate] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [currentDay, setCurrentDay] = useState(
    new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  )

  const daysOfWeek = lang === 'sv'
    ? ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']
    : ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) return

        const { data: profile } = await supabase
          .from('student_profiles')
          .select('id, exam_date, available_hours_per_week')
          .eq('auth_user_id', userData.user.id)
          .single()

        if (profile) {
          if (profile.exam_date) {
            setExamDate(profile.exam_date)
            const examD = new Date(profile.exam_date)
            const diff = Math.ceil((examD.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            setDaysUntilExam(diff > 0 ? diff : 0)
          } else {
            setShowSetup(true)
          }
          setHoursPerWeek(profile.available_hours_per_week || 10)
        }

        // Get topics + lessons + progress
        const { data: topics } = await supabase.from('topics').select('id, name_fi, name_sv, area')
        const { data: lessons } = await supabase.from('lessons').select('id, topic_id')
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed, score')
          .eq('student_id', profile?.id)

        if (topics && lessons && progress) {
          const completedSet = new Set(progress.filter(p => p.completed).map(p => p.lesson_id))

          const tps: TopicProgress[] = topics.map(topic => {
            const topicLessons = lessons.filter(l => l.topic_id === topic.id)
            const completed = topicLessons.filter(l => completedSet.has(l.id))
            const scores = progress
              .filter(p => topicLessons.some(l => l.id === p.lesson_id) && p.score != null)
              .map(p => p.score)

            return {
              id: topic.id,
              name_fi: topic.name_fi,
              name_sv: topic.name_sv,
              area: topic.area,
              totalLessons: topicLessons.length,
              completedLessons: completed.length,
              avgScore: scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0,
            }
          })

          setTopicProgress(tps)
        }
      } catch (error) {
        console.error('Error fetching plan data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveSetup = async () => {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_date: examDate || null,
          available_hours_per_week: hoursPerWeek,
        }),
      })

      if (examDate) {
        const examD = new Date(examDate)
        const diff = Math.ceil((examD.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        setDaysUntilExam(diff > 0 ? diff : 0)
      }

      setSaved(true)
      setShowSetup(false)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  // Generate weekly plan based on progress
  const generateWeeklyPlan = () => {
    // Prioritize: uncompleted topics, then low-score topics
    const uncompleted = topicProgress
      .filter(tp => tp.completedLessons < tp.totalLessons)
      .sort((a, b) => {
        // Prioritize topics with lower scores (need more work)
        if (a.avgScore !== b.avgScore) return a.avgScore - b.avgScore
        // Then by completion ratio
        const ratioA = a.totalLessons > 0 ? a.completedLessons / a.totalLessons : 0
        const ratioB = b.totalLessons > 0 ? b.completedLessons / b.totalLessons : 0
        return ratioA - ratioB
      })

    const lowScore = topicProgress
      .filter(tp => tp.avgScore > 0 && tp.avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore)

    // Distribute across study days (Mon-Thu + Sat)
    const studyDays = [0, 1, 2, 3, 5] // Mon-Thu + Sat
    const hoursPerDay = hoursPerWeek / studyDays.length

    const weekPlan = daysOfWeek.map((day, i) => {
      const isStudyDay = studyDays.includes(i)
      const isSaturday = i === 5

      if (!isStudyDay) {
        return { day, topics: [] as { id: string; name: string; area: string; type: string }[], hours: 0, isExamDay: false }
      }

      if (isSaturday) {
        return {
          day,
          topics: [{ id: 'exam', name: lang === 'sv' ? 'Övningsprov' : 'Harjoituskoe', area: '', type: lang === 'sv' ? 'Fullständigt prov (3h)' : 'Koko koe (3h)' }],
          hours: 3,
          isExamDay: true,
        }
      }

      // Assign 1-2 topics per day
      const dayTopics: { id: string; name: string; area: string; type: string }[] = []

      // Pick from uncompleted first, then low-score for review
      const topicPool = [...uncompleted, ...lowScore]
      const assigned = new Set<string>()

      for (const tp of topicPool) {
        if (assigned.has(tp.id)) continue
        if (dayTopics.length >= 2) break

        const name = lang === 'sv' && tp.name_sv ? tp.name_sv : tp.name_fi
        const type = tp.completedLessons < tp.totalLessons
          ? (lang === 'sv' ? 'Ny lektion' : 'Uusi oppitunti')
          : (lang === 'sv' ? 'Repetition' : 'Kertaus')

        dayTopics.push({ id: tp.id, name, area: tp.area, type })
        assigned.add(tp.id)
      }

      // Rotate through different days - shift pool
      const dayIndex = studyDays.indexOf(i)
      for (let j = 0; j < dayIndex && topicPool.length > 0; j++) {
        topicPool.push(topicPool.shift()!)
      }

      return { day, topics: dayTopics, hours: hoursPerDay, isExamDay: false }
    })

    return weekPlan
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    )
  }

  const weekPlan = generateWeeklyPlan()
  const totalWeekHours = weekPlan.reduce((a, d) => a + d.hours, 0)
  const totalComplete = topicProgress.reduce((a, tp) => a + tp.completedLessons, 0)
  const totalLessons = topicProgress.reduce((a, tp) => a + tp.totalLessons, 0)
  const weeksNeeded = daysUntilExam ? Math.ceil(daysUntilExam / 7) : null

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === 'sv' ? 'Studieplan' : 'Opiskelusuunnitelma'}
          </h1>
          <p className="text-gray-600 mt-1">
            {daysUntilExam !== null
              ? (lang === 'sv'
                  ? `${daysUntilExam} dagar kvar — ${weeksNeeded} veckor`
                  : `${daysUntilExam} päivää jäljellä — ${weeksNeeded} viikkoa`)
              : (lang === 'sv'
                  ? 'Ange ditt provdatum för att skapa en plan'
                  : 'Aseta koepäiväsi luodaksesi suunnitelman')}
          </p>
        </div>
        <button
          onClick={() => setShowSetup(!showSetup)}
          className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          {showSetup
            ? (lang === 'sv' ? 'Stäng' : 'Sulje')
            : (lang === 'sv' ? 'Inställningar' : 'Asetukset')}
        </button>
      </div>

      {/* Setup panel */}
      {showSetup && (
        <div className="bg-white border rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">
            {lang === 'sv' ? 'Planens inställningar' : 'Suunnitelman asetukset'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700 block mb-1">
                {lang === 'sv' ? 'Provdatum' : 'Koepäivä'}
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full md:w-64"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">
                  {lang === 'sv' ? 'Timmar per vecka' : 'Tuntia viikossa'}
                </span>
                <span className="font-medium">{hoursPerWeek}h</span>
              </label>
              <input
                type="range"
                min={3}
                max={40}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>
            <button
              onClick={handleSaveSetup}
              disabled={saving}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {saving
                ? (lang === 'sv' ? 'Sparar...' : 'Tallennetaan...')
                : saved
                ? (lang === 'sv' ? 'Sparat!' : 'Tallennettu!')
                : (lang === 'sv' ? 'Spara' : 'Tallenna')}
            </button>
          </div>
        </div>
      )}

      {/* Progress overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">{lang === 'sv' ? 'Framsteg' : 'Edistyminen'}</div>
          <div className="text-2xl font-bold text-gray-900">
            {totalLessons > 0 ? Math.round((totalComplete / totalLessons) * 100) : 0}%
          </div>
          <div className="bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${totalLessons > 0 ? (totalComplete / totalLessons) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">{lang === 'sv' ? 'Klara' : 'Valmiit'}</div>
          <div className="text-2xl font-bold text-gray-900">{totalComplete}/{totalLessons}</div>
          <div className="text-xs text-gray-400 mt-1">{lang === 'sv' ? 'lektioner' : 'oppituntia'}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">{lang === 'sv' ? 'Veckoplan' : 'Viikkosuunnitelma'}</div>
          <div className="text-2xl font-bold text-gray-900">{totalWeekHours}h</div>
          <div className="text-xs text-gray-400 mt-1">{lang === 'sv' ? 'denna vecka' : 'tällä viikolla'}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">{lang === 'sv' ? 'Att studera' : 'Opiskeltavaa'}</div>
          <div className="text-2xl font-bold text-gray-900">{totalLessons - totalComplete}</div>
          <div className="text-xs text-gray-400 mt-1">{lang === 'sv' ? 'lektioner kvar' : 'oppituntia jäljellä'}</div>
        </div>
      </div>

      {/* Week overview */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weekPlan.map((day, i) => (
          <button
            key={day.day}
            onClick={() => setCurrentDay(i)}
            className={`rounded-xl p-3 text-center transition-colors ${
              i === currentDay
                ? 'bg-brand-600 text-white'
                : day.hours > 0
                ? 'bg-white border hover:border-brand-300'
                : 'bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="text-xs font-medium mb-1">{day.day}</div>
            <div className={`text-lg font-bold ${i === currentDay ? '' : 'text-gray-900'}`}>
              {day.hours > 0 ? `${Math.round(day.hours * 10) / 10}h` : '—'}
            </div>
            <div className={`text-xs mt-1 ${i === currentDay ? 'text-blue-100' : 'text-gray-400'}`}>
              {day.topics.length > 0
                ? `${day.topics.length} ${lang === 'sv' ? 'ämnen' : 'aihetta'}`
                : (lang === 'sv' ? 'Ledig' : 'Vapaa')}
            </div>
          </button>
        ))}
      </div>

      {/* Day detail */}
      <div className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">
          {weekPlan[currentDay].day}
          {weekPlan[currentDay].hours === 0
            ? ` — ${lang === 'sv' ? 'Ledig dag' : 'Vapaapäivä'}`
            : ` — ${Math.round(weekPlan[currentDay].hours * 10) / 10}h`}
        </h2>

        {weekPlan[currentDay].topics.length > 0 ? (
          <div className="space-y-3">
            {weekPlan[currentDay].topics.map((topic, i) => {
              const config = areaConfig[topic.area]
              return (
                <Link
                  key={i}
                  href={topic.id === 'exam' ? '/study/exam' : `/study/subjects/${topic.area}/${topic.id}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: config ? `${config.color}20` : '#f3f4f6' }}
                    >
                      {config?.icon || (topic.id === 'exam' ? '📝' : '📖')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{topic.name}</h3>
                      <p className="text-sm text-gray-500">{topic.type}</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            {lang === 'sv'
              ? 'Idag är en ledig dag. Vila är viktigt för inlärningen!'
              : 'Tänään on vapaapäivä. Lepo on tärkeää oppimiselle!'}
          </p>
        )}
      </div>

      {/* Area breakdown */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">
          {lang === 'sv' ? 'Framsteg per område' : 'Edistyminen aihealueittain'}
        </h2>
        <div className="space-y-4">
          {Object.entries(areaConfig).map(([key, config]) => {
            const areaTopics = topicProgress.filter(tp => tp.area === key)
            const total = areaTopics.reduce((a, tp) => a + tp.totalLessons, 0)
            const completed = areaTopics.reduce((a, tp) => a + tp.completedLessons, 0)
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className="font-medium">{config[lang as 'fi' | 'sv']}</span>
                  </div>
                  <span className="text-gray-500">{completed}/{total} ({percent}%)</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: config.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
