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
    console.log('StreamingResult: isStreaming:', isStreaming, 'result:', result)
    if (isStreaming || result) {
      setStreamedText(result)
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

