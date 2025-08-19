import { z } from 'zod'

export const QuoteRequestSchema = z.object({
  state: z.string().min(2).max(2),
  zipCode: z.string().min(5).max(10),
  householdSize: z.number().min(1).max(20),
  income: z.number().min(0),
  ages: z.array(z.number().min(0).max(120)),
  coverageType: z.enum(['individual', 'family', 'small_group']),
  metalTier: z.enum(['bronze', 'silver', 'gold', 'platinum', 'catastrophic']).optional()
})

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>

export interface InsurancePlan {
  id: string
  name: string
  carrier: string
  metalTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'catastrophic'
  premium: number
  deductible: number
  outOfPocketMax: number
  copayPrimaryCare: number
  copaySpecialist: number
  coinsurance: number
  networkType: string
  state: string
  hiosId: string
  benefits: string[]
  rating: number
}

export interface QuoteResult {
  plans: InsurancePlan[]
  subsidyAmount: number
  benchmarkPlan: InsurancePlan | null
  eligibleForSubsidy: boolean
  totalHouseholdIncome: number
  federalPovertyLevel: number
  estimatedTaxCredit: number
}

// Federal Poverty Level guidelines (2024)
const FPL_2024 = {
  1: 14580,
  2: 19720,
  3: 24860,
  4: 30000,
  5: 35140,
  6: 40280,
  7: 45420,
  8: 50560
}

function calculateFPL(householdSize: number): number {
  if (householdSize <= 8) {
    return FPL_2024[householdSize as keyof typeof FPL_2024]
  }
  // For households larger than 8, add $5,140 for each additional person
  return FPL_2024[8] + ((householdSize - 8) * 5140)
}

function calculateSubsidy(income: number, householdSize: number, benchmarkPremium: number): number {
  const fpl = calculateFPL(householdSize)
  const incomeAsPercentOfFPL = (income / fpl) * 100

  // Not eligible for subsidies if income is above 400% FPL
  if (incomeAsPercentOfFPL > 400) {
    return 0
  }

  // Not eligible if income is below 100% FPL (should qualify for Medicaid)
  if (incomeAsPercentOfFPL < 100) {
    return 0
  }

  // Calculate expected contribution percentage based on 2024 ACA guidelines
  let expectedContributionPercent = 0

  if (incomeAsPercentOfFPL <= 150) {
    expectedContributionPercent = 0.0 // 0% for very low income (enhanced subsidies)
  } else if (incomeAsPercentOfFPL <= 200) {
    // Sliding scale from 0% to 2.07%
    const ratio = (incomeAsPercentOfFPL - 150) / (200 - 150)
    expectedContributionPercent = 0.0 + (ratio * 2.07)
  } else if (incomeAsPercentOfFPL <= 300) {
    // Sliding scale from 2.07% to 6.67%
    const ratio = (incomeAsPercentOfFPL - 200) / (300 - 200)
    expectedContributionPercent = 2.07 + (ratio * (6.67 - 2.07))
  } else if (incomeAsPercentOfFPL <= 400) {
    // Sliding scale from 6.67% to 8.5%
    const ratio = (incomeAsPercentOfFPL - 300) / (400 - 300)
    expectedContributionPercent = 6.67 + (ratio * (8.5 - 6.67))
  }

  const expectedContribution = (income * expectedContributionPercent) / 100
  const monthlyExpectedContribution = expectedContribution / 12
  const subsidy = Math.max(0, benchmarkPremium - monthlyExpectedContribution)



  return Math.round(subsidy)
}

import { getPlansForState, type InsurancePlan as PlanDataInsurancePlan } from './planDataService'

async function loadPlanData(state: string, zipCode: string): Promise<InsurancePlan[]> {
  try {
    const plans = await getPlansForState(state, zipCode)
    return plans as InsurancePlan[]
  } catch (error) {
    console.error(`Failed to load plan data for ${state} ${zipCode}:`, error)
    throw new Error(`No plans available for ${state} ${zipCode}`)
  }
}

export async function generateQuote(request: QuoteRequest): Promise<QuoteResult> {
  // Validate the request
  const validatedRequest = QuoteRequestSchema.parse(request)

  // Load plans for the specific state and zip code
  const statePlans = await loadPlanData(validatedRequest.state, validatedRequest.zipCode)

  if (statePlans.length === 0) {
    throw new Error(`No plans available for ${validatedRequest.state} ${validatedRequest.zipCode}`)
  }

  // Find the benchmark plan (second lowest cost silver plan)
  const silverPlans = statePlans
    .filter(plan => plan.metalTier === 'silver')
    .sort((a, b) => a.premium - b.premium)

  const benchmarkPlan = silverPlans[1] || silverPlans[0] || null
  const benchmarkPremium = benchmarkPlan?.premium || 0
  
  // Calculate subsidy eligibility
  const fpl = calculateFPL(validatedRequest.householdSize)
  const incomeAsPercentOfFPL = (validatedRequest.income / fpl) * 100
  const eligibleForSubsidy = incomeAsPercentOfFPL >= 100 && incomeAsPercentOfFPL <= 400

  const subsidyAmount = eligibleForSubsidy 
    ? calculateSubsidy(validatedRequest.income, validatedRequest.householdSize, benchmarkPremium)
    : 0

  // Apply subsidy to all plans
  const plansWithSubsidy = statePlans.map(plan => ({
    ...plan,
    premium: Math.max(0, plan.premium - subsidyAmount)
  }))

  // Sort plans by premium (lowest first)
  const sortedPlans = plansWithSubsidy.sort((a, b) => a.premium - b.premium)

  return {
    plans: sortedPlans,
    subsidyAmount,
    benchmarkPlan,
    eligibleForSubsidy,
    totalHouseholdIncome: validatedRequest.income,
    federalPovertyLevel: fpl,
    estimatedTaxCredit: subsidyAmount
  }
}

export function validateQuoteRequest(data: any): QuoteRequest {
  return QuoteRequestSchema.parse(data)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function getStateList(): Array<{ code: string; name: string }> {
  return [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ]
}
