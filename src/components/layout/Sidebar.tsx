'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'
import { useLanguage } from '@/lib/i18n/useLanguage'

const baseNavItems = [
  { href: '/dashboard', labelKey: 'home' as const, icon: '🏠' },
  { href: '/study/subjects', labelKey: 'subjects' as const, icon: '📚' },
  { href: '/study/pomodoro', labelKey: 'pomodoro' as const, icon: '🍅', visibility: 'show_pomodoro' },
  { href: '/study/review', labelKey: 'review' as const, icon: '🔄' },
  { href: '/study/feynman', labelKey: 'feynman' as const, icon: '🧠', visibility: 'show_feynman' },
  { href: '/study/exam', labelKey: 'exam' as const, icon: '📝' },
  { href: '/study/plan', labelKey: 'plan' as const, icon: '📅' },
  { href: '/chat', labelKey: 'tutor' as const, icon: '🤖' },
  { href: '/forum', labelKey: 'forum' as const, icon: '💬' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t, lang, setLang } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const [navItems, setNavItems] = useState(baseNavItems)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createSupabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('student_profiles')
          .select('show_pomodoro, show_feynman')
          .eq('auth_user_id', user.id)
          .single()

        if (profile) {
          const filtered = baseNavItems.filter((item) => {
            if (item.visibility === 'show_pomodoro') return profile.show_pomodoro !== false
            if (item.visibility === 'show_feynman') return profile.show_feynman !== false
            return true
          })
          setNavItems(filtered)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r flex flex-col transition-all duration-200 z-40',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        {!collapsed && (
          <Link href="/dashboard" className="text-lg font-bold text-brand-700">
            ValintakoeF
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label={collapsed ? 'Laajenna' : 'Pienennä'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-blue-50 text-brand-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t p-3 space-y-1">
        <button
          onClick={() => setLang(lang === 'fi' ? 'sv' : 'fi')}
          className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full"
          title={lang === 'fi' ? 'Byt till svenska' : 'Vaihda suomeksi'}
        >
          <span className="text-lg">{lang === 'fi' ? '🇫🇮' : '🇸🇪'}</span>
          {!collapsed && (
            <span className="font-medium">
              {lang === 'fi' ? 'FI → SV' : 'SV → FI'}
            </span>
          )}
        </button>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50',
            pathname === '/settings' && 'bg-blue-50 text-brand-700'
          )}
        >
          <span className="text-lg">⚙️</span>
          {!collapsed && <span>{t('settings')}</span>}
        </Link>
      </div>
    </aside>
  )
}
