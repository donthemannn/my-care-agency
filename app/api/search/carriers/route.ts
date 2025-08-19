import { NextRequest, NextResponse } from 'next/server';
import { weaviateService } from '@/lib/weaviate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const state = searchParams.get('state') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const results = await weaviateService.searchCarriers(query, state, limit);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(results) ? results : (results?.data?.Get?.InsuranceCarrier || []),
      query,
      state,
      limit
    });
  } catch (error) {
    console.error('Carrier search error:', error);
    return NextResponse.json(
      { error: 'Failed to search carriers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, state, naicCode, description, website, phone, planTypes, rating } = body;

    if (!name || !state) {
      return NextResponse.json(
        { error: 'Name and state are required' },
        { status: 400 }
      );
    }

    const result = await weaviateService.addCarrier({
      name,
      state,
      naicCode,
      description,
      website,
      phone,
      planTypes,
      rating
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Carrier added successfully'
    });
  } catch (error) {
    console.error('Add carrier error:', error);
    return NextResponse.json(
      { error: 'Failed to add carrier' },
      { status: 500 }
    );
  }
}
