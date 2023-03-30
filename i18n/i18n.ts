import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
//   .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          title: 'Semantic Search',  
          slogan: 'Search the FCNB knowledgebase using AI!',
          hint: 'What is FCNB?',
          poweredBy: 'Powered by GPT-3.5',
          disclaimer: "*This website is a proof of concept and intended for testing purposes only. All information presented here was sourced from <1 className='font-normal hover:underline' href='https://www.fcnb.ca/en' target='_blank'>fcnb.ca</1> and is accurate as of March 18th, 2023.",
          error: "An error occurred while searching.",
          query: "Please enter a query"
        }
      },
      fr: {
        translation: {
          title: 'Recherche Sémantique',  
          slogan: 'Recherchez la base de connaissances de FCNB en utilisant l\'IA !',
          hint: 'Qu\'est-ce que la FCNB ?',
          poweredBy: 'Propulsé par GPT-3.5',
          disclaimer: "*Ce site Web est une preuve de concept et destiné à des fins de test uniquement. Toutes les informations présentées ici ont été sourcées de <1 className='font-normal hover:underline' href='https://www.fcnb.ca/fr' target='_blank'>fcnb.ca</1> et sont exactes jusqu'au 18 mars 2023.",
          error: "Une erreur s'est produite lors de la recherche.",
          query: "Veuillez entrer une requête."
        }
      }
    }
  });

export default i18n;