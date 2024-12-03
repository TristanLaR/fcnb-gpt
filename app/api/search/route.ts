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

    // Helper function to sanitize text for safe encoding
    const sanitizeText = (text: string) => {
      return text.replace(/[\u2018\u2019]/g, "'")
                .replace(/[\u201C\u201D]/g, '"')
                .replace(/[\u2013\u2014]/g, '-');
    };

    // Query Pinecone for similar documents
    const queryResponse = await index.query({
      vector: embedding.data[0].embedding,
      topK: 5,
      includeMetadata: true,
    })

    // Log raw matches for debugging with sanitized text
    logger.info('Raw Pinecone matches:', {
      matches: queryResponse.matches.map(match => ({
        id: match.id,
        metadata: match.metadata ? {
          ...match.metadata,
          text: typeof match.metadata.text === 'string' ? sanitizeText(match.metadata.text) : match.metadata.text
        } : null
      }))
    });

    // Extract the relevant context from the similar documents
    const context = queryResponse.matches
      .map(match => {
        if (typeof match.metadata?.text === 'string') {
          const sanitizedText = sanitizeText(match.metadata.text);
          logger.info('Processing metadata text:', {
            id: match.id,
            textLength: sanitizedText.length,
            textSample: sanitizedText.substring(0, 100)
          });
          return sanitizedText;
        }
        return '';
      })
      .join('\n\n')

    logger.info('Final context built:', {
      contextLength: context.length,
      contextSample: context.substring(0, 100)
    });

    // Prepare complete debug info with sanitized text
    const debugInfo = {
      matches: queryResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata ? {
          ...match.metadata,
          text: typeof match.metadata.text === 'string' ? sanitizeText(match.metadata.text) : match.metadata.text
        } : null,
        values: match.values,
        sparseValues: match.sparseValues
      })),
      namespace: queryResponse.namespace,
      usage: queryResponse.usage
    }

    // Create headers with complete debug info
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Debug-Info': JSON.stringify(debugInfo)
    })

    // Log complete debug info server-side
    logger.info('Pinecone Query Response:', debugInfo)

    // Generate response using GPT-4 with context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    const encoder = new TextEncoder()
    
    // Helper function to safely encode text with Unicode characters
    const safeEncode = (text: string) => {
      // Replace problematic characters with their ASCII equivalents
      const sanitized = sanitizeText(text);
      return encoder.encode(sanitized);
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send debug info
          controller.enqueue(safeEncode('Debug Info:\n'));
          controller.enqueue(safeEncode(JSON.stringify(debugInfo, null, 2) + '\n---\n'));

          // Stream the completion
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(safeEncode(content));
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
      headers: headers,
    });
  } catch (error) {
    logger.error('Search API Error', { context: 'search', error: error as Error });
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
