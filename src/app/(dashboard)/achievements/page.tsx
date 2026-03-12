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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{lang === 'sv' ? 'Kunde inte ladda data' : 'Tietojen lataus epäonnistui'}</p>
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
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === 'sv' ? 'Prestationer' : 'Saavutukset'}
        </h1>
        <p className="text-gray-600 mt-1">
          {lang === 'sv' ? 'Dina framsteg och belöningar' : 'Edistymisesi ja palkintosi'}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-brand-600">{level}</div>
          <div className="text-xs text-gray-500 mt-1">{lang === 'sv' ? 'Nivå' : 'Taso'}</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-amber-500">{data.xp}</div>
          <div className="text-xs text-gray-500 mt-1">XP</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-500">{data.currentStreak}</div>
          <div className="text-xs text-gray-500 mt-1">
            🔥 {lang === 'sv' ? 'Dagars svit' : 'Päivän putki'}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-500">{data.earnedBadges.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {lang === 'sv' ? 'Märken' : 'Merkkiä'}
          </div>
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="bg-white border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {lang === 'sv' ? 'Nivå' : 'Taso'} {level}
          </span>
          <span className="text-sm text-gray-500">
            {xpInLevel} / {xpNeeded} XP
          </span>
        </div>
        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
            style={{ width: `${Math.round((xpInLevel / xpNeeded) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {xpNeeded - xpInLevel} XP {lang === 'sv' ? 'till nästa nivå' : 'seuraavalle tasolle'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('badges')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'badges' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {lang === 'sv' ? 'Märken' : 'Merkit'} ({data.earnedBadges.length}/{data.allBadges.length})
        </button>
        <button
          onClick={() => setTab('xp')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'xp' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          XP {lang === 'sv' ? 'historik' : 'historia'}
        </button>
      </div>

      {/* Badges tab */}
      {tab === 'badges' && (
        <div>
          {/* Group by category */}
          {['streak', 'xp', 'lesson', 'exam', 'special'].map((cat) => {
            const catBadges = data.allBadges.filter((b) => b.category === cat)
            if (catBadges.length === 0) return null

            return (
              <div key={cat} className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {categoryLabels[cat]?.[lang as 'fi' | 'sv'] || cat}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {catBadges.map((badge) => {
                    const earned = earnedIds.has(badge.id)
                    return (
                      <div
                        key={badge.id}
                        className={`border rounded-xl p-4 text-center transition-all ${
                          earned
                            ? 'bg-white border-amber-200 shadow-sm'
                            : 'bg-gray-50 border-gray-200 opacity-50'
                        }`}
                      >
                        <div className={`text-3xl mb-2 ${earned ? '' : 'grayscale'}`}>
                          {badge.icon}
                        </div>
                        <div className="font-medium text-sm text-gray-900">
                          {lang === 'sv' && badge.name_sv ? badge.name_sv : badge.name_fi}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {lang === 'sv' && badge.description_sv
                            ? badge.description_sv
                            : badge.description_fi}
                        </div>
                        {earned && (
                          <div className="text-xs text-amber-600 font-medium mt-2">
                            ✓ {lang === 'sv' ? 'Erhållet' : 'Ansaittu'}
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
        <div className="bg-white border rounded-xl divide-y">
          {data.recentXp.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {lang === 'sv' ? 'Ingen XP-historik ännu' : 'Ei vielä XP-historiaa'}
            </div>
          ) : (
            data.recentXp.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {sourceLabels[entry.source]?.[lang as 'fi' | 'sv'] || entry.source}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'fi-FI', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-500">+{entry.amount} XP</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
