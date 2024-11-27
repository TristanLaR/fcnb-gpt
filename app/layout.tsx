'use client'

import { Inter } from 'next/font/google'
import { LanguageProvider } from '../utils/LanguageContext'
import { useState, useEffect } from 'react'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FCNB Semantic Search',
  description: 'Search the FCNB knowledgebase using AI!',
  icons: {
    icon: '/favicon_white.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [])

  return (
    <LanguageProvider>
      <html lang="en" className={darkMode ? 'dark' : 'light'}>
        <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">{children}</main>
          </div>
        </body>
      </html>
    </LanguageProvider>
  )
}
