# Business Integration Checklist

This project is configured as a premium boutique storefront with a strong front-end shopping experience and local-first data persistence. The remaining production integrations require external provider credentials, merchant approval, and live service setup.

## 1. Supabase configuration
Required:
- Supabase project URL
- Supabase anonymous key
- Supabase service role key (server-side only; never expose in the browser)
- Database schema for products, orders, reviews, customers, inventory, promotions, and admin accounts
- Storage bucket for product images
- Row-level security policies

Current status:
- Frontend config is prepared through the existing config.js file.
- Production database and security rules still need the business owner's Supabase project details.

## 2. Payment providers
### Orange Money
Required:
- Orange Money merchant or business account
- API credentials or approved payment integration details
- Callback/webhook URL
- Verification flow for transaction status and duplicate checks

Notes:
- This project is prepared for Orange Money checkout flow and verification patterns, but a live merchant account is required before real transactions are enabled.

### Afrimoney
Required:
- Afrimoney business onboarding approval
- Merchant credentials or API contract
- Webhook endpoint and signature verification setup
- Transaction lookup logic for success/failure handling

Notes:
- Real production activation requires provider approval and credentials.

### Card payments
Required:
- Merchant account with card provider (example: Stripe or a Sierra Leone-compatible processor)
- Publishable key
- Secret key
- Webhook secret
- Refund support configuration

Notes:
- Card numbers and CVV must never be stored in frontend or browser code.
- Payment verification must occur on the server side only.

### Cash on delivery
Required:
- Business owner to enable COD in admin settings
- Delivery area setup and rules
- Order confirmation workflow

Notes:
- COD should remain admin-controlled and not be marked paid until collection or confirmation occurs.

## 3. WhatsApp Business setup
Required:
- Verified WhatsApp Business account
- Business phone number already in use by the brand
- Approved template messages or API access
- Webhook or callback handling for customer interaction tracking

Notes:
- The existing verified number is preserved as the brand contact number in the storefront.

## 4. SMS and email
### SMS
Required:
- Twilio or another SMS provider account
- Account SID
- Auth token
- Sender number or approved short code

### Email
Required:
- Transactional email provider (for example Resend, SendGrid, Postmark, or similar)
- API key
- Verified sender domain or verified email address
- SMTP or provider-specific configuration

Notes:
- Real email and SMS delivery should be enabled only after provider credentials are supplied and tested.

## 5. Google and analytics
Required:
- Google Analytics measurement ID
- Google Search Console verification
- Meta Pixel ID if used
- Advertising campaign tracking IDs if activated

Notes:
- Only activate these after the business owner provides the correct account values.

## 6. Delivery and logistics setup
Required:
- Delivery zones and prices for Freetown and other towns
- Delivery thresholds for free shipping
- Admin-managed courier assignments
- Estimated delivery times per region
- Pickup availability rules

Notes:
- Delivery pricing should be configured from the admin dashboard instead of hard-coded in the storefront.

## 7. Business owner actions before production launch
1. Create or connect the live Supabase project.
2. Add the production database schema and storage buckets.
3. Enable authentication and admin roles.
4. Complete payment provider onboarding.
5. Configure the WhatsApp Business number and templates.
6. Configure SMS and email providers.
7. Set up business profile, delivery fees, and store policies.
8. Add approved promotional banners and product inventory.
9. Review support, refund, and return terms.
10. Test checkout and order processing in a staging or production environment.

## 8. Important deployment warning
This project can be made production-ready with real backend services, but it cannot claim live payment confirmation or real customer notifications without valid provider credentials and verified accounts.

The storefront should only show real success states after provider confirmation is received.
