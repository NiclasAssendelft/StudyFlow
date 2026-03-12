'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'fi' | 'sv'>('fi')
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createSupabaseBrowser()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(lang === 'sv'
        ? 'Felaktig e-postadress eller lösenord'
        : 'Virheellinen sähköposti tai salasana')
      setLoading(false)
      return
    }

    window.location.href = redirect || '/dashboard'
  }

  return (
    <div className="w-full max-w-md">
      {/* Language toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === 'fi' ? 'sv' : 'fi')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {lang === 'fi' ? '🇫🇮 FI' : '🇸🇪 SV'} → {lang === 'fi' ? 'SV' : 'FI'}
        </button>
      </div>

      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-brand-700">
          StudyFlow
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 mt-4">
          {lang === 'sv' ? 'Logga in' : 'Kirjaudu sisään'}
        </h1>
        <p className="text-gray-600 mt-1">
          {lang === 'sv' ? 'Välkommen tillbaka!' : 'Tervetuloa takaisin opiskelemaan!'}
        </p>
      </div>

      <form onSubmit={handleLogin} className="bg-white rounded-xl border p-6 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'sv' ? 'E-post' : 'Sähköposti'}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            placeholder={lang === 'sv' ? 'namn@exempel.fi' : 'nimi@esimerkki.fi'}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'sv' ? 'Lösenord' : 'Salasana'}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? (lang === 'sv' ? 'Loggar in...' : 'Kirjaudutaan...')
            : (lang === 'sv' ? 'Logga in' : 'Kirjaudu')}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        {lang === 'sv' ? 'Har du inget konto? ' : 'Ei vielä tiliä? '}
        <Link href="/signup" className="text-brand-600 font-medium hover:text-brand-700">
          {lang === 'sv' ? 'Registrera dig gratis' : 'Rekisteröidy ilmaiseksi'}
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="text-gray-400">...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
