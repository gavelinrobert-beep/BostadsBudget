import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bostadsbudget - Verklig boendekostnad',
  description: 'Räkna ut din verkliga boendekostnad inklusive renovering och energi. Få en komplett bild av alla kostnader för din bostad.',
  keywords: ['bostadsbudget', 'boendekostnad', 'boendekalkyl', 'bolånekalkylator', 'renovering', 'bostadskostnad', 'bolån', 'amortering', 'belåningsgrad'],
  authors: [{ name: 'BostadsBudget' }],
  creator: 'BostadsBudget',
  publisher: 'BostadsBudget',
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://bostadsbudget.vercel.app',
    title: 'Bostadsbudget - Verklig boendekostnad',
    description: 'Räkna ut din verkliga boendekostnad inklusive renovering och energi',
    siteName: 'Bostadsbudget',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bostadsbudget - Verklig boendekostnad',
    description: 'Räkna ut din verkliga boendekostnad inklusive renovering och energi',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
