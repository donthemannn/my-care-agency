import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/lib/services/quoteService';
import { QuoteFormData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData: QuoteFormData = await request.json();
    
    const validation = quoteService.validateQuoteForm(formData);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.errors.join(', ')
      }, { status: 400 });
    }

    const result = await quoteService.generateQuote(formData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred while generating your quote.'
    }, { status: 500 });
  }
}
