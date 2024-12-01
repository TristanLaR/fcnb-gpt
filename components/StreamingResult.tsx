'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StreamingResultProps {
  isStreaming: boolean
  result: string
}

export default function StreamingResult({ isStreaming, result }: StreamingResultProps) {
  const [streamedText, setStreamedText] = useState('')

  useEffect(() => {
    if (result) {
      // Remove debug info if present
      const parts = result.split('---\n')
      if (parts.length > 1) {
        setStreamedText(parts[1]) // Take everything after the debug separator
      } else {
        setStreamedText(result)
      }
    }
  }, [result])

  return (
    <div className="mt-8">
      <AnimatePresence>
        {streamedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="prose dark:prose-invert max-w-none"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {streamedText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
