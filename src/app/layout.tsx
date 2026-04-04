import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InternTrack",
  description: "Suis tes candidatures facilement",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('dark-mode') === 'true') {
              document.documentElement.classList.add('dark')
            }
          } catch {}
        `}} />
      </head>
      <body className={`${geist.className} bg-white dark:bg-gray-950 transition-colors`}>
        {children}
      </body>
    </html>
  )
}