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
- Customer reviews (empty by default, owner-approved)
- WhatsApp order builder (pre-filled message)
- Retail & Wholesale sections
- **Owner Panel** (`#admin`) — add/remove products & reviews, view orders, push notifications
- Supabase backend: products, reviews, orders, RLS, Realtime, Storage
- Firebase Cloud Messaging push notifications on new orders
- Accurate Africa/Freetown (GMT) store hours status
- SEO: meta, OpenGraph, LocalBusiness JSON-LD
- Graceful fallback when Supabase/Firebase not yet configured

## Setup
See **SETUP_GUIDE.md** — no developer needed.  
Owner management: see **OWNER_GUIDE.md**.

## Stack
Static HTML/CSS/vanilla JS → Vercel CDN  
Database/Auth/Storage → Supabase  
Push Notifications → Firebase Cloud Messaging (FCM v1 via Edge Function)

_Last updated: 2026-09-29_
