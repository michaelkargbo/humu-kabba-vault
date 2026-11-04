# HUMU KABBA VARIETY VAULT

## Project Documentation & Prototype Guide

> **"Your Style, Our Priority."**  
> **Fashion, Beauty & Lifestyle Boutique**  
> 4B Johnson Land, Aberdeen, Freetown, Sierra Leone  
> **WhatsApp:** +232 77 416008  
> **Operating Hours:** Mon–Sat 09:00–19:00 | Sun 13:00–17:00 (Freetown Time)  
> **Prepared for:** Humu Kabba Variety Vault  
> **Version:** 1.0 — 29 September 2026  
> **Live Website:** [https://humu-kabba-vault.vercel.app](https://humu-kabba-vault.vercel.app)  
> **Source Repository:** [https://github.com/michaelkargbo/humu-kabba-vault](https://github.com/michaelkargbo/humu-kabba-vault)

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
14. [Customer Reviews](#14-customer-reviews)
15. [Notifications](#15-notifications)
16. [Security](#16-security)
17. [Search Engine and Social Media Visibility](#17-search-engine-and-social-media-visibility)
18. [Deployment and Setup](#18-deployment-and-setup)
19. [Testing](#19-testing)
20. [Maintenance](#20-maintenance)
21. [Future Improvements](#21-future-improvements)
22. [Conclusion](#22-conclusion)
23. [References](#23-references)

---

## 1. Introduction
**Humu Kabba Variety Vault** is a fashion, beauty and lifestyle boutique based at 4B Johnson Land, Aberdeen, Freetown. The business offers a variety of products, including bags, dresses, beauty products, footwear and iPhone 17 Pro Max phone cases. This project was created to give the business a strong online presence and make it easier for customers to discover products and contact the shop.

Instead of making the website feel like a complicated online store, the design focuses on what customers are most likely to need: seeing products clearly, finding the right collection, asking questions and placing an order through WhatsApp. The owner also has an administration area for managing products, reviews and order information.

---

## 2. About the Business
Humu Kabba Variety Vault is built around fashion, beauty and lifestyle products. The boutique serves customers who want stylish and affordable items while also providing a more personal shopping experience through WhatsApp. Customers can ask about sizes, colours, availability, prices and delivery before completing a purchase.

### Business Information Summary

| Business Information | Details |
| :--- | :--- |
| **Business name** | Humu Kabba Variety Vault |
| **Tagline** | Your Style, Our Priority. |
| **Location** | 4B Johnson Land, Aberdeen, Freetown, Sierra Leone |
| **WhatsApp** | +232 77 416008 |
| **Opening hours** | Monday–Saturday: 09:00–19:00; Sunday: 13:00–17:00 |

---

## 3. Purpose of the Website
The main purpose of the website is to bring the boutique closer to its customers online. A customer should be able to visit the website from a phone, look through the available collections, choose an item that interests them and contact the business without having to understand any complicated technology.

For the owner, the website provides a simple way to keep the catalogue up to date. Products can be added or removed, approved customer reviews can be displayed, and order inquiries can be viewed from the owner area.

---

## 4. Main Objectives
- **Create a modern and attractive online storefront** for the boutique.
- **Make it easy for customers in Freetown and elsewhere** to browse the available collections.
- **Give customers a direct way to contact the business** through WhatsApp.
- **Provide separate information** for normal retail customers and wholesale buyers.
- **Allow the owner to manage products and customer reviews** without changing the website code.
- **Keep important business information** such as the address, opening hours and contact number easy to find.
- **Provide a foundation** that can later support online payments, stock management and other business features.

---

## 5. What the Website Covers
The current project includes the following areas:
- **Home page and business introduction**
- **Product collections and category filters:**
  - Bags and accessories
  - Apparel and dresses
  - Beauty and perfumes
  - Footwear and denim
  - iPhone 17 Pro Max cases
- **Retail and wholesale information**
- **WhatsApp order builder**
- **Customer reviews**
- **Frequently asked questions**
- **Store location and opening hours**
- **Owner/admin panel**
- **Supabase database and storage integration**
- **Firebase push notifications**
- **Search-engine and social-sharing information**

> [!NOTE]
> The current version does not include a full card-payment checkout, automatic delivery tracking or a native mobile application.

---

## 6. People Who Use the System

| User | What they can do | Access |
| :--- | :--- | :--- |
| **Customer** | Browse products, ask questions and start an order | Public |
| **Wholesale customer** | Ask about bulk purchases and wholesale pricing | Public |
| **Owner/Admin** | Manage products, reviews, orders and notifications | Protected |

---

## 7. Main Features

| Feature | How it helps |
| :--- | :--- |
| **Product catalogue** | Products are grouped into clear collections so customers can quickly find what they are looking for. |
| **Category filtering** | Customers can filter the product list instead of scrolling through every item. |
| **WhatsApp ordering** | A customer can enter their details and item information and have a ready-made WhatsApp message prepared for the shop. |
| **Retail and wholesale** | The website explains both normal purchases and bulk/wholesale inquiries. |
| **Reviews** | Customer reviews can be collected and approved by the owner before being shown publicly. |
| **Owner panel** | The owner can manage products, reviews, order inquiries and notification settings. |
| **Cloud database** | Supabase provides the database, authentication, storage, security rules and realtime features. |
| **Notifications** | Firebase Cloud Messaging can notify the owner when new order activity is recorded. |
| **Store status** | Opening hours are shown using Freetown/Africa time so customers can see whether the shop is open. |
| **SEO** | The site includes search-engine metadata, social sharing information and LocalBusiness structured data. |

---

## 8. How the System Works
The website is intentionally lightweight. The customer-facing pages are built with HTML, CSS and vanilla JavaScript and are delivered through Vercel's CDN. When cloud services are connected, the website communicates with Supabase for data and storage. Firebase Cloud Messaging is used for push notifications.

```
       ┌────────────────────────────────────────────────────────┐
       │               CUSTOMER DEVICE (BROWSER)                │
       │       - Browse collections with category filters       │
       │       - Select item & open WhatsApp Order Builder      │
       └───────────────────────────┬────────────────────────────┘
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
             ▼                                           ▼
┌─────────────────────────┐                 ┌─────────────────────────┐
│     SUPABASE CLOUD      │                 │     WHATSAPP HOTLINE    │
│  - Products & Reviews   │                 │  - Direct boutique chat │
│  - Order inquiries log  │                 │  - Video & size check   │
│  - Row Level Security   │                 │  - Bike dispatch coord  │
└─────────────────────────┘                 └─────────────────────────┘
             ▲
             │
┌────────────┴────────────┐
│    OWNER ADMIN PANEL    │
│  - Authenticated login  │
│  - Inventory management │
│  - Review moderation    │
└─────────────────────────┘
```

### Operational Workflow:
1. Customer opens the website on a phone, tablet or computer.
2. Customer browses a collection and filters the products if necessary.
3. Customer selects an item and chooses to make an inquiry.
4. The order builder collects the customer's name, phone number, order type and product details.
5. A WhatsApp message is prepared and opened for the customer to send.
6. Where configured, the interaction is also recorded for the owner.
7. The owner confirms availability, price, payment and delivery details directly with the customer.

---

## 9. Database and Information Management
Supabase is used as the cloud data layer. It provides PostgreSQL database storage, authentication, file storage, realtime updates and Row Level Security. The main information areas are products, reviews, orders and owner profiles.

- **Products:** name, category, variants, price, image, description and publication status.
- **Reviews:** customer name, purchased item, rating, comment, approval status and date.
- **Orders:** customer details, phone number, order type, requested item and date.
- **Owner/profile information:** authenticated user details, role and notification information.

Public customers should only be able to see information that the owner has chosen to publish. Administrative actions should remain restricted to authenticated and authorized owner accounts.

---

## 10. Customer Journey
1. **Visit the website.**
2. **Check the store information** and current opening status.
3. **Choose a product collection.**
4. **Use the category filter** to narrow the products.
5. **Select an item** that looks interesting.
6. **Click the WhatsApp/inquiry button.**
7. **Enter name, phone number, order type** and product details.
8. **Open the prepared WhatsApp message.**
9. **Continue the conversation** with the boutique to confirm the purchase.

---

## 11. Owner/Admin Journey
1. **Open the owner section** and sign in.
2. **Add a new product** with its name, collection, image and description.
3. **Publish the product** when it is ready for customers.
4. **Update or remove products** that are no longer available.
5. **Review submitted customer feedback** and approve suitable reviews.
6. **Check order inquiries** recorded by the website.
7. **Manage notification settings** when Firebase is connected.
8. **Sign out** after finishing administrative work.

---

## 12. Prototype Design
The prototype included with this documentation is a simple working front-end demonstration of the proposed customer and owner experience. It uses sample products so that it can be opened without connecting to the production database.

- **Home** — Luxury dark-and-gold introduction, store status and clear calls to action.
- **Collections** — Product cards with category filters for the main collections.
- **Order Builder** — Simple form that prepares a WhatsApp message.
- **Retail & Wholesale** — Separate sections explaining the two shopping paths.
- **Reviews** — Examples of approved customer feedback.
- **FAQ & Store** — Common questions, address, opening hours and contact information.
- **Owner Panel** — A visual demonstration of product, review, order and notification management.

---

## 13. WhatsApp Ordering
WhatsApp is central to the current customer experience because it allows the business and customer to have a direct conversation. Rather than forcing the customer through a complicated checkout process, the website prepares the important information first.

A typical message contains the customer's name, phone number, category, retail or wholesale status, and the item details. The owner can then confirm availability, price, payment and delivery arrangements.

---

## 14. Customer Reviews
Reviews are kept under the owner's control. New feedback should not automatically become visible on the public website. The owner can review the submission first and then decide whether it should be published. This keeps the public review section relevant and trustworthy.

---

## 15. Notifications
When Firebase Cloud Messaging is configured, the owner can receive a push notification when a new order-related event is recorded. The notification service is connected through a secure backend/Edge Function so private Firebase credentials are not placed in the browser.

---

## 16. Security
Security is especially important because the owner panel contains business information and allows changes to the public catalogue. The recommended setup uses Supabase authentication and Row Level Security to control who can make changes.

- Keep Supabase service-role keys and Firebase private credentials out of browser code.
- Only authenticated owners should be able to manage products and reviews.
- Use database security policies rather than relying only on hidden buttons in the interface.
- Validate information entered through owner forms.
- Protect uploaded images and storage operations with appropriate access rules.
- Use HTTPS for the production website.
- Review owner accounts and access permissions regularly.

---

## 17. Search Engine and Social Media Visibility
The website has been prepared with SEO information, OpenGraph metadata and LocalBusiness structured data. This helps search engines understand the business and gives social platforms useful information when the website is shared.

Keeping product names, descriptions, business address, opening hours and contact information accurate will help maintain a consistent online presence.

---

## 18. Deployment and Setup
1. Keep the project source code in the GitHub repository.
2. Connect the repository to Vercel for hosting and automatic deployment.
3. Create/configure the Supabase project and apply the required database and security setup.
4. Configure Firebase Cloud Messaging if owner push notifications are required.
5. Add production environment values through the appropriate secure configuration.
6. Test the customer website and owner panel after deployment.
7. Use [SETUP_GUIDE.md](file:///d:/desktop/HK/SETUP_GUIDE.md) for technical setup and [OWNER_GUIDE.md](file:///d:/desktop/HK/OWNER_GUIDE.md) for day-to-day owner tasks.

---

## 19. Testing
Before the website is considered ready for regular business use, the following areas should be checked:
- Homepage opens correctly on mobile and desktop.
- Collection filters show the correct products.
- WhatsApp messages contain the information entered by the customer.
- Owner login blocks unauthorized administrative access.
- Products can be added and published correctly.
- Reviews only appear after approval.
- Orders are recorded when the cloud backend is active.
- Push notifications work when FCM is configured.
- The website remains useful when optional cloud services are unavailable.
- Business address, phone number and opening hours are correct.

---

## 20. Maintenance
- Keep product information and availability up to date.
- Replace old product photos with clear, good-quality images.
- Review WhatsApp inquiries regularly.
- Remove products that are no longer available.
- Check the owner account and notification setup from time to time.
- Test the website after major code or database changes.
- Keep a backup/version of important project changes in GitHub.

---

## 21. Future Improvements
- **Online payment integration** for supported Sierra Leone payment methods.
- **Customer accounts** and order history.
- **Stock quantities** and low-stock alerts.
- **Product search** and sorting.
- **Discount codes** and promotions.
- **Delivery fees** based on location.
- **Wholesale customer accounts** and special pricing.
- **Sales and product-interest reports.**
- **Progressive Web App support.**
- **Dedicated Android/iOS application** if the business grows enough to require it.

---

## 22. Conclusion
**Humu Kabba Variety Vault** is more than a product display page. It gives the boutique a practical way to present its products online while keeping the personal shopping experience that customers get through WhatsApp. The dark luxury design gives the brand a clear identity, while the owner panel and cloud services provide a foundation for managing the business as it grows.

The current version focuses on making the important things simple: customers can find products, ask questions and contact the business, while the owner can keep the catalogue and customer information organised. Future additions such as online payments, inventory management and customer accounts can be introduced as the business needs them.

---

## 23. References
- Humu Kabba Variety Vault. Live website: [https://humu-kabba-vault.vercel.app](https://humu-kabba-vault.vercel.app) (accessed 29 September 2026).
- Michael Kargbo. Humu Kabba Variety Vault GitHub repository: [https://github.com/michaelkargbo/humu-kabba-vault](https://github.com/michaelkargbo/humu-kabba-vault) (accessed 29 September 2026).
- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Vercel Documentation: [https://vercel.com/docs](https://vercel.com/docs)
- Firebase Cloud Messaging Documentation: [https://firebase.google.com/docs/cloud-messaging](https://firebase.google.com/docs/cloud-messaging)
