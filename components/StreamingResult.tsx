'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StreamingResultProps {
  isStreaming: boolean
  result: string
}

export default function StreamingResult({ isStreaming, result }: StreamingResultProps) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    if (!result) {
      setDisplayedText('')
      return
    }

    const parts = result.split('---\n')
    const cleanText = parts.length > 1 ? parts[1] : result
    
    if (cleanText === displayedText) return

    let currentIndex = displayedText.length
    const targetLength = cleanText.length

    const interval = setInterval(() => {
      if (currentIndex >= targetLength) {
        clearInterval(interval)
        return
      }

      setDisplayedText(cleanText.slice(0, currentIndex + 1))
      currentIndex++
    }, 5)

    return () => clearInterval(interval)
  }, [result, displayedText])

  return (
    <div className="mt-8">
      <AnimatePresence>
        {displayedText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="prose dark:prose-invert max-w-none"
          >
            <div className="text-left">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-left">
                {displayedText.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.05,
                      ease: "easeOut"
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
