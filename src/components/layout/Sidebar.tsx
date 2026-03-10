'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { createSupabaseBrowser } from '@/lib/db/supabase-browser'

const baseNavItems = [
  { href: '/dashboard', label: 'Etusivu', icon: '🏠' },
  { href: '/study/subjects', label: 'Oppiaineet', icon: '📖' },
  { href: '/study/topics', label: 'Aiheet', icon: '📚' },
  { href: '/study/pomodoro', label: 'Pomodoro', icon: '🍅', visibility: 'show_pomodoro' },
  { href: '/study/review', label: 'Kertaus', icon: '🔄' },
  { href: '/study/feynman', label: 'Feynman', icon: '🧠', visibility: 'show_feynman' },
  { href: '/study/exam', label: 'Harjoituskoe', icon: '📝' },
  { href: '/study/plan', label: 'Opiskelusuunnitelma', icon: '📅' },
  { href: '/chat', label: 'Tuutori', icon: '🤖' },
  { href: '/forum', label: 'Foorumi', icon: '💬' },
]

export function Sidebar() {
  const pathname = usePathname()
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
          .eq('user_id', user.id)
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
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t p-3">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50',
            pathname === '/settings' && 'bg-blue-50 text-brand-700'
          )}
        >
          <span className="text-lg">⚙️</span>
          {!collapsed && <span>Asetukset</span>}
        </Link>
      </div>
    </aside>
  )
}
