'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-mesh">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        {/* Mobile header — glass morphism */}
        <header className="fixed top-0 left-0 right-0 h-14 glass border-b border-white/20 flex items-center justify-between px-4 z-30 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-surface-600 hover:text-surface-900 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-gradient">StudyFlow</span>
          <div className="w-10" />
        </header>

        <main className="md:ml-56 min-h-screen pt-14 md:pt-0">{children}</main>
      </div>
    </LanguageProvider>
  )
}
