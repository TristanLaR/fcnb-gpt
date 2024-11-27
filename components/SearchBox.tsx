'use client'

import { useState } from 'react'
import { useCompletion } from 'ai/react'
import SearchResults from './SearchResults'
import { useLanguage } from '../utils/LanguageContext'

export default function SearchBox() {
  const [query, setQuery] = useState('')
  const { language, t } = useLanguage()
  const { complete, completion, isLoading } = useCompletion({
    api: '/api/search',
    body: { language },
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await complete(query)
    setQuery('')
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative mb-8 flex items-center bg-gray-100 rounded-full shadow-sm">
        <div className="flex items-center pl-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5 text-gray-500"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          <div className="h-6 border-l border-gray-300 mx-2"></div>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="flex-grow bg-transparent py-2 pr-4 text-gray-800 dark:text-gray-200"
        />
        <button
          type="submit"
          className="p-2 bg-transparent text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          )}
          <span className="sr-only">{t('searchButton')}</span>
        </button>
      </form>
      <SearchResults completion={completion} />
    </div>
  )
}

