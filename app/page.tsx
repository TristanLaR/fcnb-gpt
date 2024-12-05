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

  const handleSubmit = async (query: string) => {
    console.log('Home: Search query submitted:', query)
    setIsStreaming(true)
    setCurrentResult('')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: query,
          language: t('language'),
        }),
      })

      if (!response.ok) {
        throw new Error('Search request failed')
      }

      // Log debug info from headers
      const debugInfo = response.headers.get('X-Debug-Info')
      if (debugInfo) {
        const pineconeData = JSON.parse(debugInfo)
        console.group('Pinecone Query Results')
        console.log('Matches:', pineconeData.matches)
        console.log('Namespace:', pineconeData.namespace)
        console.log('Usage:', pineconeData.usage)
        console.groupEnd()
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          setIsStreaming(false)
          break
        }
        const text = new TextDecoder().decode(value)
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.debug) {
                console.log('Pinecone Query Results:', data.debug)
              } else if (data.choices?.[0]?.delta?.content) {
                setCurrentResult(prev => prev + data.choices[0].delta.content)
              }
            } catch (e) {
              // If it's not JSON, treat it as regular text
              setCurrentResult(prev => prev + line.slice(6))
            }
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setCurrentResult('An error occurred while searching. Please try again.')
      setIsStreaming(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A1A2F]' : 'bg-white'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="flex justify-end items-center mb-8 space-x-4">
          <LanguageToggle className="h-8 px-3" />
          <DarkModeToggle
            darkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            className="h-8 w-8 flex items-center justify-center"
          />
        </div>
        
        <div className="space-y-8 text-center">
          <h1 className="text-[2rem] sm:text-[3.5rem] md:text-[4.5rem] leading-tight font-bold flex items-center justify-center gap-2 sm:gap-4 flex-wrap md:flex-nowrap px-2">
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
            <span className={`${isDarkMode ? 'text-white' : 'text-[#0A1A2F]'} md:whitespace-nowrap`}>
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

        <footer className="mt-auto pt-8 pb-4 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('footer')}
          </p>
        </footer>
      </div>
    </div>
  )
}
