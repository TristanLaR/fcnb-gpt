'use client'

import { useState, useEffect } from 'react'
import { GlowEffect } from '@/components/GlowEffect'
import EnhancedSearchBox from '../components/EnhancedSearchBox'
import StreamingResult from '../components/StreamingResult'
import LanguageToggle from '../components/LanguageToggle'
import DarkModeToggle from '../components/DarkModeToggle'
import { useLanguage } from '../utils/LanguageContext'

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentResult, setCurrentResult] = useState('')
  const { t } = useLanguage()

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(isDarkMode)
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [])

  const handleSubmit = (query: string) => {
    console.log('Home: Search query submitted:', query)
    setIsStreaming(true)
    setCurrentResult('')

    // Simulate streaming response
    const mockResponses = [
      `The Financial and Consumer Services Commission (FCNB) is New Brunswick's financial and consumer services regulator. FCNB is responsible for the administration and enforcement of provincial legislation that regulates the following sectors: securities, insurance, pensions, credit unions, trust and loan companies, co-operatives, and a wide range of consumer legislation.`,
      `FCNB's mandate is to protect consumers and enhance public confidence in the financial and consumer marketplace through the provision of regulatory and educational services. They work to protect consumers and investors from unfair, improper or fraudulent practices. This includes investigating complaints, enforcing legislation, and educating the public about their rights and responsibilities.`,
      `Some key areas that FCNB oversees include:
1. Securities: Regulating the sale of securities and derivatives in New Brunswick.
2. Insurance: Licensing and regulating insurance companies and professionals.
3. Pensions: Overseeing private pension plans in the province.
4. Consumer Affairs: Addressing issues related to credit reporting, collection agencies, real estate, and more.
5. Financial Education: Providing resources and programs to improve financial literacy among New Brunswick residents.`
    ]

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < randomResponse.length) {
        setCurrentResult(prev => prev + randomResponse[currentIndex])
        currentIndex++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
      }
    }, 20)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A1A2F]' : 'bg-white'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-end items-center mb-8 space-x-4">
          <LanguageToggle className="h-8 px-3" />
          <DarkModeToggle
            darkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            className="h-8 w-8 flex items-center justify-center"
          />
        </div>
        
        <div className="space-y-8 text-center">
          <h1 className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] leading-tight font-bold flex items-center justify-center gap-4 flex-nowrap">
            <span className={`
              relative inline-block
              bg-gradient-to-r from-blue-500 via-blue-400 to-yellow-400
              bg-clip-text text-transparent
              [&::selection]:text-[#0A1A2F] [&::selection]:bg-blue-700/20
            `}
            style={{
              textShadow: isDarkMode
                ? '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3), 0 0 60px rgba(250, 204, 21, 0.3)'
                : 'none'
            }}>
              FCNB
            </span>
            <span className={`${isDarkMode ? 'text-white' : 'text-[#0A1A2F]'} whitespace-nowrap`}>
              {t('title')}
            </span>
          </h1>

          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('subtitle')}
          </p>

          <div className="max-w-2xl mx-auto relative">
            {isDarkMode ? (
              <GlowEffect>
                <EnhancedSearchBox
                  isDarkMode={isDarkMode}
                  onSubmit={handleSubmit}
                />
              </GlowEffect>
            ) : (
              <EnhancedSearchBox
                isDarkMode={isDarkMode}
                onSubmit={handleSubmit}
              />
            )}
            <p className="text-sm text-gray-500 mt-2">{t('poweredBy')}</p>
          </div>

          <StreamingResult isStreaming={isStreaming} result={currentResult} />
        </div>

        <footer className="absolute bottom-4 left-4 right-4 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('footer')}
          </p>
        </footer>
      </div>
    </div>
  )
}
