import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from './components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Bostadsbudget - Beräkna verklig boendekostnad',
  description: 'Gratis kalkylator för att räkna ut total boendekostnad inklusive lån, drift, renovering och energi. Med svenska amorteringskrav.',
  keywords: ['bostadskalkyl', 'bolånekalkyl', 'boendekostnad', 'amortering', 'bostadsbudget', 'sverige'],
  authors: [{ name: 'Bostadsbudget' }],
  openGraph: {
    title: 'Bostadsbudget - Beräkna verklig boendekostnad',
    description: 'Se den totala kostnaden för din bostad innan du köper',
    type: 'website',
    locale: 'sv_SE',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bostadsbudget',
    description: 'Beräkna verklig boendekostnad',
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
    <html lang="sv" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-inter">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
