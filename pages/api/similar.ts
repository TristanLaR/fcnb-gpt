import { Document } from "langchain/document";
import { PineconeStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeClient } from "@pinecone-database/pinecone";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<Document[]>) => {

  // Query 
  const query = req.body.query;

  // Vector DB 
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: "us-central1-gcp",
    apiKey: process.env.PINECONE_API_KEY ?? "",
  });
  const index = pinecone.Index("fcnb-gpt");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({openAIApiKey: process.env.OPEN_AI_API_KEY}), { pineconeIndex: index },
  );
  // Return chunks to display as references 
  const results = await vectorStore.similaritySearch(query, 7);
  res.status(200).send(results);
}

export default handler;