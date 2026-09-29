/**
 * ==============================================================================
 * HUMU KABBA VARIETY VAULT - CORE JAVASCRIPT CONTROLLER
 * Handles: Store Hours (Africa/Freetown), WhatsApp deep-linking, Supabase data,
 * Realtime updates, Client-side image resizing, and Owner Management Panel.
 * ==============================================================================
 */

(function () {
  'use strict';

  // Fallback defaults if config.js not yet loaded
  const CONFIG = window.APP_CONFIG || {
    BUSINESS: {
      name: "Humu Kabba Variety Vault",
      whatsappNumber: "23275416008",
      whatsappLink: "https://wa.me/23275416008"
    },
    isSupabaseConfigured: () => false,
    isFirebaseConfigured: () => false
  };

  let supabaseClient = null;
  let currentUser = null;
  let isAdmin = false;

  // Initialize Supabase Client if credentials are provided
  if (typeof window.supabase !== 'undefined' && CONFIG.isSupabaseConfigured && CONFIG.isSupabaseConfigured()) {
    try {
      supabaseClient = window.supabase.createClient(
        CONFIG.SUPABASE.url,
        CONFIG.SUPABASE.anonKey
      );
    } catch (e) {
      console.warn("Could not initialize Supabase client:", e);
    }
  }

  // Helper: Secure HTML escape to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ==============================================================================
  // 1. STORE HOURS (Accurate Africa/Freetown GMT/UTC Time)
  // ==============================================================================
  function updateStoreHoursStatus() {
    const statusBadges = document.querySelectorAll('[data-store-status]');
    if (!statusBadges.length) return;

    // Sierra Leone is on GMT/UTC all year round (Africa/Freetown)
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const currentMins = utcHour * 60 + utcMinute;

    let isOpen = false;
    let nextOpenText = "";

    if (utcDay === 0) {
      // Sunday: 13:00 to 17:00 (1 PM to 5 PM)
      const openMins = 13 * 60;
      const closeMins = 17 * 60;
      if (currentMins >= openMins && currentMins < closeMins) {
        isOpen = true;
      } else if (currentMins < openMins) {
        nextOpenText = "today at 13:00";
      } else {
        nextOpenText = "tomorrow at 09:00";
      }
    } else {
      // Monday to Saturday: 09:00 to 19:00 (9 AM to 7 PM)
      const openMins = 9 * 60;
      const closeMins = 19 * 60;
      if (currentMins >= openMins && currentMins < closeMins) {
        isOpen = true;
      } else if (currentMins < openMins) {
        nextOpenText = "today at 09:00";
      } else {
        if (utcDay === 6) {
          nextOpenText = "Sunday at 13:00";
        } else {
          nextOpenText = "tomorrow at 09:00";
        }
      }
    }

    statusBadges.forEach(el => {
      if (isOpen) {
        el.innerHTML = `<span class="status-indicator status-open"></span> Open Today (Closes ${utcDay === 0 ? '17:00' : '19:00'})`;
      } else {
        el.innerHTML = `<span class="status-indicator status-closed"></span> Closed now, opens ${nextOpenText}`;
      }
    });
  }

  // ==============================================================================
  // 2. WHATSAPP LOGGING & REDIRECTION
  // ==============================================================================
  async function logOrderAndRedirect(productName, customerName = "A customer", orderType = "retail", notes = "", customMsg = "") {
    const cleanNum = CONFIG.BUSINESS.whatsappNumber || "23275416008";

    // 1. Asynchronously log order to Supabase orders table (if configured)
    if (supabaseClient) {
      try {
        await supabaseClient.from('orders').insert([{
          product_name: productName,
          customer_name: customerName,
          order_type: orderType,
          notes: notes,
          status: 'new'
        }]);
      } catch (err) {
        console.warn("Could not log order to Supabase:", err);
      }
    }

    // 2. Construct WhatsApp Message URL
    let text = customMsg;
    if (!text) {
      text = `Hello Humu! 👋 I'm on your website and would love to inquire about the ${productName}. Could you please confirm if it's in stock? Thank you!`;
    }

    const whatsappUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Attach click listeners to WhatsApp order buttons
  function bindWhatsAppButtons() {
    document.querySelectorAll('[data-wa-order]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productName = btn.getAttribute('data-wa-order') || "Boutique Item";
        const customMessage = btn.getAttribute('data-wa-msg') || "";
        logOrderAndRedirect(productName, "Website Visitor", "retail", "", customMessage);
      });
    });
  }

  // ==============================================================================
  // 3. WHATSAPP ORDER BUILDER (Home Page)
  // ==============================================================================
  function setupOrderBuilder() {
    const form = document.getElementById('whatsappOrderForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('orderCustName')?.value.trim() || "A valued customer";
      const category = document.getElementById('orderCustCategory')?.value || "General Fashion";
      const orderType = document.getElementById('orderCustType')?.value || "Retail";
      const contact = document.getElementById('orderCustPhone')?.value.trim() || "Via WhatsApp";
      const details = document.getElementById('orderCustDetails')?.value.trim() || "Inquiring about stock and sizes";

      const formattedMessage = 
        `Hello Humu! 👋%0A%0A` +
        `I would love to place an order from your boutique:%0A` +
        `• *Name:* ${encodeURIComponent(name)}%0A` +
        `• *Looking for:* ${encodeURIComponent(category)} (${encodeURIComponent(orderType)})%0A` +
        `• *Contact / Phone:* ${encodeURIComponent(contact)}%0A` +
        `• *Preferences / Notes:* ${encodeURIComponent(details)}%0A%0A` +
        `Could you please let me know current availability and price? Thank you!`;

      logOrderAndRedirect(`${category} (${orderType})`, name, orderType.toLowerCase(), details, decodeURIComponent(formattedMessage));
    });
  }

  // ==============================================================================
  // 4. CUSTOMER REVIEWS (Rendered with Warm Human Touch)
  // ==============================================================================
  function getInitials(name) {
    if (!name) return "HK";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function renderReviewsHtml(reviews) {
    let html = `<div class="reviews-grid">`;
    reviews.forEach(r => {
      const stars = '★'.repeat(Math.max(1, Math.min(5, r.rating))) + '☆'.repeat(Math.max(0, 5 - r.rating));
      const initials = getInitials(r.name);
      html += `
        <div class="review-card">
          <div>
            <div class="review-user-row">
              <div class="review-avatar-circle">${escapeHTML(initials)}</div>
              <div class="review-user-info">
                <div class="review-author">
                  ${escapeHTML(r.name)}
                  <span class="review-verified-badge" title="Verified Customer"><i class="fa-solid fa-circle-check"></i> Verified</span>
                </div>
                <div class="review-subline">Customer in Sierra Leone</div>
              </div>
            </div>
            <span class="review-item-chip"><i class="fa-solid fa-bag-shopping"></i> ${escapeHTML(r.item)}</span>
            <div class="review-stars">${stars}</div>
            <p class="review-text">"${escapeHTML(r.text)}"</p>
          </div>
        </div>
      `;
    });
    html += `</div>
      <div style="text-align: center; margin-top: 20px;">
        <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 12px;">
          Have you shopped with Humu Kabba? We'd love your honest feedback!
        </p>
        <a href="https://wa.me/${CONFIG.BUSINESS.whatsappNumber}?text=${encodeURIComponent('Hello Humu! 👋 I would like to leave a review for your boutique:\n\n• My Name: \n• What I bought: \n• Rating (1 to 5): \n• My feedback: ')}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
          <i class="fa-brands fa-whatsapp" style="color: var(--whatsapp-green);"></i> Share a Review or Voice Note on WhatsApp
        </a>
      </div>`;
    return html;
  }

  async function loadCustomerReviews() {
    const listContainer = document.getElementById('reviewsList');
    if (!listContainer) return;

    if (!supabaseClient) return; // Keep pre-rendered static reviews

    try {
      const { data: reviews, error } = await supabaseClient
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !reviews || reviews.length === 0) {
        return; // Keep existing static humanized reviews
      }

      listContainer.innerHTML = renderReviewsHtml(reviews);
    } catch (e) {
      console.warn("Could not fetch reviews from Supabase:", e);
    }
  }

  // ==============================================================================
  // 5. PHONE CASES & COLLECTIONS DYNAMIC LOADING
  // ==============================================================================
  async function loadDynamicProducts(categoryFilter = null) {
    const container = document.getElementById('dynamicProductsContainer');
    if (!container || !supabaseClient) return;

    try {
      let query = supabaseClient.from('products').select('*').order('created_at', { ascending: false });
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data: products, error } = await query;
      if (error || !products || products.length === 0) return; // Keep static fallback

      let html = '';
      products.forEach(p => {
        const isCase = p.category === 'Phone Cases';
        const orderMessage = isCase
          ? `Hello Humu Kabba Variety Vault, I would like to order the ${p.name} phone case for iPhone 17 Pro Max. Please confirm it is in stock.`
          : `Hello Humu Kabba Variety Vault, I would like to inquire about ${p.name}. Please confirm availability and pricing.`;

        const priceDisplay = p.price && Number(p.price) > 0
          ? `<span class="product-price">SLE ${Number(p.price).toLocaleString()}</span>`
          : `<span class="ask-price">Ask price on WhatsApp</span>`;

        const stockBadge = !p.in_stock ? `<span class="sold-out-badge">Sold Out</span>` : '';

        html += `
          <article class="product-card" data-category="${escapeHTML(p.category)}">
            <div class="product-img-wrap">
              <img src="${escapeHTML(p.image_url || 'assets/logo.jpg')}" alt="${escapeHTML(p.name)}" loading="lazy" class="product-img">
              <span class="product-tag">${escapeHTML(p.category)}</span>
            </div>
            <div class="product-body">
              <h3 class="product-title">${escapeHTML(p.name)}</h3>
              ${p.colors ? `<div class="product-colors">${escapeHTML(p.colors)}</div>` : ''}
              <p class="product-desc">${escapeHTML(p.description || '')}</p>
              <div class="product-footer">
                <div>
                  ${priceDisplay}
                  ${stockBadge}
                </div>
                ${p.in_stock ? `
                  <button type="button" class="btn btn-whatsapp btn-sm" data-wa-order="${escapeHTML(p.name)}" data-wa-msg="${escapeHTML(orderMessage)}">
                    <i class="fa-brands fa-whatsapp"></i> ${isCase ? 'Order' : 'Inquire'}
                  </button>
                ` : `
                  <button type="button" class="btn btn-outline btn-sm" disabled style="opacity: 0.6; cursor: not-allowed;">
                    Sold Out
                  </button>
                `}
              </div>
            </div>
          </article>
        `;
      });

      container.innerHTML = html;
      bindWhatsAppButtons();
    } catch (e) {
      console.warn("Could not load dynamic products:", e);
    }
  }

  // ==============================================================================
  // 6. REALTIME SUBSCRIPTIONS
  // ==============================================================================
  function setupRealtimeListeners() {
    if (!supabaseClient) return;

    try {
      supabaseClient
        .channel('public:realtime_feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadDynamicProducts();
          loadAdminProductList();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          loadCustomerReviews();
          loadAdminReviewsList();
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
          loadAdminOrdersList();
        })
        .subscribe();
    } catch (err) {
      console.warn("Supabase Realtime not initialized:", err);
    }
  }

  // ==============================================================================
  // 7. CLIENT-SIDE IMAGE RESIZING (Canvas to ~900px JPEG)
  // ==============================================================================
  function resizeImageToJpeg(file, maxDimension = 900, quality = 0.85) {
    return new Promise((resolve, reject) => {
      if (!file.type.match(/image.*/)) {
        return reject(new Error("File is not an image"));
      }
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Image compression failed"));
            resolve(blob);
          }, 'image/jpeg', quality);
        };
        img.onerror = () => reject(new Error("Image load error"));
        img.src = readerEvent.target.result;
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsDataURL(file);
    });
  }

  // ==============================================================================
  // 8. OWNER PANEL (Authentication, Product & Review Management)
  // ==============================================================================
  const ownerOverlay = document.getElementById('ownerOverlay');
  const ownerLoginView = document.getElementById('ownerLoginView');
  const ownerDashboardView = document.getElementById('ownerDashboardView');

  function openOwnerPanel() {
    if (!ownerOverlay) return;
    ownerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    checkAuthStatus();
  }

  function closeOwnerPanel() {
    if (!ownerOverlay) return;
    ownerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  async function checkAuthStatus() {
    if (!supabaseClient) {
      if (ownerLoginView) {
        ownerLoginView.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h4 style="color: var(--gold-accent); margin-bottom: 10px;">Supabase Credentials Required</h4>
            <p style="font-size: 0.9rem; margin-bottom: 15px;">Please update <code>config.js</code> with your Supabase Project URL and Public Anon Key.</p>
            <p style="font-size: 0.85rem; color: var(--text-dim);">Once added, push to GitHub or reload to manage products and reviews.</p>
          </div>
        `;
      }
      return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;

    if (currentUser) {
      // Check admin status via is_admin function
      const { data: adminCheck } = await supabaseClient.rpc('is_admin');
      isAdmin = !!adminCheck;

      if (isAdmin) {
        if (ownerLoginView) ownerLoginView.style.display = 'none';
        if (ownerDashboardView) ownerDashboardView.style.display = 'block';
        loadAdminProductList();
        loadAdminReviewsList();
        loadAdminOrdersList();
      } else {
        showToast("Signed in user is not registered as an Owner in admins table.", "error");
        if (ownerLoginView) ownerLoginView.style.display = 'block';
        if (ownerDashboardView) ownerDashboardView.style.display = 'none';
      }
    } else {
      if (ownerLoginView) ownerLoginView.style.display = 'block';
      if (ownerDashboardView) ownerDashboardView.style.display = 'none';
    }
  }

  // Handle Owner Sign-In
  const loginForm = document.getElementById('ownerLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('ownerEmail')?.value.trim();
      const password = document.getElementById('ownerPassword')?.value;
      const errorMsgEl = document.getElementById('loginErrorMsg');

      if (!email || !password || !supabaseClient) return;

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
          if (errorMsgEl) errorMsgEl.textContent = error.message;
          return;
        }
        if (errorMsgEl) errorMsgEl.textContent = '';
        showToast("Welcome back, Owner!", "success");
        checkAuthStatus();
      } catch (err) {
        if (errorMsgEl) errorMsgEl.textContent = err.message;
      }
    });
  }

  // Handle Owner Sign-Out
  const logoutBtn = document.getElementById('ownerLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
        currentUser = null;
        isAdmin = false;
        showToast("Signed out successfully.");
        checkAuthStatus();
      }
    });
  }

  // Handle Add Product Form
  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!supabaseClient || !isAdmin) {
        showToast("Could not save. Check that you are signed in as the owner.", "error");
        return;
      }

      const name = document.getElementById('prodName')?.value.trim();
      const category = document.getElementById('prodCategory')?.value || 'Phone Cases';
      const colors = document.getElementById('prodColors')?.value.trim();
      const priceVal = document.getElementById('prodPrice')?.value;
      const price = priceVal && !isNaN(priceVal) ? parseFloat(priceVal) : null;
      const description = document.getElementById('prodDesc')?.value.trim();
      const fileInput = document.getElementById('prodImage');
      const submitBtn = document.getElementById('saveProductBtn');

      if (!name) {
        showToast("Product name is required.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Resizing & Uploading...";

      try {
        let imageUrl = "";

        if (fileInput && fileInput.files && fileInput.files[0]) {
          const rawFile = fileInput.files[0];
          // Resize client-side to ~900px JPEG before upload
          const resizedBlob = await resizeImageToJpeg(rawFile, 900, 0.85);

          const fileName = `${Date.now()}_${rawFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.jpg`;
          const { error: uploadErr } = await supabaseClient.storage
            .from('product-images')
            .upload(fileName, resizedBlob, { contentType: 'image/jpeg' });

          if (uploadErr) {
            throw new Error("Photo upload failed: " + uploadErr.message);
          }

          const { data: publicUrlData } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(fileName);

          imageUrl = publicUrlData.publicUrl;
        }

        const { error: insertErr } = await supabaseClient.from('products').insert([{
          name,
          category,
          colors,
          price,
          description,
          image_url: imageUrl,
          in_stock: true
        }]);

        if (insertErr) throw insertErr;

        showToast("Product added successfully!", "success");
        addProductForm.reset();
        loadAdminProductList();
        loadDynamicProducts();
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save & Publish Product";
      }
    });
  }

  // Load Admin Product List
  async function loadAdminProductList() {
    const listEl = document.getElementById('adminProductsList');
    if (!listEl || !supabaseClient) return;

    const { data: products } = await supabaseClient
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!products || products.length === 0) {
      listEl.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 15px;">No products yet. Use the tab above to add your first product.</td></tr>`;
      return;
    }

    let rows = '';
    products.forEach(p => {
      rows += `
        <tr>
          <td><strong>${escapeHTML(p.name)}</strong></td>
          <td>${escapeHTML(p.category)}</td>
          <td>${p.price ? 'SLE ' + Number(p.price).toLocaleString() : '<em style="color: var(--gold-accent);">Ask price</em>'}</td>
          <td>
            <span class="admin-badge ${p.in_stock ? 'stock-in' : 'stock-out'}">
              ${p.in_stock ? 'In Stock' : 'Sold Out'}
            </span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm toggle-stock-btn" data-id="${p.id}" data-stock="${p.in_stock}">
              ${p.in_stock ? 'Mark Sold Out' : 'Mark In Stock'}
            </button>
            <button class="btn btn-sm delete-prod-btn" data-id="${p.id}" style="color: var(--danger-color); margin-left: 6px;">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
    listEl.innerHTML = rows;

    // Attach listeners
    listEl.querySelectorAll('.toggle-stock-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const currentStock = btn.getAttribute('data-stock') === 'true';
        await supabaseClient.from('products').update({ in_stock: !currentStock }).eq('id', id);
        showToast(`Product marked as ${!currentStock ? 'In Stock' : 'Sold Out'}.`);
        loadAdminProductList();
        loadDynamicProducts();
      });
    });

    listEl.querySelectorAll('.delete-prod-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
        const id = btn.getAttribute('data-id');
        await supabaseClient.from('products').delete().eq('id', id);
        showToast("Product deleted successfully.");
        loadAdminProductList();
        loadDynamicProducts();
      });
    });
  }

  // Handle Add Approved Review Form
  const addReviewForm = document.getElementById('addReviewForm');
  if (addReviewForm) {
    addReviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!supabaseClient || !isAdmin) {
        showToast("Could not save. Check that you are signed in as the owner.", "error");
        return;
      }

      const name = document.getElementById('revCustomerName')?.value.trim();
      const item = document.getElementById('revItemName')?.value.trim();
      const rating = parseInt(document.getElementById('revRating')?.value || '5', 10);
      const text = document.getElementById('revText')?.value.trim();

      if (!name || !item || !text) {
        showToast("Please complete all review fields.", "error");
        return;
      }

      try {
        const { error } = await supabaseClient.from('reviews').insert([{
          name, item, rating, text
        }]);
        if (error) throw error;

        showToast("Approved review published live!", "success");
        addReviewForm.reset();
        loadAdminReviewsList();
        loadCustomerReviews();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

  // Load Admin Reviews List
  async function loadAdminReviewsList() {
    const listEl = document.getElementById('adminReviewsList');
    if (!listEl || !supabaseClient) return;

    const { data: reviews } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
    if (!reviews || reviews.length === 0) {
      listEl.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No reviews published yet.</p>`;
      return;
    }

    let html = '';
    reviews.forEach(r => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div>
            <strong>${escapeHTML(r.name)}</strong> (${r.rating}★) — <span style="color: var(--gold-accent);">${escapeHTML(r.item)}</span>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">"${escapeHTML(r.text)}"</p>
          </div>
          <button class="btn btn-sm delete-rev-btn" data-id="${r.id}" style="color: var(--danger-color);">Delete</button>
        </div>
      `;
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll('.delete-rev-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm("Delete this review from the public site?")) return;
        const id = btn.getAttribute('data-id');
        await supabaseClient.from('reviews').delete().eq('id', id);
        showToast("Review deleted.");
        loadAdminReviewsList();
        loadCustomerReviews();
      });
    });
  }

  // Load Admin WhatsApp Orders List (Latest 10)
  async function loadAdminOrdersList() {
    const listEl = document.getElementById('adminOrdersList');
    if (!listEl || !supabaseClient) return;

    const { data: orders } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!orders || orders.length === 0) {
      listEl.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 15px;">No orders captured yet. When customers click "Order on WhatsApp", they will be logged here.</td></tr>`;
      return;
    }

    let rows = '';
    orders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      rows += `
        <tr>
          <td><strong>${escapeHTML(o.product_name)}</strong></td>
          <td>${escapeHTML(o.customer_name || 'Website Visitor')}</td>
          <td>${escapeHTML(o.order_type || 'Retail')}</td>
          <td style="color: var(--text-dim); font-size: 0.82rem;">${dateStr}</td>
        </tr>
      `;
    });
    listEl.innerHTML = rows;
  }

  // ==============================================================================
  // 9. FIREBASE CLOUD MESSAGING (PUSH NOTIFICATIONS)
  // ==============================================================================
  const enablePushBtn = document.getElementById('enablePushBtn');
  if (enablePushBtn) {
    enablePushBtn.addEventListener('click', async () => {
      if (!CONFIG.isFirebaseConfigured || !CONFIG.isFirebaseConfigured()) {
        showToast("Firebase keys not set in config.js yet.", "error");
        return;
      }
      if (!supabaseClient || !currentUser) {
        showToast("Please sign in as Owner first.", "error");
        return;
      }

      if (!('Notification' in window)) {
        showToast("This browser does not support desktop notifications.", "error");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast("Notification permission was denied.", "error");
          return;
        }

        // Initialize Firebase Messaging if available
        if (typeof firebase !== 'undefined') {
          if (!firebase.apps.length) {
            firebase.initializeApp(CONFIG.FIREBASE);
          }
          const messaging = firebase.messaging();
          const token = await messaging.getToken({ vapidKey: CONFIG.FIREBASE.vapidKey });

          if (token) {
            // Store token in Supabase push_tokens table
            const { error } = await supabaseClient.from('push_tokens').upsert([{
              user_id: currentUser.id,
              token: token,
              updated_at: new Date().toISOString()
            }]);

            if (error) throw error;
            showToast("Push notifications enabled! You will be alerted when new orders start.", "success");
            enablePushBtn.textContent = "Notifications Enabled";
            enablePushBtn.disabled = true;
          }
        } else {
          showToast("Firebase library loading. Please try again in a few seconds.", "info");
        }
      } catch (err) {
        showToast("Push setup error: " + err.message, "error");
      }
    });
  }

  // ==============================================================================
  // 10. FAQ ACCORDION INTERACTION
  // ==============================================================================
  function setupFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // ==============================================================================
  // 11. INITIALIZATION & ROUTING
  // ==============================================================================
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Store Hours
    updateStoreHoursStatus();
    setInterval(updateStoreHoursStatus, 30000);

    // 2. Navigation Mobile Toggle
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileNavDrawer');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => drawer.classList.toggle('open'));
      drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));
    }

    // 3. Category Filter Tabs (Home & Catalog)
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        document.querySelectorAll('.product-card').forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // 4. WhatsApp bindings & Order builder
    bindWhatsAppButtons();
    setupOrderBuilder();

    // 5. FAQ Accordion
    setupFaqAccordion();

    // 6. Customer Reviews
    loadCustomerReviews();

    // 7. Dynamic Supabase Products
    loadDynamicProducts();
    setupRealtimeListeners();

    // 8. Owner Modal triggers (#admin or discreet link)
    document.querySelectorAll('[data-open-owner]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openOwnerPanel();
      });
    });

    document.querySelectorAll('[data-close-owner]').forEach(el => {
      el.addEventListener('click', closeOwnerPanel);
    });

    if (window.location.hash === '#admin') {
      openOwnerPanel();
    }

    // Owner modal tabs
    document.querySelectorAll('.owner-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.owner-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.owner-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        const content = document.getElementById(targetId);
        if (content) content.classList.add('active');
      });
    });
  });

})();
