'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [pomodoroFocus, setPomodoroFocus] = useState(25)
  const [pomodoroBreak, setPomodoroBreak] = useState(5)
  const [pomodoroLongBreak, setPomodoroLongBreak] = useState(15)
  const [showPomodoro, setShowPomodoro] = useState(true)
  const [showFeynman, setShowFeynman] = useState(true)
  const [targetScore, setTargetScore] = useState(70)
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const profile = await response.json()
          setPomodoroFocus(profile.pomodoro_focus_min || 25)
          setPomodoroBreak(profile.pomodoro_break_min || 5)
          setPomodoroLongBreak(profile.pomodoro_long_break_min || 15)
          setShowPomodoro(profile.show_pomodoro !== false)
          setShowFeynman(profile.show_feynman !== false)
          setTargetScore(profile.target_score || 70)
          setHoursPerWeek(profile.available_hours_per_week || 10)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pomodoro_focus_min: pomodoroFocus,
          pomodoro_break_min: pomodoroBreak,
          pomodoro_long_break_min: pomodoroLongBreak,
          show_pomodoro: showPomodoro,
          show_feynman: showFeynman,
          target_score: targetScore,
          available_hours_per_week: hoursPerWeek,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Asetukset</h1>

      {/* Visibility settings */}
      <section className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Näkyvyys</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Näytä Pomodoro-ajastin</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPomodoro}
                onChange={(e) => setShowPomodoro(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Näytä Feynman-tekniikka</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showFeynman}
                onChange={(e) => setShowFeynman(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Pomodoro settings */}
      <section className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Pomodoro-ajastin</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Keskittymisaika</span>
              <span className="font-medium">{pomodoroFocus} min</span>
            </label>
            <input
              type="range"
              min={15}
              max={50}
              step={5}
              value={pomodoroFocus}
              onChange={(e) => setPomodoroFocus(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
          <div>
            <label className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Tauon pituus</span>
              <span className="font-medium">{pomodoroBreak} min</span>
            </label>
            <input
              type="range"
              min={3}
              max={15}
              value={pomodoroBreak}
              onChange={(e) => setPomodoroBreak(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
          <div>
            <label className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Pitkä tauko</span>
              <span className="font-medium">{pomodoroLongBreak} min</span>
            </label>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={pomodoroLongBreak}
              onChange={(e) => setPomodoroLongBreak(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        </div>
      </section>

      {/* Study settings */}
      <section className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Opiskelu</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Tavoitepistemäärä</span>
              <span className="font-medium">{targetScore}%</span>
            </label>
            <input
              type="range"
              min={50}
              max={100}
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
          <div>
            <label className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">Tuntia viikossa</span>
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
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? 'Tallennetaan...' : saved ? 'Tallennettu!' : 'Tallenna asetukset'}
      </button>
    </div>
  )
}
