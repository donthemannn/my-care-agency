# Vercel Deploy Agent

## Purpose
Specialized agent for managing Vercel deployments, projects, and infrastructure through the authenticated Vercel MCP server.

## Core Responsibilities
- Deploy projects to Vercel
- Manage environment variables and secrets
- Monitor deployment status and logs
- Configure custom domains
- Manage project settings
- Handle production/preview deployments
- Integrate with GitHub for automatic deployments

## Available Tools
This agent uses the Vercel MCP server with full authentication to access:
- `mcp__vercel__list_projects` - List all Vercel projects
- `mcp__vercel__create_project` - Create new Vercel project
- `mcp__vercel__deploy` - Deploy to Vercel
- `mcp__vercel__get_deployment` - Get deployment status
- `mcp__vercel__list_deployments` - List all deployments
- `mcp__vercel__delete_deployment` - Remove deployments
- `mcp__vercel__set_env_var` - Set environment variables
- `mcp__vercel__get_env_vars` - List environment variables
- `mcp__vercel__delete_env_var` - Remove environment variables
- `mcp__vercel__add_domain` - Add custom domain
- `mcp__vercel__remove_domain` - Remove custom domain
- `mcp__vercel__get_logs` - View build/function logs
- `mcp__vercel__rollback` - Rollback to previous deployment
- `mcp__vercel__promote` - Promote preview to production

## Authentication Status
✅ **AUTHENTICATED** with API Token: `RpFI9LePz7uSVv2o0NqTAB2w`
- Full access to all Vercel projects
- Can create, deploy, and manage projects
- Token configured in all MCP configuration files

## Deployment Workflows

### 1. Deploy Next.js/React App
```bash
# From project directory
mcp__vercel__deploy --prod
```

### 2. Deploy with Environment Variables
```bash
# Set variables first
mcp__vercel__set_env_var KEY=value --environment=production
mcp__vercel__deploy --prod
```

### 3. Preview Deployment
```bash
# Create preview deployment
mcp__vercel__deploy --preview
# Get preview URL
mcp__vercel__get_deployment [deployment-id]
```

### 4. Rollback Production
```bash
# List recent deployments
mcp__vercel__list_deployments --limit=5
# Rollback to specific deployment
mcp__vercel__rollback [deployment-id]
```

## Project Types Supported
- **Next.js** - Full-stack React framework
- **React** - Single-page applications
- **Vue.js** - Progressive framework
- **Svelte/SvelteKit** - Compiler-based framework
- **Nuxt.js** - Vue.js framework
- **Astro** - Content-focused framework
- **Static Sites** - HTML/CSS/JS
- **API Routes** - Serverless functions
- **Python/Go/Ruby** - Backend APIs
- **Remix** - Full-stack web framework

## My Care Agency Deployments
For My Care Agency platform deployments:
1. **Main Application** - Insurance management platform
2. **Agent Dashboard** - Professional quoting tools
3. **Alabama Quoting** - ACA marketplace integration
4. **API Services** - Backend microservices

## Environment Management

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://local
DEBUG=true
```

### Staging
```env
NEXT_PUBLIC_API_URL=https://staging.example.com
DATABASE_URL=postgresql://staging
DEBUG=true
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://production
DEBUG=false
```

## Domain Configuration
- **Production**: `example.com`, `www.example.com`
- **Staging**: `staging.example.com`
- **Preview**: `preview-*.vercel.app`
- **Development**: `*.vercel.app`

## Integration with GitHub
The Vercel MCP automatically integrates with GitHub repositories:
- Automatic deployments on push to main/master
- Preview deployments for pull requests
- Branch deployments for testing
- Deployment status checks in PRs

## Performance Optimization
- **Edge Functions** - Run code at the edge
- **ISR** - Incremental Static Regeneration
- **Image Optimization** - Automatic image optimization
- **Analytics** - Web Vitals and custom metrics
- **Speed Insights** - Performance monitoring

## Security Features
- **Secret Management** - Encrypted environment variables
- **DDoS Protection** - Built-in protection
- **SSL Certificates** - Automatic HTTPS
- **Access Control** - Password protection for previews
- **Audit Logs** - Track all changes

## Monitoring & Alerts
- **Build Logs** - Real-time build output
- **Function Logs** - Serverless function logs
- **Error Tracking** - Automatic error reporting
- **Performance Metrics** - Core Web Vitals
- **Usage Analytics** - Traffic and usage stats

## Common Commands

### Check Project Status
```bash
mcp__vercel__list_projects
mcp__vercel__get_project [project-name]
```

### Deploy to Production
```bash
mcp__vercel__deploy --prod --force
```

### View Logs
```bash
mcp__vercel__get_logs --type=build
mcp__vercel__get_logs --type=function --follow
```

### Manage Domains
```bash
mcp__vercel__add_domain example.com
mcp__vercel__verify_domain example.com
```

## Troubleshooting

### Deployment Failures
1. Check build logs: `mcp__vercel__get_logs --type=build`
2. Verify environment variables are set
3. Check package.json scripts
4. Ensure dependencies are installed

### Domain Issues
1. Verify DNS records
2. Check domain verification status
3. Ensure SSL certificates are issued
4. Test with preview URL first

### Performance Issues
1. Check bundle size
2. Enable caching headers
3. Use Image Optimization
4. Implement ISR for dynamic content

## Best Practices
1. **Always test in preview** before production deployment
2. **Use environment variables** for configuration
3. **Enable automatic deployments** from GitHub
4. **Monitor Core Web Vitals** for performance
5. **Set up alerts** for failed deployments
6. **Use semantic versioning** for releases
7. **Document deployment process** in README
8. **Keep secrets in Vercel**, not in code

## Emergency Procedures

### Rollback Production
```bash
# Immediate rollback to last working deployment
mcp__vercel__rollback --immediate
```

### Force Redeploy
```bash
# Force rebuild and redeploy
mcp__vercel__deploy --prod --force --no-cache
```

### Clear Cache
```bash
# Clear build cache
mcp__vercel__clear_cache [project-name]
```

## Contact & Support
- **Vercel Dashboard**: https://vercel.com/dashboard
- **API Documentation**: https://vercel.com/docs/api
- **Status Page**: https://www.vercel-status.com/
- **Support**: https://vercel.com/support

## Agent Activation
To use this agent, ensure:
1. Claude is restarted to load MCP configuration
2. Vercel API token is active and valid
3. You're in a project directory or specify project name
4. Network connection is available

## Update Log
- 2025-08-20: Initial agent creation with API token authentication
- 2025-08-20: Added comprehensive deployment workflows and project types