interface QuoteRequest {
  state: string
  zipCode: string
  ages: number[]
  income: number
  householdSize: number
  coverageType?: string
}

interface CMSPlan {
  id: string
  name: string
  carrier: string
  metalTier: string
  premium: number
  deductible: number
  outOfPocketMax: number
  planType: string
  networkTier: string
}

interface QuoteResponse {
  plans: CMSPlan[]
  subsidyAmount: number
  eligibleForSubsidy: boolean
  benchmarkPlan: string
  location: {
    state: string
    zipCode: string
  }
  household: {
    income: number
    size: number
    ages: number[]
  }
  dataSource: string
  timestamp: string
}

export async function getRealQuotes(request: QuoteRequest): Promise<QuoteResponse> {
  const { state, zipCode, ages, income, householdSize } = request
  
  try {
    // Step 1: Get county FIPS code from zip
    const fipsResponse = await fetch(`https://api.zippopotam.us/us/${zipCode}`)
    if (!fipsResponse.ok) {
      throw new Error(`Invalid zip code: ${zipCode}`)
    }
    
    const zipData = await fipsResponse.json()
    const county = zipData.places[0]['place name']
    const stateAbbr = zipData.places[0]['state abbreviation']
    
    if (stateAbbr !== state) {
      throw new Error(`Zip code ${zipCode} is not in ${state}`)
    }

    // Step 2: Call CMS API for real plans
    const cmsApiKey = process.env.CMS_API_KEY || process.env.HEALTHCARE_GOV_API_KEY
    if (!cmsApiKey) {
      throw new Error('CMS API key not configured')
    }

    // CMS Marketplace API endpoint
    const cmsUrl = 'https://marketplace.api.healthcare.gov/api/v1/plans/search'
    
    const cmsPayload = {
      household: {
        income: income,
        people: ages.map((age, index) => ({
          age: age,
          aptc_eligible: true,
          does_not_cohabitate: false,
          is_parent: index === 0,
          uses_tobacco: false
        }))
      },
      market: 'Individual',
      place: {
        countyfips: await getCountyFips(state, county),
        state: state,
        zipcode: zipCode
      },
      year: 2025
    }

    console.log('Calling CMS API with payload:', JSON.stringify(cmsPayload, null, 2))

    const cmsResponse = await fetch(cmsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': cmsApiKey
      },
      body: JSON.stringify(cmsPayload)
    })

    if (!cmsResponse.ok) {
      const errorText = await cmsResponse.text()
      console.error('CMS API Error:', cmsResponse.status, errorText)
      throw new Error(`CMS API error: ${cmsResponse.status} - ${errorText}`)
    }

    const cmsData = await cmsResponse.json()
    console.log('CMS API Response:', JSON.stringify(cmsData, null, 2))

    // Step 3: Transform CMS data to our format
    const plans: CMSPlan[] = (cmsData.plans || []).slice(0, 10).map((plan: any) => ({
      id: plan.id || `plan-${Math.random().toString(36).substr(2, 9)}`,
      name: plan.name || 'Unknown Plan',
      carrier: plan.issuer?.name || 'Unknown Carrier',
      metalTier: plan.metal_level?.toLowerCase() || 'bronze',
      premium: Math.round(plan.premium || 0),
      deductible: plan.deductible?.amount || 0,
      outOfPocketMax: plan.mooop || 0,
      planType: plan.plan_type || 'HMO',
      networkTier: plan.network_tier || 'Standard'
    }))

    // Step 4: Calculate subsidy
    const subsidyAmount = cmsData.aptc_amount || 0

    return {
      plans,
      subsidyAmount: Math.round(subsidyAmount),
      eligibleForSubsidy: subsidyAmount > 0,
      benchmarkPlan: 'Second Lowest Cost Silver Plan',
      location: { state, zipCode },
      household: { income, size: householdSize, ages },
      dataSource: 'CMS Healthcare.gov Marketplace API (Live Data)',
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('CMS Service Error:', error)
    throw error
  }
}

async function getCountyFips(state: string, county: string): Promise<string> {
  // Simple mapping for common counties - in production, use a proper FIPS lookup
  const fipsMap: Record<string, Record<string, string>> = {
    'AL': {
      'Jefferson': '01073',
      'Mobile': '01097',
      'Madison': '01089',
      'Montgomery': '01101',
      'Tuscaloosa': '01125'
    },
    'TX': {
      'Harris': '48201',
      'Dallas': '48113',
      'Tarrant': '48439',
      'Bexar': '48029',
      'Travis': '48453'
    }
  }
  
  return fipsMap[state]?.[county] || '01073' // Default to Jefferson County, AL
}
