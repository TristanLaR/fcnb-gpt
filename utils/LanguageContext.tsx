'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'fr'

type Translations = {
  [key: string]: {
    [key in Language]: string
  }
}

const translations: Translations = {
  title: {
    en: 'Semantic Search',
    fr: 'Recherche Sémantique',
  },
  subtitle: {
    en: 'Search the FCNB knowledgebase using AI!',
    fr: 'Recherchez la base de connaissances FCNB en utilisant l\'IA !',
  },
  searchPlaceholder: {
    en: 'Ask me anything!',
    fr: 'Posez-moi n\'importe quelle question !',
  },
  poweredBy: {
    en: 'Powered by GPT-4',
    fr: 'Propulsé par GPT-4',
  },
  footer: {
    en: 'Proof of concept and intended for testing purposes only. All information presented here was sourced from fcnb.ca and is accurate as of',
    fr: 'Preuve de concept et destiné uniquement à des fins de test. Toutes les informations présentées ici proviennent de fcnb.ca et sont exactes à la date du',
  },
  languageToggle: {
    en: 'FR',
    fr: 'EN',
  },
  darkModeToggle: {
    en: 'Toggle dark mode',
    fr: 'Basculer en mode sombre',
  },
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
