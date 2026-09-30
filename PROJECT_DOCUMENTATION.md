# HUMU KABBA VARIETY VAULT

## Project Documentation & Prototype Guide

> **"Your Style, Our Priority."**  
> **Fashion, Beauty & Lifestyle Boutique**  
> 4B Johnson Land, Aberdeen, Freetown, Sierra Leone  
> **WhatsApp:** +232 754 16008  
> **Hours:** Mon–Sat 09:00–19:00 | Sun 13:00–17:00 (GMT/Freetown Time)  
> **Prepared for:** Humu Kabba Variety Vault  
> **Version:** 1.0 — 29 September 2026  
> **Production URL:** [https://humu-kabba-vault.vercel.app](https://humu-kabba-vault.vercel.app)  
> **Repository:** [https://github.com/michaelkargbo/humu-kabba-vault](https://github.com/michaelkargbo/humu-kabba-vault)

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [About the Business](#2-about-the-business)
3. [Purpose of the Website](#3-purpose-of-the-website)
4. [Main Objectives](#4-main-objectives)
5. [What the Website Covers](#5-what-the-website-covers)
6. [People Who Use the System](#6-people-who-use-the-system)
7. [Main Features](#7-main-features)
8. [How the System Works](#8-how-the-system-works)
9. [Database and Information Management](#9-database-and-information-management)
10. [Customer Journey](#10-customer-journey)
11. [Owner/Admin Journey](#11-owneradmin-journey)
12. [Prototype Design](#12-prototype-design)
13. [WhatsApp Ordering](#13-whatsapp-ordering)
14. [Online Payments and Checkout](#14-online-payments-and-checkout)
15. [Customer Reviews](#15-customer-reviews)
16. [Notifications](#16-notifications)
17. [Security](#17-security)
18. [Search Engine and Social Media Visibility](#18-search-engine-and-social-media-visibility)
19. [Deployment and Setup](#19-deployment-and-setup)
20. [Testing](#20-testing)
21. [Maintenance](#21-maintenance)
22. [Future Improvements](#22-future-improvements)
23. [Conclusion](#23-conclusion)
24. [References](#24-references)

---

## 1. Introduction
**Humu Kabba Variety Vault** is a fashion, beauty, and lifestyle boutique based at 4B Johnson Land, Aberdeen, Freetown, Sierra Leone. The business offers a variety of curated products, including luxury bags, dresses, beauty products, footwear, and specialized iPhone 17 Pro Max phone cases. This project was created to give the boutique a strong, professional online presence and make it seamless for customers to discover products, view authentic daylight details, and contact the shop.

Instead of making the website feel like a detached, rigid online supermarket, the design deliberately focuses on what customers need most: viewing products clearly with rich visual fidelity, finding the right collection easily, asking questions directly, and placing orders through WhatsApp with doorstep bike dispatch. The boutique owner also has a dedicated administrative area for managing products, approving authentic customer reviews, and tracking incoming order inquiries.

---

## 2. About the Business
Humu Kabba Variety Vault is built around fashion, beauty, and lifestyle products. The boutique serves customers who desire stylish and affordable items while receiving a warm, personalized shopping experience. Customers can inquire about sizes, colors, availability, real-time pricing in Sierra Leone New Leones (`SLE`), and local doorstep delivery before completing their purchase.

### Business Information Summary

| Detail | Specification |
| :--- | :--- |
| **Business Name** | Humu Kabba Variety Vault |
| **Tagline** | *Your Style, Our Priority.* |
| **Physical Location** | 4B Johnson Land, Aberdeen, Freetown, Sierra Leone (Back of the Field) |
| **WhatsApp Hotline** | `+232 754 16008` |
| **Store Hours** | Monday–Saturday: 09:00–19:00; Sunday: 13:00–17:00 |
| **WhatsApp Inquiries** | Available 24/7 (Replies during store operating hours) |
| **Local Currencies** | Sierra Leone New Leones (`SLE`) and US Dollars (`USD`) |

---

## 3. Purpose of the Website
The primary purpose of the website is to bring the boutique closer to its customers online. A customer should be able to visit the website from any smartphone or computer, browse available collections, choose an item of interest, calculate delivery fees, select payment options, and contact the business without technical friction.

For the owner, the website provides a user-friendly management portal. Products can be added, updated, or marked as sold out, customer reviews can be curated and published, and incoming orders can be audited in real time.

---

## 4. Main Objectives
- **Create a modern and attractive digital storefront:** Showcase boutique items with an elegant dark-and-gold luxury aesthetic.
- **Empower effortless browsing:** Group items into distinct categories so shoppers in Freetown and upcountry can quickly locate desired fashion pieces.
- **Provide direct WhatsApp communication:** Allow shoppers to request daylight video clips, confirm sizes, and chat directly with Humu Kabba.
- **Support retail and wholesale buyers:** Clearly distinguish between individual retail purchases and wholesale bulk reseller packs for provincial traders.
- **Enable dynamic catalog management:** Allow the business owner to add, edit, and publish products without touching the underlying source code.
- **Highlight physical store presence:** Keep store location, Aberdeen landmark guidance, and real-time open/closed business hours readily visible.
- **Provide a foundation for secure online payments:** Enable structured checkouts using Orange Money, Afrimoney, credit cards, and debit cards.

---

## 5. What the Website Covers
The current platform implementation encompasses:
- **Home page & brand introduction:** High-impact hero section, value badges, and founder story.
- **Product collections & category filters:** Filterable gallery across Bags & Accessories, Apparel & Dresses, Beauty & Perfumes, Footwear & Denim, and iPhone 17 Pro Max Cases.
- **Dedicated iPhone 17 Pro Max Cases catalog (`cases.html`):** Crystal Shells, Monogram Leather, and protective luxury cases.
- **Retail & wholesale information:** Clear purchasing guidelines for personal shoppers and bulk resellers.
- **WhatsApp order builder:** Interactive form generating structured inquiry messages.
- **Online payment & structured checkout:** Instant checkout supporting Orange Money, Afrimoney, Credit Cards, and Debit Cards with payment verification and receipt generation.
- **Customer reviews:** Social proof displaying verified customer reviews and rating breakdowns.
- **Frequently asked questions (FAQ):** Interactive accordion resolving common questions on delivery, video clips, and payment methods.
- **Store location & real-time hours:** Live GMT clock calculation displaying whether the Aberdeen boutique is currently open or closed.
- **Protected owner/admin panel:** Secure authentication, inventory management, review approval, and order audit log.
- **Cloud database & storage:** Supabase integration with PostgreSQL and Row Level Security.
- **Push notifications:** Firebase Cloud Messaging support for instant owner notifications.
- **Search engine & social sharing optimization:** Structured JSON-LD metadata, OpenGraph cards, and Twitter cards.

---

## 6. People Who Use the System

| User Role | Capabilities | Access Level |
| :--- | :--- | :--- |
| **Retail Customer** | Browse catalog, filter categories, view pricing, select payment method, initiate checkout, and order via WhatsApp | Public |
| **Wholesale Buyer** | Explore bulk packs, learn about wholesale minimum order quantities, and request reseller rates | Public |
| **Owner / Admin** | Create and edit products, upload product imagery, approve reviews, audit orders, and manage notification settings | Protected (Authenticated) |

---

## 7. Main Features

| Feature | Description & Benefit |
| :--- | :--- |
| **Curated Product Catalog** | Grouped into intuitive collections with high-resolution imagery and local pricing. |
| **Interactive Category Filtering** | Instant client-side filtering without page reloads. |
| **WhatsApp Order Builder** | Generates pre-formatted order text including product name, order type, and customer preferences. |
| **Online Payments & Checkout** | Structured payment stage supporting Orange Money, Afrimoney, Visa/Mastercard credit/debit cards with instant transaction references. |
| **Real-time Store Status** | Dynamic indicator calculated based on Africa/Freetown time zone (Mon–Sat 09:00–19:00, Sun 13:00–17:00). |
| **Customer Reviews Moderation** | Allows customers to share feedback while keeping the owner in control of published reviews. |
| **Owner CMS Dashboard** | Password-protected portal to publish new items, toggle stock availability, and inspect orders. |
| **Cloud Database (Supabase)** | PostgreSQL backend with Row Level Security, auto-generated UUIDs, and realtime capabilities. |
| **Push Notifications (FCM)** | Alerts the owner on device when incoming orders or customer actions are recorded. |
| **SEO & Social Metadata** | OpenGraph tags, Twitter cards, and Schema.org `LocalBusiness` structured data for search ranking. |

---

## 8. How the System Works
The platform is built using a high-performance, lightweight architecture using vanilla HTML5, CSS3, and JavaScript, hosted globally on Vercel's Edge CDN.

```
+-------------------------------------------------------------------+
|                        CUSTOMER BROWSER                           |
|  - Browses Catalog     - Selects Item / Quantity                 |
|  - Chooses Payment     - Initiates Checkout / WhatsApp Order      |
+---------------------------------+---------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
+-----------------------+                   +-----------------------+
|   SUPABASE BACKEND    |                   |    WHATSAPP ENGINE    |
| - PostgreSQL Tables   |                   | - Pre-filled Message  |
| - Orders & Payments   |                   | - Direct Hotline Chat |
| - Products & Reviews  |                   | - 360° Video Previews |
| - RLS Authorization   |                   | - Rider Dispatch      |
+-----------------------+                   +-----------------------+
            ^
            |
+-----------+-----------+
|    OWNER ADMIN CMS    |
| - Authenticated Login |
| - Inventory & Stock   |
| - Payment Verification|
+-----------------------+
```

1. The customer loads the website on any device.
2. The customer filters products and inspects item details.
3. The customer chooses between direct WhatsApp inquiry or instant online checkout.
4. If choosing checkout, the customer selects Orange Money, Afrimoney, or Card, reviews the order total, and enters delivery information.
5. A secure transaction reference and order record are generated and saved to the Supabase database.
6. The customer receives a digital receipt and continues to WhatsApp to coordinate bike delivery or boutique pickup.

---

## 9. Database and Information Management
Supabase provides the PostgreSQL cloud data layer, Row Level Security (RLS), and authentication.

### Database Tables Schema

```sql
-- 1. Admins Table
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 2. Products Table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Phone Cases',
  colors text default '',
  price numeric default null,
  description text default '',
  image_url text default '',
  in_stock boolean default true,
  created_at timestamptz default now()
);

-- 3. Reviews Table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  item text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text not null,
  created_at timestamptz default now()
);

-- 4. Orders & Payments Table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  customer_name text default 'Anonymous Customer',
  phone text default '',
  order_type text default 'retail',
  amount numeric default null,
  currency text default 'SLE',
  payment_method text default 'whatsapp',
  payment_reference text default '',
  payment_status text default 'pending',
  delivery_address text default '',
  notes text default '',
  status text not null default 'new',
  created_at timestamptz default now()
);

-- 5. Push Notification Tokens
create table public.push_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  token text primary key,
  updated_at timestamptz default now()
);
```

---

## 10. Customer Journey
1. **Discovery:** Shopper arrives at `https://humu-kabba-vault.vercel.app` via social link or direct search.
2. **Orientation:** Checks Aberdeen boutique hours and open/closed indicator.
3. **Exploration:** Navigates collections (Bags, Apparel, Perfumes, Footwear, iPhone Cases) using filter pills.
4. **Item Selection:** Selects desired item, color, and size preference.
5. **Checkout & Payment Choice:**
   - **Path A (Fast Inquiry):** Direct WhatsApp link with pre-filled greeting.
   - **Path B (Structured Checkout):** Enters contact info, delivery location, and selects Orange Money, Afrimoney, Credit Card, or Debit Card.
6. **Payment Confirmation:** Reviews transaction reference and digital receipt.
7. **Fulfillment:** WhatsApp dialogue coordinates same-day bike dispatch across Freetown or upcountry courier transport.

---

## 11. Owner/Admin Journey
1. **Access:** Owner scrolls to bottom footer or navigates to `#admin`.
2. **Authentication:** Enters registered credentials securely validated via Supabase Auth.
3. **Inventory Management:**
   - Adds new items with image, price, description, and category.
   - Updates stock status (`In Stock` vs `Sold Out`).
4. **Order & Payment Auditing:**
   - Reviews inbound orders, payment methods used, and transaction references.
   - Verifies Orange Money / Afrimoney receipt codes against merchant account.
5. **Review Moderation:** Approves verified customer testimonials for public display.
6. **Sign-out:** Terminate session safely with one click.

---

## 12. Prototype Design
The platform features a luxury dark-and-gold design system:
- **Palette:** Obsidian dark backgrounds (`#0a0a0c`, `#141418`), warm champagne gold accents (`#d4af37`), and WhatsApp emerald green (`#25d366`).
- **Typography:** Modern, clean system fonts and Google Fonts ensuring fast rendering on mobile devices across 3G/4G connections in Sierra Leone.
- **Micro-interactions:** Smooth tab transitions, card hover glows, and responsive modal dialogues.

---

## 13. WhatsApp Ordering
WhatsApp remains central to the boutique's customer relationships. In Freetown's fashion landscape, customers value seeing daylight video clips, discussing fit, and asking questions before money changes hands. Rather than replacing WhatsApp with a rigid detached cart, the system leverages WhatsApp as the personal concierge closing stage while structuring all order details systematically.

---

## 14. Online Payments and Checkout
The upgraded website introduces a structured checkout stage so customers can choose a supported payment method after confirming their products, quantity, delivery details, and final amount.

### Supported Payment Methods
- **Orange Money:** Payment through enabled Orange Money merchant integration / USSD push (`*144#`).
- **Afrimoney:** Payment through enabled Afrimoney merchant integration (`*161#`).
- **Credit Cards:** Visa and Mastercard payments via secure tokenized payment provider.
- **Debit Cards:** Local and international issuing bank debit cards.
- **Cash on Delivery / In-Store Pickup:** For customers collecting in Aberdeen or paying the bike courier upon arrival.

### Recommended Payment Flow
1. Customer reviews order summary and confirms final amount in New Leones (`SLE`).
2. Customer confirms name, telephone number, and delivery location.
3. Customer selects Orange Money, Afrimoney, credit card, or debit card.
4. Customer completes payment authorization through provider's secure checkout flow.
5. The system records the transaction reference and marks the order status as `Paid` or `Pending Verification`.
6. Customer receives an on-screen payment confirmation receipt with unique Order ID.
7. Customer continues seamlessly to WhatsApp with the payment receipt pre-attached for prompt dispatch.
8. Failed, pending, or cancelled payments remain clearly logged for administrative reconciliation.

### Recorded Payment Attributes
- Order ID (e.g., `HK-ORD-84920`)
- Payment Reference (e.g., `OM-SLE-93810`)
- Selected Payment Method
- Total Amount and Currency (`SLE`)
- Payment Status (`Pending`, `Paid`, `Failed`, `Cancelled`, `Refunded`)
- Date and Timestamp
- Delivery Location and Customer Phone

### Payment Security Standards
- Card numbers and CVV codes are **never** stored in the client or Supabase database.
- Secure HTTPS encryption is enforced across all endpoints.
- Server-side verification is executed prior to marking payments settled.
- Provider secrets and API keys are stored exclusively in secure server-side environment variables.

---

## 15. Customer Reviews
Reviews reflect authentic customer experiences from shoppers across Freetown, Sierra Leone, and the diaspora. The owner retains administrative approval control to safeguard against spam and ensure all displayed testimonials represent real boutique clients.

---

## 16. Notifications
Push notifications powered by Firebase Cloud Messaging (FCM) alert the boutique owner when new orders, payment verifications, or review submissions occur. Web push tokens are stored securely in Supabase and dispatched via secure serverless Edge Functions.

---

## 17. Security
Security safeguards include:
- Supabase Row Level Security (RLS) guaranteeing that public visitors can only read published products and reviews.
- Strict `is_admin()` database policies ensuring only authorized user IDs can create or modify inventory.
- Zero client storage of sensitive payment credentials.
- HTTPS encryption enforced globally by Vercel's Edge Network.
- Input validation and HTML escaping preventing XSS vulnerabilities.

---

## 18. Search Engine and Social Media Visibility
The boutique website includes comprehensive SEO and social sharing tags:
- Search engine meta titles and descriptions tailored to fashion shoppers in Freetown.
- OpenGraph (OG) tags ensuring attractive preview cards when shared on WhatsApp, Facebook, or Instagram.
- Schema.org `LocalBusiness` JSON-LD structured data designating the physical Aberdeen address, telephone contact, and opening hours for Google Search and Maps indexing.

---

## 19. Deployment and Setup
The platform is deployed via modern continuous deployment:
1. Source code managed in GitHub repository: `https://github.com/michaelkargbo/humu-kabba-vault`.
2. Vercel automatically deploys every push to the `main` branch with sub-second global edge distribution.
3. Supabase database schema configured via SQL Editor using `supabase-setup.sql`.
4. Day-to-day operation managed through `OWNER_GUIDE.md` and technical configuration guided by `SETUP_GUIDE.md`.

---

## 20. Testing
Comprehensive test procedures verify system stability:
- **Responsive Viewport Testing:** Fluid display verified across mobile (375px), tablet (768px), and desktop (1200px+).
- **Store Hours Accuracy:** Verifies correct opening/closing status against Africa/Freetown time.
- **Checkout & Payment Flow:** Simulates Orange Money, Afrimoney, and Card checkout flows with receipt generation.
- **WhatsApp Deep-links:** Validates that URLs correctly populate customer details and product metadata.
- **Authentication & RLS:** Confirms unauthorized visitors cannot access or mutate admin tables.

---

## 21. Maintenance
Routine operational maintenance entails:
- Regular catalog updates to reflect incoming fashion stock.
- Marking sold-out items to set customer expectations.
- Monitoring WhatsApp order inquiries and reconciling mobile money payments.
- Updating store hours for national holidays or seasonal boutique schedules.
- Performing periodic database and configuration backups.

---

## 22. Future Improvements
- Direct API webhook integration with Orange Money and Afrimoney merchant gateways.
- Automated SMS notifications for delivery dispatch.
- Customer accounts with saved delivery addresses and re-order history.
- Dynamic delivery fee calculation based on Freetown postal zones and upcountry districts.
- Reseller wholesale portal with tier-based pricing discounts.
- Progressive Web App (PWA) with offline catalog caching.

---

## 23. Conclusion
**Humu Kabba Variety Vault** bridges the gap between high-end digital presentation and the warm, conversational shopping culture of Sierra Leone. By combining a dark luxury digital showcase with structured online payments (Orange Money, Afrimoney, Cards) and WhatsApp concierge ordering, the boutique delivers a state-of-the-art retail experience tailored to local and diaspora clientele.

---

## 24. References
1. **Live Production Storefront:** [https://humu-kabba-vault.vercel.app](https://humu-kabba-vault.vercel.app)
2. **GitHub Source Code Repository:** [https://github.com/michaelkargbo/humu-kabba-vault](https://github.com/michaelkargbo/humu-kabba-vault)
3. **Supabase Documentation:** [https://supabase.com/docs](https://supabase.com/docs)
4. **Vercel Edge Hosting Documentation:** [https://vercel.com/docs](https://vercel.com/docs)
5. **Firebase Cloud Messaging Documentation:** [https://firebase.google.com/docs/cloud-messaging](https://firebase.google.com/docs/cloud-messaging)
