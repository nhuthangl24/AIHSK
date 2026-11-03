# Classnia AI SaaS Deployment Guide

This guide details the steps required to deploy Classnia AI to production environments such as Vercel, Railway, Render, AWS, or Docker containers.

---

## 1. Environment Variables Configuration

Copy `.env.example` to your production environment configuration and populate the required secrets:

```env
# Database (PostgreSQL Connection String)
DATABASE_URL="postgresql://user:password@db-host.internal:5432/aihsk_saas?schema=public&sslmode=require"

# Application URL & Security
NEXT_PUBLIC_APP_URL="https://app.classnia.com"
JWT_SECRET="generate-a-secure-random-64-character-hex-string-for-production"
SESSION_EXPIRY_DAYS="7"

# AI LLM Providers (Optional for cloud LLMs; Built-in engine works without keys)
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."
AI_DEFAULT_MODEL="gpt-4o-mini"

# Speech-to-Text & Text-to-Speech
AZURE_SPEECH_KEY=""
AZURE_SPEECH_REGION="eastus"

# S3-Compatible Object Storage (AWS S3 / Cloudflare R2 / MinIO)
# Leave empty for local filesystem storage (/public/uploads/audio/)
S3_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
S3_BUCKET="aihsk-audio-storage"
S3_ACCESS_KEY="r2_access_key_id"
S3_SECRET_KEY="r2_secret_access_key"
S3_REGION="auto"

# SaaS Billing (Stripe)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Node Environment
NODE_ENV="production"
```

---

## 2. Managed PostgreSQL Setup

1. Provision a PostgreSQL 15+ database on **Supabase**, **Neon**, **AWS RDS**, or **Railway**.
2. Run database schema sync:
   ```bash
   npx prisma db push
   ```
3. Run the initial data seed to populate standard plans, rubrics, and templates:
   ```bash
   node scripts/seed.mjs
   ```

---

## 3. Vercel Deployment

1. Connect your GitHub repository to **Vercel**.
2. Framework Preset: **Next.js**.
3. Build Command: `npm run build`.
4. Output Directory: `.next`.
5. Install Command: `npm install`.
6. Add the environment variables specified in Section 1.
7. Click **Deploy**.

---

## 4. Audio Storage (S3 / Cloudflare R2)

When running in serverless environments (like Vercel), local disk writes are ephemeral. Configure an S3-compatible bucket (such as Cloudflare R2 or AWS S3):
1. Create a private bucket: `aihsk-audio-storage`.
2. Generate an Access Key ID and Secret Access Key with Read/Write permissions.
3. Configure CORS on the bucket to allow requests from your production domain:
   ```json
   [
     {
       "AllowedOrigins": ["https://app.classnia.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

---

## 5. Stripe Billing Integration

1. In the **Stripe Dashboard**, create products matching the 4 SaaS tiers:
   - Free ($0/mo)
   - Pro ($19/mo)
   - Teacher ($49/mo)
   - Organization ($199/mo)
2. Configure Webhook endpoint pointing to:
   `https://app.classnia.com/api/billing/webhook`
3. Listen for events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

---

## 6. Custom Domain & Subdomains

Recommended DNS setup:
- Root / Marketing: `classnia.com`
- App Portal: `app.classnia.com`
- Institutional Tenants (Optional): `<school-slug>.classnia.com`
