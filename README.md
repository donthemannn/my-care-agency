# My Care Agency - Insurance Management Platform

A comprehensive insurance management system with multiple features including dashboard, training, customer management, and quoting tools. Built with modular architecture for easy feature expansion.

## 🚀 Platform Features

### ✅ **Active Features**
- **Dashboard** - Central management hub with activity overview
- **Training** - Insurance training modules and progress tracking
- **AI Assistant** - Intelligent support and guidance system
- **Settings** - User profile and system configuration

### 🚧 **Coming Soon Features**
- **Customers** - Client management and relationship tracking
- **Quotes** - Multi-state ACA insurance quoting system
- **Plan Finder** - Insurance plan discovery and comparison tools
- **Reports** - Analytics, performance metrics, and compliance reporting
- **Compliance** - Regulatory compliance tracking and management

### 📋 **Quotes Feature Details** (When Enabled)
The Quotes feature will include:
- **Multi-step quote form** with all required ACA questions
- **Real-time validation** using Zod schema validation
- **CMS Marketplace API integration** following official guidelines
- **SmartyStreets integration** for accurate ZIP → County → FIPS mapping
- **Federal subsidy calculations** with 2024 poverty guidelines
- **Professional plan display** with metal levels, premiums, and benefits

#### State Coverage (Inside Quotes)
- **Alabama (FIRST)** - All 67 counties with accurate FIPS mapping
- **Texas (PLANNED)** - Future expansion target
- **Florida (PLANNED)** - Future expansion target
- **Additional States** - Up to 13+ states total

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk (switched from Supabase for reliability)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Styling**: Tailwind CSS with professional healthcare.gov-inspired design
- **Forms**: React Hook Form with Zod validation
- **APIs**: CMS Marketplace API, SmartyStreets API
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before running this application, you need:

1. **API Keys**:
   - CMS Marketplace API key from [developer.cms.gov](https://developer.cms.gov)
   - SmartyStreets API credentials from [smartystreets.com](https://smartystreets.com)

2. **Clerk Project**:
   - Create a project at [clerk.com](https://clerk.com)
   - Note your publishable key and secret key

3. **Alabama Insurance License** (for production use)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd my-care-agency
npm install
```

### 2. Environment Setup
Create `.env.local` with your API keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# CMS Marketplace API (Phase 2)
CMS_API_KEY=your_cms_api_key

# SmartyStreets API (Phase 2)
SMARTYSTREETS_AUTH_ID=your_auth_id
SMARTYSTREETS_AUTH_TOKEN=your_auth_token
```

### 3. Database Setup
Run the Supabase migration:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in supabase/migrations/001_init.sql
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

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
my-care-agency/
├── app/                          # Next.js App Router
│   ├── (auth)/login/            # Authentication pages
│   ├── (dashboard)/             # Protected dashboard pages
│   │   ├── dashboard/           # Main dashboard
│   │   ├── quotes/              # Quote form and results
│   │   └── settings/            # User settings
│   ├── api/quote/               # Quote generation API
│   └── layout.tsx               # Root layout
├── lib/                         # Core business logic
│   ├── services/                # Service layer
│   │   ├── cmsApiService.ts     # CMS Marketplace API
│   │   ├── geoService.ts        # Geographic services
│   │   └── quoteService.ts      # Main quote orchestration
│   ├── types.ts                 # TypeScript definitions
│   └── supabaseClient.ts        # Database client
├── supabase/migrations/         # Database schema
└── components/                  # Reusable UI components
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

### Database Schema
- **profiles**: User profile information
- **quotes**: Insurance quote history with RLS policies
- **Indexes**: Optimized for quote retrieval and user queries

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
- Supabase credentials
- CMS API key
- SmartyStreets credentials

## 📊 Monitoring

### Built-in Monitoring
- **API Status**: Settings page shows connection status
- **Error Logging**: Comprehensive error handling and logging
- **Performance**: Optimized API calls with caching

### Production Monitoring
Consider adding:
- Sentry for error tracking
- Vercel Analytics for performance
- Supabase monitoring for database health

## 🔒 Security

### Authentication
- **Clerk Authentication**: Professional login/signup flows with social providers
- **Session Management**: Secure JWT-based sessions
- **Protected Routes**: Middleware ensures authentication

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
