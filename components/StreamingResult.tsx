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
    if (isStreaming) {
      setStreamedText('') // Reset streamed text when a new query is submitted
      const words = result.split(' ')
      let currentIndex = 0

      const interval = setInterval(() => {
        if (currentIndex < words.length) {
          setStreamedText(prev => `${prev}${currentIndex > 0 ? ' ' : ''}${words[currentIndex]}`)
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isStreaming, result])

  return (
    <div className="mt-8">
      <AnimatePresence>
        {streamedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-left">{streamedText}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

