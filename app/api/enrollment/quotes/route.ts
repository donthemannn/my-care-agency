import { NextRequest, NextResponse } from 'next/server'

interface EnrollmentData {
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    ssn: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    hasMedicaid: boolean
    hasMedicare: boolean
  }
  currentCoverage: {
    hasMarketplacePlan: boolean
  }
  healthQuestions: {
    usesTobacco: boolean
    isCitizen: boolean
    isTribalMember: boolean
  }
  employment: {
    status: 'employed' | 'unemployed' | 'social_security' | ''
  }
  household: {
    hasDependents: boolean
    householdSize: number
    annualIncome: number
  }
  taxAndReferral: {
    willFileTaxes: boolean
    referralSource: string
  }
  agreement: {
    agreedToTerms: boolean
  }
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

async function getHealthcareGovSubsidy(data: EnrollmentData): Promise<number> {
  try {
    const age = calculateAge(data.personalInfo.dateOfBirth)
    
    const requestBody = {
      household: {
        income: data.household.annualIncome,
        people: Array.from({ length: data.household.householdSize }, (_, i) => ({
          age: i === 0 ? age : 25, // Primary applicant age, others default to 25
          aptc_eligible: true,
          does_not_cohabitate: false,
          is_parent: i === 0,
          is_pregnant: false,
          relationship: i === 0 ? 'self' : 'child',
          uses_tobacco: i === 0 ? data.healthQuestions.usesTobacco : false
        }))
      },
      market: 'Individual',
      place: {
        countyfips: '48201', // Default to Harris County, TX
        state: data.personalInfo.state,
        zipcode: data.personalInfo.zipCode
      },
      year: 2025
    }

    const response = await fetch(process.env.HEALTHCARE_GOV_API_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.HEALTHCARE_GOV_API_KEY!
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error('Healthcare.gov API error:', response.status, await response.text())
      return 0
    }

    const result = await response.json()
    
    // Extract APTC (Advanced Premium Tax Credit) from response
    const aptc = result.households?.[0]?.aptc_amount || 0
    return Math.round(aptc)
    
  } catch (error) {
    console.error('Error calculating subsidy:', error)
    return 0
  }
}

function generatePlanQuotes(data: EnrollmentData, subsidy: number) {
  const age = calculateAge(data.personalInfo.dateOfBirth)
  const state = data.personalInfo.state
  const zipCode = data.personalInfo.zipCode
  
  // Base premium calculation based on age and location
  const basePremium = Math.round(200 + (age * 8) + (data.healthQuestions.usesTobacco ? 50 : 0))
  
  const plans = [
    {
      id: 'bronze-1',
      name: `${state} Bronze Essential`,
      carrier: 'Blue Cross Blue Shield',
      metalLevel: 'Bronze',
      monthlyPremium: Math.max(50, basePremium - subsidy),
      originalPremium: basePremium,
      subsidy: Math.min(subsidy, basePremium - 50),
      deductible: 7000,
      outOfPocketMax: 9200,
      copayPrimaryCare: 40,
      copaySpecialist: 80,
      network: 'PPO',
      benefits: [
        'Preventive care covered 100%',
        'Prescription drug coverage',
        'Emergency room coverage',
        'Mental health services'
      ]
    },
    {
      id: 'silver-1',
      name: `${state} Silver Plus`,
      carrier: 'Aetna',
      metalLevel: 'Silver',
      monthlyPremium: Math.max(75, Math.round(basePremium * 1.3) - subsidy),
      originalPremium: Math.round(basePremium * 1.3),
      subsidy: Math.min(subsidy, Math.round(basePremium * 1.3) - 75),
      deductible: 4500,
      outOfPocketMax: 8200,
      copayPrimaryCare: 25,
      copaySpecialist: 50,
      network: 'HMO',
      benefits: [
        'Preventive care covered 100%',
        'Lower deductible than Bronze',
        'Prescription drug coverage',
        'Specialist visits covered',
        'Mental health services'
      ]
    },
    {
      id: 'gold-1',
      name: `${state} Gold Premium`,
      carrier: 'United Healthcare',
      metalLevel: 'Gold',
      monthlyPremium: Math.max(100, Math.round(basePremium * 1.6) - subsidy),
      originalPremium: Math.round(basePremium * 1.6),
      subsidy: Math.min(subsidy, Math.round(basePremium * 1.6) - 100),
      deductible: 2000,
      outOfPocketMax: 7000,
      copayPrimaryCare: 15,
      copaySpecialist: 30,
      network: 'PPO',
      benefits: [
        'Preventive care covered 100%',
        'Low deductible',
        'Comprehensive prescription coverage',
        'Low copays for all services',
        'Mental health services',
        'Vision and dental discounts'
      ]
    }
  ]

  // Sort by monthly premium (lowest first)
  return plans.sort((a, b) => a.monthlyPremium - b.monthlyPremium)
}

export async function POST(request: NextRequest) {
  try {
    const data: EnrollmentData = await request.json()
    
    // Validate required fields
    if (!data.personalInfo.dateOfBirth || !data.personalInfo.zipCode || !data.household.annualIncome) {
      return NextResponse.json(
        { error: 'Missing required information for quote calculation' },
        { status: 400 }
      )
    }

    // Calculate subsidy using Healthcare.gov API
    const subsidy = await getHealthcareGovSubsidy(data)
    
    // Generate plan quotes
    const plans = generatePlanQuotes(data, subsidy)
    
    // Add metadata
    const response = {
      success: true,
      plans,
      metadata: {
        applicantAge: calculateAge(data.personalInfo.dateOfBirth),
        householdSize: data.household.householdSize,
        annualIncome: data.household.annualIncome,
        estimatedSubsidy: subsidy,
        location: `${data.personalInfo.city}, ${data.personalInfo.state} ${data.personalInfo.zipCode}`,
        generatedAt: new Date().toISOString()
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Error generating quotes:', error)
    return NextResponse.json(
      { error: 'Failed to generate quotes. Please try again.' },
      { status: 500 }
    )
  }
}
