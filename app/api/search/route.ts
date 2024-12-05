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

const aiModel = process.env.OPENAI_MODEL!

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { prompt, language } = await req.json()

    // Log the incoming search request
    console.log(JSON.stringify({
      type: 'search_request',
      prompt,
      language,
      timestamp: new Date().toISOString()
    }))

    // Generate embeddings for the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: prompt,
      encoding_format: "float"
    })

    // Helper function to sanitize text for safe encoding
    const sanitizeText = (text: string) => {
      return text
        // Remove BOM and zero-width characters
        .replace(/[\uFEFF\u200B-\u200D\uFFFE\uFFFF]/g, '')
        // Replace smart quotes
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        // Replace em/en dashes
        .replace(/[\u2013\u2014]/g, '-')
        // Replace other problematic Unicode characters with ASCII equivalents
        .replace(/[\u2026]/g, '...')
        .replace(/[\u2022]/g, '*')
        .replace(/[\u2012\u2015]/g, '-')
        // Remove any remaining non-ASCII characters
        .replace(/[^\x00-\x7F]/g, ' ');
    };

    // Query Pinecone for similar documents
    const queryResponse = await index.query({
      vector: embedding.data[0].embedding,
      topK: 10,
      includeMetadata: true,
    })

    // Extract the relevant context from the similar documents
    const context = queryResponse.matches
      .map(match => {
        if (typeof match.metadata?.text === 'string') {
          return sanitizeText(match.metadata.text);
        }
        return '';
      })
      .join('\n\n')

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a helpful assistant that accurately answers queries about the Financial Commission of New Brunswick (FCNB) from its website data. Use the text provided to form your answer, but avoid copying word-for-word from the original text. Try to use your own words when possible. Keep your answer under 5 sentences. Be accurate, helpful, concise, and clear. If you cannot find the answer in the context, say so politely and suggest contacting FCNB directly for more accurate information.${
          language ? `\n\nIMPORTANT: You MUST respond in ${language} regardless of the language of the source text. If you need to translate the information from the source text, do so accurately while maintaining the meaning.` : ''
        }`,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${prompt}`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages,
      stream: true,
    })

    // Create headers with complete debug info
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
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
          // Send debug data first
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ debug: queryResponse })}\n\n`));

          // Stream the completion
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      }
    });

    // Log the search response
    console.log(JSON.stringify({
      type: 'search_response',
      prompt,
      language,
      response: '',
      timestamp: new Date().toISOString()
    }))

    return new Response(stream, {
      headers: headers,
    });
  } catch (error: any) {
    console.error('Search API Error:', error.message, error.stack);
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request',
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}
