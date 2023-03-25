This repository containes the code for [FCNB GPT](www.fcnb.xyz), a website to query public FCNB knowledge and receive AI generated answers.

## How to Run

1. Create a .env file based off the .env.example

2. Install dependencies
```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

*NOTE: You will need to provide an OpenAI API key as well as supply a pinecone vector store along with an API key.

## Stack
- React.js
- Next.js
- tailwindcss
- langchain
- pinecone
- embeddings were created with Python + langchain
