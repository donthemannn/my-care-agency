import { NextRequest, NextResponse } from 'next/server';
import { cmsApiService } from '../../../../lib/cmsApiService';
import { QuoteRequest } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { state, zipCode, annualIncome, members } = body;

    if (!state || !zipCode || !annualIncome || !members || !Array.isArray(members)) {
      return NextResponse.json(
        { error: 'Missing required fields: state, zipCode, annualIncome, members' },
        { status: 400 }
      );
    }

    if (members.length === 0) {
      return NextResponse.json(
        { error: 'At least one household member is required' },
        { status: 400 }
      );
    }

    const quoteRequest: QuoteRequest = {
      state: state.toUpperCase(),
      zipCode: zipCode.toString(),
      annualIncome: parseInt(annualIncome),
      members: members.map((member: any) => ({
        age: parseInt(member.age) || 0,
        tobaccoUse: Boolean(member.tobaccoUse),
        isPregnant: Boolean(member.isPregnant),
        relationship: member.relationship || 'other'
      }))
    };

    console.log('Processing comprehensive quote request:', {
      state: quoteRequest.state,
      zipCode: quoteRequest.zipCode,
      income: quoteRequest.annualIncome,
      memberCount: quoteRequest.members.length,
      memberAges: quoteRequest.members.map(m => m.age)
    });

    const quote = await cmsApiService.getComprehensiveQuote(quoteRequest);

    console.log('Quote response:', {
      planCount: quote.plans.length,
      subsidyAmount: quote.subsidy.aptcAmount,
      isEligible: quote.subsidy.isEligible,
      location: quote.location
    });

    return NextResponse.json(quote);

  } catch (error) {
    console.error('Comprehensive quote API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('County FIPS code not found')) {
      return NextResponse.json(
        { error: `Zip code is not supported. Please verify the zip code is valid and in a supported state.` },
        { status: 400 }
      );
    }

    if (errorMessage.includes('CMS API Error')) {
      return NextResponse.json(
        { error: 'Unable to retrieve insurance plans at this time. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get comprehensive quote. Please try again.' },
      { status: 500 }
    );
  }
}
