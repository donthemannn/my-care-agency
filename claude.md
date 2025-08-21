# Claude Technical Documentation - My Care Agency

## 🎯 Project Overview

This is a comprehensive **insurance management platform** with modular feature architecture. The platform includes dashboard, training, customer management, and quoting capabilities. Built with enterprise-grade security and scalability in mind.

**🚀 PRODUCTION STATUS**: Complete Clerk + Supabase integration with Alabama quoting ready for production use.

## 🏗 Platform Architecture

### Feature-Based Modular Design
```
/app/(protected)/
├── dashboard/                  # ✅ Modern card-based dashboard with shadcn/ui 
├── settings/                   # ✅ Clerk-integrated user settings
├── quoting/
│   ├── quotes/
│   │   ├── page.tsx           # ✅ Quote history hub
│   │   └── alabama/           # ✅ Complete Alabama ACA quoting
├── training/                   # 🚧 Training modules (coming soon)
├── customers/                  # 🚧 Customer management (coming soon)
├── reports/                    # 🚧 Analytics (coming soon)
└── compliance/                 # 🚧 Compliance tracking (coming soon)
```

## 🏗 Architecture Overview

### Core Services Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Quote Form    │───▶│  Quote Service  │───▶│   CMS API       │
│   (Multi-step)  │    │  (Orchestrator) │    │   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Geo Service   │───▶│  SmartyStreets  │
                       │  (ZIP→County)   │    │      API        │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Supabase      │
                       │   Database      │
                       └─────────────────┘
```

### Data Flow

1. **User Input** → Multi-step form with validation
2. **Geographic Resolution** → ZIP → County → FIPS via SmartyStreets
3. **Plan Retrieval** → FIPS → Plans via CMS Marketplace API
4. **Subsidy Calculation** → Income + Household → Federal tax credits
5. **Results Display** → Professional plan cards with pricing
6. **Database Storage** → Quote history for logged-in users

## 🔧 Technical Implementation

### Service Layer (`lib/services/`)

#### QuoteService (`quoteService.ts`)
**Purpose**: Main orchestrator for quote generation process

**Key Methods**:
- `generateQuote(formData)` - Main entry point
- `validateQuoteForm(formData)` - Input validation
- `saveQuoteToDatabase()` - Persist quotes for users
- `getUserQuotes()` - Retrieve quote history

**Error Handling**: Comprehensive try-catch with user-friendly messages

#### CmsApiService (`cmsApiService.ts`)
**Purpose**: Official CMS Marketplace API integration

**Key Features**:
- Federal Poverty Level calculations (2024 guidelines)
- Age-based premium calculations
- Subsidy eligibility determination
- Plan filtering and sorting

**API Endpoints Used**:
- `/plans` - Insurance plan data
- `/counties` - County/FIPS mapping
- `/rates` - Premium calculations

**Rate Limiting**: Follows CMS guidelines with intelligent caching

#### GeoService (`geoService.ts`)
**Purpose**: Geographic data resolution

**Key Features**:
- SmartyStreets ZIP code validation
- Alabama county FIPS mapping
- Fallback to local data for development

**Data Sources**:
- Primary: SmartyStreets US ZIP Code API
- Fallback: Local Alabama county mapping

### Database Schema (`supabase/migrations/001_init.sql`)

#### Tables

**profiles**
- User profile information
- Links to Supabase Auth users
- RLS policies for data protection

**quotes**
- Individual plan quotes (one record per plan)
- Links to user profiles
- Comprehensive plan details and pricing
- Optimized indexes for performance

#### Security
- Row Level Security (RLS) enabled
- User-specific data access policies
- Anonymous quote support for demos

### Frontend Architecture

#### Authentication Flow
```
Login Page → Clerk SignIn → Social/Email → Dashboard
     ↓
