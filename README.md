# My Care Agency - Insurance Management Platform

A professional insurance management system built for Alabama insurance agents. Features a comprehensive ACA quoting system with real-time CMS Marketplace API integration.

## 🚀 Current Status

### ✅ **Phase 1: Core Platform (LIVE)**
- **Dashboard** - Central management hub with system monitoring
- **Authentication** - Clerk-powered login with Google/GitHub OAuth
- **Settings** - User profile and system configuration

### 🚧 **Phase 2: Alabama Quoting (IN DEVELOPMENT)**
- **Quote Engine** - Multi-step ACA quote form with real CMS data
- **Geographic Services** - ZIP → County → FIPS mapping via SmartyStreets
- **Subsidy Calculator** - Federal premium tax credit calculations
- **Plan Display** - Professional plan cards with pricing and benefits

### 📋 **Coming Soon**
- **Customers** - Client management and relationship tracking
- **Plan Finder** - Advanced plan comparison tools
- **Reports** - Analytics and commission tracking
- **Training** - Insurance education modules
- **AI Assistant** - Intelligent support system

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk with OAuth providers (Google, GitHub, Email)
- **Styling**: Tailwind CSS with professional healthcare.gov-inspired design
- **Forms**: React Hook Form with Zod validation
- **APIs**: CMS Marketplace API, SmartyStreets API
- **Deployment**: Vercel with automatic deployments

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd my-care-agency
npm install
```

### 2. Environment Setup
Create `.env.local` with your Clerk keys:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# CMS Marketplace API (Phase 2)
CMS_API_KEY=your_cms_api_key

# SmartyStreets API (Phase 2)
SMARTYSTREETS_AUTH_ID=your_auth_id
SMARTYSTREETS_AUTH_TOKEN=your_auth_token
```

### 3. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Prerequisites

