import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { EduFlowProvider } from '@/components/eduflow-provider'
import { OfflineClient } from '@/components/offline-client'

export const metadata: Metadata = {
  title: {
    default: 'EduFlow OS',
    template: '%s | EduFlow OS',
  },
  description: 'Pakistan Ka Pehla 1-Click AI School Operating System',
  generator: 'EduFlow OS',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/eduflow-logo.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/eduflow-logo.svg',
    apple: '/eduflow-logo.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

import { GodModeBar } from '@/components/god-mode-bar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <EduFlowProvider>
          <GodModeBar />
          <OfflineClient />
          {children}
        </EduFlowProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
