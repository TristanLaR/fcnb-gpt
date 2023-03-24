import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader, TextLoader, PDFLoader } from "langchain/document_loaders";
import { get_encoding, encoding_for_model } from "@dqbd/tiktoken";
import * as fs from 'fs';

const fix_urls = (docs: any) => {
    // Change metadata to url
    // create a list of scraped urls

    const urls = fs.readFileSync('scripts/scraped_urls.txt', 'utf-8').split('\n');

    // console.log(docs[0].metadata['source']);
    for (const doc of docs) {
        // console.log("***************");

        // console.log(doc.metadata['source']);

        const source = doc.metadata['source'].split('/').pop().split('.')[0];
        for (const url of urls) {
            if (url.includes(source)) {
                doc.metadata['source'] = url;
                break;
            }
        }
    }
};

const run = async () => {
    // Create docs with a loader
    const loader = new DirectoryLoader(
        "docs",
        {
            ".txt": (path) => new TextLoader(path),
            ".pdf": (path) => new PDFLoader(path),
        }
    );

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 20,
    });

    console.log("Loading docs...");
    const docs_load = await loader.load();

    console.log("Splitting docs...");
    const docs = await splitter.splitDocuments(
        docs_load,
    );

    // console.log({docs});
    // print length of docs
    // console.log(docs[100].metadata['source']);
    fix_urls(docs);
    // console.log(docs[100].metadata['source']);
    // console.log(docs[100]);

    // STATISTICS

    const enc = get_encoding("cl100k_base");

    let total_tokens = 0;
    let max_tokens = 0;

    for (const doc of docs) {
        let tokens = enc.encode(doc.pageContent);
        total_tokens += tokens.length;
        if (tokens.length > max_tokens) {
            max_tokens = tokens.length;
        }
    }

    console.log("total tokens:", total_tokens);
    console.log("max tokens:", max_tokens);
    console.log("doc length:", docs.length);


    // Load the docs into the vector store
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    // Save the vector store to a directory
    const directory = "db";
    await vectorStore.save(directory);
};

(async () => {
    await run();
})();