import React, { useEffect, useState } from "react";
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
      <div className='mt-6 divide-y divide-slate-200'>
        {showDocuments && documents.map((doc, index) => (
          <div key={index} className={`mt-2 hover:underline ${styles.fadeIn}`} style={{ animationDelay: `${index * 0.001}s` }}>
            <a href={doc.metadata.url} target='_blank'>{doc.metadata.title}</a>
          </div>),
        )}
      </div>
    </div>
  );
};
