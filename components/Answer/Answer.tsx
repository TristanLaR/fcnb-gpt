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
      <div className={`font-bold text-xl pt-6 ${styles.fadeIn}`}>
        Read More
      </div>
      <div className='mt-6 pb-6 divide-y divide-slate-200'>
        {showDocuments && documents.map((doc, index) => {
          const type = doc.metadata.source.split("/")[0];
          const image = type === "pdf" ? "/favicon_pdf.png" : "/favicon_black.ico";
          return (<div
            key={index}
            className={`mt-2 hover:underline flex flex-row space-x-2 ${styles.fadeIn}`}
            style={{ animationDelay: `${index * 0.3}s` }}>
              <Image src={image} width={22} height={8} alt={type} />
            <a href={doc.metadata.url} target='_blank'>{doc.metadata.title}</a>
          </div>)},
        )}
      </div>
    </div>
  );
};
