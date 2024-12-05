'use client'

import { useState } from 'react'
import { useLanguage } from '../utils/LanguageContext'
import { VanishingInput } from './VanishingInput'
import { cn } from "@/lib/utils"

interface EnhancedSearchBoxProps {
  isDarkMode: boolean
  onSubmit: (query: string) => void
}

export default function EnhancedSearchBox({ isDarkMode, onSubmit }: EnhancedSearchBoxProps) {
  const [query, setQuery] = useState('')
  const { t } = useLanguage()

  const handleSubmit = (submittedQuery: string) => {
    console.log('EnhancedSearchBox: Form submitted with query:', submittedQuery)
    onSubmit(submittedQuery)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
  }

  const placeholders = ["What is FCNB?"]

  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <path d="M12 8V4H8"/>
          <rect width="16" height="12" x="4" y="8" rx="2"/>
          <path d="M2 14h2"/>
          <path d="M20 14h2"/>
          <path d="M15 13v2"/>
          <path d="M9 13v2"/>
        </svg>
        <div className="h-6 border-l border-gray-300 mx-2"></div>
      </div>
      <VanishingInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={handleSubmit}
        value={query}
        setValue={setQuery}
        isDarkMode={isDarkMode}
        className={cn(
          "relative h-14 rounded-full",
          isDarkMode 
            ? 'bg-[#0A1A2F] text-white' 
            : 'bg-white text-gray-900 border-2 border-gray-300'
        )}
        inputClassName="h-full w-full pl-[4.5rem] pr-12 text-lg"
        placeholderClassName="left-[4.5rem]"
      />
    </div>
  )
}
