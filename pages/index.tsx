import Head from 'next/head'
import '../i18n/i18n';
import { useEffect, useState, KeyboardEvent, useRef } from 'react'
import { IconSearch, IconArrowRight } from "@tabler/icons-react";
import { Document } from "langchain/document";
import { Answer } from '@/components/Answer/Answer';
import { useTranslation, Trans } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const lngs = {
  en: { nativeName: 'English' },
  fr: { nativeName: 'French' }
};


export default function Home() {

  const { t, i18n } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("useEffect");
    i18n.changeLanguage(localStorage.getItem('LANG') || 'en');
  }, [i18n]);

  // Handle answer 
  const handleAnswer = async () => {

    console.log("Start handle answer");
    if (!query) {
      toast.warn(t('query'));
      return;
    }

    // console.log("At handle answer");

    setAnswer("");
    setLoading(true);

    console.log("Fetching documents...");
    console.log("Query: " + query);

    // Similarity search for relevant chunks 
    const search_results = await fetch("/api/similar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    console.log("Search results fetched.");
    console.log(search_results);
    

    if (!search_results.ok) {
      setLoading(false);
      toastError();
      console.log("Error fetching search results", search_results.statusText);
    }

    console.log("Documents fetched.");
    const result: Document[] = await search_results.json();
    console.log(result);


    // Prompt for LLM summarization
    const prompt = `Use the following passages to provide an answer to the query: "${query}"
    
    ${result?.map((d: Document) => d.pageContent).join("\n\n")}"`

    console.log("Fetching answer...");

    const response = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        lang: i18n.language
      }),
    });

    if (!response.ok) {
      toastError();
      console.log("Error fetching answer: ", response.statusText);
    }

    console.log("Answer fetched.");

    console.log(response);

    const data = response.body;

    if (!data) {
      console.log("No data");
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAnswer((prev) => prev + chunkValue);
    }

  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAnswer();
    }
  };

  const handleLanguageChange = () => {
    const nextLng = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(nextLng);
    localStorage.setItem('LANG', nextLng);
  };

  const toastError = () => toast.error(t('error'));

  const url = i18n.language === 'en' ? 'https://www.fcnb.ca/en' : 'https://www.fcnb.ca/fr';

  return (
    <>
      <Head>
        <title>FCNB Semantic Search</title>
        <meta name="description" content="Search the FCNB knowledgebase using AI!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon_white.ico" />
      </Head>

      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-auto">
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <div className='flex flex-row-reverse pr-4 pt-2'>
            <button
              className='border border-zinc-600 rounded px-3 py-1 text-zinc-600 hover:border-zinc-800 hover:text-zinc-800 hover:shadow hover:shadow-slate-300'
              onClick={handleLanguageChange} >
              {i18n.resolvedLanguage === 'en' ? 'FR' : 'EN'}
            </button>
          </div>
          <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center px-3 pt-4 sm:pt-8">
            <div className="font-bold text-6xl md:flex text-center py-8">
              <div className="text-transparent bg-gradient-to-br from-blue-600 to-yellow-300 bg-clip-text">FCNB</div>
              <div className='md:whitespace-nowrap'>&nbsp;{t('title')}</div>
            </div>
            <div className="pt-4 pb-6 text-lg text-center">{t('slogan')}</div>

            <div className="relative w-full mt-4">
              <IconSearch className="absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />

              <input
                ref={inputRef}
                className="h-12 w-full rounded-full border border-zinc-600 pr-12 pl-11 focus:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
                type="text"
                placeholder={t('hint')!}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {loading ? (
                <div className="flex h-8 w-8 absolute right-1 -bottom-2 sm:bottom-0">
                  <span className="animate-ping absolute h-8 w-8 -top-4 -left-4 rounded-full bg-gray-200 opacity-75"></span>
                  <span className="relative rounded-full h-8 w-8 -top-4 -left-4 bg-gray-100"></span>
                </div>

              ) : (
                <button>
                  <IconArrowRight
                    onClick={handleAnswer}
                    className="absolute top-3 w-10 right-1 h-6 rounded-full opacity-50 sm:right-3 sm:top-4 sm:h-8"
                  />
                </button>
              )}
            </div>
            <div className='font-light italic text-sm text-slate-500'>{t('poweredBy')}</div>

            {loading ? (
              <div className="mt-8 w-full">

                <div className="animate-pulse mt-2">
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded mt-2"></div>
                  <div className="h-4 bg-gray-100 rounded mt-2"></div>
                  <div className="h-4 bg-gray-100 rounded mt-2"></div>
                  <div className="h-4 bg-gray-100 rounded mt-2"></div>
                </div>
              </div>
            ) : <div className="mt-8 min-w-full">
              <Answer text={answer} />
            </div>
            }
          </div>
        </div>
        <div className="flex-col text-center font-extralight py-2 px-8 text-xs">
          <Trans i18nKey="disclaimer">
            *This website is a proof of concept and intended for testing purposes only, any information presented here is sourced from <a className='font-normal hover:underline' href={url} target='_blank'>fcnb.ca</a> and should not be considered final or official.
          </Trans>
        </div>
      </div>
    </>
  )
}
