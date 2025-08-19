import { NextRequest, NextResponse } from 'next/server';
import { weaviateService } from '@/lib/weaviate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const state = searchParams.get('state') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const results = await weaviateService.searchGuides(query, state, category, limit);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(results) ? results : (results?.data?.Get?.InsuranceGuide || []),
      query,
      state,
      category,
      limit
    });
  } catch (error) {
    console.error('Guide search error:', error);
    return NextResponse.json(
      { error: 'Failed to search guides' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, state, category, source, tags } = body;

    if (!title || !content || !state || !category) {
      return NextResponse.json(
        { error: 'Title, content, state, and category are required' },
        { status: 400 }
      );
    }

    const result = await weaviateService.addGuide({
      title,
      content,
      state,
      category,
      lastUpdated: new Date().toISOString(),
      source: source || 'Manual Entry',
      tags
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Guide added successfully'
    });
  } catch (error) {
    console.error('Add guide error:', error);
    return NextResponse.json(
      { error: 'Failed to add guide' },
      { status: 500 }
    );
  }
}
