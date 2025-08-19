'use client';

interface FilterBarProps {
  totalPlans: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onAddFilters?: () => void;
}

export default function FilterBar({ 
  totalPlans, 
  sortBy, 
  onSortChange, 
  onAddFilters 
}: FilterBarProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Filters</span>
          <button
            onClick={onAddFilters}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Add filters
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-900">
            {totalPlans} plans (no filters added)
          </span>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
            >
              <option value="lowest-premium">Lowest premium</option>
              <option value="highest-premium">Highest premium</option>
              <option value="lowest-deductible">Lowest deductible</option>
              <option value="highest-deductible">Highest deductible</option>
              <option value="plan-name">Plan name A-Z</option>
              <option value="issuer-name">Insurance company A-Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
