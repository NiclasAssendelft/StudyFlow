import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Valintakoe F — Valmistaudu pääsykokeeseen',
  description:
    'Henkilökohtainen, tekoälyavusteinen oppimisalusta Valintakoe F:ään. Pomodoro, Feynman, spaced repetition ja 24/7 tekoälytuutorit.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
