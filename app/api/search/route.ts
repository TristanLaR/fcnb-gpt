import { NextResponse } from 'next/server'
import { mockStream } from '../../utils/mockStream'

export const runtime = 'edge'

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'development') {
    return mockStream()
  }

  const { prompt, language } = await req.json()

  // TODO: Implement actual search functionality
  const mockResponse = `This is a mock response for the query: "${prompt}" in ${language} language.`

  return NextResponse.json({ result: mockResponse })
}

