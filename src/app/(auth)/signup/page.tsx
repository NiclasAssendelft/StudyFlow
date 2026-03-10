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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('Salasanan tulee olla vähintään 6 merkkiä')
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
      // Redirect to onboarding
      setTimeout(() => {
        window.location.href = '/onboarding'
      }, 1000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-xl font-semibold">Tili luotu!</h1>
          <p className="text-gray-600 mt-2">Ohjataan alkukartoitukseen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-brand-700">
            ValintakoeF
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 mt-4">Luo tili</h1>
          <p className="text-gray-600 mt-1">Aloita valmistautuminen Valintakoe F:ään</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white rounded-xl border p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nimi
            </label>
            <input
              id="name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Etunimi"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Sähköposti
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="nimi@esimerkki.fi"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Salasana
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Vähintään 6 merkkiä"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Luodaan tiliä...' : 'Luo tili'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Onko sinulla jo tili?{' '}
          <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
            Kirjaudu sisään
          </Link>
        </p>
      </div>
    </div>
  )
}
