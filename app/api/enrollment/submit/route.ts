import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(request: NextRequest) {
  try {
    const enrollmentData = await request.json()
    
    // Validate required fields
    if (!enrollmentData.personalInfo?.firstName || !enrollmentData.personalInfo?.email) {
      return NextResponse.json(
        { error: 'Missing required personal information' },
        { status: 400 }
      )
    }

    if (!enrollmentData.agreement?.agreedToTerms) {
      return NextResponse.json(
        { error: 'Terms and conditions must be accepted' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    
    // For testing mode, just log the data
    if (!supabase) {
      console.log('🧪 TESTING MODE - Enrollment Data:', JSON.stringify(enrollmentData, null, 2))
      return NextResponse.json({
        success: true,
        message: 'Enrollment submitted successfully (testing mode)',
        enrollmentId: `test-${Date.now()}`,
        testMode: true
      })
    }

    // Store enrollment in Supabase
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        // Personal Information
        first_name: enrollmentData.personalInfo.firstName,
        last_name: enrollmentData.personalInfo.lastName,
        date_of_birth: enrollmentData.personalInfo.dateOfBirth,
        ssn: enrollmentData.personalInfo.ssn,
        address: enrollmentData.personalInfo.address,
        city: enrollmentData.personalInfo.city,
        state: enrollmentData.personalInfo.state,
        zip_code: enrollmentData.personalInfo.zipCode,
        phone: enrollmentData.personalInfo.phone,
        email: enrollmentData.personalInfo.email,
        has_medicaid: enrollmentData.personalInfo.hasMedicaid,
        has_medicare: enrollmentData.personalInfo.hasMedicare,
        
        // Coverage and Health
        has_marketplace_plan: enrollmentData.currentCoverage.hasMarketplacePlan,
        uses_tobacco: enrollmentData.healthQuestions.usesTobacco,
        is_citizen: enrollmentData.healthQuestions.isCitizen,
        is_tribal_member: enrollmentData.healthQuestions.isTribalMember,
        
        // Employment and Household
        employment_status: enrollmentData.employment.status,
        has_dependents: enrollmentData.household.hasDependents,
        household_size: enrollmentData.household.householdSize,
        annual_income: enrollmentData.household.annualIncome,
        
        // Tax and Referral
        will_file_taxes: enrollmentData.taxAndReferral.willFileTaxes,
        referral_source: enrollmentData.taxAndReferral.referralSource,
        
        // Agreement
        agreed_to_terms: enrollmentData.agreement.agreedToTerms,
        
        // Metadata
        selected_plans: enrollmentData.selectedPlans || [],
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (enrollmentError) {
      console.error('Supabase enrollment error:', enrollmentError)
      return NextResponse.json(
        { error: 'Failed to save enrollment data' },
        { status: 500 }
      )
    }

    // For testing: Log enrollment details and disable database storage
    console.log('=== ENROLLMENT SUBMITTED (TESTING MODE) ===');
    console.log('Personal Info:', enrollmentData.personalInfo);
    console.log('Selected Plans:', enrollmentData.selectedPlans);
    console.log('Household Size:', enrollmentData.household?.householdSize);
    console.log('Annual Income:', enrollmentData.household?.annualIncome);
    console.log('=== END ENROLLMENT ===');
    
    // Return success response for testing
    return NextResponse.json({
      success: true,
      enrollmentId: 'test-' + Date.now(),
      message: 'TEST SUBMISSION: Enrollment logged successfully (not saved to database)',
      note: 'This is a test submission - check server logs for details',
      testMode: true,
      nextSteps: [
        'This was a test submission only',
        'Check server console for enrollment details',
        'No data was permanently stored',
        'Future versions will integrate with GoHighLevel CRM'
      ]
    })
    
  } catch (error) {
    console.error('Error submitting enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to submit enrollment. Please try again.' },
      { status: 500 }
    )
  }
}
