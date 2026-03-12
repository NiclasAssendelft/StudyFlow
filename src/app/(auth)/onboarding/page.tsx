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

  const sv = language === 'sv'

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

  const steps = ['language', 'exam_date', 'hours', 'learning_style', 'target']
  const currentStepIndex = steps.indexOf(step)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-mesh opacity-30" />

      {/* Floating blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />

      <div className="w-full max-w-lg relative z-10">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-12 animate-slide-up">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i < currentStepIndex
                  ? 'w-8 bg-gradient-to-r from-indigo-500 to-fuchsia-500'
                  : i === currentStepIndex
                  ? 'w-8 bg-gradient-to-r from-indigo-400 to-fuchsia-400'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="glass card-interactive backdrop-blur-xl border border-slate-600/40 rounded-2xl p-8">
          {step === 'language' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                Valitse kieli / Välj språk
              </h2>
              <p className="text-slate-300 text-sm mb-8">
                Valitse opiskelukielesi. Du kan ändra detta senare.
              </p>
              <div className="flex gap-4 mb-8">
                {[
                  { value: 'fi', label: 'Suomi', flag: '🇫🇮', desc: 'Opiskele suomeksi' },
                  { value: 'sv', label: 'Svenska', flag: '🇸🇪', desc: 'Studera på svenska' },
                ].map((opt, idx) => (
                  <button
                    key={opt.value}
                    onClick={() => setLanguage(opt.value)}
                    className={`flex-1 p-6 rounded-xl transition-all duration-300 text-center animate-slide-up ${
                      language === opt.value
                        ? 'glass-brand border border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                        : 'glass-subtle border border-slate-600/30 hover:glass'
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="text-5xl block mb-3">{opt.flag}</span>
                    <div className="font-semibold text-slate-100">{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-2">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep('exam_date')}
                className="btn-primary w-full"
              >
                {sv ? 'Nästa' : 'Seuraava'}
              </button>
            </div>
          )}

          {step === 'exam_date' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                {sv ? 'När är ditt prov?' : 'Milloin kokeesi on?'}
              </h2>
              <p className="text-slate-300 text-sm mb-8">
                {sv
                  ? 'Detta hjälper oss att skapa ett schema som passar dig.'
                  : 'Tämä auttaa meitä luomaan sinulle sopivan aikataulun.'}
              </p>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full glass-subtle border border-slate-600/30 px-4 py-3 text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4 placeholder-slate-500"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-slate-500 mb-8">
                {sv
                  ? 'Du kan lämna detta tomt om du inte vet ännu.'
                  : 'Voit jättää tämän tyhjäksi jos et tiedä vielä.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('language')}
                  className="btn-secondary flex-1"
                >
                  {sv ? 'Tillbaka' : 'Takaisin'}
                </button>
                <button
                  onClick={() => setStep('hours')}
                  className="btn-primary flex-1"
                >
                  {sv ? 'Nästa' : 'Seuraava'}
                </button>
              </div>
            </div>
          )}

          {step === 'hours' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                {sv ? 'Hur många timmar per vecka kan du studera?' : 'Kuinka monta tuntia viikossa voit opiskella?'}
              </h2>
              <p className="text-slate-300 text-sm mb-8">
                {sv
                  ? 'Vi skapar ett schema som passar ditt liv.'
                  : 'Luomme aikataulun, joka sopii elämääsi.'}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="range"
                  min={3}
                  max={40}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-3xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent w-20 text-right">
                  {hoursPerWeek}h
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-8">
                <span>3h/{sv ? 'v' : 'vko'}</span>
                <span>40h/{sv ? 'v' : 'vko'}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('exam_date')}
                  className="btn-secondary flex-1"
                >
                  {sv ? 'Tillbaka' : 'Takaisin'}
                </button>
                <button
                  onClick={() => setStep('learning_style')}
                  className="btn-primary flex-1"
                >
                  {sv ? 'Nästa' : 'Seuraava'}
                </button>
              </div>
            </div>
          )}

          {step === 'learning_style' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                {sv ? 'Hur lär du dig bäst?' : 'Miten opit parhaiten?'}
              </h2>
              <p className="text-slate-300 text-sm mb-8">
                {sv
                  ? 'Vi anpassar innehållet efter din stil.'
                  : 'Painotamme sisältöä sinulle sopivaan muotoon.'}
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { value: 'visual', fi: 'Visuaalinen', sv: 'Visuell', fiDesc: 'Videot, kaaviot, kuvalliset selitykset', svDesc: 'Videor, diagram, visuella förklaringar', icon: '🎥' },
                  { value: 'reading', fi: 'Lukeminen', sv: 'Läsning', fiDesc: 'Teksti, tiivistelmät, muistiinpanot', svDesc: 'Text, sammanfattningar, anteckningar', icon: '📖' },
                  { value: 'practice', fi: 'Harjoittelu', sv: 'Övning', fiDesc: 'Tehtävät, kokeet, interaktiiviset harjoitukset', svDesc: 'Uppgifter, prov, interaktiva övningar', icon: '✏️' },
                  { value: 'mixed', fi: 'Sekoitus', sv: 'Blandning', fiDesc: 'Kaikkea sopivassa suhteessa', svDesc: 'Allt i lagom proportioner', icon: '🎯' },
                ].map((opt, idx) => (
                  <button
                    key={opt.value}
                    onClick={() => setLearningStyle(opt.value)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 animate-slide-up ${
                      learningStyle === opt.value
                        ? 'glass-brand border border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                        : 'glass-subtle border border-slate-600/30 hover:glass'
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="font-semibold text-sm text-slate-100">{sv ? opt.sv : opt.fi}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{sv ? opt.svDesc : opt.fiDesc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('hours')}
                  className="btn-secondary flex-1"
                >
                  {sv ? 'Tillbaka' : 'Takaisin'}
                </button>
                <button
                  onClick={() => setStep('target')}
                  className="btn-primary flex-1"
                >
                  {sv ? 'Nästa' : 'Seuraava'}
                </button>
              </div>
            </div>
          )}

          {step === 'target' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
                {sv ? 'Vad är ditt mål?' : 'Mikä on tavoitteesi?'}
              </h2>
              <p className="text-slate-300 text-sm mb-8">
                {sv
                  ? 'Sätt ett målresultat för övningsproven. Du kan ändra detta senare.'
                  : 'Aseta tavoitepistemäärä harjoituskokeissa. Voit muuttaa tätä myöhemmin.'}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-3xl font-bold text-gradient bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent w-20 text-right">
                  {targetScore}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-4">
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-slate-400 mb-8 p-3 glass-subtle rounded-lg border border-slate-600/30">
                {targetScore >= 80
                  ? (sv ? 'Ambitiöst mål! Det kräver hårt arbete, men vi hjälper dig.' : 'Kunnianhimoinen tavoite! Se vaatii kovaa työtä, mutta me autamme.')
                  : targetScore >= 65
                  ? (sv ? 'Bra mål! Realistiskt och uppnåeligt med systematisk studie.' : 'Hyvä tavoite! Realistinen ja saavutettavissa järjestelmällisellä opiskelulla.')
                  : (sv ? 'Måttligt mål. Du kan alltid höja det senare!' : 'Maltillinen tavoite. Voit aina nostaa sitä myöhemmin!')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('learning_style')}
                  className="btn-secondary flex-1"
                >
                  {sv ? 'Tillbaka' : 'Takaisin'}
                </button>
                <button
                  onClick={saveAndFinish}
                  disabled={saving}
                  className="btn-primary flex-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none"
                >
                  {saving
                    ? (sv ? 'Sparar...' : 'Tallennetaan...')
                    : (sv ? 'Börja studera!' : 'Aloitetaan opiskelu!')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
