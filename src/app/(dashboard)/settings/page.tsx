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
  const [language, setLanguage] = useState('fi')
  const [tutorIntensity, setTutorIntensity] = useState('balanced')
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
          setLanguage(profile.language_preference || 'fi')
          setTutorIntensity(profile.tutor_intensity || 'balanced')
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
          language_preference: language,
          tutor_intensity: tutorIntensity,
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

      {/* Language settings */}
      <section className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Kieli / Språk</h2>
        <div className="flex gap-4">
          {[
            { value: 'fi', label: 'Suomi', flag: '🇫🇮' },
            { value: 'sv', label: 'Svenska', flag: '🇸🇪' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLanguage(opt.value)}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors text-center ${
                language === opt.value
                  ? 'border-brand-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-3xl block mb-1">{opt.flag}</span>
              <span className="font-medium text-sm">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

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

      {/* Tutor intensity settings */}
      <section className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Tuutorin tyyli</h2>
        <div className="space-y-3">
          {[
            { value: 'strict', label: 'Tiukka', desc: 'Vaativa mentori, haastaa oletuksiasi, odottaa tarkkuutta', icon: '🎯' },
            { value: 'balanced', label: 'Tasapainoinen', desc: 'Auttava mutta vaatii ymmärrystä, sopiva rohkaisu', icon: '⚖️' },
            { value: 'gentle', label: 'Lempeä', desc: 'Kärsivällinen, kannustava, selittää askel askeleelta', icon: '🌱' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTutorIntensity(opt.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                tutorIntensity === opt.value
                  ? 'border-brand-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.desc}</div>
                </div>
              </div>
            </button>
          ))}
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
