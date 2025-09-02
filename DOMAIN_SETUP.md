# Domain Setup Guide: dangol.site

## Overview
Configure custom domain `dangol.site` for DANGOL V2 deployed on Vercel.

## DNS Configuration

### Required DNS Records

Add these records to your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.):

#### Primary Domain (dangol.site)
```
Type: A
Name: @
Value: 76.76.19.19
TTL: Auto/3600
```

#### WWW Subdomain (www.dangol.site)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto/3600
```

#### Alternative: CNAME for Root Domain
If your DNS provider supports CNAME for root domain:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Auto/3600
```

### Vercel Dashboard Configuration

1. **Login to Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your project: `dangol-v2`

2. **Add Custom Domain**
   - Navigate to: Settings → Domains
   - Add domain: `dangol.site`
   - Add domain: `www.dangol.site` (redirect to apex)

3. **Verify Configuration**
   - Vercel will automatically detect DNS records
   - SSL certificate will be provisioned automatically
   - Wait for "Valid Configuration" status

## Domain Provider Specific Instructions

### Cloudflare
1. Login to Cloudflare Dashboard
2. Select domain: `dangol.site`
3. Go to DNS → Records
4. Add A record: `@` → `76.76.19.19`
5. Add CNAME record: `www` → `cname.vercel-dns.com`
6. Set Proxy status: DNS only (gray cloud)

### GoDaddy
1. Login to GoDaddy Domain Manager
2. Select domain: `dangol.site`
3. Manage DNS
4. Add A record: `@` → `76.76.19.19`
5. Add CNAME record: `www` → `cname.vercel-dns.com`

### Namecheap
1. Login to Namecheap Domain List
2. Click "Manage" next to `dangol.site`
3. Advanced DNS tab
4. Add A record: `@` → `76.76.19.19`
5. Add CNAME record: `www` → `cname.vercel-dns.com`

### Google Domains
1. Login to Google Domains
2. Select domain: `dangol.site`
3. DNS settings
4. Custom records
5. Add A record: `@` → `76.76.19.19`
6. Add CNAME record: `www` → `cname.vercel-dns.com`

## SSL Certificate

### Automatic Configuration
- Vercel automatically provisions SSL certificates
- Uses Let's Encrypt for free certificates
- Automatic renewal every 90 days
- HTTPS redirect enabled by default

### Manual Verification
1. Wait 24-48 hours for DNS propagation
2. Check certificate status in Vercel Dashboard
3. Test HTTPS access: https://dangol.site
4. Verify redirect: http://dangol.site → https://dangol.site

## Verification and Testing

### DNS Propagation Check
Use online tools to verify DNS propagation:
- https://dnschecker.org
- https://whatsmydns.net
- Command line: `dig dangol.site`

### Expected Results
```bash
# A Record Check
dig dangol.site A
# Expected: dangol.site. 3600 IN A 76.76.19.19

# CNAME Record Check  
dig www.dangol.site CNAME
# Expected: www.dangol.site. 3600 IN CNAME cname.vercel-dns.com
```

### SSL Certificate Check
```bash
# Check SSL certificate
openssl s_client -connect dangol.site:443 -servername dangol.site

# Or use online tools:
# https://www.sslchecker.com/sslchecker
```

## Custom Domain Features

### Automatic Redirects
- `www.dangol.site` → `dangol.site`
- `http://` → `https://`
- All configured automatically by Vercel

### Performance Benefits
- Edge network optimization
- Global CDN distribution
- Automatic compression
- HTTP/2 and HTTP/3 support

## Troubleshooting

### Common Issues

#### DNS Not Propagating
- Wait up to 48 hours for full propagation
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Try different DNS servers (8.8.8.8, 1.1.1.1)

#### SSL Certificate Pending
- Verify DNS records are correct
- Wait for DNS propagation to complete
- Check domain verification in Vercel Dashboard
- Contact Vercel support if stuck for >48 hours

#### Domain Configuration Error
- Double-check DNS record values
- Ensure no conflicting records exist
- Verify domain ownership in Vercel
- Remove old DNS records pointing elsewhere

### Advanced Configuration

#### Subdomain Setup
To add subdomains like `api.dangol.site`:
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

#### Apex Domain Alternative
If A record doesn't work, try ALIAS record (if supported):
```
Type: ALIAS
Name: @
Value: cname.vercel-dns.com
```

## Post-Setup Validation

### Checklist
- [ ] DNS records configured correctly
- [ ] DNS propagation completed
- [ ] Domain added in Vercel Dashboard
- [ ] SSL certificate active
- [ ] HTTPS redirect working
- [ ] WWW redirect functioning
- [ ] All pages accessible via custom domain
- [ ] Service Worker loads from custom domain
- [ ] Push notifications work with new domain

### Test URLs
After setup, verify these URLs work:
- https://dangol.site
- https://www.dangol.site (redirects to above)
- https://dangol.site/customer
- https://dangol.site/merchant
- https://dangol.site/admin
- https://dangol.site/api/health (if health check exists)

## Environment Variables Update

After domain setup, update environment variables in Vercel:

```bash
NEXT_PUBLIC_DOMAIN=https://dangol.site
NEXT_PUBLIC_BASE_URL=https://dangol.site
```

## Monitoring

### Domain Health
- Monitor SSL certificate expiration
- Check DNS record integrity
- Monitor domain performance metrics
- Set up uptime monitoring

### Analytics
- Vercel Analytics automatically tracks custom domain
- Google Analytics configured for dangol.site
- Firebase Analytics with custom domain

## Support

### Vercel Support
- Documentation: https://vercel.com/docs/concepts/projects/custom-domains
- Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

### DNS Provider Support
- Contact your DNS provider for specific configuration help
- Most providers have detailed guides for Vercel integration

## Timeline

### Expected Setup Time
- DNS configuration: 5-10 minutes
- DNS propagation: 24-48 hours
- SSL certificate: Automatic after DNS propagation
- Full availability: 24-48 hours maximum

### Immediate vs Delayed
- **Immediate**: Vercel dashboard configuration
- **Delayed**: DNS propagation, SSL certificate, global availability