'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

interface QuoteInputs {
  income: string
  householdSize: string
  metalLevel: string
  smoker: string
  gender: string
  age: string
  zipCode: string
}

export default function AlabamaQuotingPage() {
  const [inputs, setInputs] = useState<QuoteInputs>({
    income: '',
    householdSize: '',
    metalLevel: '',
    smoker: '',
    gender: '',
    age: '',
    zipCode: ''
  })

  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: keyof QuoteInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const calculateQuote = async () => {
    setLoading(true)
    
    // Simulate API call for now
    setTimeout(() => {
      const mockResults = {
        monthlyPremium: 450,
        subsidyAmount: 200,
        outOfPocketCost: 250,
        deductible: 2500,
        maxOutOfPocket: 8000
      }
      setResults(mockResults)
      setLoading(false)
    }, 2000)
  }

  const isFormValid = inputs.income && inputs.householdSize && inputs.metalLevel && 
                     inputs.smoker && inputs.gender && inputs.age && inputs.zipCode

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
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                placeholder="35201"
                value={inputs.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="35"
                  value={inputs.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
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
              <RadioGroup value={inputs.smoker} onValueChange={(value) => handleInputChange('smoker', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="nonsmoker" />
                  <Label htmlFor="nonsmoker">Non-smoker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="smoker" />
                  <Label htmlFor="smoker">Smoker</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Metal Level</Label>
              <Select value={inputs.metalLevel} onValueChange={(value) => handleInputChange('metalLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metal level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze (60% coverage)</SelectItem>
                  <SelectItem value="silver">Silver (70% coverage)</SelectItem>
                  <SelectItem value="gold">Gold (80% coverage)</SelectItem>
                  <SelectItem value="platinum">Platinum (90% coverage)</SelectItem>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Monthly Premium</div>
                    <div className="text-2xl font-bold text-blue-900">${results.monthlyPremium}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Monthly Subsidy</div>
                    <div className="text-2xl font-bold text-green-900">${results.subsidyAmount}</div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Your Monthly Cost</div>
                  <div className="text-3xl font-bold text-purple-900">${results.outOfPocketCost}</div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Deductible</span>
                    <span className="font-semibold">${results.deductible.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Out-of-Pocket</span>
                    <span className="font-semibold">${results.maxOutOfPocket.toLocaleString()}</span>
                  </div>
                </div>

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
