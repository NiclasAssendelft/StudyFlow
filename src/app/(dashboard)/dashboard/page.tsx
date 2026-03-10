'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Placeholder data — will be replaced with real Supabase queries
const mockData = {
  streakDays: 5,
  todayPomodoros: { completed: 2, planned: 4 },
  spacedRepDue: 12,
  weeklyHours: 8.5,
  weakestTopics: [
    { id: '2.1', name: 'BKT ja kansantalouden tilinpito', score: 42 },
    { id: '3.3', name: 'Todennäköisyyslaskenta', score: 51 },
  ],
  strongestTopics: [
    { id: '1.1', name: 'Kysyntä ja tarjonta', score: 85 },
    { id: '3.1', name: 'Kuvaileva tilastotiede', score: 78 },
  ],
  recentExam: { score: 62, date: '2026-03-08' },
  daysUntilExam: 97,
}

export default function DashboardPage() {
  const data = mockData

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tervetuloa takaisin!</h1>
        <p className="text-gray-600 mt-1">
          {data.daysUntilExam} päivää kokeeseen. Jatka siitä mihin jäit.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Putkipäivät"
          value={`${data.streakDays}`}
          icon="🔥"
          color="orange"
        />
        <StatCard
          label="Pomodoro tänään"
          value={`${data.todayPomodoros.completed}/${data.todayPomodoros.planned}`}
          icon="🍅"
          color="red"
        />
        <StatCard
          label="Kerrattavana"
          value={`${data.spacedRepDue}`}
          icon="🔄"
          color="blue"
        />
        <StatCard
          label="Tuntia tällä viikolla"
          value={`${data.weeklyHours}`}
          icon="⏱️"
          color="green"
        />
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's plan */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Tämän päivän suunnitelma</h2>
          <div className="space-y-3">
            <PlanItem
              time="14:00"
              topic="Kysyntä ja tarjonta"
              format="Teksti + video"
              status="completed"
            />
            <PlanItem
              time="14:30"
              topic="Kysyntä ja tarjonta"
              format="Harjoitustehtävät"
              status="completed"
            />
            <PlanItem
              time="15:00"
              topic="BKT"
              format="Teksti + video"
              status="current"
            />
            <PlanItem
              time="15:30"
              topic="BKT"
              format="Muistikortit"
              status="upcoming"
            />
          </div>
          <Link
            href="/study/plan"
            className="block text-center text-brand-600 font-medium mt-4 hover:text-brand-700"
          >
            Katso koko viikkosuunnitelma →
          </Link>
        </div>

        {/* Topic mastery */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Aiheesi</h2>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Heikoimmat</h3>
            {data.weakestTopics.map((t) => (
              <TopicBar key={t.id} name={t.name} score={t.score} color="red" />
            ))}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Vahvimmat</h3>
            {data.strongestTopics.map((t) => (
              <TopicBar key={t.id} name={t.name} score={t.score} color="green" />
            ))}
          </div>
          <Link
            href="/study/topics"
            className="block text-center text-brand-600 font-medium mt-4 hover:text-brand-700"
          >
            Kaikki aiheet →
          </Link>
        </div>

        {/* Quick actions */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Pikatoiminnot</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/study/pomodoro" icon="🍅" label="Aloita Pomodoro" />
            <QuickAction href="/study/review" icon="🔄" label="Kertaa (12 korttia)" />
            <QuickAction href="/study/feynman" icon="🧠" label="Feynman-harjoitus" />
            <QuickAction href="/study/exam" icon="📝" label="Harjoituskoe" />
            <QuickAction href="/chat" icon="🤖" label="Kysy tuutorilta" />
            <QuickAction href="/forum" icon="💬" label="Foorumi" />
          </div>
        </div>

        {/* Latest exam result */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Viimeisin harjoituskoe</h2>
          {data.recentExam ? (
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {data.recentExam.score}%
              </div>
              <p className="text-gray-500 text-sm">{data.recentExam.date}</p>
              <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${data.recentExam.score}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Tavoite: 70% — {data.recentExam.score >= 70 ? 'Saavutettu!' : `${70 - data.recentExam.score}% puuttuu`}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Et ole vielä tehnyt harjoituskoetta
            </p>
          )}
          <Link
            href="/study/exam"
            className="block text-center text-brand-600 font-medium mt-4 hover:text-brand-700"
          >
            Tee harjoituskoe →
          </Link>
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
  color,
}: {
  label: string
  value: string
  icon: string
  color: string
}) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function PlanItem({
  time,
  topic,
  format,
  status,
}: {
  time: string
  topic: string
  format: string
  status: 'completed' | 'current' | 'upcoming'
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        status === 'current'
          ? 'bg-blue-50 border border-blue-200'
          : status === 'completed'
          ? 'bg-gray-50 opacity-75'
          : 'bg-gray-50'
      }`}
    >
      <span className="text-sm text-gray-500 w-12">{time}</span>
      <div className="flex-1">
        <div className="font-medium text-sm">{topic}</div>
        <div className="text-xs text-gray-500">{format}</div>
      </div>
      {status === 'completed' && <span className="text-green-500">✓</span>}
      {status === 'current' && (
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          Nyt
        </span>
      )}
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
        <span className="text-gray-700">{name}</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${
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
