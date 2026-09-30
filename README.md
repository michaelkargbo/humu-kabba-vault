# Humu Kabba Variety Vault

**Live site:** https://humu-kabba-vault.vercel.app  
**GitHub:** https://github.com/michaelkargbo/humu-kabba-vault

> *"Your Style, Our Priority."*

Fashion, beauty and lifestyle boutique — 4B Johnson Land, Aberdeen, Freetown, Sierra Leone.  
WhatsApp: +232 754 16008 | Mon–Sat 09:00–19:00 | Sun 13:00–17:00

## Features
- Mobile-first dark luxury design (`#0a0a0c` / `#d4af37` gold)
- Collections: Bags, Dresses, Beauty, Footwear, iPhone 17 Pro Max Phone Cases
- Filterable product grid with WhatsApp order buttons
- **Online Payments & Checkout (Section 14)**: Orange Money (`*144#`), Afrimoney (`*161#`), Credit/Debit Cards, Cash on Delivery with automatic fee calculation and digital receipt generation
- Pre-filled WhatsApp concierge order builder and digital receipt dispatcher
- Customer reviews (owner-approved moderation)
- Retail & Wholesale inquiry sections
- **Owner CMS Panel** (`#admin`) — add/edit products & reviews, audit inbound orders with payment methods & references, push notifications
- Supabase backend: products, reviews, orders, RLS, Realtime, Storage
- Firebase Cloud Messaging push notifications on new orders
- Accurate Africa/Freetown (GMT) store hours status
- SEO: meta, OpenGraph, LocalBusiness JSON-LD
- Graceful fallback when Supabase/Firebase not yet configured

## Documentation
- Complete 24-Chapter Guide: **[PROJECT_DOCUMENTATION.md](file:///c:/Users/micky/OneDrive/Desktop/HK/PROJECT_DOCUMENTATION.md)**
- Proposal Specification: **[DOCUMENTATION_PROPOSAL.md](file:///c:/Users/micky/OneDrive/Desktop/HK/DOCUMENTATION_PROPOSAL.md)**
- Technical Deployment Guide: **[SETUP_GUIDE.md](file:///c:/Users/micky/OneDrive/Desktop/HK/SETUP_GUIDE.md)**
- Daily Management Manual: **[OWNER_GUIDE.md](file:///c:/Users/micky/OneDrive/Desktop/HK/OWNER_GUIDE.md)**

## Stack
Static HTML/CSS/vanilla JS → Vercel Edge CDN  
Database/Auth/Storage → Supabase (PostgreSQL with RLS)  
Push Notifications → Firebase Cloud Messaging (FCM v1 via Edge Function)  

_Version 1.0 — 29 September 2026_
