'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/useLanguage'

interface Badge {
  id: string
  name_fi: string
  name_sv?: string
  description_fi: string
  description_sv?: string
  icon: string
  category: string
  requirement_value: number
}

interface EarnedBadge {
  badge_id: string
  earned_at: string
  badges: Badge
}

interface XpEntry {
  amount: number
  source: string
  created_at: string
}

interface GamificationData {
  xp: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  earnedBadges: EarnedBadge[]
  allBadges: Badge[]
  recentXp: XpEntry[]
}

// XP needed per level
const xpPerLevel = (level: number) => level * 100

function getLevel(xp: number) {
  let level = 1
  let remaining = xp
  while (remaining >= xpPerLevel(level)) {
    remaining -= xpPerLevel(level)
    level++
  }
  return { level, xpInLevel: remaining, xpNeeded: xpPerLevel(level) }
}

export default function AchievementsPage() {
  const { lang, t } = useLanguage()
  const [data, setData] = useState<GamificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'badges' | 'xp'>('badges')

  useEffect(() => {
    fetch('/api/gamification')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">{t('loading')}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">{lang === 'sv' ? 'Kunde inte ladda data' : 'Tietojen lataus epäonnistui'}</p>
      </div>
    )
  }

  const { level, xpInLevel, xpNeeded } = getLevel(data.xp)
  const earnedIds = new Set(data.earnedBadges.map((b) => b.badge_id))

  const sourceLabels: Record<string, { fi: string; sv: string }> = {
    lesson_complete: { fi: 'Oppitunti suoritettu', sv: 'Lektion slutförd' },
    task_correct: { fi: 'Tehtävä oikein', sv: 'Uppgift rätt' },
    question_correct: { fi: 'Kysymys oikein', sv: 'Fråga rätt' },
    exam_complete: { fi: 'Harjoituskoe suoritettu', sv: 'Övningsprov slutfört' },
    streak_bonus: { fi: 'Putkibonus', sv: 'Svitbonus' },
    badge_earned: { fi: 'Merkki ansaittu', sv: 'Märke erhållet' },
  }

  const categoryLabels: Record<string, { fi: string; sv: string }> = {
    streak: { fi: 'Putki', sv: 'Svit' },
    xp: { fi: 'Kokemus', sv: 'Erfarenhet' },
    lesson: { fi: 'Oppitunnit', sv: 'Lektioner' },
    exam: { fi: 'Kokeet', sv: 'Prov' },
    special: { fi: 'Erikois', sv: 'Special' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-mesh opacity-40" />

      {/* Floating blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000" />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            {lang === 'sv' ? 'Prestationer' : 'Saavutukset'}
          </h1>
          <p className="text-slate-400 text-lg">
            {lang === 'sv' ? 'Dina framsteg och belöningar' : 'Edistymisesi ja palkintosi'}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up [animation-delay:100ms]">
          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="text-4xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-indigo-500 bg-clip-text text-transparent">
                {level}
              </div>
              <div className="text-xs text-slate-400 mt-2">{lang === 'sv' ? 'Nivå' : 'Taso'}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="text-4xl font-bold text-gradient bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {data.xp}
              </div>
              <div className="text-xs text-slate-400 mt-2">XP</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="text-4xl font-bold text-gradient bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {data.currentStreak}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                🔥 {lang === 'sv' ? 'Dagars svit' : 'Päivän putki'}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-inner">
              <div className="text-4xl font-bold text-gradient bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
                {data.earnedBadges.length}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {lang === 'sv' ? 'Märken' : 'Merkkiä'}
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="glass card-hover p-6 mb-8 animate-slide-up [animation-delay:200ms]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-300">
              {lang === 'sv' ? 'Nivå' : 'Taso'} {level}
            </span>
            <span className="text-sm text-slate-400">
              {xpInLevel} / {xpNeeded} XP
            </span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${Math.round((xpInLevel / xpNeeded) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {xpNeeded - xpInLevel} XP {lang === 'sv' ? 'till nästa nivå' : 'seuraavalle tasolle'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 animate-slide-up [animation-delay:300ms]">
          <button
            onClick={() => setTab('badges')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              tab === 'badges'
                ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20'
                : 'glass text-slate-300 hover:glass-brand'
            }`}
          >
            {lang === 'sv' ? 'Märken' : 'Merkit'} ({data.earnedBadges.length}/{data.allBadges.length})
          </button>
          <button
            onClick={() => setTab('xp')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              tab === 'xp'
                ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20'
                : 'glass text-slate-300 hover:glass-brand'
            }`}
          >
            XP {lang === 'sv' ? 'historik' : 'historia'}
          </button>
        </div>

        {/* Badges tab */}
        {tab === 'badges' && (
          <div className="animate-slide-up [animation-delay:400ms]">
            {/* Group by category */}
            {['streak', 'xp', 'lesson', 'exam', 'special'].map((cat, catIdx) => {
              const catBadges = data.allBadges.filter((b) => b.category === cat)
              if (catBadges.length === 0) return null

              return (
                <div key={cat} className="mb-10 animate-slide-up" style={{ animationDelay: `${400 + catIdx * 50}ms` }}>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    {categoryLabels[cat]?.[lang as 'fi' | 'sv'] || cat}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {catBadges.map((badge, badgeIdx) => {
                      const earned = earnedIds.has(badge.id)
                      return (
                        <div
                          key={badge.id}
                          className={`transition-all duration-300 animate-slide-up`}
                          style={{ animationDelay: `${400 + catIdx * 50 + badgeIdx * 25}ms` }}
                        >
                          {earned ? (
                            <div className="glass-brand card-hover p-5 text-center rounded-xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20">
                              <div className="text-4xl mb-3 animate-float">
                                {badge.icon}
                              </div>
                              <div className="font-semibold text-sm text-slate-100 mb-1">
                                {lang === 'sv' && badge.name_sv ? badge.name_sv : badge.name_fi}
                              </div>
                              <div className="text-xs text-slate-400 mb-3">
                                {lang === 'sv' && badge.description_sv
                                  ? badge.description_sv
                                  : badge.description_fi}
                              </div>
                              <div className="text-xs font-semibold text-emerald-400">
                                ✓ {lang === 'sv' ? 'Erhållet' : 'Ansaittu'}
                              </div>
                            </div>
                          ) : (
                            <div className="glass card-hover p-5 text-center rounded-xl border border-slate-600/30 opacity-60">
                              <div className="text-4xl mb-3 grayscale opacity-50">
                                {badge.icon}
                              </div>
                              <div className="font-semibold text-sm text-slate-400 mb-1">
                                {lang === 'sv' && badge.name_sv ? badge.name_sv : badge.name_fi}
                              </div>
                              <div className="text-xs text-slate-500">
                                {lang === 'sv' && badge.description_sv
                                  ? badge.description_sv
                                  : badge.description_fi}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* XP History tab */}
        {tab === 'xp' && (
          <div className="glass card rounded-xl overflow-hidden animate-slide-up [animation-delay:400ms]">
            {data.recentXp.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                {lang === 'sv' ? 'Ingen XP-historik ännu' : 'Ei vielä XP-historiaa'}
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {data.recentXp.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/20 transition-colors animate-slide-up"
                    style={{ animationDelay: `${400 + i * 25}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-100">
                          {sourceLabels[entry.source]?.[lang as 'fi' | 'sv'] || entry.source}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(entry.created_at).toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'fi-FI', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gradient bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      +{entry.amount} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
