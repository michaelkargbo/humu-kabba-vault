# Humu Kabba Variety Vault

**Live site:** https://humu-kabba-vault.vercel.app  
**GitHub:** https://github.com/michaelkargbo/humu-kabba-vault

> *"Your Style, Our Priority."*

Fashion, beauty and lifestyle boutique — 4B Johnson Land, Aberdeen, Freetown, Sierra Leone.  
WhatsApp: +232 77 416008 | Mon–Sat 09:00–19:00 | Sun 13:00–17:00

## Features
- Mobile-first dark luxury design (`#0a0a0c` / `#d4af37` gold)
- Collections: Bags, Dresses, Beauty, Footwear, iPhone 17 Pro Max Phone Cases
- Filterable product grid with WhatsApp order buttons
- Direct WhatsApp concierge order builder and digital receipt dispatcher
- Customer reviews (owner-approved moderation)
- Retail & Wholesale inquiry sections
- **Owner CMS Panel** (`#admin`) — add/edit products & reviews, audit inbound orders, push notifications
- Supabase backend: products, reviews, orders, RLS, Realtime, Storage
- Firebase Cloud Messaging push notifications on new orders
- Accurate Africa/Freetown (GMT) store hours status
- SEO: meta, OpenGraph, LocalBusiness JSON-LD
- Graceful fallback when Supabase/Firebase not yet configured

## Documentation
- Complete 23-Chapter Guide: **[PROJECT_DOCUMENTATION.md](file:///d:/desktop/HK/PROJECT_DOCUMENTATION.md)**
- Checkout & Payments Upgrade Proposal: **[DOCUMENTATION_PROPOSAL.md](file:///d:/desktop/HK/DOCUMENTATION_PROPOSAL.md)**
- Technical Deployment Guide: **[SETUP_GUIDE.md](file:///d:/desktop/HK/SETUP_GUIDE.md)**
- Daily Management Manual: **[OWNER_GUIDE.md](file:///d:/desktop/HK/OWNER_GUIDE.md)**

## Stack
Static HTML/CSS/vanilla JS → Vercel Edge CDN  
Database/Auth/Storage → Supabase (PostgreSQL with RLS)  
Push Notifications → Firebase Cloud Messaging (FCM v1 via Edge Function)  

_Version 1.0 — 29 September 2026_
