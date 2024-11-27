import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const search_results = await fetch("/api/similar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!search_results.ok) {
      return NextResponse.json({ error: 'Failed to fetch search results' }, { status: search_results.status });
    }

    const results = await search_results.json();
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in similar search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
