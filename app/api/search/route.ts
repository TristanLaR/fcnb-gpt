import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

const index = pinecone.index(process.env.PINECONE_INDEX_NAME!, process.env.PINECONE_HOST!)

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt, language } = await req.json()

    console.log('Generating embeddings for:', prompt)
    // Generate embeddings for the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: prompt,
      encoding_format: "float"
    })

    console.log('Querying Pinecone...')
    // Query Pinecone for similar documents
    const queryResponse = await index.query({
      vector: embedding.data[0].embedding,
      topK: 5,
      includeMetadata: true,
    })

    console.log('Found matches:', queryResponse.matches.length)
    // Extract the relevant context from the similar documents
    const context = queryResponse.matches
      .map(match => match.metadata?.text || '')
      .join('\n\n')

    console.log('Generating GPT-4 response...')
    // Generate response using GPT-4 with context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for the Financial and Consumer Services Commission (FCNB) of New Brunswick. 
          Use the following context to answer the user's question. If you cannot find the answer in the context, 
          say so politely and suggest contacting FCNB directly for more accurate information.
          
          Context:
          ${context}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    })

    // Create a readable stream from the completion
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(new TextEncoder().encode(content))
          }
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
