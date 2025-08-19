interface FPLData {
  [year: number]: {
    [householdSize: number]: number;
  };
}

const FEDERAL_POVERTY_LEVELS: FPLData = {
  2024: {
    1: 14580,
    2: 19720,
    3: 24860,
    4: 30000,
    5: 35140,
    6: 40280,
    7: 45420,
    8: 50560
  },
  2025: {
    1: 15060,
    2: 20440,
    3: 25820,
    4: 31200,
    5: 36580,
    6: 41960,
    7: 47340,
    8: 52720
  }
};

interface APTCContributionTable {
  [fplPercent: number]: number;
}

const APTC_CONTRIBUTION_PERCENTAGES_2025: APTCContributionTable = {
  138: 0.0285,
  150: 0.0285,
  200: 0.0285,
  250: 0.0285,
  300: 0.0285,
  400: 0.085
};

export function calculateFPLPercentage(income: number, householdSize: number, year: number = 2025): number {
  const fplAmount = FEDERAL_POVERTY_LEVELS[year]?.[householdSize];
  if (!fplAmount) {
    throw new Error(`FPL data not available for household size ${householdSize} in ${year}`);
  }
  
  return Math.round((income / fplAmount) * 100);
}

export function calculateAPTC(
  annualIncome: number, 
  householdSize: number, 
  benchmarkPremium: number,
  year: number = 2025
): number {
  const fplPercent = calculateFPLPercentage(annualIncome, householdSize, year);
  
  // Not eligible for APTC if over 400% FPL
  if (fplPercent > 400) {
    return 0;
  }
  
  // Not eligible if under 138% FPL (Medicaid eligible)
  if (fplPercent < 138) {
    return 0;
  }
  
  // Find the appropriate contribution percentage
  let contributionPercent = 0.085; // Default to 400% FPL rate
  
  for (const threshold of Object.keys(APTC_CONTRIBUTION_PERCENTAGES_2025).map(Number).sort()) {
    if (fplPercent <= threshold) {
      contributionPercent = APTC_CONTRIBUTION_PERCENTAGES_2025[threshold];
      break;
    }
  }
  
  // Calculate expected contribution (monthly)
  const expectedMonthlyContribution = (annualIncome * contributionPercent) / 12;
  
  // APTC is the difference between benchmark premium and expected contribution
  const aptc = Math.max(0, benchmarkPremium - expectedMonthlyContribution);
  
  return Math.round(aptc);
}

export function getCSRLevel(fplPercent: number): string | null {
  if (fplPercent <= 150) {
    return '94%'; // 94% AV
  } else if (fplPercent <= 200) {
    return '87%'; // 87% AV
  } else if (fplPercent <= 250) {
    return '73%'; // 73% AV
  }
  return null; // No CSR
}

export function isEligibleForExtraSavings(metalLevel: string, fplPercent: number): boolean {
  return metalLevel.toLowerCase() === 'silver' && fplPercent <= 250;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
