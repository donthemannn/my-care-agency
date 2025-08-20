import { NextRequest, NextResponse } from 'next/server';
import { quoteService } from '@/lib/services/quoteService';
import { QuoteFormData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData: QuoteFormData = await request.json();

    console.log('Processing quote request:', { 
      zipCode: formData.zipCode, 
      income: formData.annualIncome,
      householdSize: formData.householdSize 
    });

    // Validate the form data
    const validation = quoteService.validateQuoteForm(formData);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid form data',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Generate the quote
    const quoteResult = await quoteService.generateQuote(formData);

    if (!quoteResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: quoteResult.error
        },
        { status: 400 }
      );
    }

    // Return successful quote
    return NextResponse.json({
      success: true,
      data: quoteResult.data,
      message: quoteResult.message
    });

  } catch (error) {
    console.error('Quote API Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate quote',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
