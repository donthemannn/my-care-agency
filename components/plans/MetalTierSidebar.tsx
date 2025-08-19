'use client';

interface MetalTierCounts {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

interface MetalTierSidebarProps {
  counts: MetalTierCounts;
  selectedTiers: string[];
  onTierToggle: (tier: string) => void;
  hasExtraSavings: boolean;
}

const TIER_INFO = {
  bronze: {
    name: 'Bronze',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Lowest monthly premium'
  },
  silver: {
    name: 'Silver',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Moderate monthly premium'
  },
  gold: {
    name: 'Gold',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Higher monthly premium'
  },
  platinum: {
    name: 'Platinum',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Highest monthly premium'
  }
};

export default function MetalTierSidebar({ 
  counts, 
  selectedTiers, 
  onTierToggle, 
  hasExtraSavings 
}: MetalTierSidebarProps) {
  const totalPlans = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">
        {totalPlans} total plans
      </h3>
      
      <div className="space-y-3">
        {Object.entries(counts).map(([tier, count]) => {
          if (count === 0) return null;
          
          const tierInfo = TIER_INFO[tier as keyof typeof TIER_INFO];
          const isSelected = selectedTiers.includes(tier);
          
          return (
            <label
              key={tier}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected 
                  ? `${tierInfo.bgColor} ${tierInfo.borderColor}` 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onTierToggle(tier)}
                  className="rounded"
                />
                <div>
                  <div className={`font-medium ${tierInfo.color}`}>
                    {count} {tierInfo.name}
                    {tier === 'silver' && hasExtraSavings && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded font-medium">
                        Extra savings
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tierInfo.description}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {hasExtraSavings && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-1">Extra Savings</h4>
              <p className="text-sm text-green-800">
                You qualify for extra savings on out-of-pocket costs.
              </p>
              <p className="text-sm text-green-700 mt-2">
                Pick a Silver plan to get these savings.
              </p>
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline">
                See Silver plans
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Quick tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review plan category fact facts</li>
              <li>• Think about all costs, not just the premium</li>
              <li>• Consider plans with easy pricing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
