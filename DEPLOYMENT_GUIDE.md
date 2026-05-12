# Deployment Guide — Saravanakumar AI Spend Audit

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase account
- Resend account
- Deployment platform (Vercel or Render)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the project URL and API keys

### 1.2 Run Database Migrations
1. Go to Supabase SQL Editor
2. Run migrations in order:
   ```sql
   -- First: 001_initial_schema.sql
   -- Second: 002_leads_schema.sql
   -- Third: 003_audit_tracking_and_referrals.sql
   ```

### 1.3 Enable Row Level Security (RLS)
- Supabase automatically enables RLS on new tables
- Verify in Supabase Dashboard → Authentication → Policies

---

## Step 2: Resend Setup

### 2.1 Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Create account
3. Verify domain (for production emails)

### 2.2 Generate API Key
1. Settings → API Keys
2. Create new API key
3. Copy and save (you'll only see it once)

### 2.3 Verify Email Domain (Production Only)
1. Resend → Domains
2. Add your domain
3. Add DNS records provided by Resend
4. Wait for verification

---

## Step 3: Local Development

### 3.1 Clone & Install
```bash
git clone https://github.com/Saravanakumar-v-dev/ai-spend-audit.git
cd ai-spend-audit
npm install
```

### 3.2 Configure Environment
```bash
cp .env.example .env.local
```

### 3.3 Fill in .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3.4 Run Local Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3.5 Test Locally
1. Fill out audit form
2. Check `/api/leads` console logs (email will show in logs if no Resend key)
3. Verify lead saved to Supabase
4. Test share URL generation

---

## Step 4: Deploy to Vercel

### 4.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Connect GitHub repository
4. Select `ai-spend-audit` project

### 4.2 Set Environment Variables
In Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL = https://your-domain.vercel.app
```

### 4.3 Deploy
1. Vercel automatically deploys on git push to main
2. Wait for build to complete
3. Visit your deployment URL

### 4.4 Verify Deployment
- Check live site loads
- Test audit form submission
- Verify email sends (check Resend dashboard)
- Check Supabase for new lead

---

## Step 5: Deploy to Render (Alternative)

### 5.1 Connect Repository
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub
4. Select repository

### 5.2 Configure Build & Start
- Build Command: `npm run build`
- Start Command: `npm run start`
- Node Version: 20 (or latest)

### 5.3 Set Environment Variables
Environment → Add from file or manually:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://your-render-domain.onrender.com
NODE_ENV=production
```

### 5.4 Deploy
1. Click "Create Web Service"
2. Wait for build & deploy
3. Verify live site

---

## Step 6: Domain Configuration

### 6.1 For Vercel
1. Project Settings → Domains
2. Add custom domain
3. Follow DNS instructions
4. Wait for verification (usually instant)

### 6.2 For Render
1. Project Settings → Custom Domains
2. Add domain
3. Update DNS to point to Render
4. Wait for SSL certificate

### 6.3 Update Environment Variable
Once domain is live, update `.env`:
```
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

Redeploy to apply changes.

---

## Step 7: Email Configuration (Production)

### 7.1 Resend Domain Verification
1. Add your domain to Resend
2. Add DNS records:
   - SPF: `v=spf1 include:sendingdomain.resend.dev ~all`
   - DKIM: Records provided by Resend
3. Verify in Resend dashboard

### 7.2 Update Email Sender
In `src/lib/email.ts`, update:
```typescript
from: "Saravanakumar AI Audit <audit@your-domain.com>"
```

### 7.3 Test Email Sending
1. Submit audit form
2. Check Resend dashboard → Activity
3. Verify email delivered
4. Check recipient inbox

---

## Step 8: Monitoring & Logs

### 8.1 Vercel Logs
```bash
vercel logs --project ai-spend-audit
```

### 8.2 Supabase Logs
- Dashboard → Logs
- Check for RLS policy errors
- Monitor query performance

### 8.3 Resend Logs
- Dashboard → Activity
- Monitor email delivery rates
- Check bounce/complaint rates

### 8.4 Rate Limit Monitoring
In production, implement proper monitoring:
- Track rate limit rejections
- Alert on suspicious patterns (DDoS)
- Consider upgrading to Redis-based rate limiting

---

## Step 9: Launch Checklist

### Before Public Launch
- [ ] All environment variables set correctly
- [ ] Email confirmation works
- [ ] Rate limiting active
- [ ] OG tags working (use cardvalidator.com)
- [ ] Referral system tested
- [ ] Share URLs generate correctly
- [ ] Blog post published
- [ ] Twitter thread scheduled
- [ ] Portfolio link working
- [ ] Analytics set up (if using PostHog)

### Launch Day
- [ ] Publish blog post
- [ ] Post Twitter thread
- [ ] Share on Product Hunt (optional)
- [ ] Send emails to warm list
- [ ] Monitor for errors/issues
- [ ] Respond to comments/questions

### Post-Launch
- [ ] Monitor Supabase for performance
- [ ] Check email delivery rates (>95%)
- [ ] Review user feedback
- [ ] Optimize based on metrics
- [ ] Plan next features

---

## Troubleshooting

### Email Not Sending
1. Check `RESEND_API_KEY` is set correctly
2. Verify email format is valid
3. Check Resend dashboard for errors
4. For production, verify domain DNS records

### Rate Limiting Not Working
1. Check `x-forwarded-for` header from proxy
2. Test with different IPs
3. Verify rate limit code in `/api/leads`
4. Monitor rate limit store for memory leaks

### Supabase Connection Issues
1. Verify `NEXT_PUBLIC_SUPABASE_URL` matches project
2. Check API keys are correct
3. Verify RLS policies allow operations
4. Check network connectivity

### OG Tags Not Working
1. Use cardvalidator.com to debug
2. Verify metadata generation in `/share/[id]`
3. Check image URL is accessible
4. Wait 24 hours for cache invalidation

### Referral System Issues
1. Check `referral_code` generating in leads
2. Verify referral codes are unique
3. Test `/api/referral` POST/GET
4. Monitor for duplicate codes

---

## Performance Optimization

### 1. Image Optimization
- Use Vercel's built-in image optimization
- Add OG image at `/public/og-image.png`

### 2. Database Optimization
- Monitor slow queries in Supabase
- Add indexes as needed
- Consider caching frequent queries

### 3. Rate Limit Optimization
- Upgrade to Redis for distributed rate limiting:
  ```bash
  npm install ioredis
  ```
- Use Upstash Redis (free tier available)

### 4. Email Optimization
- Batch email sends during off-peak hours
- Monitor email delivery rates
- A/B test subject lines

---

## Scaling Considerations

### When You Hit 100 Audits/Day
- Monitor Supabase usage
- Consider Supabase pricing tier upgrade
- Implement caching layer

### When You Hit 1000 Audits/Day
- Upgrade to Redis for rate limiting
- Consider CDN for static assets
- Implement database connection pooling

### Future Integrations
- Slack notifications for high-savings cases
- Admin dashboard for lead review
- Email list management (Mailchimp/Segment)
- Analytics dashboard (Plausible/Mixpanel)

---

## Support & Resources

- **Documentation**: See README.md
- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Issue Tracking**: GitHub Issues

---

**Deployment complete! Ready for launch.** 🚀
