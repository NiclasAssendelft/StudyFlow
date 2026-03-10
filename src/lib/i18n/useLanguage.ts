'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'
import { translations, type TranslationKey, type Language } from './translations'

export function useLanguage() {
  const [lang, setLang] = useState<Language>('fi')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const { data: profile } = await supabase
          .from('student_profiles')
          .select('language_preference')
          .eq('auth_user_id', user.id)
          .single()

        if (profile?.language_preference) {
          setLang(profile.language_preference as Language)
        }
      } catch (error) {
        console.error('Error fetching language preference:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLanguage()
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || translations.fi[key] || key
  }, [lang])

  return { lang, t, loading }
}
