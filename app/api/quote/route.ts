import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { state, zipCode, ages, income, householdSize, coverageType } = body

    // Input validation
    if (!state || !zipCode || !ages || !income || !householdSize) {
      return NextResponse.json(
        { error: 'Missing required fields: state, zipCode, ages, income, householdSize' },
        { status: 400 }
      )
    }

    // Security validation - only allow Alabama
    if (state !== 'AL') {
      return NextResponse.json(
        { error: 'Currently only Alabama (AL) is supported' },
        { status: 400 }
      )
    }

    // Validate zip code format (5 digits)
    if (!/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { error: 'Invalid zip code format. Please enter a 5-digit zip code.' },
        { status: 400 }
      )
    }

    // Validate income range
    if (income < 0 || income > 1000000) {
      return NextResponse.json(
        { error: 'Income must be between $0 and $1,000,000' },
        { status: 400 }
      )
    }

    // Validate household size
    if (householdSize < 1 || householdSize > 20) {
      return NextResponse.json(
        { error: 'Household size must be between 1 and 20' },
        { status: 400 }
      )
    }

    // Validate ages array
    if (!Array.isArray(ages) || ages.length === 0 || ages.some(age => age < 0 || age > 120)) {
      return NextResponse.json(
        { error: 'Invalid ages provided. Ages must be between 0 and 120.' },
        { status: 400 }
      )
    }

    console.log(`Getting mock data for ${zipCode}, ${state}...`)

    // Mock Alabama insurance plans for testing
    const mockPlans = [
      {
        id: 'AL-BCBS-SILVER-001',
        name: 'Blue Cross Blue Shield Silver Plan',
        carrier: 'Blue Cross and Blue Shield of Alabama',
        metalTier: 'silver',
        premium: 350,
        deductible: 2500,
        outOfPocketMax: 8000,
        planType: 'HMO',
        networkTier: 'Standard'
      },
      {
        id: 'AL-BCBS-BRONZE-001',
        name: 'Blue Cross Blue Shield Bronze Plan',
        carrier: 'Blue Cross and Blue Shield of Alabama',
        metalTier: 'bronze',
        premium: 280,
        deductible: 5000,
        outOfPocketMax: 8500,
        planType: 'PPO',
        networkTier: 'Standard'
      },
      {
        id: 'AL-BCBS-GOLD-001',
        name: 'Blue Cross Blue Shield Gold Plan',
        carrier: 'Blue Cross and Blue Shield of Alabama',
        metalTier: 'gold',
        premium: 450,
        deductible: 1500,
        outOfPocketMax: 7000,
        planType: 'HMO',
        networkTier: 'Premium'
      }
    ]

    // Calculate mock subsidy based on income
    const subsidyAmount = income < 50000 ? Math.max(0, 400 - (income / 1000)) : 0

    const quoteResult = {
      plans: mockPlans,
      subsidyAmount: Math.round(subsidyAmount),
      eligibleForSubsidy: subsidyAmount > 0,
      benchmarkPlan: 'Second Lowest Cost Silver Plan',
      location: {
        state,
        zipCode
      },
      household: {
        income,
        size: householdSize,
        ages
      },
      dataSource: 'Mock Data for Alabama Testing',
      timestamp: new Date().toISOString()
    }

    console.log(`Successfully retrieved ${mockPlans.length} plans with $${Math.round(subsidyAmount)} subsidy`)
    return NextResponse.json(quoteResult)
    
  } catch (error) {
    console.error('Live CMS Quote API Error:', error)
    
    return NextResponse.json(
      { 
        error: `Failed to get live insurance data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        dataSource: 'CMS Healthcare.gov Marketplace API (Live Data)'
      },
      { status: 500 }
    )
  }
}
