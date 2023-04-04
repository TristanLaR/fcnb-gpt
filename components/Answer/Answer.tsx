import React, { useEffect, useState } from "react";
import Image from 'next/image'
import { Document } from "langchain/document";
import styles from "./answer.module.css";

interface AnswerProps {
  text: string;
  showDocuments: boolean;
  documents: Document[];
}

export const Answer: React.FC<AnswerProps> = ({ text, showDocuments, documents }) => {
  const [words, setWords] = useState<string[]>([]);

  const uniqueDocs = new Set();

  useEffect(() => {
    setWords(text.split(" "));
  }, [text]);

  return (
    <div>
      {words.map((word, index) => (
        <span
          key={index}
          className={styles.fadeIn}
          style={{ animationDelay: `${index * 0.001}s` }}
        >
          {word}{" "}
        </span>
      ))}
      {showDocuments && (
        <div>
          <div className={`font-bold text-xl pt-6 ${styles.fadeIn}`}>
            Read More
          </div>
          <div className='mt-6 pb-6 divide-y divide-slate-200'>
            {documents.map((doc, index) => {
              if (uniqueDocs.has(doc.metadata.title)) {
                return null; // Skip rendering this item
              }
              uniqueDocs.add(doc.metadata.title);

              const type = doc.metadata.source.split("/")[0];
              const image = type === "pdf" ? "/favicon_pdf.png" : "/favicon_black.ico";
              return (
                <a href={doc.metadata.url} target='_blank' key={index}>
                  <div
                    className={`py-1 hover:underline flex flex-row items-center space-x-2 ${styles.fadeIn}`}
                    style={{ animationDelay: `${index * 0.3}s` }}>
                    <Image src={image} width={16} height={16} alt={type} className="w-4 h-4 aspect-square" />
                    <div>
                      {doc.metadata.title}
                    </div>
                  </div>
                </a>)
            },
            )}
          </div>
        </div>)}
    </div>
  );
};
