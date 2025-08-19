interface CMSPlan {
  id: string;
  name: string;
  carrier: string;
  metalTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Catastrophic';
  monthlyPremium: number;
  deductible: number;
  outOfPocketMax: number;
  network: string;
  state: string;
  zipCode: string;
  countyFips: string;
}

interface CMSResponse {
  plans: CMSPlan[];
  total: number;
  page: number;
}

const CMS_BASE_URL = process.env.HEALTHCARE_GOV_API_ENDPOINT || 'https://marketplace.api.healthcare.gov/api/v1';
const CMS_API_KEY = process.env.HEALTHCARE_GOV_API_KEY || process.env.CMS_API_KEY;

export async function getPlansByZipCode(
  zipCode: string,
  state: string,
  year: number = 2025
): Promise<CMSPlan[]> {
  try {
    const url = `${CMS_BASE_URL}/plans/search`;
    const params = new URLSearchParams({
      zipcode: zipCode,
      state: state,
      year: year.toString(),
      limit: '50'
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SeanInsuranceAgency/1.0',
        'Authorization': `Bearer ${CMS_API_KEY}`,
        'X-API-Key': CMS_API_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.status} ${response.statusText}`);
    }

    const data: CMSResponse = await response.json();
    return data.plans || [];
  } catch (error) {
    console.error('CMS API Error:', error);
    return [];
  }
}

export async function calculateSubsidy(
  zipCode: string,
  householdSize: number,
  income: number,
  ages: number[]
): Promise<{
  eligibleForSubsidy: boolean;
  monthlyTaxCredit: number;
  povertyLevelPercentage: number;
  benchmarkPremium: number;
}> {
  try {
    const url = `${CMS_BASE_URL}/households/pcfpl`;
    const params = new URLSearchParams({
      zipcode: zipCode,
      household_size: householdSize.toString(),
      household_income: income.toString(),
      year: '2025'
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SeanInsuranceAgency/1.0',
        'Authorization': `Bearer ${CMS_API_KEY}`,
        'X-API-Key': CMS_API_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error(`Subsidy API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      eligibleForSubsidy: data.aptc_eligible || false,
      monthlyTaxCredit: data.aptc_amount || 0,
      povertyLevelPercentage: data.poverty_level_percentage || 0,
      benchmarkPremium: data.benchmark_premium || 0
    };
  } catch (error) {
    console.error('Subsidy calculation error:', error);
    
    const federalPovertyLevel2024 = {
      1: 15060,
      2: 20440,
      3: 25820,
      4: 31200,
      5: 36580,
      6: 41960,
      7: 47340,
      8: 52720
    };

    const fpl = federalPovertyLevel2024[householdSize as keyof typeof federalPovertyLevel2024] || 52720;
    const povertyPercentage = (income / fpl) * 100;
    
    const eligibleForSubsidy = povertyPercentage >= 100 && povertyPercentage <= 400;
    
    let contributionPercentage = 0;
    if (povertyPercentage <= 150) contributionPercentage = 0.0207;
    else if (povertyPercentage <= 200) contributionPercentage = 0.0517;
    else if (povertyPercentage <= 250) contributionPercentage = 0.0827;
    else if (povertyPercentage <= 300) contributionPercentage = 0.1103;
    else if (povertyPercentage <= 400) contributionPercentage = 0.1379;
    
    const estimatedBenchmarkPremium = 800;
    const expectedContribution = (income * contributionPercentage) / 12;
    const monthlyTaxCredit = Math.max(0, estimatedBenchmarkPremium - expectedContribution);
    
    return {
      eligibleForSubsidy,
      monthlyTaxCredit: Math.round(monthlyTaxCredit),
      povertyLevelPercentage: Math.round(povertyPercentage),
      benchmarkPremium: estimatedBenchmarkPremium
    };
  }
}
