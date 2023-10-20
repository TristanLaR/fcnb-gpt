import { Document } from "langchain/document";
import { PineconeStore } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeClient } from "@pinecone-database/pinecone";
import { NextApiRequest, NextApiResponse } from "next";
import { findRowByName } from "@/utils/metadata";

const handler = async (req: NextApiRequest, res: NextApiResponse<Document[]>) => {

  // Query 
  const query = req.body.query;

  
  
  // Vector DB 
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: "us-central1-gcp",
    apiKey: process.env.PINECONE_API_KEY ?? "",
  });
  const index = pinecone.Index("fcnb-gpt-index");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_API_KEY }), { pineconeIndex: index },
    );
  // Return chunks to display as references 
  const results = await vectorStore.similaritySearch(query, 7);

  if (results.length > 0) {
    const promises = results.map((result) =>
      findRowByName(result.metadata.source)
        .then((row) => {
          // console.log("Row: ", row);

          // add row to metadata
          result.metadata = { ...result.metadata, ...row };
        })
        .catch((err) => {
          console.log("Error finding row: ", err);
        })
    );

    Promise.all(promises)
      .then(() => {
        res.status(200).send(results);
      })
      .catch((err) => {
        console.log("Error waiting for all promises to complete: ", err);
        res.status(500).send(results);
      });
  } else {
    res.status(200).send(results);
  }
};

export default handler;