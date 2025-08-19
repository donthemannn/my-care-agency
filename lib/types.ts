export interface HouseholdMember {
  age: number;
  tobaccoUse: boolean;
  isPregnant: boolean;
  relationship: 'self' | 'spouse' | 'child' | 'other';
}

export interface QuoteRequest {
  state: string;
  zipCode: string;
  annualIncome: number;
  members: HouseholdMember[];
  effectiveDate?: string;
}

export interface SubsidyInfo {
  aptcAmount: number;
  csrLevel: string;
  isEligible: boolean;
  federalPovertyLevel: number;
  medicaidEligible: boolean;
}

export interface PlanDetails {
  id: string;
  name: string;
  issuerName: string;
  premium: number;
  deductible: number;
  outOfPocketMax: number;
  metalLevel: string;
  planType: string;
  network: string;
  hsaEligible: boolean;
  copayPrimaryCare?: number;
  copaySpecialist?: number;
  copayEmergencyRoom?: number;
  copayInpatientHospital?: number;
  coinsuranceAfterDeductible?: number;
  planBrochureUrl?: string;
}

export interface QuoteResponse {
  plans: PlanDetails[];
  subsidy: SubsidyInfo;
  location: {
    zipCode: string;
    county: string;
    state: string;
  };
  requestId: string;
  timestamp: string;
}
