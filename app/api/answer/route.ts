import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query, context, lang } = await request.json();

    if (!query || !context) {
      return NextResponse.json({ error: 'Query and context are required' }, { status: 400 });
    }

    const response = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        context,
        lang
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch answer' }, { status: response.status });
    }

    const data = response.body;
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error in answer generation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