Clerk Auth → JWT Token → Protected Routes
```

**AUTHENTICATION ARCHITECTURE (August 2025)**:
- **Clerk for Authentication** - Professional UX, OAuth providers, reliable sessions
- **Supabase for Data Storage** - Quote history, user profiles, RLS policies
- **JWT Integration** - Clerk JWTs work seamlessly with Supabase RLS
- **Benefits**: Best of both worlds - great auth UX + powerful database

## 🚀 Production Ready Components

**STATUS**: All components are LIVE and production-ready:

### Alabama Quoting System (LIVE)
```
/lib/
├── cmsApiService.ts          # ✅ CMS Marketplace API integration
├── cmsClient.ts              # ✅ CMS API client
├── cmsService.ts             # ✅ CMS service layer
├── quoteEngine.ts            # ✅ Quote calculation engine
├── smartyStreetsService.ts   # ✅ ZIP → County → FIPS mapping
├── zipCodeMapping.ts         # ✅ Alabama county mappings
├── zipService.ts             # ✅ ZIP code utilities
└── services/
    └── quoteService.ts       # ✅ Database integration for quote storage

/app/(protected)/quoting/
├── quotes/
│   ├── alabama/page.tsx      # ✅ Complete Alabama quote form (LIVE)
│   ├── layout.tsx            # ✅ Quoting layout
│   └── page.tsx              # ✅ Quote history hub

/components/plans/            # ✅ Professional plan display components
```

### Production Features (LIVE)
- ✅ **Complete Alabama quote form** (67 counties, all ACA fields)
- ✅ **CMS API integration** (plans, rates, subsidies)
- ✅ **SmartyStreets integration** (ZIP validation)
- ✅ **Quote calculation engine** (premiums, subsidies, out-of-pocket)
- ✅ **Professional plan display** (metal levels, benefits)
- ✅ **Database integration** (quote history, user profiles)
- ✅ **Modern dashboard** (shadcn/ui components)
- ✅ **Clerk authentication** (OAuth, professional UX)

#### Form Architecture
- **Multi-step form** with progress indicator
- **React Hook Form** for state management
- **Zod validation** for type safety
- **Real-time validation** with error display

#### UI Components
- **Dashboard Layout** with sidebar navigation
- **Quote Form** with 5-step wizard
- **Plan Results** with professional cards
- **Settings Page** with profile management

## 📊 Data Models

### QuoteFormData Interface
```typescript
interface QuoteFormData {
  // Location & Demographics
  zipCode: string
  dateOfBirth: string
  gender: 'male' | 'female'
  
  // Financial Information
  annualIncome: number
  householdSize: number
  filingStatus: string
  
  // Eligibility Factors
  isCitizen: boolean
  isTribalMember: boolean
  employmentStatus: string
  
  // Coverage Information
  hasCurrentCoverage: boolean
  currentCoverageType?: string
  willClaimDependents: boolean
  
  // Health Factors
  tobaccoUse: boolean
  isPregnant?: boolean
  hasDisability?: boolean
}
```

### PlanResult Interface
```typescript
interface PlanResult {
  planId: string
  planName: string
  issuerName: string
  metalLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  planType: string
  
  // Pricing
  monthlyPremium: number
  subsidyAmount: number
  netPremium: number
  
  // Benefits
  deductible: number
  outOfPocketMax: number
  primaryCare: number
  specialist: number
  
  // Metadata
  county: string
  fips: string
}
```

## 🔌 API Integration Details

### CMS Marketplace API

**Base URL**: `https://marketplace.api.healthcare.gov/api/v1`

**Authentication**: 
```typescript
headers: {
  'Authorization': `Bearer ${CMS_API_KEY}`,
  'Content-Type': 'application/json'
}
```

**Key Endpoints**:

1. **Plans Endpoint**
   ```
   GET /plans?state=AL&fips={countyFips}&year=2024
   ```

2. **Counties Endpoint**
   ```
   GET /counties?state=AL
   ```

3. **Rates Endpoint**
   ```
   POST /rates
   Body: { planId, age, tobacco, income, householdSize }
   ```

### SmartyStreets API

**Service**: US ZIP Code API
**Purpose**: ZIP → County → FIPS resolution

**Request Format**:
```typescript
{
  auth_id: SMARTYSTREETS_AUTH_ID,
  auth_token: SMARTYSTREETS_AUTH_TOKEN,
  zipcode: '35201'
}
```

**Response Parsing**:
- Extract county name and FIPS code
- Handle multiple counties per ZIP
- Fallback to Alabama county mapping

