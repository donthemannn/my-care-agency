import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  BookOpen, 
  Settings, 
  Shield,
  FileText,
  BarChart3,
  Search,
  MessageCircle,
  ClipboardList
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href?: string
  icon: any
  description: string
  highlight?: boolean
  disabled?: boolean
}

export const ACTIVE_NAVIGATION: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Training',
    href: '/training',
    icon: BookOpen,
    description: 'Insurance training modules'
  },
  {
    name: 'AI Assistant',
    href: '/chat',
    icon: MessageCircle,
    description: 'Get help from AI assistant'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account and preferences'
  }
]

export const INACTIVE_NAVIGATION: NavigationItem[] = [
  {
    name: 'Customers',
    icon: Users,
    description: 'Manage customer relationships',
    disabled: true
  },
  {
    name: 'Quotes',
    icon: Calculator,
    description: 'Generate and compare quotes',
    disabled: true
  },
  {
    name: 'Plan Finder',
    icon: Search,
    description: 'Find best plans for clients',
    disabled: true
  },
  {
    name: 'Reports',
    icon: BarChart3,
    description: 'Analytics and reporting',
    disabled: true
  },
  {
    name: 'Compliance',
    icon: Shield,
    description: 'State and federal compliance',
    disabled: true
  }
]

export const ALL_NAVIGATION = [...ACTIVE_NAVIGATION, ...INACTIVE_NAVIGATION]
