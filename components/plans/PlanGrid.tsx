'use client';

import { useState } from 'react';
import { EnhancedPlan } from '@/lib/services/planService';
import PlanCard from './PlanCard';

interface PlanGridProps {
  plans: EnhancedPlan[];
  subsidyAmount: number;
  currentPage: number;
  plansPerPage: number;
}

export default function PlanGrid({ 
  plans, 
  subsidyAmount, 
  currentPage, 
  plansPerPage 
}: PlanGridProps) {
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set());
  const [comparingPlans, setComparingPlans] = useState<Set<string>>(new Set());

  const startIndex = (currentPage - 1) * plansPerPage;
  const endIndex = startIndex + plansPerPage;
  const currentPlans = plans.slice(startIndex, endIndex);

  const handleSave = (planId: string) => {
    const newSaved = new Set(savedPlans);
    if (newSaved.has(planId)) {
      newSaved.delete(planId);
    } else {
      newSaved.add(planId);
    }
    setSavedPlans(newSaved);
  };

  const handleCompare = (planId: string, selected: boolean) => {
    const newComparing = new Set(comparingPlans);
    if (selected && newComparing.size < 3) {
      newComparing.add(planId);
    } else if (!selected) {
      newComparing.delete(planId);
    }
    setComparingPlans(newComparing);
  };

  const handleViewDetails = (planId: string) => {
    // Navigate to plan details page
    window.open(`/plan/${planId}`, '_blank');
  };

  if (currentPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No plans found matching your criteria</div>
        <div className="text-gray-400 text-sm mt-2">Try adjusting your filters</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentPlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          subsidyAmount={subsidyAmount}
          onSave={handleSave}
          onCompare={handleCompare}
          onViewDetails={handleViewDetails}
          isComparing={comparingPlans.has(plan.id)}
          isSaved={savedPlans.has(plan.id)}
        />
      ))}
      
      {comparingPlans.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {comparingPlans.size} plan{comparingPlans.size !== 1 ? 's' : ''} selected for comparison
              </span>
              <button
                onClick={() => setComparingPlans(new Set())}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors"
              onClick={() => {
                // Navigate to comparison page
                const planIds = Array.from(comparingPlans).join(',');
                window.open(`/compare?plans=${planIds}`, '_blank');
              }}
            >
              Compare plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