## 🧪 Testing Strategy

### Test Data

**Alabama Test ZIP Codes**:
- `35201` - Birmingham, Jefferson County (Urban)
- `36101` - Montgomery, Montgomery County (Capital)
- `35801` - Huntsville, Madison County (Tech hub)
- `36602` - Mobile, Mobile County (Coastal)

**Expected Results**:
- 10-15 plans per county
- Major insurers: Blue Cross Blue Shield AL, etc.
- Premium range: $200-800/month
- Subsidy eligibility based on income

### Validation Tests

**Form Validation**:
- ZIP code format (5 digits)
- Age validation (18-120)
- Income validation (positive numbers)
- Required field enforcement

**API Integration Tests**:
- CMS API connectivity
- SmartyStreets response handling
- Error handling for API failures
- Rate limiting compliance

## 🚀 Deployment Configuration

### Environment Variables

**Required for Production**:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# CMS Marketplace API (Phase 2)
CMS_API_KEY=your_cms_api_key

# SmartyStreets (Phase 2)
SMARTYSTREETS_AUTH_ID=your_auth_id
SMARTYSTREETS_AUTH_TOKEN=your_auth_token
```

### Vercel Deployment

**Build Configuration**:
- Next.js 14 with App Router
- Automatic static optimization
- Edge runtime for API routes
- Environment variable management

**Performance Optimizations**:
- API response caching
- Static asset optimization
- Database connection pooling
- Image optimization

## 🔍 Monitoring & Debugging

### Built-in Monitoring

**Settings Page Status**:
- CMS API connectivity
- SmartyStreets API status
- Database connection health
- Alabama plan availability

**Error Logging**:
- Comprehensive error messages
- API failure handling
- User-friendly error display
- Console logging for debugging

### Production Monitoring

**Recommended Tools**:
- Sentry for error tracking
- Vercel Analytics for performance
- Supabase monitoring for database
- Custom API monitoring

## 🔒 Security Implementation

### Authentication Security
- Clerk Auth with social providers and email
- JWT token validation
- Protected route middleware
- Secure session management

### Data Security
- Row Level Security (RLS) policies
- Input validation with Zod
- SQL injection prevention
- API key protection

### API Security
- Environment variable protection
- Rate limiting compliance
- HTTPS enforcement
- CORS configuration

## 📈 Performance Optimization

### Caching Strategy
- API response caching (5-minute TTL)
- Static asset caching
- Database query optimization
- Client-side form state management

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling
- Query optimization
- RLS policy efficiency

## 🔄 Future Enhancements

### Multi-State Expansion
1. **Geographic Service Updates**
   - Add state-specific county mappings
   - Update FIPS code handling
   - Modify API calls for multiple states

2. **UI Updates**
   - State selection in forms
   - State-specific branding
   - Regional compliance features

### Advanced Features
- **AI-Powered Plan Recommendations**
- **Advanced Filtering Options**
- **Plan Comparison Tools**
- **Enrollment Integration**
- **Agent Commission Tracking**

## 🛠 Development Guidelines

### Code Standards
- TypeScript strict mode
- No explanatory comments (self-documenting code)
- Comprehensive error handling
- Consistent naming conventions

### File Organization
- Service layer separation
- Component reusability
- Type definitions centralized
- Environment-specific configurations

### Testing Requirements
- Form validation testing
- API integration testing
- Error handling verification
- User flow testing

## 📞 Troubleshooting

### Common Issues

**Quote Generation Fails**:
1. Check API keys in environment variables
2. Verify ZIP code format (5 digits)
3. Check CMS API status
4. Review browser console for errors

**Authentication Issues**:
1. Verify Supabase configuration
2. Check email delivery for magic links
3. Review RLS policies
4. Validate JWT tokens

**Database Connection Issues**:
1. Check Supabase project status
2. Verify connection string
3. Review RLS policies
4. Check migration status

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

This enables:
- Detailed API request/response logging
- Form validation error details
- Database query logging
- Performance timing information

---

**Technical Architecture by Claude**
*Built for Alabama insurance agents with enterprise-grade reliability*
