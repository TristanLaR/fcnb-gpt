import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'
import { logger } from '@/utils/logger';

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

    // Generate embeddings for the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: prompt,
      encoding_format: "float"
    })

    // Query Pinecone for similar documents
    const queryResponse = await index.query({
      vector: embedding.data[0].embedding,
      topK: 5,
      includeMetadata: true,
    })

    // Extract the relevant context from the similar documents
    const context = queryResponse.matches
      .map(match => match.metadata?.text || '')
      .join('\n\n')

    // Generate response using GPT-4 with context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that accurately answers queries about the Financial Commission of New Brunswick (FCNB) from its website data. Use the text provided to form your answer, but avoid copying word-for-word from the original text. Try to use your own words when possible. Keep your answer under 5 sentences. Be accurate, helpful, concise, and clear. If you cannot find the answer in the context, say so politely and suggest contacting FCNB directly for more accurate information.',
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${prompt}${language ? ` (Please respond in ${language})` : ''}`
        }
      ],
      stream: true,
    })

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send debug info
          const debugInfo = `DEBUG_INFO: ${JSON.stringify({ 
            matches: queryResponse.matches.map(match => ({
              score: match.score,
              metadata: match.metadata
            }))
          })}\n---\n`;
          controller.enqueue(new TextEncoder().encode(debugInfo));

          // Stream the completion
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    logger.error('Search API Error', { context: 'search', error: error as Error });
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
