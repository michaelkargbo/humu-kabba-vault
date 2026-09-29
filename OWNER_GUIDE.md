# Owner Guide — How to Manage Your Website

**This guide is for the business owner only. You do not need to touch any code.**

---

## How to Open the Owner Panel

1. Go to your live website: **[https://humu-kabba-vault.vercel.app](https://humu-kabba-vault.vercel.app)**
2. Scroll to the very bottom of the page (the footer).
3. Look for the small word **"Owner"** at the bottom right corner.
4. Click it. The sign-in panel will appear.
5. Enter your owner email and password, then click **Sign In**.

> **Tip:** You can also go directly to `https://humu-kabba-vault.vercel.app/#admin` to open the panel immediately.

---

## How to Add a New Product

1. Open the Owner Panel and sign in.
2. You are on the **"Add Product"** tab by default.
3. Fill in the fields:

   | Field | What to enter |
   |-------|---------------|
   | **Product Name** *(required)* | e.g. "Crystal Shell Case", "Pink Evening Dress" |
   | **Category** | Select from the dropdown (Phone Cases, Bags, Dresses, etc.) |
   | **Colours / Variants** | e.g. "White, Lilac, Pink" |
   | **Price in SLE** | Leave blank to show "Ask price on WhatsApp" instead |
   | **Product Photo** | Choose a photo from your phone or computer — it is automatically compressed and uploaded |
   | **Description** | Optional. A short honest description of the item. |

4. Click **"Save & Publish Product"**.
5. The product appears on your website immediately — no refresh needed.

> **Tip:** For phone cases, always select "Phone Cases" as the category. They will appear on both the home page and the `cases.html` page.

---

## How to Mark a Product as Sold Out

1. Open the Owner Panel and click the **"Manage Products"** tab.
2. Find the product in the list.
3. Click the **"Mark Sold Out"** button next to it.
4. The website shows "Sold Out" instantly and the order button disappears.

To bring it back in stock, click **"Mark In Stock"** on the same row.

---

## How to Delete a Product

1. Open the Owner Panel and click the **"Manage Products"** tab.
2. Find the product and click **"Delete"**.
3. A confirmation question appears — click OK to confirm.
4. The product is removed from the website immediately.

---

## How to Add a Customer Review

> **Important:** Only add reviews from real customers who gave you permission. Never write fake reviews.

1. A customer messages you on WhatsApp with feedback. Copy their exact words.
2. Open the Owner Panel and click the **"Approved Reviews"** tab.
3. Fill in:

   | Field | What to enter |
   |-------|---------------|
   | **Customer Name** | Their name or first name (e.g. "Zainab K.") |
   | **Item Purchased** | What they bought (e.g. "Crystal Shell Case") |
   | **Star Rating** | 1 to 5 stars |
   | **Customer's Review Quote** | Paste their exact words |

4. Click **"Publish Review to Website"**.
5. The review appears in the Reviews section immediately.

---

## How to Delete a Review

1. Open the Owner Panel and click **"Approved Reviews"**.
2. Scroll down to see the list of published reviews.
3. Click **"Delete"** next to the one you want to remove.
4. Confirm and it disappears from the site.

---

## How to View Recent WhatsApp Order Inquiries

1. Open the Owner Panel and click the **"WhatsApp Orders (10)"** tab.
2. You can see the last 10 times a customer clicked an "Order on WhatsApp" button on your site — with the product name, customer name, type (retail / wholesale), and the date and time.

> This is just a log. The actual conversation happens on WhatsApp.

---

## How to Enable Push Notifications

When a customer clicks "Order on WhatsApp" on your website, you can receive a notification on your phone or computer.

1. Open the Owner Panel and sign in.
2. Click the **"Enable Push Notifications"** button at the top right of the dashboard.
3. Your browser will ask for permission — click **Allow**.
4. You will see a confirmation message: "Push notifications enabled!"

> **Requires:** The developer must have completed the Firebase setup in SETUP_GUIDE.md first. If Firebase is not configured, this button will say so.

---

## How to Replace Real Phone Case Photos

When you receive your real phone case photos:

1. Name each photo file clearly, e.g.:
   - `crystal_shell.jpg`
   - `heart_shell.jpg`
   - `monogram_leather.jpg`

2. Open the Owner Panel → **Add Product**.
3. Delete the old product (Manage Products → Delete).
4. Add the product again with the real photo.

The photo is automatically resized to the right size for fast loading before it is uploaded.

---

## Quick Reference: Owner Panel Tabs

| Tab | What you can do |
|-----|-----------------|
| **Add Product** | Add a new item with photo, price, and description |
| **Manage Products** | Toggle sold-out status or delete items |
| **Approved Reviews** | Publish real customer reviews or remove old ones |
| **WhatsApp Orders (10)** | See recent customer order inquiries from the website |

---

## Important Reminders

- **Never share your owner password** with anyone else.
- **Prices are shown in SLE** (Sierra Leonean Leones). Leave price blank to show "Ask price on WhatsApp" instead.
- **Reviews section starts empty** by design. Only add real approved reviews.
- All changes go live **immediately** — no need to wait or refresh the site.
- If something goes wrong, you will see a red error message. Read it carefully. If the problem says "Check that you are signed in as the owner", sign out and sign back in.

---

*Guide written for Humu Kabba Variety Vault — "Your Style, Our Priority."*
