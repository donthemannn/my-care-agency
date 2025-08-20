export interface EnhancedPlan {
  id: string;
  name: string;
  metalLevel: string;
  premium: number;
  netPremium: number;
  hasExtraSavings?: boolean;
  issuer: {
    name: string;
    logo?: string;
  };
  deductible?: {
    individual?: number;
    family?: number;
  };
  outOfPocketMax?: {
    individual?: number;
    family?: number;
  };
}

export interface MetalTierCounts {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface QuoteResponse {
  plans: EnhancedPlan[];
  subsidyAmount: number;
  household: {
    ages: number[];
    income: number;
    size: number;
  };
  metalTierCounts: MetalTierCounts;
  fplPercentage: number;
  eligibleForSubsidy: boolean;
  location: {
    state: string;
    zipCode: string;
  };
  dataSource: string;
  timestamp: string;
}
