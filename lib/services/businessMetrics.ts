interface BusinessMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  newCustomers: number;
  callVolume: number;
  conversionRate: number;
  avgPolicyValue: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  customers: number;
  calls: number;
}

interface PolicyTypeData {
  name: string;
  value: number;
  color: string;
}

interface TopPerformer {
  name: string;
  policies: number;
  revenue: number;
}

export async function getBusinessMetrics(): Promise<BusinessMetrics | null> {
  try {
    const response = await fetch('/api/business-metrics');
    if (!response.ok) {
      throw new Error('Failed to fetch business metrics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    return null;
  }
}

export async function getMonthlyData(): Promise<MonthlyData[] | null> {
  try {
    const response = await fetch('/api/business-metrics/monthly');
    if (!response.ok) {
      throw new Error('Failed to fetch monthly data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    return null;
  }
}

export async function getPolicyTypeData(): Promise<PolicyTypeData[] | null> {
  try {
    const response = await fetch('/api/business-metrics/policy-types');
    if (!response.ok) {
      throw new Error('Failed to fetch policy type data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching policy type data:', error);
    return null;
  }
}

export async function getTopPerformers(): Promise<TopPerformer[] | null> {
  try {
    const response = await fetch('/api/business-metrics/top-performers');
    if (!response.ok) {
      throw new Error('Failed to fetch top performers');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return null;
  }
}
