import { NextResponse } from 'next/server'
import { validateDataIntegrity, getSupportedStates } from '@/lib/planDataService'

export async function GET() {
  try {
    const validation = await validateDataIntegrity()
    const supportedStates = getSupportedStates()
    
    return NextResponse.json({
      status: validation.isValid ? 'healthy' : 'degraded',
      supportedStates,
      planCounts: validation.summary,
      errors: validation.errors,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
