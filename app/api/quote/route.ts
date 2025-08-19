import { NextRequest, NextResponse } from 'next/server';
import { planService, QuoteRequest } from '@/lib/services/planService';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();
    const { zipCode, state, annualIncome, householdSize, ages } = body;

    // Validate input
    if (!zipCode || !state || !annualIncome || !householdSize || !ages?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Processing quote request:', { zipCode, state, annualIncome, householdSize, ages });

    // Get comprehensive quote with all plans
    const quoteResponse = await planService.getQuote({
      zipCode,
      state,
      annualIncome,
      householdSize,
      ages
    });

    if (!quoteResponse.plans || quoteResponse.plans.length === 0) {
      return NextResponse.json(
        { error: 'No plans found for this location' },
        { status: 404 }
      );
    }

    // Get the best plan (lowest net premium)
    const bestPlan = quoteResponse.plans.reduce((prev, current) => 
      (prev.netPremium < current.netPremium) ? prev : current
    );

    // Save quote to database
    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .insert([{
        zip_code: zipCode,
        state: state.toUpperCase(),
        annual_income: annualIncome,
        household_size: householdSize,
        ages: ages,
        premium: bestPlan.premium,
        subsidy_amount: quoteResponse.subsidyAmount,
        net_premium: bestPlan.netPremium,
        plan_id: bestPlan.id,
        plan_name: bestPlan.name,
        issuer_name: bestPlan.issuer.name,
        metal_level: bestPlan.metalLevel,
        plan_type: bestPlan.planType,
        deductible: bestPlan.deductible?.individual || null,
        out_of_pocket_max: bestPlan.outOfPocketMax?.individual || null,
        profile_id: null // Anonymous for now
      }])
      .select('id')
      .single();

    if (quoteError) {
      console.error('Error saving quote:', quoteError);
      // Continue even if save fails - don't block the user
    }

    // Return comprehensive quote results
    return NextResponse.json({
      success: true,
      quoteId: quoteData?.id,
      ...quoteResponse,
      bestPlan: {
        id: bestPlan.id,
        name: bestPlan.name,
        issuer: bestPlan.issuer.name,
        metalLevel: bestPlan.metalLevel,
        planType: bestPlan.planType,
        premium: bestPlan.premium,
        netPremium: bestPlan.netPremium,
        deductible: bestPlan.deductible?.individual,
        outOfPocketMax: bestPlan.outOfPocketMax?.individual,
        hasExtraSavings: bestPlan.hasExtraSavings
      }
    });

  } catch (error) {
    console.error('Quote API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate quote',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
