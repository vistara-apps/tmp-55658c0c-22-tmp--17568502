import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Base Mini App',
  description: 'Built with Zara',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}