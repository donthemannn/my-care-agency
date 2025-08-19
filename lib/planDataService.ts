import fs from 'fs/promises'
import path from 'path'
import { getPlansByZipCode } from './cmsClient'
import { getZipCodeInfo, getZipCodesByCounty } from './zipCodeMapping'

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

const SUPPORTED_STATES = ['TX', 'OH', 'AL'] as const
type SupportedState = typeof SUPPORTED_STATES[number]

const planCache = new Map<string, { plans: InsurancePlan[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000

let localPlansCache: any = null

async function loadLocalPlansData(state: SupportedState): Promise<any> {
  const cacheKey = `localPlans-${state}`
  if (localPlansCache && localPlansCache[cacheKey]) return localPlansCache[cacheKey]
  
  try {
    const stateFiles = {
      'TX': 'texas-plans-complete-2025.json',
      'OH': 'ohio-plans-2025.json', 
      'AL': 'alabama-plans-2025.json'
    }
    
    const fileName = stateFiles[state]
    if (!fileName) {
      throw new Error(`No data file configured for state: ${state}`)
    }
    
    const dataPath = path.join(process.cwd(), 'data', 'healthcare-plans', fileName)
    const data = await fs.readFile(dataPath, 'utf8')
    const stateData = JSON.parse(data)
    
    if (!localPlansCache) localPlansCache = {}
    localPlansCache[cacheKey] = stateData
    
    console.log(`✅ Loaded ${state} plans data with ${stateData.total_plans} total plans`)
    return stateData
  } catch (error) {
    console.error(`Failed to load ${state} plans data:`, error)
    throw new Error(`Unable to load insurance plan data for ${state}`)
  }
}

async function fetchCMSPlans(state: SupportedState, zipCode: string): Promise<InsurancePlan[]> {
  if (!process.env.CMS_API_KEY) {
    console.log('⚠️  No CMS_API_KEY found, skipping CMS API call')
    return []
  }

  try {
    console.log(`🔄 Attempting to fetch CMS plans for ${state} ${zipCode}`)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    
    const cmsPlans = await getPlansByZipCode(zipCode, state)
    clearTimeout(timeoutId)
    
    if (cmsPlans.length > 0) {
      const convertedPlans: InsurancePlan[] = cmsPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        carrier: plan.carrier,
        metalTier: plan.metalTier.toLowerCase() as any,
        premium: plan.monthlyPremium,
        deductible: plan.deductible,
        outOfPocketMax: plan.outOfPocketMax,
        copayPrimaryCare: 25,
        copaySpecialist: 50,
        coinsurance: plan.metalTier === 'Bronze' ? 40 : plan.metalTier === 'Silver' ? 20 : 10,
        networkType: plan.network || 'PPO',
        state: plan.state,
        hiosId: plan.id,
        benefits: ['Preventive Care', 'Prescription Drugs', 'Mental Health', 'Emergency Services'],
        rating: 4.0
      }))
      
      console.log(`✅ Successfully fetched ${convertedPlans.length} CMS plans for ${state}`)
      return convertedPlans
    }
  } catch (error) {
    console.log(`⚠️  CMS API call failed for ${state} ${zipCode}:`, error instanceof Error ? error.message : 'Unknown error')
  }
  
  return []
}

