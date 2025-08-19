'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { EnhancedPlan, QuoteResponse } from '@/lib/services/planService';
import { formatCurrency } from '@/lib/utils/subsidy';
import PlanGrid from '@/components/plans/PlanGrid';
import MetalTierSidebar from '@/components/plans/MetalTierSidebar';
import FilterBar from '@/components/plans/FilterBar';
import Pagination from '@/components/plans/Pagination';

export default function PlansPage() {
  const searchParams = useSearchParams();
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('lowest-premium');
  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 10;

  // Get quote data from URL params or localStorage
  useEffect(() => {
    const loadQuoteData = async () => {
      try {
        // Try to get from URL params first
        const zipCode = searchParams.get('zipCode');
        const state = searchParams.get('state');
        const income = searchParams.get('income');
        const householdSize = searchParams.get('householdSize');
        const ages = searchParams.get('ages');

        if (zipCode && state && income && householdSize && ages) {
          // Make new quote request
          const response = await fetch('/api/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              zipCode,
              state,
              annualIncome: parseInt(income),
              householdSize: parseInt(householdSize),
              ages: ages.split(',').map(age => parseInt(age))
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch quote data');
          }

          const data = await response.json();
          setQuoteData(data);
        } else {
          // Try to get from localStorage
          const savedQuote = localStorage.getItem('lastQuote');
          if (savedQuote) {
            setQuoteData(JSON.parse(savedQuote));
          } else {
            throw new Error('No quote data found. Please start a new quote.');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    loadQuoteData();
  }, [searchParams]);

  // Filter and sort plans
  const filteredAndSortedPlans = useMemo(() => {
    if (!quoteData?.plans) return [];

    let filtered = quoteData.plans;

    // Filter by metal tiers
    if (selectedTiers.length > 0) {
      filtered = filtered.filter(plan => 
        selectedTiers.includes(plan.metalLevel.toLowerCase())
      );
    }

    // Sort plans
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'lowest-premium':
          return a.netPremium - b.netPremium;
        case 'highest-premium':
          return b.netPremium - a.netPremium;
        case 'lowest-deductible':
          return (a.deductible?.individual || 0) - (b.deductible?.individual || 0);
        case 'highest-deductible':
          return (b.deductible?.individual || 0) - (a.deductible?.individual || 0);
        case 'plan-name':
          return a.name.localeCompare(b.name);
        case 'issuer-name':
          return a.issuer.name.localeCompare(b.issuer.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [quoteData?.plans, selectedTiers, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPlans.length / plansPerPage);

  const handleTierToggle = (tier: string) => {
    setSelectedTiers(prev => 
      prev.includes(tier) 
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    );
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sorting
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-900">Loading your plans...</div>
          <div className="text-sm text-gray-600">This may take a moment</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Plans</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
          >
            Start New Quote
          </button>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 mb-2">No Quote Data</div>
          <div className="text-gray-600 mb-4">Please start a new quote to see available plans.</div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
          >
            Start New Quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">View health & dental plans</h1>
              <div className="text-sm text-gray-600 mt-1">
                Optional step: View health & dental plans • View plans
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Like a plan? Take the next step</div>
              <div className="text-xs text-gray-500 mt-1">
                Once you've saved plans you like, log in or create an account to apply.
              </div>
              <button className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium text-sm">
                Start or update an application
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Summary */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h2 className="font-semibold text-gray-900 mb-2">Viewing plans for this group</h2>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-600">You (age {quoteData.household.ages[0]})</span>
              </div>
              <div>
                <span className="text-gray-600">Your total estimated tax credit: </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(quoteData.subsidyAmount)}
                </span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 underline text-sm">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        totalPlans={filteredAndSortedPlans.length}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <MetalTierSidebar
              counts={quoteData.metalTierCounts}
              selectedTiers={selectedTiers}
              onTierToggle={handleTierToggle}
              hasExtraSavings={quoteData.fplPercentage <= 250}
            />
          </div>

          {/* Plans Grid */}
          <div className="flex-1">
            <PlanGrid
              plans={filteredAndSortedPlans}
              subsidyAmount={quoteData.subsidyAmount}
              currentPage={currentPage}
              plansPerPage={plansPerPage}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

            {/* Important Notice */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Important: Prices here are estimates - fill out an application to see exact prices
              </h3>
              <p className="text-sm text-yellow-800">
                When you fill out an application, you'll provide more detailed income and household 
                information. You'll know exactly what you'll pay when you select a plan and enroll.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
