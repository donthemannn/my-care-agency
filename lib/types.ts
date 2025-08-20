// ============================================
// CORE APPLICATION TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// QUOTE FORM TYPES
// ============================================

export interface QuoteFormData {
  // Personal Information
  dateOfBirth: string;
  gender: 'male' | 'female';
  zipCode: string;
  county?: string;
  state?: string;
  
  // Income & Household
  annualIncome: number;
  householdSize: number;
  
  // Health & Lifestyle
  tobaccoUse: boolean;
  isPregnant?: boolean;
  
  // Citizenship & Legal Status
  isCitizen: boolean;
  isTribalMember: boolean;
  
  // Employment & Benefits
  employmentStatus: 'employed' | 'unemployed' | 'social_security' | 'self_employed';
  hasCurrentCoverage: boolean;
  currentCoverageType?: 'marketplace' | 'employer' | 'medicaid' | 'medicare' | 'other';
  
  // Tax Information
  willClaimDependents: boolean;
  filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
}

// ============================================
// GEOGRAPHIC TYPES
// ============================================

export interface CountyInfo {
  fips: string;
  name: string;
  state: string;
  zipCodes: string[];
}

export interface SmartyStreetsResponse {
  results: Array<{
    components: {
      county_fips: string;
      county_name: string;
      state_abbreviation: string;
      zipcode: string;
    };
    metadata: {
      county_fips: string;
      county_name: string;
      state_abbreviation: string;
    };
  }>;
}

// ============================================
// CMS API TYPES
// ============================================

export interface CMSPlanSearchRequest {
  place: {
    countyfips: string;
    state: string;
    zipcode: string;
  };
  year: number;
  market: string;
}

export interface CMSPlan {
  id: string;
  name: string;
  issuer: {
    name: string;
    id: string;
  };
  premium: number;
  deductible?: {
    individual?: number;
    family?: number;
  };
  out_of_pocket_maximum?: {
    individual?: number;
    family?: number;
  };
  metal_level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Catastrophic';
  plan_type: string;
  network_tier?: string;
  benefits?: {
    medical_deductible?: number;
    drug_deductible?: number;
    medical_maximum_out_of_pocket?: number;
    drug_maximum_out_of_pocket?: number;
  };
}

export interface CMSSubsidyRequest {
  household: {
    income: number;
    people: Array<{
      age: number;
      aptc_eligible: boolean;
      does_not_require_coverage: boolean;
      is_pregnant: boolean;
      is_parent: boolean;
      uses_tobacco: boolean;
    }>;
  };
  place: {
    countyfips: string;
    state: string;
    zipcode: string;
  };
  year: number;
  market: string;
}

export interface CMSSubsidyResponse {
  aptc_amount: number;
  csr_variant: string;
  estimated_premium_after_aptc: number;
  is_eligible_for_aptc: boolean;
  is_eligible_for_csr: boolean;
}

// ============================================
// PLAN RESULT TYPES
// ============================================

export interface PlanResult {
  id: string;
  name: string;
  issuer: string;
  metalLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Catastrophic';
  planType: string;
  
  // Costs
  monthlyPremium: number;
  monthlyPremiumAfterSubsidy: number;
  annualDeductible: number;
  maxOutOfPocket: number;
  
  // Subsidies
  aptcAmount: number;
  csrVariant: string;
  isEligibleForAptc: boolean;
  isEligibleForCsr: boolean;
  
  // Additional Info
  networkTier?: string;
  benefits?: {
    medicalDeductible?: number;
    drugDeductible?: number;
    medicalMaxOutOfPocket?: number;
    drugMaxOutOfPocket?: number;
  };
}

export interface QuoteResult {
  id: string;
  userId?: string;
  formData: QuoteFormData;
  plans: PlanResult[];
  county: string;
  fips: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QuoteApiResponse extends ApiResponse<{
  plans: PlanResult[];
  county: string;
  fips: string;
  totalPlans: number;
}> {}

// ============================================
// FEDERAL POVERTY LEVEL TYPES
// ============================================

export interface FederalPovertyLevel {
  year: number;
  householdSize: number;
  amount: number;
}

// ============================================
// SUPPORTED STATES
// ============================================

export const SUPPORTED_STATES = ['AL'] as const;
export type SupportedState = typeof SUPPORTED_STATES[number];

export const STATE_NAMES: Record<SupportedState, string> = {
  AL: 'Alabama'
};

// ============================================
// METAL LEVEL COLORS
// ============================================

export const METAL_LEVEL_COLORS = {
  Bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  Silver: 'bg-gray-100 text-gray-800 border-gray-200',
  Gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Platinum: 'bg-slate-100 text-slate-800 border-slate-200',
  Catastrophic: 'bg-red-100 text-red-800 border-red-200'
} as const;
