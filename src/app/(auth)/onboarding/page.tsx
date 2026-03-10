'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'

type Step = 'language' | 'exam_date' | 'hours' | 'learning_style' | 'target' | 'done'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('language')
  const [language, setLanguage] = useState('fi')
  const [examDate, setExamDate] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [learningStyle, setLearningStyle] = useState('mixed')
  const [targetScore, setTargetScore] = useState(70)
  const [saving, setSaving] = useState(false)

  const saveAndFinish = async () => {
    setSaving(true)
    const supabase = createSupabaseBrowser()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('student_profiles')
        .update({
          language_preference: language,
          exam_date: examDate || null,
          available_hours_per_week: hoursPerWeek,
          learning_style_preference: learningStyle,
          target_score: targetScore,
          onboarding_completed: true,
        })
        .eq('auth_user_id', user.id)
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {['language', 'exam_date', 'hours', 'learning_style', 'target'].map((s, i) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${
                ['language', 'exam_date', 'hours', 'learning_style', 'target'].indexOf(step) >= i
                  ? 'bg-brand-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-xl border p-8">
          {step === 'language' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Valitse kieli / Välj språk</h2>
              <p className="text-gray-600 text-sm mb-6">
                Valitse opiskelukielesi. Du kan ändra detta senare.
              </p>
              <div className="flex gap-4 mb-6">
                {[
                  { value: 'fi', label: 'Suomi', flag: '🇫🇮', desc: 'Opiskele suomeksi' },
                  { value: 'sv', label: 'Svenska', flag: '🇸🇪', desc: 'Studera på svenska' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLanguage(opt.value)}
                    className={`flex-1 p-6 rounded-lg border-2 transition-colors text-center ${
                      language === opt.value
                        ? 'border-brand-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-4xl block mb-2">{opt.flag}</span>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep('exam_date')}
                className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700"
              >
                Seuraava / Nästa
              </button>
            </div>
          )}

          {step === 'exam_date' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Milloin kokeesi on?</h2>
              <p className="text-gray-600 text-sm mb-6">
                Tämä auttaa meitä luomaan sinulle sopivan aikataulun.
              </p>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none mb-4"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-400 mb-6">Voit jättää tämän tyhjäksi jos et tiedä vielä.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('language')}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
                >
                  Takaisin
                </button>
                <button
                  onClick={() => setStep('hours')}
                  className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700"
                >
                  Seuraava
                </button>
              </div>
            </div>
          )}

          {step === 'hours' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Kuinka monta tuntia viikossa voit opiskella?</h2>
              <p className="text-gray-600 text-sm mb-6">
                Luomme aikataulun, joka sopii elämääsi.
              </p>
              <div className="flex items-center gap-4 mb-2">
                <input
                  type="range"
                  min={3}
                  max={40}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="flex-1 accent-brand-600"
                />
                <span className="text-2xl font-bold text-brand-600 w-16 text-right">
                  {hoursPerWeek}h
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-6">
                <span>3h/vko</span>
                <span>40h/vko</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('exam_date')}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
                >
                  Takaisin
                </button>
                <button
                  onClick={() => setStep('learning_style')}
                  className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700"
                >
                  Seuraava
                </button>
              </div>
            </div>
          )}

          {step === 'learning_style' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Miten opit parhaiten?</h2>
              <p className="text-gray-600 text-sm mb-6">
                Painotamme sisältöä sinulle sopivaan muotoon.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'visual', label: 'Visuaalinen', desc: 'Videot, kaaviot, kuvalliset selitykset', icon: '🎥' },
                  { value: 'reading', label: 'Lukeminen', desc: 'Teksti, tiivistelmät, muistiinpanot', icon: '📖' },
                  { value: 'practice', label: 'Harjoittelu', desc: 'Tehtävät, kokeet, interaktiiviset harjoitukset', icon: '✏️' },
                  { value: 'mixed', label: 'Sekoitus', desc: 'Kaikkea sopivassa suhteessa', icon: '🎯' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLearningStyle(opt.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      learningStyle === opt.value
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
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('hours')}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
                >
                  Takaisin
                </button>
                <button
                  onClick={() => setStep('target')}
                  className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700"
                >
                  Seuraava
                </button>
              </div>
            </div>
          )}

          {step === 'target' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Mikä on tavoitteesi?</h2>
              <p className="text-gray-600 text-sm mb-6">
                Aseta tavoitepistemäärä harjoituskokeissa. Voit muuttaa tätä myöhemmin.
              </p>
              <div className="flex items-center gap-4 mb-2">
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="flex-1 accent-brand-600"
                />
                <span className="text-2xl font-bold text-brand-600 w-16 text-right">
                  {targetScore}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                {targetScore >= 80
                  ? 'Kunnianhimoinen tavoite! Se vaatii kovaa työtä, mutta me autamme.'
                  : targetScore >= 65
                  ? 'Hyvä tavoite! Realistinen ja saavutettavissa järjestelmällisellä opiskelulla.'
                  : 'Maltillinen tavoite. Voit aina nostaa sitä myöhemmin!'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('learning_style')}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
                >
                  Takaisin
                </button>
                <button
                  onClick={saveAndFinish}
                  disabled={saving}
                  className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? 'Tallennetaan...' : 'Aloitetaan opiskelu!'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
