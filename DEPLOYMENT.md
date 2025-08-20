# 🚀 Deployment Checklist - My Care Agency

## Pre-Deployment Checklist

### ✅ **Environment Setup**
- [ ] All API keys obtained and tested
- [ ] Supabase project created and configured
- [ ] Database migrations applied
- [ ] Environment variables documented

### ✅ **Code Quality**
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Build process successful (`npm run build`)
- [ ] No console errors in production build

### ✅ **Testing**
- [ ] Quote form validation working
- [ ] Alabama ZIP codes tested (35201, 36101, 35801, 36602)
- [ ] Authentication flow tested
- [ ] Database operations verified
- [ ] API integrations confirmed

## 🔧 Environment Variables

### Required for Production

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CMS Marketplace API
CMS_API_KEY=your_cms_api_key_here

# SmartyStreets API
SMARTYSTREETS_AUTH_ID=your_smartystreets_auth_id
SMARTYSTREETS_AUTH_TOKEN=your_smartystreets_auth_token
```

### Optional (for enhanced features)
```env
# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Error Tracking
SENTRY_DSN=your_sentry_dsn

# Custom Domain
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🌐 Vercel Deployment (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# From project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: my-care-agency
# - Directory: ./
# - Override settings? No
```

### Step 4: Configure Environment Variables
In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required environment variables
3. Set environment to "Production"
4. Save and redeploy

### Step 5: Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable SSL (automatic)

## 🗄️ Database Setup

### Supabase Production Setup

1. **Create Production Project**
   ```bash
   # Go to supabase.com
   # Create new project
   # Note project URL and anon key
   ```

2. **Run Migrations**
   ```sql
   -- Copy and run supabase/migrations/001_init.sql
   -- in Supabase SQL Editor
   ```

3. **Configure RLS Policies**
   ```sql
   -- Verify Row Level Security is enabled
   -- Test policies with sample data
   ```

4. **Set Up Backup**
   - Enable automatic backups in Supabase dashboard
   - Configure backup retention policy

## 🔒 Security Configuration

### Production Security Checklist

- [ ] **Environment Variables**: All sensitive data in environment variables
- [ ] **HTTPS**: SSL certificate configured and enforced
- [ ] **CORS**: Proper CORS configuration for API routes
- [ ] **RLS**: Row Level Security enabled and tested
- [ ] **API Keys**: Restricted to production domains only
- [ ] **Rate Limiting**: CMS API rate limits respected

### API Key Security

1. **CMS API Key**
   - Restrict to production domain
   - Monitor usage in CMS developer portal
   - Set up usage alerts

2. **SmartyStreets API**
   - Configure domain restrictions
   - Monitor credit usage
   - Set up billing alerts

3. **Supabase**
   - Use anon key for client-side
   - Service role key only for server-side operations
   - Configure RLS policies properly

## 📊 Monitoring Setup

### Built-in Monitoring
- Settings page shows API status
- Console logging for debugging
- Error boundaries for React components

### Recommended External Monitoring

1. **Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

2. **Sentry Error Tracking**
   ```bash
   npm install @sentry/nextjs
   ```

3. **Uptime Monitoring**
   - UptimeRobot for endpoint monitoring
   - Pingdom for performance monitoring

## 🧪 Post-Deployment Testing

### Functional Testing
- [ ] Login/logout flow
- [ ] Quote generation for all test ZIP codes
- [ ] Form validation and error handling
- [ ] Database operations (save/retrieve quotes)
- [ ] Settings page functionality

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 5 seconds
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Alabama-Specific Testing
- [ ] Test major Alabama cities:
  - Birmingham (35201)
  - Montgomery (36101)
  - Huntsville (35801)
  - Mobile (36602)
  - Tuscaloosa (35401)
- [ ] Verify county FIPS mapping accuracy
- [ ] Confirm plan availability and pricing

## 🚨 Rollback Plan

### If Deployment Fails

1. **Immediate Rollback**
   ```bash
   # Vercel automatic rollback
   vercel --prod --rollback
   ```

2. **Database Rollback**
   - Restore from Supabase backup
   - Revert migration if needed

3. **DNS Rollback**
   - Point domain back to previous deployment
   - Update DNS records if necessary

## 📈 Performance Optimization

### Production Optimizations

1. **Caching Strategy**
   - API response caching (5-minute TTL)
   - Static asset caching
   - Database query optimization

2. **Image Optimization**
   - Next.js automatic image optimization
   - WebP format support
   - Responsive images

3. **Bundle Optimization**
   - Tree shaking enabled
   - Code splitting
   - Lazy loading for components

## 🔄 Maintenance Schedule

### Daily
- [ ] Monitor error logs
- [ ] Check API usage quotas
- [ ] Verify system status

### Weekly
- [ ] Review performance metrics
- [ ] Update dependencies (security patches)
- [ ] Backup verification

### Monthly
- [ ] Full system testing
- [ ] Security audit
- [ ] Performance optimization review
- [ ] API key rotation (if required)

## 📞 Support Contacts

### Technical Support
- **Vercel Support**: vercel.com/support
- **Supabase Support**: supabase.com/support
- **CMS API Support**: developer.cms.gov/support

### Emergency Contacts
- **Primary Developer**: [Your contact info]
- **System Administrator**: [Admin contact]
- **Business Owner**: [Business contact]

## 📋 Go-Live Checklist

### Final Pre-Launch Steps
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Monitoring tools active
- [ ] Backup systems verified
- [ ] Team notified of go-live

### Launch Day
- [ ] Deploy to production
- [ ] Verify all functionality
- [ ] Monitor for errors
- [ ] Test with real Alabama ZIP codes
- [ ] Confirm quote generation working
- [ ] Update team on status

### Post-Launch (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check API usage
- [ ] Verify user registrations
- [ ] Monitor performance metrics
- [ ] Collect user feedback

---

**Deployment Guide by Claude**
*Enterprise-ready Alabama insurance quote system*

*Last updated: August 2024*
