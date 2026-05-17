import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financial Planning Co-Pilot',
  description: 'Paraplanning workspace for IFAs and financial planners',
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
