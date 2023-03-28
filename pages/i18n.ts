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
    debug: true,
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
          disclaimer: "*This website is a proof of concept and intended for testing purposes only, any information presented here is sourced from <1 className='font-normal hover:underline' href='https://www.fcnb.ca' target='_blank'>fcnb.ca</1> and should not be considered final or official."
        }
      },
      fr: {
        translation: {
          title: 'Recherche Sémantique',  
          slogan: 'Recherchez la base de connaissances de FCNB en utilisant l\'IA !',
          hint: 'Qu\'est-ce que la FCNB ?',
          poweredBy: 'Propulsé par GPT-3.5',
          disclaimer: "*Ce site Web est une preuve de concept et est destiné uniquement à des fins de test. Toute information présentée ici est sourcée de <1 className='font-normal hover:underline' href='https://www.fcnb.ca' target='_blank'>fcnb.ca</1> et ne doit pas être considérée comme finale ou officielle."
        }
      }
    }
  });

export default i18n;