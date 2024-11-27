'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '../utils/LanguageContext'

interface SearchResultsProps {
  completion: string | undefined
}

export default function SearchResults({ completion }: SearchResultsProps) {
  const { t } = useLanguage()

  if (!completion) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('answer')}</h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{completion}</p>
    </motion.div>
  )
}

