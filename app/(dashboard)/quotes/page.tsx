'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { QuoteFormData } from '@/lib/types'

const quoteSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/, 'Zip code must be 5 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  annualIncome: z.number().min(1, 'Annual income must be greater than $0'),
  householdSize: z.number().min(1, 'Household size must be at least 1'),
  isCitizen: z.boolean(),
  isTribalMember: z.boolean(),
  employmentStatus: z.enum(['employed', 'unemployed', 'self-employed', 'retired', 'student', 'disabled'], {
    required_error: 'Employment status is required'
  }),
  hasCurrentCoverage: z.boolean(),
  currentCoverageType: z.string().optional(),
  willClaimDependents: z.boolean(),
  filingStatus: z.enum(['single', 'married-filing-jointly', 'married-filing-separately', 'head-of-household'], {
    required_error: 'Filing status is required'
  }),
  tobaccoUse: z.boolean(),
  isPregnant: z.boolean().optional(),
  hasDisability: z.boolean().optional(),
})

type QuoteFormValues = z.infer<typeof quoteSchema>

export default function QuotesPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [quoteResults, setQuoteResults] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      householdSize: 1,
      isCitizen: true,
      isTribalMember: false,
      hasCurrentCoverage: false,
      willClaimDependents: false,
      tobaccoUse: false,
      isPregnant: false,
      hasDisability: false,
    }
  })

  const watchedValues = watch()

  const steps = [
    { id: 1, name: 'Location & Basic Info', fields: ['zipCode', 'dateOfBirth', 'gender'] },
    { id: 2, name: 'Income & Household', fields: ['annualIncome', 'householdSize', 'filingStatus'] },
    { id: 3, name: 'Citizenship & Employment', fields: ['isCitizen', 'isTribalMember', 'employmentStatus'] },
    { id: 4, name: 'Current Coverage', fields: ['hasCurrentCoverage', 'currentCoverageType'] },
    { id: 5, name: 'Additional Information', fields: ['willClaimDependents', 'tobaccoUse', 'isPregnant', 'hasDisability'] },
  ]

  const nextStep = async () => {
    const currentStepFields = steps[currentStep - 1].fields
    const isValid = await trigger(currentStepFields as any)
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: QuoteFormValues) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setQuoteResults(result.data)
      } else {
        setError(result.error || 'Failed to generate quote')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (quoteResults) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Quote Results</h1>
          <p className="mt-2 text-gray-600">
            Found {quoteResults.totalPlans} ACA plans in {quoteResults.county} County
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => {
              setQuoteResults(null)
              setCurrentStep(1)
            }}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            ← Start New Quote
          </button>
        </div>

        <div className="grid gap-6">
          {quoteResults.plans.map((plan: any, index: number) => (
            <div key={index} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.planName}</h3>
                  <p className="text-sm text-gray-600">{plan.issuerName}</p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.metalLevel === 'Bronze' ? 'bg-orange-100 text-orange-800' :
                      plan.metalLevel === 'Silver' ? 'bg-gray-100 text-gray-800' :
                      plan.metalLevel === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                      plan.metalLevel === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {plan.metalLevel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${plan.monthlyPremium}/mo
                  </div>
                  {plan.subsidyAmount > 0 && (
                    <div className="text-sm text-green-600">
                      ${plan.subsidyAmount}/mo subsidy
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Deductible</span>
                  <div className="font-medium">${plan.deductible}</div>
                </div>
                <div>
                  <span className="text-gray-500">Out-of-Pocket Max</span>
                  <div className="font-medium">${plan.outOfPocketMax}</div>
                </div>
                <div>
                  <span className="text-gray-500">Primary Care</span>
                  <div className="font-medium">${plan.primaryCare}</div>
                </div>
                <div>
                  <span className="text-gray-500">Specialist</span>
                  <div className="font-medium">${plan.specialist}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Select This Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Get Your Quote</h1>
        <p className="mt-2 text-gray-600">Find the perfect ACA health insurance plan for you</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep > step.id ? 'bg-indigo-600 text-white' :
                currentStep === step.id ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600' :
                'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div className={`ml-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-indigo-600' : 'text-gray-500'
              }`}>
                {step.name}
              </div>
              {index < steps.length - 1 && (
                <div className={`ml-4 w-16 h-0.5 ${
                  currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
        {/* Step 1: Location & Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Location & Basic Information</h3>
            
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                Zip Code *
              </label>
              <input
                {...register('zipCode')}
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="35201"
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth *
              </label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender *</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('gender')}
                    type="radio"
                    value="male"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('gender')}
                    type="radio"
                    value="female"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Female</span>
                </label>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Income & Household */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Income & Household Information</h3>
            
            <div>
              <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700">
                Annual Income *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  {...register('annualIncome', { valueAsNumber: true })}
                  type="number"
                  className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="50000"
                />
              </div>
              {errors.annualIncome && (
                <p className="mt-1 text-sm text-red-600">{errors.annualIncome.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="householdSize" className="block text-sm font-medium text-gray-700">
                Household Size *
              </label>
              <select
                {...register('householdSize', { valueAsNumber: true })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {[1,2,3,4,5,6,7,8].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.householdSize && (
                <p className="mt-1 text-sm text-red-600">{errors.householdSize.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="filingStatus" className="block text-sm font-medium text-gray-700">
                Tax Filing Status *
              </label>
              <select
                {...register('filingStatus')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select filing status</option>
                <option value="single">Single</option>
                <option value="married-filing-jointly">Married Filing Jointly</option>
                <option value="married-filing-separately">Married Filing Separately</option>
                <option value="head-of-household">Head of Household</option>
              </select>
              {errors.filingStatus && (
                <p className="mt-1 text-sm text-red-600">{errors.filingStatus.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Citizenship & Employment */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Citizenship & Employment</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Are you a U.S. citizen or lawfully present? *
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('isCitizen')}
                    type="radio"
                    value="true"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('isCitizen')}
                    type="radio"
                    value="false"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Are you a member of a federally recognized tribe? *
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('isTribalMember')}
                    type="radio"
                    value="true"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('isTribalMember')}
                    type="radio"
                    value="false"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700">
                Employment Status *
              </label>
              <select
                {...register('employmentStatus')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select employment status</option>
                <option value="employed">Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="self-employed">Self-employed</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
                <option value="disabled">Disabled</option>
              </select>
              {errors.employmentStatus && (
                <p className="mt-1 text-sm text-red-600">{errors.employmentStatus.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Current Coverage */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Current Coverage</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Do you currently have health insurance? *
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('hasCurrentCoverage')}
                    type="radio"
                    value="true"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('hasCurrentCoverage')}
                    type="radio"
                    value="false"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {watchedValues.hasCurrentCoverage && (
              <div>
                <label htmlFor="currentCoverageType" className="block text-sm font-medium text-gray-700">
                  What type of coverage do you have?
                </label>
                <select
                  {...register('currentCoverageType')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select coverage type</option>
                  <option value="employer">Employer-sponsored</option>
                  <option value="marketplace">Marketplace plan</option>
                  <option value="medicaid">Medicaid</option>
                  <option value="medicare">Medicare</option>
                  <option value="cobra">COBRA</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Additional Information */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Will you claim any dependents on your tax return? *
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('willClaimDependents')}
                    type="radio"
                    value="true"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('willClaimDependents')}
                    type="radio"
                    value="false"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Do you use tobacco products? *
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('tobaccoUse')}
                    type="radio"
                    value="true"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('tobaccoUse')}
                    type="radio"
                    value="false"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {watchedValues.gender === 'female' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Are you currently pregnant?
                </label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      {...register('isPregnant')}
                      type="radio"
                      value="true"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('isPregnant')}
                      type="radio"
                      value="false"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Do you have a disability?
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('hasDisability')}
                    type="radio"
                    value="true"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('hasDisability')}
                    type="radio"
                    value="false"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating Quote...' : 'Get My Quote'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
