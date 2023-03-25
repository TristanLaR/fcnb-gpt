import { Document } from "langchain/document";
import { HNSWLib } from "langchain/vectorstores";
import { PineconeStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeClient } from "@pinecone-database/pinecone";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<Document[]>) => {

  // Query 
  const query = req.body.query;
  const apiKey = req.body.apiKey;
  process.env.OPENAI_API_KEY = apiKey;

  // Vector DB 
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: "us-central1-gcp",
    apiKey: process.env.PINECONE_API_KEY ?? "",
  });
  const index = pinecone.Index("fcnb-gpt");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(), { pineconeIndex: index },
  );
  // Return chunks to display as references 
  const results = await vectorStore.similaritySearch(query, 5);
  res.status(200).send(results);
}

// const handler = async (req: NextApiRequest, res: NextApiResponse<Document[]>) => {

//   console.log("Request received");


//   const query = req.body.query;
//   const apiKey = req.body.apiKey;
//   process.env.OPENAI_API_KEY = apiKey;

//   console.log("Loading vector store...")

//   // Load the vector store from the same directory
//   const vectorStore = await HNSWLib.load(
//     "db",
//     new OpenAIEmbeddings()
//   );

//   // console.log("Searching...")

//   const result = await vectorStore.similaritySearch(query, 5);

//   // console.log(result);
//   console.log("Request completed");


//   res.status(200).send(result); 

// };

export default handler;