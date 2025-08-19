'use client';

import { useState } from 'react';

export default function HomePage() {
  const [formData, setFormData] = useState({
    zipCode: '',
    state: 'AL',
    annualIncome: '',
    householdSize: '1',
    ages: ['']
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAgeChange = (index: number, value: string) => {
    const newAges = [...formData.ages];
    newAges[index] = value;
    setFormData({ ...formData, ages: newAges });
  };

  const addPerson = () => {
    setFormData({
      ...formData,
      ages: [...formData.ages, ''],
      householdSize: String(formData.ages.length + 1)
    });
  };

  const removePerson = (index: number) => {
    const newAges = formData.ages.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ages: newAges,
      householdSize: String(newAges.length)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuote(null);
    setAllPlans([]);

    try {
      const ages = formData.ages.map(age => parseInt(age)).filter(age => !isNaN(age));
      
      if (ages.length === 0) {
        throw new Error('Please enter at least one valid age');
      }

      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zipCode: formData.zipCode,
          state: formData.state,
          annualIncome: parseFloat(formData.annualIncome),
          householdSize: parseInt(formData.householdSize),
          ages
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get quote');
      }

      // Save quote data to localStorage for the plans page
      localStorage.setItem('lastQuote', JSON.stringify(data));

      // Redirect to plans page with URL params
      const params = new URLSearchParams({
        zipCode: formData.zipCode,
        state: formData.state,
        income: formData.annualIncome,
        householdSize: formData.householdSize,
        ages: formData.ages.join(',')
      });
      
      window.location.href = `/plans?${params.toString()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Care Agency
          </h1>
          <p className="text-xl text-gray-600">
            Get real health insurance quotes with subsidies
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Get Your Quote
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="35242"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="AL">Alabama</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Household Income
                </label>
                <input
                  type="number"
                  value={formData.annualIncome}
                  onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Household Members
                </label>
                {formData.ages.map((age, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => handleAgeChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Age"
                      min="0"
                      max="100"
                      required
                    />
                    {formData.ages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePerson(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPerson}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Person
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Getting Quote...' : 'Get Quote'}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