1. **Clerk Project**: Create at [clerk.com](https://clerk.com) and get your API keys
2. **CMS API Key**: From [developer.cms.gov](https://developer.cms.gov) (for Phase 2)
3. **SmartyStreets Account**: From [smartystreets.com](https://smartystreets.com) (for Phase 2)
4. **Alabama Insurance License** (for production use)

## 📖 How It Works

### Quote Generation Process

1. **User Input**: Multi-step form captures all ACA-required information
2. **Geographic Lookup**: ZIP code → County → FIPS using SmartyStreets
3. **Plan Retrieval**: FIPS code → Available plans via CMS Marketplace API
4. **Subsidy Calculation**: Income + household size → Federal premium tax credits
5. **Results Display**: Professional plan cards with pricing and benefits

### API Integration

#### CMS Marketplace API
- **Endpoint**: `https://marketplace.api.healthcare.gov/api/v1`
- **Authentication**: API key in headers
- **Rate Limits**: Follows CMS guidelines
- **Caching**: Intelligent caching to minimize API calls

#### SmartyStreets API
- **Service**: US ZIP Code API
- **Purpose**: Accurate ZIP → County → FIPS mapping
- **Fallback**: Local Alabama county mapping for offline development

## 🏗 Project Structure

```
My Care Agency (Insurance Management Platform)
├── Dashboard (main hub) - Phase 1 ✅
│   ├── app/dashboard/              # Main dashboard view
│   ├── components/                 # Dashboard UI components
│   └── middleware.ts               # Clerk authentication
│
├── Quoting - Phase 2 🚧
│   ├── Alabama
│   │   ├── app/quotes/            # Quote form and results
│   │   ├── api/quote/             # Quote generation API
│   │   └── lib/services/
│   │       ├── cmsApiService.ts   # CMS Marketplace API
│   │       ├── geoService.ts      # Geographic services
│   │       └── quoteService.ts    # Main quote orchestration
│   └── [Other States - Coming Soon]
│
├── Settings - Phase 1 ✅
│   ├── app/settings/              # User settings pages
│   └── components/                # Settings UI components
│
├── Authentication - Phase 1 ✅
│   ├── app/(auth)/sign-in/        # Clerk login pages
│   ├── app/(auth)/sso-callback/   # OAuth callback handler
│   └── lib/clerkClient.ts         # Auth utilities
│
└── COMING SOON:
    ├── Training - TBD
    ├── AI Assistant - TBD
    ├── Customers - TBD
    ├── Plan Finder - TBD
    ├── Reports - TBD
    └── Compliance - TBD

Technical Foundation:
- Framework: Next.js 14 with App Router
- Authentication: Clerk with OAuth providers
- Types: TypeScript definitions in lib/types.ts
- Layout: Root layout with ClerkProvider
- Components: Reusable UI in components/
```

## 🔧 Configuration

### CMS API Configuration
The application follows official CMS API guidelines:

- **Base URL**: `https://marketplace.api.healthcare.gov/api/v1`
- **Required Headers**: API key authentication
- **Endpoints Used**:
  - `/plans` - Get available insurance plans
  - `/counties` - Get county/FIPS data
  - `/rates` - Get plan rates and pricing

### Authentication Configuration
- **Clerk Provider**: Configured in app/layout.tsx
- **Protected Routes**: Middleware protects /dashboard and /settings
- **OAuth Providers**: Google, GitHub, Email/Password enabled
- **Session Management**: Automatic JWT handling

## 🧪 Testing

### Test Alabama Quotes
Use these test ZIP codes for development:

- **35201** (Birmingham, Jefferson County)
- **36101** (Montgomery, Montgomery County)  
- **35801** (Huntsville, Madison County)
- **36602** (Mobile, Mobile County)

### Expected Results
- Should return 10-15 plans per county
- Plans from major Alabama insurers (Blue Cross Blue Shield, etc.)
- Accurate subsidy calculations based on income

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- Clerk API keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY)
- CMS API key (for Phase 2)
- SmartyStreets credentials (for Phase 2)

## 📊 Monitoring

### Built-in Monitoring
- **API Status**: Settings page shows connection status
- **Error Logging**: Comprehensive error handling and logging
- **Performance**: Optimized API calls with caching

### Production Monitoring
Consider adding:
- Sentry for error tracking
- Vercel Analytics for performance
- Clerk Dashboard for authentication metrics

## 🔒 Security

### Authentication
- **Clerk Authentication**: Professional login/signup flows with OAuth providers
- **Session Management**: Secure JWT-based sessions with automatic refresh
- **Protected Routes**: Middleware ensures authentication for /dashboard and /settings
- **OAuth Security**: Google and GitHub integration with secure callbacks

### API Security
- **Environment Variables**: All API keys stored securely
- **Rate Limiting**: Follows CMS API guidelines
- **Input Validation**: Zod schema validation on all inputs

## 📈 Scaling

### Multi-State Expansion
**Current Architecture**: `/app/(dashboard)/features/quoting/[state]/`

**Active States**:
- ✅ **Alabama** - `/features/quoting/alabama/` (LIVE)

**Planned States**:
- 🚧 **Texas** - `/features/quoting/texas/` (Week 2)
- 🚧 **Florida** - `/features/quoting/florida/` (Week 3)

**To Add New States**:
1. Create `/features/quoting/[state]/` directory
2. Add state-specific county mappings
3. Update CMS API integration for state
4. Add state to dashboard navigation

### Performance Optimization
- **Caching**: Redis for API response caching
- **CDN**: Static asset optimization
- **Database**: Query optimization and indexing

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Make changes with comprehensive tests
3. Update documentation
4. Submit pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js
- **Prettier**: Code formatting
- **No Comments**: Clean, self-documenting code

## 📞 Support

### For Technical Issues
- Check API status in Settings page
- Review browser console for errors
- Verify environment variables

### For Business Questions
- Ensure proper Alabama insurance licensing
- Review CMS API terms of service
- Consult with compliance team

## 📄 License

This project is proprietary software for My Care Agency. All rights reserved.

---

**Built with ❤️ for Alabama insurance agents**

*Last updated: August 2024*
