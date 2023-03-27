import Head from 'next/head'
import { useEffect, useState, KeyboardEvent, useRef } from 'react'
import { IconSearch } from "@tabler/icons-react";
import { Document } from "langchain/document";
import { Answer } from '@/components/Answer/Answer';
import Navbar from '@/components/Navbar';


export default function Home() {

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Handle answer 
  const handleAnswer = async () => {

    console.log("Start handle answer");
    if (!query) {
      alert("Please enter a query.");
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

    if (!search_results.ok) {
      setLoading(false);
      console.log("Error fetching search results");
      throw new Error(search_results.statusText);
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
        prompt
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
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

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <>
      <Head>
        <title>FCNB GPT</title>
        <meta name="description" content="AI Search on FCNB" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon_white.ico" />
      </Head>

      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center px-3 pt-4 sm:pt-8">
            <div className="font-bold text-5xl flex items-center">
              <div className="py-8">FCNB 🤝 GPT</div>
            </div>
            <div className="pt-4 pb-6 text-lg">Search FCNB knowledgebase powered by AI!</div>

            <div className="relative w-full mt-4">
              <IconSearch className="absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />

              <input
                ref={inputRef}
                className="h-12 w-full rounded-full border border-zinc-600 pr-12 pl-11 focus:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
                type="text"
                placeholder="What is FCNB?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />

            </div>

            {loading ? (
              <div className="mt-6 w-full">

                <div className="animate-pulse mt-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              </div>
            ) : <div className="mt-6 min-w-full">
              <Answer text={answer} />
            </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}
