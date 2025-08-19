'use client'

import { useState } from 'react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('quotes')
  const [formData, setFormData] = useState({
    state: 'AL',
    zipCode: '',
    age: '',
    income: '',
    householdSize: 1
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: formData.state,
          zipCode: formData.zipCode,
          householdSize: formData.householdSize,
          income: parseInt(formData.income) || 0,
          ages: [parseInt(formData.age) || 30],
          coverageType: 'individual'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to get quote`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error('Quote error:', err)
      setError(err instanceof Error ? err.message : 'Failed to get quote. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Sean Insurance Pro</h1>
            <p className="text-sm text-gray-600">Alabama Insurance Quotes</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quotes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quotes
            </button>
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai-assistant'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Assistant
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Coming Soon
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Sean Insurance Pro</h2>
              <p className="text-gray-600 mb-4">
                Get real insurance quotes for Alabama using live data from the CMS Healthcare.gov API.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Real Data</h3>
                  <p className="text-sm text-blue-700">Live CMS API integration</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Alabama Coverage</h3>
                  <p className="text-sm text-green-700">Statewide zip code support</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Accurate Subsidies</h3>
                  <p className="text-sm text-purple-700">APTC calculations</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="space-y-6">
              {/* Quote Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Your Quote</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        required
                      >
                        <option value="AL">Alabama (AL)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="35242"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="30"
                        min="18"
                        max="64"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                      <input
                        type="number"
                        value={formData.income}
                        onChange={(e) => setFormData({...formData, income: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="50000"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Household Size</label>
                      <select
                        value={formData.householdSize}
                        onChange={(e) => setFormData({...formData, householdSize: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      >
                        <option value={1}>1 person</option>
                        <option value={2}>2 people</option>
                        <option value={3}>3 people</option>
                        <option value={4}>4 people</option>
                        <option value={5}>5+ people</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Getting Your Quote...' : 'Get My Quote'}
                  </button>
                </form>
              </div>

              {/* Results */}
              {results && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Insurance Options</h3>
                  
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                    <p className="font-semibold">Great news! You may qualify for ${results.subsidyAmount}/month in subsidies!</p>
                    <p className="text-sm">Found {results.plans.length} plans in your area</p>
                  </div>

                  <div className="space-y-4">
                    {results.plans.map((plan, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-900">{plan.name}</h4>
                            <p className="text-gray-600">{plan.carrier}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">${plan.premium}/month</p>
                            <p className="text-sm text-gray-500">{plan.metalTier} plan</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium">Monthly Premium</p>
                            <p className="font-semibold text-gray-900">${plan.premium}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Healthcare Deductible</p>
                            <p className="font-semibold text-gray-900">
                              {plan.deductible ? `$${plan.deductible.toLocaleString()}` : 'A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Drug Deductible</p>
                            <p className="font-semibold text-gray-900">A</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Out-of-Pocket Max</p>
                            <p className="font-semibold text-gray-900">
                              {plan.outOfPocketMax ? `$${plan.outOfPocketMax.toLocaleString()}` : 'A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Doctor Visits</p>
                            <p className="font-semibold text-gray-900">A</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Specialist Visits</p>
                            <p className="font-semibold text-gray-900">A</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Generic Drugs</p>
                            <p className="font-semibold text-gray-900">A</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-assistant' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Assistant</h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">
                  Our AI assistant will help you find the perfect insurance plan and answer your questions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
