'use client';

import { EnhancedPlan } from '@/lib/services/planService';
import { formatCurrency, formatCurrencyDetailed } from '@/lib/utils/subsidy';

interface PlanCardProps {
  plan: EnhancedPlan;
  subsidyAmount: number;
  onSave?: (planId: string) => void;
  onCompare?: (planId: string, selected: boolean) => void;
  onViewDetails?: (planId: string) => void;
  isComparing?: boolean;
  isSaved?: boolean;
}

const METAL_COLORS = {
  bronze: 'bg-amber-600 text-white',
  silver: 'bg-gray-400 text-white',
  gold: 'bg-yellow-500 text-white',
  platinum: 'bg-gray-700 text-white'
};

export default function PlanCard({ 
  plan, 
  subsidyAmount, 
  onSave, 
  onCompare, 
  onViewDetails,
  isComparing = false,
  isSaved = false 
}: PlanCardProps) {
  const metalLevel = plan.metalLevel.toLowerCase() as keyof typeof METAL_COLORS;
  const metalColorClass = METAL_COLORS[metalLevel] || METAL_COLORS.bronze;

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {plan.issuer.logo && (
                <img 
                  src={plan.issuer.logo} 
                  alt={plan.issuer.name}
                  className="h-6 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-sm text-gray-600">{plan.issuer.name}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {plan.name}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${metalColorClass}`}>
              {plan.metalLevel}
            </span>
            {plan.hasExtraSavings && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Extra savings
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Premium</div>
            <div className="font-bold text-2xl text-gray-900">
              {subsidyAmount > 0 ? (
                <div>
                  <div className="text-lg text-gray-400 line-through">
                    {formatCurrency(plan.premium)}
                  </div>
                  <div>{formatCurrency(plan.netPremium)}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Including {formatCurrency(subsidyAmount)} tax credit
                  </div>
                </div>
              ) : (
                <div>{formatCurrency(plan.premium)}</div>
              )}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-1">Deductible</div>
            <div className="font-semibold text-lg">
              {plan.deductible?.individual ? 
                formatCurrency(plan.deductible.individual) : 
                '$0'
              }
            </div>
            <div className="text-xs text-gray-500">individual total</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-1">Out-of-pocket maximum</div>
            <div className="font-semibold text-lg">
              {plan.outOfPocketMax?.individual ? 
                formatCurrency(plan.outOfPocketMax.individual) : 
                'N/A'
              }
            </div>
            <div className="text-xs text-gray-500">individual total</div>
          </div>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-sm text-gray-600 mb-2">You pay</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span>Primary care</span>
            <span className="font-medium">$5 per visit from day 1</span>
          </div>
          <div className="flex justify-between">
            <span>Specialist care</span>
            <span className="font-medium">$30 per visit from day 1</span>
          </div>
          <div className="flex justify-between">
            <span>Urgent care</span>
            <span className="font-medium">$30 per visit from day 1</span>
          </div>
          <div className="flex justify-between">
            <span>Emergency room</span>
            <span className="font-medium">20% after deductible</span>
          </div>
          <div className="flex justify-between">
            <span>Generic drugs</span>
            <span className="font-medium">$5</span>
          </div>
          <div className="flex justify-between">
            <span>Preferred brand drugs</span>
            <span className="font-medium">$30</span>
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-sm text-gray-600 mb-2">Plan features</div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Adult Dental</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600">✕</span>
            <span>Child Dental</span>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-sm text-gray-600 mb-1">Find covered providers & drugs</div>
          <div className="flex gap-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm underline">
              Add doctors & facilities
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm underline">
              Add prescription drugs
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="flex gap-3">
          <button
            onClick={() => onViewDetails?.(plan.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Go to plan details
          </button>
          
          <button
            onClick={() => onSave?.(plan.id)}
            className={`p-2 rounded border transition-colors ${
              isSaved 
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save plan'}
          >
            <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          <label className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={isComparing}
              onChange={(e) => onCompare?.(plan.id, e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-600">Compare</span>
          </label>
        </div>
      </div>
    </div>
  );
}
