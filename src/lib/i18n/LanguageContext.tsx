'use client'

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'
import { translations, type TranslationKey, type Language } from './translations'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => Promise<void>
  t: (key: TranslationKey) => string
  loading: boolean
}

export const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('fi')
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
          setLangState(profile.language_preference as Language)
        }
      } catch (error) {
        console.error('Error fetching language preference:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLanguage()
  }, [])

  const switchLang = useCallback(async (newLang: Language) => {
    setLangState(newLang)
    try {
      const supabase = createSupabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('student_profiles')
          .update({ language_preference: newLang })
          .eq('auth_user_id', user.id)
      }
    } catch (error) {
      console.error('Error updating language:', error)
    }
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || translations.fi[key] || key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang: switchLang, t, loading }}>
      {children}
    </LanguageContext.Provider>
  )
}
