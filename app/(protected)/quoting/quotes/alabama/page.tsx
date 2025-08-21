'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QuoteFormData, PlanResult } from '@/lib/types'

interface QuoteInputs {
  income: string
  householdSize: string
  dateOfBirth: string
  gender: string
  zipCode: string
  tobaccoUse: string
  isCitizen: string
  isTribalMember: string
  employmentStatus: string
  hasCurrentCoverage: string
  willClaimDependents: string
  filingStatus: string
}

export default function AlabamaQuotingPage() {
  const [inputs, setInputs] = useState<QuoteInputs>({
    income: '',
    householdSize: '1',
    dateOfBirth: '',
    gender: '',
    zipCode: '',
    tobaccoUse: 'false',
    isCitizen: 'true',
    isTribalMember: 'false',
    employmentStatus: 'employed',
    hasCurrentCoverage: 'false',
    willClaimDependents: 'false',
    filingStatus: 'single'
  })

  const [results, setResults] = useState<{ plans: PlanResult[]; county: string; totalPlans: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof QuoteInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const calculateQuote = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const formData: QuoteFormData = {
        zipCode: inputs.zipCode,
        dateOfBirth: inputs.dateOfBirth,
        gender: inputs.gender as 'male' | 'female',
        annualIncome: parseInt(inputs.income),
        householdSize: parseInt(inputs.householdSize),
        tobaccoUse: inputs.tobaccoUse === 'true',
        isCitizen: inputs.isCitizen === 'true',
        isTribalMember: inputs.isTribalMember === 'true',
        employmentStatus: inputs.employmentStatus as any,
        hasCurrentCoverage: inputs.hasCurrentCoverage === 'true',
        willClaimDependents: inputs.willClaimDependents === 'true',
        filingStatus: inputs.filingStatus as any
      }

      const response = await fetch('/api/quotes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to generate quote')
        return
      }

      setResults(data.data)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Quote generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = inputs.income && inputs.householdSize && inputs.dateOfBirth && 
                     inputs.gender && inputs.zipCode

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Alabama ACA Marketplace Quotes</h2>
        <p className="text-blue-700">
          Get accurate subsidy estimates and out-of-pocket costs for Alabama residents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Quote Information</CardTitle>
            <CardDescription>
              Enter the applicant's information to calculate subsidies and costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="income">Annual Income ($)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="50000"
                  value={inputs.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="householdSize">Household Size</Label>
                <Select value={inputs.householdSize} onValueChange={(value) => handleInputChange('householdSize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 person</SelectItem>
                    <SelectItem value="2">2 people</SelectItem>
                    <SelectItem value="3">3 people</SelectItem>
                    <SelectItem value="4">4 people</SelectItem>
                    <SelectItem value="5">5 people</SelectItem>
                    <SelectItem value="6">6+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code (Alabama)</Label>
              <Input
                id="zipCode"
                placeholder="35201"
                value={inputs.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={inputs.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <RadioGroup value={inputs.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div>
              <Label>Tobacco Use</Label>
              <RadioGroup value={inputs.tobaccoUse} onValueChange={(value) => handleInputChange('tobaccoUse', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="nonsmoker" />
                  <Label htmlFor="nonsmoker">Non-smoker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="smoker" />
                  <Label htmlFor="smoker">Smoker</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Tax Filing Status</Label>
              <Select value={inputs.filingStatus} onValueChange={(value) => handleInputChange('filingStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married_filing_jointly">Married Filing Jointly</SelectItem>
                  <SelectItem value="married_filing_separately">Married Filing Separately</SelectItem>
                  <SelectItem value="head_of_household">Head of Household</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateQuote} 
              disabled={!isFormValid || loading}
              className="w-full"
            >
              {loading ? 'Calculating...' : 'Calculate Quote'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Results</CardTitle>
            <CardDescription>
              Estimated costs and subsidies for Alabama ACA plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!results ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p>Enter information and click "Calculate Quote" to see results</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">
                    Found {results.totalPlans} plans in {results.county} County, Alabama
                  </div>
                </div>

                {results.plans.slice(0, 3).map((plan, index) => (
                  <Card key={plan.id} className={index === 0 ? 'border-blue-500 border-2' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription>{plan.issuer} • {plan.metalLevel} • {plan.planType}</CardDescription>
                        </div>
                        {index === 0 && (
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            BEST VALUE
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-900">
                            ${Math.round(plan.monthlyPremiumAfterSubsidy)}
                          </div>
                          <div className="text-sm text-gray-600">Monthly Cost</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-700">
                            ${Math.round(plan.aptcAmount || 0)}
                          </div>
                          <div className="text-sm text-gray-600">Monthly Subsidy</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            ${Math.round(plan.monthlyPremium)}
                          </div>
                          <div className="text-sm text-gray-600">Full Premium</div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deductible</span>
                          <span className="font-medium">${plan.annualDeductible?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Out-of-Pocket</span>
                          <span className="font-medium">${plan.maxOutOfPocket?.toLocaleString() || 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {results.plans.length > 3 && (
                  <div className="text-center text-gray-600">
                    <p>+ {results.plans.length - 3} more plans available</p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <strong>Note:</strong> These are estimated costs based on 2024 ACA marketplace data. 
                    Actual costs may vary based on specific plan selection and carrier.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
