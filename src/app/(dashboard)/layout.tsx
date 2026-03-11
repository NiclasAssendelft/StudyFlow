'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-56 min-h-screen">{children}</main>
      </div>
    </LanguageProvider>
  )
}
