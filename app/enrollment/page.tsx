'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, ArrowRight, ArrowLeft, User, Shield, Briefcase, Users, DollarSign, FileText, PenTool } from 'lucide-react'

interface EnrollmentData {
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    ssn: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    hasMedicaid: boolean
    hasMedicare: boolean
  }
  currentCoverage: {
    hasMarketplacePlan: boolean
  }
  healthQuestions: {
    usesTobacco: boolean
    isCitizen: boolean
    isTribalMember: boolean
  }
  employment: {
    status: 'employed' | 'unemployed' | 'social_security' | ''
  }
  household: {
    hasDependents: boolean
    householdSize: number
    annualIncome: number
  }
  taxAndReferral: {
    willFileTaxes: boolean
    referralSource: string
  }
  agreement: {
    agreedToTerms: boolean
  }
}

const STEPS = [
  { id: 1, title: 'Personal Information', icon: User, description: 'Basic details and contact info' },
  { id: 2, title: 'Current Coverage', icon: Shield, description: 'Existing insurance status' },
  { id: 3, title: 'Health Questions', icon: FileText, description: 'Quick eligibility questions' },
  { id: 4, title: 'Employment', icon: Briefcase, description: 'Work and income status' },
  { id: 5, title: 'Household', icon: Users, description: 'Family size and dependents' },
  { id: 6, title: 'Tax & Referral', icon: DollarSign, description: 'Tax filing and referral info' },
  { id: 7, title: 'Agreement', icon: PenTool, description: 'Final terms and submission' }
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function EnrollmentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [quotes, setQuotes] = useState<any[]>([])
  const [data, setData] = useState<EnrollmentData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      ssn: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      hasMedicaid: false,
      hasMedicare: false
    },
    currentCoverage: {
      hasMarketplacePlan: false
    },
    healthQuestions: {
      usesTobacco: false,
      isCitizen: true,
      isTribalMember: false
    },
    employment: {
      status: ''
    },
    household: {
      hasDependents: false,
      householdSize: 1,
      annualIncome: 0
    },
    taxAndReferral: {
      willFileTaxes: true,
      referralSource: ''
    },
    agreement: {
      agreedToTerms: false
    }
  })

  const updateData = (section: keyof EnrollmentData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateQuotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enrollment/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      setQuotes(result.plans || [])
    } catch (error) {
      console.error('Error generating quotes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitEnrollment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/enrollment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, selectedPlans: quotes })
      })
      const result = await response.json()
      if (result.success) {
        alert('Enrollment submitted successfully!')
      }
    } catch (error) {
      console.error('Error submitting enrollment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={data.personalInfo.firstName}
                  onChange={(e) => updateData('personalInfo', 'firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={data.personalInfo.lastName}
                  onChange={(e) => updateData('personalInfo', 'lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={data.personalInfo.dateOfBirth}
                  onChange={(e) => updateData('personalInfo', 'dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ssn">Social Security Number *</Label>
                <Input
                  id="ssn"
                  value={data.personalInfo.ssn}
                  onChange={(e) => updateData('personalInfo', 'ssn', e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Home Address *</Label>
              <Input
                id="address"
                value={data.personalInfo.address}
                onChange={(e) => updateData('personalInfo', 'address', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={data.personalInfo.city}
                  onChange={(e) => updateData('personalInfo', 'city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={data.personalInfo.state} onValueChange={(value) => updateData('personalInfo', 'state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={data.personalInfo.zipCode}
                  onChange={(e) => updateData('personalInfo', 'zipCode', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={data.personalInfo.phone}
                  onChange={(e) => updateData('personalInfo', 'phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => updateData('personalInfo', 'email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMedicaid"
                  checked={data.personalInfo.hasMedicaid}
                  onCheckedChange={(checked) => updateData('personalInfo', 'hasMedicaid', checked)}
                />
                <Label htmlFor="hasMedicaid">I currently have Medicaid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMedicare"
                  checked={data.personalInfo.hasMedicare}
                  onCheckedChange={(checked) => updateData('personalInfo', 'hasMedicare', checked)}
                />
                <Label htmlFor="hasMedicare">I currently have Medicare</Label>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Current Coverage Check</h3>
              <p className="text-gray-600 mb-6">Do you already have a Marketplace/Obamacare plan?</p>
            </div>
            
            <RadioGroup
              value={data.currentCoverage.hasMarketplacePlan.toString()}
              onValueChange={(value) => updateData('currentCoverage', 'hasMarketplacePlan', value === 'true')}
              className="flex justify-center space-x-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="hasMarketplace" />
                <Label htmlFor="hasMarketplace">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="noMarketplace" />
                <Label htmlFor="noMarketplace">No</Label>
              </div>
            </RadioGroup>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">A Few Quick Health Questions</h3>
              <p className="text-gray-600 mb-6">These help us determine your eligibility</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Do you use tobacco regularly (4+ times per week)?</Label>
                <RadioGroup
                  value={data.healthQuestions.usesTobacco.toString()}
                  onValueChange={(value) => updateData('healthQuestions', 'usesTobacco', value === 'true')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="usesTobacco" />
                    <Label htmlFor="usesTobacco">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="noTobacco" />
                    <Label htmlFor="noTobacco">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Are you a US citizen or US national?</Label>
                <RadioGroup
                  value={data.healthQuestions.isCitizen.toString()}
                  onValueChange={(value) => updateData('healthQuestions', 'isCitizen', value === 'true')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="isCitizen" />
                    <Label htmlFor="isCitizen">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="notCitizen" />
                    <Label htmlFor="notCitizen">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Are you part of a federally recognized tribe?</Label>
                <RadioGroup
                  value={data.healthQuestions.isTribalMember.toString()}
                  onValueChange={(value) => updateData('healthQuestions', 'isTribalMember', value === 'true')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="isTribal" />
                    <Label htmlFor="isTribal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="notTribal" />
                    <Label htmlFor="notTribal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Your Work Situation</h3>
              <p className="text-gray-600 mb-6">Tell us your current employment status</p>
            </div>

            <RadioGroup
              value={data.employment.status}
              onValueChange={(value) => updateData('employment', 'status', value)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employed" id="employed" />
                <Label htmlFor="employed">Employed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unemployed" id="unemployed" />
                <Label htmlFor="unemployed">Unemployed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="social_security" id="socialSecurity" />
                <Label htmlFor="socialSecurity">Receiving Social Security</Label>
              </div>
            </RadioGroup>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Family Size</h3>
              <p className="text-gray-600 mb-6">This helps us calculate your subsidies accurately</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Do you have dependents you'll claim on your taxes?</Label>
                <RadioGroup
                  value={data.household.hasDependents.toString()}
                  onValueChange={(value) => {
                    const hasDependents = value === 'true'
                    updateData('household', 'hasDependents', hasDependents)
                    if (!hasDependents) {
                      updateData('household', 'householdSize', 1)
                    }
                  }}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="hasDependents" />
                    <Label htmlFor="hasDependents">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="noDependents" />
                    <Label htmlFor="noDependents">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {data.household.hasDependents && (
                <div>
                  <Label htmlFor="householdSize">Total Household Size (including yourself)</Label>
                  <Select 
                    value={data.household.householdSize.toString()} 
                    onValueChange={(value) => updateData('household', 'householdSize', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(size => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="annualIncome">Annual Household Income *</Label>
                <Input
                  id="annualIncome"
                  type="number"
                  value={data.household.annualIncome}
                  onChange={(e) => updateData('household', 'annualIncome', parseInt(e.target.value) || 0)}
                  placeholder="50000"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Tax Credits & Referral</h3>
              <p className="text-gray-600 mb-6">Two important items to complete your application</p>
            </div>

            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-blue-50">
                <Label className="text-base font-medium">To get cost savings, you must file a tax return next year</Label>
                <p className="text-sm text-gray-600 mt-2">Answer Yes to continue (No will disqualify you from savings)</p>
                <RadioGroup
                  value={data.taxAndReferral.willFileTaxes.toString()}
                  onValueChange={(value) => updateData('taxAndReferral', 'willFileTaxes', value === 'true')}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="willFile" />
                    <Label htmlFor="willFile">Yes, I will file taxes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="wontFile" />
                    <Label htmlFor="wontFile">No, I will not file taxes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="referralSource">Who referred you or where did you hear about us?</Label>
                <Input
                  id="referralSource"
                  value={data.taxAndReferral.referralSource}
                  onChange={(e) => updateData('taxAndReferral', 'referralSource', e.target.value)}
                  placeholder="Friend, Google, Facebook, etc."
                />
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            {quotes.length === 0 ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Generate Your Personalized Quotes</h3>
                <p className="text-gray-600 mb-6">Click below to see your available plans and exact subsidy calculations</p>
                <Button onClick={generateQuotes} disabled={isLoading} className="mb-6">
                  {isLoading ? 'Generating Quotes...' : 'Get My Quotes'}
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Personalized Plan Options</h3>
                <div className="space-y-4 mb-6">
                  {quotes.map((plan, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.carrier}</p>
                          <p className="text-sm">Deductible: ${plan.deductible}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${plan.monthlyPremium}/mo</p>
                          {plan.subsidy > 0 && (
                            <p className="text-sm text-blue-600">Subsidy: ${plan.subsidy}/mo</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {quotes.length > 0 && (
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold mb-3">Final Agreement</h4>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p>By clicking "Submit Application" you're agreeing to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Let us help you apply for healthcare coverage</li>
                    <li>Share your information securely with Healthcare.gov</li>
                    <li>Receive electronic communications about your coverage</li>
                    <li>Confirm all your information is accurate</li>
                    <li>Allow your agent to work on your behalf</li>
                  </ul>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="agreedToTerms"
                    checked={data.agreement.agreedToTerms}
                    onCheckedChange={(checked) => updateData('agreement', 'agreedToTerms', checked)}
                  />
                  <Label htmlFor="agreedToTerms">I agree to all terms and conditions</Label>
                </div>

                <Button 
                  onClick={submitEnrollment} 
                  disabled={!data.agreement.agreedToTerms || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.personalInfo.firstName && data.personalInfo.lastName && 
               data.personalInfo.dateOfBirth && data.personalInfo.ssn &&
               data.personalInfo.address && data.personalInfo.city && 
               data.personalInfo.state && data.personalInfo.zipCode &&
               data.personalInfo.phone && data.personalInfo.email
      case 2:
        return true // Always valid since it has a default
      case 3:
        return true // Always valid since it has defaults
      case 4:
        return data.employment.status !== ''
      case 5:
        return data.household.annualIncome > 0
      case 6:
        return data.taxAndReferral.willFileTaxes
      case 7:
        return quotes.length > 0 && data.agreement.agreedToTerms
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MyCareAct Enrollment Process</h1>
          <p className="text-gray-600">Get Your Healthcare Coverage in 7 Easy Steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={(currentStep / 7) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs text-center ${isCurrent ? 'font-semibold' : ''}`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
              Step {currentStep}: {STEPS[currentStep - 1].title}
            </CardTitle>
            <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {currentStep < 7 && (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Making Healthcare.gov Simple and Easy - That's the MyCareAct Promise</p>
          <p className="mt-2">Need help? Your agent is here to guide you through every step.</p>
        </div>
      </div>
    </div>
  )
}
