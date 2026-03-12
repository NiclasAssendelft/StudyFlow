'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [lang, setLang] = useState<'fi' | 'sv'>('fi')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError(lang === 'sv'
        ? 'Lösenordet måste vara minst 6 tecken'
        : 'Salasanan tulee olla vähintään 6 merkkiä')
      setLoading(false)
      return
    }

    const supabase = createSupabaseBrowser()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create student profile
      await supabase.from('student_profiles').insert({
        auth_user_id: data.user.id,
        display_name: displayName,
        email,
      })

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/onboarding'
      }, 1000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left: animated background (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-animated-gradient relative overflow-hidden items-center justify-center">
          {/* Floating blobs */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full mix-blend-overlay filter blur-xl animate-float-slower" />

          {/* Branding */}
          <div className="relative z-10 text-center text-white px-12">
            <h1 className="text-5xl font-bold mb-4">StudyFlow</h1>
            <p className="text-xl text-white/80 max-w-md">
              {lang === 'sv'
                ? 'Börja din väg mot framgång'
                : 'Aloita polkusi kohti menestystä'}
            </p>
          </div>
        </div>

        {/* Right: success state */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative overflow-hidden">
          {/* Subtle background blobs */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-200/20 rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-fuchsia-200/15 rounded-full filter blur-3xl animate-float-slow" />

          <div className="w-full max-w-md relative z-10">
            <div className="glass rounded-2xl p-8 text-center space-y-6">
              <div className="text-6xl animate-bounce">🎉</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {lang === 'sv' ? 'Konto skapat!' : 'Tili luotu!'}
                </h1>
                <p className="text-slate-600 mt-2">
                  {lang === 'sv' ? 'Omdirigerar till introduktionen...' : 'Ohjataan alkukartoitukseen...'}
                </p>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: animated background (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-animated-gradient relative overflow-hidden items-center justify-center">
        {/* Floating blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-float-slow" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full mix-blend-overlay filter blur-xl animate-float-slower" />

        {/* Branding */}
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-5xl font-bold mb-4">StudyFlow</h1>
          <p className="text-xl text-white/80 max-w-md">
            {lang === 'sv'
              ? 'Börja din väg mot framgång'
              : 'Aloita polkusi kohti menestystä'}
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-white/60">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">66</div>
              <div className="text-sm">{lang === 'sv' ? 'Lektioner' : 'Oppituntia'}</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">270+</div>
              <div className="text-sm">{lang === 'sv' ? 'Frågor' : 'Kysymystä'}</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4</div>
              <div className="text-sm">{lang === 'sv' ? 'Ämnen' : 'Aihetta'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: signup form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 relative overflow-hidden">
        {/* Subtle background blobs (mobile only shows these) */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-200/20 rounded-full filter blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-fuchsia-200/15 rounded-full filter blur-3xl animate-float-slow" />

        <div className="w-full max-w-md relative z-10">
          {/* Language toggle */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setLang(lang === 'fi' ? 'sv' : 'fi')}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {lang === 'fi' ? '🇫🇮 FI' : '🇸🇪 SV'} → {lang === 'fi' ? 'SV' : 'FI'}
            </button>
          </div>

          <div className="text-center mb-8">
            <Link href="/" className="text-4xl font-bold text-gradient inline-block">
              StudyFlow
            </Link>
            <h1 className="text-2xl font-semibold text-slate-900 mt-4">
              {lang === 'sv' ? 'Skapa konto' : 'Luo tili'}
            </h1>
            <p className="text-slate-600 mt-1.5">
              {lang === 'sv'
                ? 'Börja förbereda dig för urvalsprovet'
                : 'Aloita valmistautuminen valintakokeeseen'}
            </p>
          </div>

          <form onSubmit={handleSignup} className="glass rounded-2xl p-8 space-y-5">
            {error && (
              <div className="bg-red-50/80 text-red-700 text-sm p-3.5 rounded-xl border border-red-200/50 animate-slide-down">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                {lang === 'sv' ? 'Namn' : 'Nimi'}
              </label>
              <input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder={lang === 'sv' ? 'Förnamn' : 'Etunimi'}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                {lang === 'sv' ? 'E-post' : 'Sähköposti'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder={lang === 'sv' ? 'namn@exempel.fi' : 'nimi@esimerkki.fi'}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                {lang === 'sv' ? 'Lösenord' : 'Salasana'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder={lang === 'sv' ? 'Minst 6 tecken' : 'Vähintään 6 merkkiä'}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading
                ? (lang === 'sv' ? 'Skapar konto...' : 'Luodaan tiliä...')
                : (lang === 'sv' ? 'Skapa konto' : 'Luo tili')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            {lang === 'sv' ? 'Har du redan ett konto? ' : 'Onko sinulla jo tili? '}
            <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors">
              {lang === 'sv' ? 'Logga in' : 'Kirjaudu sisään'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
