export const FEATURES = {
  QUOTING_ALABAMA: process.env.NEXT_PUBLIC_ENABLE_QUOTING === 'true',
  TRAINING: false,
  AI_ASSISTANT: false,
  CUSTOMERS: false,
  PLAN_FINDER: false,
  REPORTS: false,
  COMPLIANCE: false,
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature]
}

export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    enabled: true,
    phase: 1,
  },
  {
    name: 'Quoting',
    href: '/quoting',
    enabled: FEATURES.QUOTING_ALABAMA,
    phase: 2,
    comingSoon: !FEATURES.QUOTING_ALABAMA,
  },
  {
    name: 'Settings',
    href: '/settings',
    enabled: true,
    phase: 1,
  },
  {
    name: 'Training',
    href: '/training',
    enabled: FEATURES.TRAINING,
    phase: 3,
    comingSoon: true,
  },
  {
    name: 'AI Assistant',
    href: '/ai-assistant',
    enabled: FEATURES.AI_ASSISTANT,
    phase: 4,
    comingSoon: true,
  },
  {
    name: 'Customers',
    href: '/customers',
    enabled: FEATURES.CUSTOMERS,
    phase: 5,
    comingSoon: true,
  },
  {
    name: 'Plan Finder',
    href: '/plan-finder',
    enabled: FEATURES.PLAN_FINDER,
    phase: 6,
    comingSoon: true,
  },
  {
    name: 'Reports',
    href: '/reports',
    enabled: FEATURES.REPORTS,
    phase: 7,
    comingSoon: true,
  },
  {
    name: 'Compliance',
    href: '/compliance',
    enabled: FEATURES.COMPLIANCE,
    phase: 8,
    comingSoon: true,
  },
]
