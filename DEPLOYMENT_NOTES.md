# Deployment Configuration Notes

## Environment Variables for Version Tracking

Add this to your Vercel environment variables:

```
NEXT_PUBLIC_APP_VERSION=v8.1
```

This allows the version badge to be updated automatically without code changes.

## Grid Layout Fix

Fixed the 3-column layout math:
- Container width: 1024px (was 896px)
- Min column width: 280px (was 300px)
- Gap: 32px
- Math: 3×280 + 2×32 = 904px < 1024px ✅

This ensures 3 columns can actually display on desktop screens.
