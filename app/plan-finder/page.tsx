'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Star, DollarSign, Shield, Users } from 'lucide-react';

interface PlanRecommendation {
  planName: string;
  carrier: { name: string };
  premium: number;
  deductible: number;
  oopMax: number;
  rating: number;
  metalLevel: string;
  rank: number;
  recommendationReason: string;
  estimatedSubsidy: number;
}

interface RecommendationResponse {
  success: boolean;
  clientInfo: {
    name: string;
    age: number;
    state: string;
    planType: string;
    eligibleForSubsidies: boolean;
  };
  recommendations: PlanRecommendation[];
  totalPlansFound: number;
  error?: string;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function PlanFinderPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    state: '',
    zipCode: '',
    planType: 'ACA',
    householdSize: 1,
    estimatedIncome: '',
    tobaccoUse: false
  });

  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate supported states
      if (!['TX', 'OH', 'AL'].includes(formData.state)) {
        throw new Error('Currently only available in Texas (TX), Ohio (OH), and Alabama (AL)')
      }

      // Calculate age from DOB
      const age = new Date().getFullYear() - new Date(formData.dob).getFullYear()

      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: formData.state,
          zipCode: formData.zipCode || '44101',
          householdSize: formData.householdSize,
          income: formData.estimatedIncome ? parseInt(formData.estimatedIncome) : 0,
          ages: [age],
          coverageType: formData.planType === 'ACA' ? 'individual' : 'individual'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      // Transform the quote response to match the expected format
      const transformedData = {
        success: true,
        clientInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          age: age,
          state: formData.state,
          planType: formData.planType,
          eligibleForSubsidies: data.eligibleForSubsidy
        },
        recommendations: data.plans.slice(0, 10).map((plan, index) => ({
          planName: plan.name,
          carrier: { name: plan.carrier },
          premium: plan.premium,
          deductible: plan.deductible,
          oopMax: plan.outOfPocketMax,
          rating: plan.rating,
          metalLevel: plan.metalTier,
          rank: index + 1,
          recommendationReason: `${plan.metalTier} plan with ${plan.networkType} network`,
          estimatedSubsidy: data.subsidyAmount
        })),
        totalPlansFound: data.plans.length
      }
      
      setRecommendations(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getMetalLevelColor = (level: string) => {
    switch (level) {
      case 'Bronze': return 'bg-amber-100 text-amber-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Plan Finder</h1>
        <p className="text-gray-600">Find the best health insurance plans tailored to your needs</p>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mt-4">
          <p className="font-semibold">Currently Available: Texas, Ohio & Alabama</p>
          <p className="text-sm">We provide real insurance quotes with accurate subsidies for these three states.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Client Information
            </CardTitle>
            <CardDescription>
              Enter client details to find personalized plan recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select State</option>
                  <option value="TX">Texas (TX)</option>
                  <option value="OH">Ohio (OH)</option>
                  <option value="AL">Alabama (AL)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="75201"
                  required
                />
              </div>

              <div>
                <Label htmlFor="planType">Plan Type</Label>
                <select
                  id="planType"
                  value={formData.planType}
                  onChange={(e) => handleInputChange('planType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACA">ACA Marketplace</option>
                  <option value="Medicare">Medicare</option>
                  <option value="Short-Term">Short-Term</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="householdSize">Household Size</Label>
                  <Input
                    id="householdSize"
                    type="number"
                    min="1"
                    value={formData.householdSize}
                    onChange={(e) => handleInputChange('householdSize', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedIncome">Annual Income (Optional)</Label>
                  <Input
                    id="estimatedIncome"
                    type="number"
                    placeholder="50000"
                    value={formData.estimatedIncome}
                    onChange={(e) => handleInputChange('estimatedIncome', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="tobaccoUse"
                  type="checkbox"
                  checked={formData.tobaccoUse}
                  onChange={(e) => handleInputChange('tobaccoUse', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="tobaccoUse">Tobacco Use</Label>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Plans...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Best Plans
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {recommendations && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {recommendations.clientInfo.name}</p>
                    <p><strong>Age:</strong> {recommendations.clientInfo.age}</p>
                    <p><strong>State:</strong> {recommendations.clientInfo.state}</p>
                    <p><strong>Plan Type:</strong> {recommendations.clientInfo.planType}</p>
                    {recommendations.clientInfo.eligibleForSubsidies && (
                      <Badge className="bg-green-100 text-green-800">
                        Eligible for Subsidies
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recommended Plans ({recommendations.recommendations.length})</h3>
                {recommendations.recommendations.map((plan, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plan.planName}</CardTitle>
                          <CardDescription>{plan.carrier.name}</CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge className={getMetalLevelColor(plan.metalLevel)}>
                            {plan.metalLevel}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-1">Rank #{plan.rank}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-semibold">${plan.premium}/month</div>
                            {plan.estimatedSubsidy > 0 && (
                              <div className="text-sm text-green-600">
                                -${plan.estimatedSubsidy} subsidy
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-semibold">${plan.deductible.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Deductible</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{plan.rating}/5.0 Rating</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Out-of-Pocket Max:</strong> ${plan.oopMax.toLocaleString()}
                      </div>
                      
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        <strong>Why recommended:</strong> {plan.recommendationReason}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
