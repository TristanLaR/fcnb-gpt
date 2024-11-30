'use client'

import { LanguageProvider } from '../utils/LanguageContext'
import { ThemeProvider } from '../utils/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  )
}