async function loadLocalPlansForState(state: SupportedState, zipCode?: string): Promise<InsurancePlan[]> {
  const localData = await loadLocalPlansData(state)
  
  // Handle different data structures
  let statePlans: any[]
  if (localData.plans) {
    if (Array.isArray(localData.plans)) {
      // Ohio/Alabama format: { plans: [array] }
      statePlans = localData.plans
    } else if (localData.plans[state]) {
      // Texas format: { plans: { TX: [array] } }
      statePlans = localData.plans[state]
    } else {
      throw new Error(`No plan data found for state: ${state}`)
    }
  } else {
    throw new Error(`No local plan data available for state: ${state}`)
  }
  
  if (!Array.isArray(statePlans)) {
    throw new Error(`Invalid plan data structure for state: ${state}`)
  }
  
  // Filter by zip code if provided
  if (zipCode) {
    // First try exact zip code match
    let zipFilteredPlans = statePlans.filter((plan: any) => plan.zipcode === zipCode)
    
    if (zipFilteredPlans.length === 0) {
      // If no exact match, try county-based filtering using real zip code mapping
      const zipInfo = getZipCodeInfo(zipCode)
      if (zipInfo) {
        console.log(`🔍 Looking for plans in ${zipInfo.county} County for zip ${zipCode}`)
        
        // Get all zip codes in the same county
        const countyZips = getZipCodesByCounty(state, zipInfo.county)
        const countyZipCodes = countyZips.map(z => z.zipCode)
        
        // Filter plans by county zip codes
        zipFilteredPlans = statePlans.filter((plan: any) => 
          countyZipCodes.includes(plan.zipcode) || 
          (plan.county && plan.county.toLowerCase() === zipInfo.county.toLowerCase())
        )
        
        if (zipFilteredPlans.length > 0) {
          console.log(`🎯 Found ${zipFilteredPlans.length} plans in ${zipInfo.county} County for zip ${zipCode}`)
        }
      }
    }
    
    if (zipFilteredPlans.length > 0) {
      statePlans = zipFilteredPlans
      console.log(`✅ Using ${statePlans.length} plans for zip code ${zipCode}`)
    } else {
      // Fallback: return a reasonable subset instead of all plans
      const maxPlans = Math.min(50, statePlans.length)
      statePlans = statePlans.slice(0, maxPlans)
      console.log(`⚠️  No specific plans found for zip ${zipCode}, returning ${maxPlans} representative plans`)
    }
  }
  
  const convertedPlans: InsurancePlan[] = statePlans.map((plan: any) => {
    // Normalize field names (handle both metalTier and metal_tier)
    const metalTier = (plan.metalTier || plan.metal_tier || 'bronze').toLowerCase()
    const outOfPocketMax = plan.outOfPocketMax || plan.out_of_pocket_max || 8000
    const hiosId = plan.hiosId || plan.hios_id || plan.id
    const networkType = plan.networkType || plan.network_type || plan.network || 'PPO'
    
    return {
      id: plan.id,
      name: plan.name,
      carrier: plan.carrier,
      metalTier: metalTier as any,
      premium: plan.premium,
      deductible: plan.deductible,
      outOfPocketMax: outOfPocketMax,
      copayPrimaryCare: 25,
      copaySpecialist: 50,
      coinsurance: metalTier === 'bronze' ? 40 : metalTier === 'silver' ? 20 : 10,
      networkType: networkType,
      state: plan.state,
      hiosId: hiosId,
      benefits: ['Preventive Care', 'Prescription Drugs', 'Mental Health', 'Emergency Services'],
      rating: 4.0
    }
  })
  
  console.log(`✅ Loaded ${convertedPlans.length} local plans for ${state}${zipCode ? ` (${zipCode})` : ''}`)
  return convertedPlans
}

export async function getPlansForState(state: string, zipCode: string): Promise<InsurancePlan[]> {
  const stateCode = state.toUpperCase() as SupportedState
  
  if (!SUPPORTED_STATES.includes(stateCode)) {
    throw new Error(`State ${state} is not supported. Supported states: ${SUPPORTED_STATES.join(', ')}`)
  }
  
  const cacheKey = `${stateCode}-${zipCode}`
  const cached = planCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`✅ Using cached plans for ${stateCode} ${zipCode}`)
    return cached.plans
  }
  
  try {
    const cmsPlans = await fetchCMSPlans(stateCode, zipCode)
    
    if (cmsPlans.length > 0) {
      planCache.set(cacheKey, { plans: cmsPlans, timestamp: Date.now() })
      return cmsPlans
    }
    
    const localPlans = await loadLocalPlansForState(stateCode, zipCode)
    
    if (localPlans.length === 0) {
      throw new Error(`No plans found for ${stateCode}`)
    }
    
    planCache.set(cacheKey, { plans: localPlans, timestamp: Date.now() })
    return localPlans
    
  } catch (error) {
    console.error(`Failed to load plans for ${stateCode}:`, error)
    throw error
  }
}

export function getSupportedStates(): SupportedState[] {
  return [...SUPPORTED_STATES]
}

export function isStateSupported(state: string): boolean {
  return SUPPORTED_STATES.includes(state.toUpperCase() as SupportedState)
}

export async function validateDataIntegrity(): Promise<{ 
  isValid: boolean
  errors: string[]
  summary: { [state: string]: number }
}> {
  const errors: string[] = []
  const summary: { [state: string]: number } = {}
  
  try {
    for (const state of SUPPORTED_STATES) {
      try {
        const plans = await loadLocalPlansForState(state)
        summary[state] = plans.length
        
        if (plans.length === 0) {
          errors.push(`No plans found for ${state}`)
        }
        
        const carriers = new Set(plans.map(p => p.carrier))
        if (carriers.size < 3) {
          errors.push(`${state} has only ${carriers.size} carriers, expected at least 3`)
        }
        
        const metalTiers = new Set(plans.map(p => p.metalTier))
        if (!metalTiers.has('bronze') || !metalTiers.has('silver')) {
          errors.push(`${state} missing required metal tiers (bronze/silver)`)
        }
        
      } catch (error) {
        errors.push(`Failed to validate ${state}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        summary[state] = 0
      }
    }
    
  } catch (error) {
    errors.push(`Failed to load local data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    summary
  }
}
