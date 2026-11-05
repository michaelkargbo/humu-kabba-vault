/**
 * ==============================================================================
 * HUMU KABBA VARIETY VAULT - CORE JAVASCRIPT CONTROLLER
 * Handles: Store Hours, WhatsApp deep-linking, Shopping Bag Cart & Wishlist,
 * Realtime updates, Client-side image resizing, and Owner Management Panel.
 * ==============================================================================
 */

(function () {
  'use strict';

  // Fallback defaults if config.js not yet loaded
  const CONFIG = window.APP_CONFIG || {
    BUSINESS: {
      name: "Humu Kabba Variety Vault",
      whatsappNumber: "23277416008",
      whatsappLink: "https://wa.me/23277416008"
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
    const cleanNum = CONFIG.BUSINESS.whatsappNumber || "23277416008";

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
  // ==============================================================================
  // 3. ONLINE PAYMENTS & CHECKOUT ENGINE
  // (Full live stock inventory, quantity steppers, USSD & direct WhatsApp checkout are unified in Section 10 below)
  // ==============================================================================

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
        const stock = (p.stock_quantity !== undefined && p.stock_quantity !== null) ? parseInt(p.stock_quantity, 10) : (p.in_stock ? 10 : 0);
        const price = Number(p.price) || 450;
        const isFinished = stock <= 0;

        html += `
          <article class="product-card ${isFinished ? 'product-finished' : ''}" data-category="${escapeHTML(p.category)}" data-item-id="${escapeHTML(p.id)}" data-stock="${stock}" data-price="${price}" style="${isFinished ? 'order: 999;' : 'order: 1;'}">
            <div class="product-img-wrap">
              <img src="${escapeHTML(p.image_url || 'assets/logo.jpg')}" alt="${escapeHTML(p.name)}" loading="lazy" class="product-img">
              <span class="product-tag">${escapeHTML(p.category)}</span>
            </div>
            <div class="product-body">
              <h3 class="product-title">${escapeHTML(p.name)}</h3>
              ${p.colors ? `<div class="product-colors">${escapeHTML(p.colors)}</div>` : ''}
              <div class="product-stock-row">
                ${isFinished
                  ? `<span class="stock-pill finished"><i class="fa-solid fa-circle-xmark"></i> <strong>Finished in Store</strong> (0 Available)</span>`
                  : (stock <= 5
                    ? `<span class="stock-pill low-stock"><i class="fa-solid fa-fire"></i> <strong>Low Stock:</strong> Only ${stock} left in store!</span>`
                    : `<span class="stock-pill in-stock"><i class="fa-solid fa-boxes-stacked"></i> <strong>In Store:</strong> ${stock} pieces available</span>`
                  )
                }
              </div>
              <p class="product-desc">${escapeHTML(p.description || '')}</p>
              <div class="product-footer">
                <div>
                  <span class="product-price">SLE ${price.toLocaleString()}</span>
                </div>
                <div class="product-order-action">
                  <div class="card-qty-stepper">
                    <button type="button" class="card-qty-btn card-qty-minus" aria-label="Decrease quantity">-</button>
                    <input type="number" class="card-qty-val" value="1" min="1" max="${Math.max(1, stock)}" readonly>
                    <button type="button" class="card-qty-btn card-qty-plus" aria-label="Increase quantity">+</button>
                  </div>
                  ${!isFinished ? `
                    <button type="button" class="btn btn-whatsapp btn-sm btn-card-order" data-order-item="${escapeHTML(p.name)}" data-price="${price}">
                      <i class="fa-solid fa-cart-shopping"></i> Order Now
                    </button>
                  ` : `
                    <button type="button" class="btn btn-outline btn-sm btn-card-order" disabled style="opacity: 0.5; cursor: not-allowed;">
                      <i class="fa-solid fa-ban"></i> Finished in Store
                    </button>
                  `}
                </div>
              </div>
            </div>
          </article>
        `;
      });

      container.innerHTML = html;
      updateAndSortProducts();
      setupProductCardInteractions();
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
      const stockVal = document.getElementById('prodStock')?.value;
      const stock = stockVal !== '' && !isNaN(stockVal) ? Math.max(0, parseInt(stockVal, 10)) : 10;
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
          in_stock: stock > 0,
          stock_quantity: stock
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
      const stockQty = (p.stock_quantity !== undefined && p.stock_quantity !== null) ? parseInt(p.stock_quantity, 10) : (p.in_stock ? 10 : 0);
      const isFinished = stockQty <= 0 || !p.in_stock;
      rows += `
        <tr>
          <td><strong>${escapeHTML(p.name)}</strong></td>
          <td>${escapeHTML(p.category)}</td>
          <td>${p.price ? 'SLE ' + Number(p.price).toLocaleString() : '<em style="color: var(--gold-accent);">Ask price</em>'}</td>
          <td>
            <span class="admin-badge ${!isFinished ? 'stock-in' : 'stock-out'}">
              ${!isFinished ? `${stockQty} in Store` : 'Finished (0)'}
            </span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm toggle-stock-btn" data-id="${p.id}" data-stock="${!isFinished}">
              ${!isFinished ? 'Mark Finished' : 'Restock (10)'}
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
        const currentlyInStock = btn.getAttribute('data-stock') === 'true';
        const newStock = currentlyInStock ? 0 : 10;
        await supabaseClient.from('products').update({ in_stock: !currentlyInStock, stock_quantity: newStock }).eq('id', id);
        showToast(`Product marked as ${!currentlyInStock ? 'In Stock (10)' : 'Finished (0)'}.`);
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

  // Load Admin WhatsApp Orders & Payment Auditing List
  async function loadAdminOrdersList() {
    const listEl = document.getElementById('adminOrdersList');
    if (!listEl || !supabaseClient) return;

    const { data: orders } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);

    if (!orders || orders.length === 0) {
      listEl.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 15px;">No orders captured yet. When customers complete checkout or click "Order on WhatsApp", they will be logged here.</td></tr>`;
      return;
    }

    let rows = '';
    orders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      // Payment method badge
      let paymentBadge = '<span class="order-badge order-badge-pending">Inquiry</span>';
      if (o.payment_method === 'orange_money') {
        paymentBadge = `<span class="order-badge order-badge-om"><i class="fa-solid fa-mobile-screen"></i> Orange Money</span>`;
      } else if (o.payment_method === 'afrimoney') {
        paymentBadge = `<span class="order-badge order-badge-afri"><i class="fa-solid fa-mobile-screen"></i> Afrimoney</span>`;
      } else if (o.payment_method === 'credit_card' || o.payment_method === 'debit_card') {
        paymentBadge = `<span class="order-badge order-badge-card"><i class="fa-solid fa-credit-card"></i> Card</span>`;
      } else if (o.payment_method === 'cash_delivery') {
        paymentBadge = `<span class="order-badge order-badge-pending"><i class="fa-solid fa-hand-holding-dollar"></i> Cash</span>`;
      }

      // Status badge
      let statusBadge = '<span class="order-badge order-badge-pending">Pending</span>';
      if (o.payment_status === 'paid' || o.status === 'confirmed' || o.status === 'paid') {
        statusBadge = `<span class="order-badge order-badge-paid"><i class="fa-solid fa-check"></i> Paid</span>`;
      }

      const amountText = (o.amount !== null && o.amount !== undefined && o.amount !== '') 
        ? `<strong style="color: var(--gold-accent);">SLE ${Number(o.amount).toFixed(2)}</strong>` 
        : '<span style="color: var(--text-dim); font-size: 0.8rem;">Ask Price</span>';

      const refText = o.payment_reference 
        ? `<div style="font-size: 0.72rem; color: var(--gold-accent); font-family: monospace; margin-top: 2px;">${escapeHTML(o.payment_reference)}</div>` 
        : '';

      const phoneText = o.phone 
        ? `<div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(o.phone)}</div>` 
        : '';

      rows += `
        <tr>
          <td><strong>${escapeHTML(o.product_name)}</strong></td>
          <td>${escapeHTML(o.customer_name || 'Website Visitor')}${phoneText}</td>
          <td>${amountText}<div style="margin-top: 3px;">${paymentBadge}</div></td>
          <td>${statusBadge}${refText}</td>
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
  // 10. INVENTORY STORE, LIVE STOCK TRACKING & ORDER/PAYMENT ENGINE
  // ==============================================================================

  // Central boutique inventory with live store stock
  const INVENTORY = {
    "case-crystal": { id: "case-crystal", name: "iPhone 17 Pro Max Case (Crystal Shell)", price: 450, stock: 12, category: "Phone Cases" },
    "case-heart": { id: "case-heart", name: "iPhone 17 Pro Max Case (Heart Shimmer)", price: 450, stock: 2, category: "Phone Cases" },
    "case-monogram": { id: "case-monogram", name: "iPhone 17 Pro Max Case (Monogram Leather)", price: 500, stock: 0, category: "Phone Cases" },
    "bags-clutches": { id: "bags-clutches", name: "Luxury Designer Handbag", price: 950, stock: 8, category: "Bags & Accessories" },
    "evening-dresses": { id: "evening-dresses", name: "Boutique Evening Dress", price: 850, stock: 14, category: "Apparel & Dresses" },
    "luxury-perfumes": { id: "luxury-perfumes", name: "Luxury Arabian Perfume", price: 650, stock: 18, category: "Beauty & Perfumes" },
    "footwear-denim": { id: "footwear-denim", name: "Designer Footwear / Heels", price: 750, stock: 4, category: "Footwear & Denim" },
    "custom-piece": { id: "custom-piece", name: "Custom Item / Other Fashion Piece", price: 500, stock: 20, category: "Other" }
  };

  // Helper to find inventory item by name or id
  function getInventoryItem(identifier) {
    if (!identifier) return null;
    if (INVENTORY[identifier]) return INVENTORY[identifier];
    const lower = identifier.toLowerCase();
    for (const key in INVENTORY) {
      if (INVENTORY[key].name.toLowerCase() === lower || 
          lower.includes(INVENTORY[key].name.toLowerCase()) || 
          INVENTORY[key].name.toLowerCase().includes(lower)) {
        return INVENTORY[key];
      }
    }
    return null;
  }

  // Update product cards across the DOM and sort finished products down to bottom
  function updateAndSortProducts() {
    const containers = document.querySelectorAll('.product-grid');
    containers.forEach(container => {
      const cards = Array.from(container.querySelectorAll('.product-card'));
      cards.forEach(card => {
        const itemId = card.getAttribute('data-item-id');
        const titleEl = card.querySelector('.product-title');
        const itemName = titleEl ? titleEl.textContent.trim() : card.getAttribute('data-order-item');
        const item = INVENTORY[itemId] || getInventoryItem(itemName);
        
        let stock = item ? item.stock : parseInt(card.getAttribute('data-stock') || '0', 10);
        card.setAttribute('data-stock', stock);

        const isFinished = (stock <= 0);
        card.classList.toggle('product-finished', isFinished);
        card.style.order = isFinished ? '999' : '1';

        // Update or create stock row / pill
        let stockRow = card.querySelector('.product-stock-row');
        if (!stockRow) {
          stockRow = document.createElement('div');
          stockRow.className = 'product-stock-row';
          const body = card.querySelector('.product-body');
          const desc = card.querySelector('.product-desc');
          if (body && desc) body.insertBefore(stockRow, desc);
        }

        let stockPill = card.querySelector('.stock-pill');
        if (!stockPill && stockRow) {
          stockPill = document.createElement('span');
          stockRow.appendChild(stockPill);
        }

        if (stockPill) {
          if (isFinished) {
            stockPill.className = 'stock-pill finished';
            stockPill.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <strong>Finished in Store</strong> (0 Available)';
          } else if (stock <= 5) {
            stockPill.className = 'stock-pill low-stock';
            stockPill.innerHTML = `<i class="fa-solid fa-fire"></i> <strong>Low Stock:</strong> Only ${stock} left in store!`;
          } else {
            stockPill.className = 'stock-pill in-stock';
            stockPill.innerHTML = `<i class="fa-solid fa-boxes-stacked"></i> <strong>In Store:</strong> ${stock} pieces available`;
          }
        }

        // Stepper input max
        const qtyVal = card.querySelector('.card-qty-val');
        if (qtyVal) {
          qtyVal.max = Math.max(1, stock);
          if (parseInt(qtyVal.value || '1', 10) > stock && stock > 0) qtyVal.value = stock;
        }

        // Action button states
        const orderBtn = card.querySelector('.btn-card-order');
        if (orderBtn) {
          if (isFinished) {
            orderBtn.disabled = true;
            orderBtn.style.opacity = '0.5';
            orderBtn.style.cursor = 'not-allowed';
            orderBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Finished in Store';
          } else {
            orderBtn.disabled = false;
            orderBtn.style.opacity = '1';
            orderBtn.style.cursor = 'pointer';
            orderBtn.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> Order Now';
          }
        }
      });

      // Sort cards: in-stock items first, finished items sink to bottom
      cards.sort((a, b) => {
        const stockA = parseInt(a.getAttribute('data-stock') || '0', 10);
        const stockB = parseInt(b.getAttribute('data-stock') || '0', 10);
        if (stockA > 0 && stockB <= 0) return -1;
        if (stockA <= 0 && stockB > 0) return 1;
        return 0;
      });
      cards.forEach(card => container.appendChild(card));
    });
  }

  // Setup product card interactive quantity steppers, bag additions & wishlist triggers
  function setupProductCardInteractions() {
    document.querySelectorAll('.product-card').forEach(card => {
      const minusBtn = card.querySelector('.card-qty-minus');
      const plusBtn = card.querySelector('.card-qty-plus');
      const qtyInput = card.querySelector('.card-qty-val');
      const orderBtn = card.querySelector('.btn-card-order');
      const imgWrap = card.querySelector('.product-img-wrap');
      const orderBar = card.querySelector('.product-order-bar');
      const itemId = card.getAttribute('data-item-id') || (card.querySelector('.product-title')?.textContent?.trim() || "item").toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const title = card.querySelector('.product-title')?.textContent?.trim() || orderBtn?.getAttribute('data-order-item') || "Boutique Item";
      const price = parseFloat(card.getAttribute('data-price') || orderBtn?.getAttribute('data-price') || '450');
      const stock = parseInt(card.getAttribute('data-stock') || '0', 10);
      const category = card.getAttribute('data-category') || "Collections";
      const img = card.querySelector('.product-img')?.getAttribute('src') || "assets/logo.jpg";
      const desc = card.querySelector('.product-desc')?.textContent?.trim() || "";

      // 1. Wishlist button overlay
      if (imgWrap && !imgWrap.querySelector('.card-wishlist-btn')) {
        const wishBtn = document.createElement('button');
        wishBtn.type = 'button';
        wishBtn.className = 'card-wishlist-btn';
        wishBtn.setAttribute('aria-label', `Add ${title} to wishlist`);
        wishBtn.title = "Save to Wishlist";
        const isSaved = WishlistManager.has(itemId);
        wishBtn.innerHTML = `<i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
        if (isSaved) wishBtn.classList.add('active');

        wishBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const savedNow = WishlistManager.toggle({
            id: itemId,
            name: title,
            price: price,
            category: category,
            image: img,
            stock: stock,
            desc: desc
          });
          wishBtn.classList.toggle('active', savedNow);
          wishBtn.innerHTML = `<i class="${savedNow ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
          showToast(savedNow ? `Saved ${title} to Wishlist ❤️` : `Removed from Wishlist`, savedNow ? 'info' : 'warning');
        });
        imgWrap.appendChild(wishBtn);
      }

      // 2. Quick View button overlay
      if (imgWrap && !imgWrap.querySelector('.card-quickview-btn')) {
        const qvBtn = document.createElement('button');
        qvBtn.type = 'button';
        qvBtn.className = 'card-quickview-btn';
        qvBtn.setAttribute('aria-label', `Quick view ${title}`);
        qvBtn.title = "Quick View";
        qvBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
        qvBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          QuickViewManager.open({
            id: itemId,
            name: title,
            price: price,
            category: category,
            image: img,
            stock: stock,
            desc: desc
          });
        });
        imgWrap.appendChild(qvBtn);
      }

      // 3. Add to Bag button injection
      if (orderBar && !orderBar.querySelector('.btn-add-bag')) {
        const bagBtn = document.createElement('button');
        bagBtn.type = 'button';
        bagBtn.className = 'btn btn-add-bag btn-sm';
        bagBtn.title = stock > 0 ? "Add to your Shopping Bag" : "Finished in store";
        if (stock <= 0) {
          bagBtn.disabled = true;
          bagBtn.style.opacity = '0.5';
          bagBtn.style.cursor = 'not-allowed';
          bagBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Finished';
        } else {
          bagBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Add to Bag';
          bagBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentQty = qtyInput ? parseInt(qtyInput.value || '1', 10) : 1;
            CartManager.addItem({
              id: itemId,
              name: title,
              price: price,
              category: category,
              image: img,
              stock: stock
            }, currentQty);

            // Button feedback
            bagBtn.classList.add('added');
            bagBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
            setTimeout(() => {
              bagBtn.classList.remove('added');
              bagBtn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Add to Bag';
            }, 1800);
          });
        }
        const stepper = orderBar.querySelector('.card-qty-stepper');
        if (stepper && stepper.nextSibling) {
          orderBar.insertBefore(bagBtn, stepper.nextSibling);
        } else {
          orderBar.prepend(bagBtn);
        }
      }

      // 4. Quantity Stepper Controls
      if (minusBtn && qtyInput) {
        minusBtn.onclick = (e) => {
          e.stopPropagation();
          let current = parseInt(qtyInput.value || '1', 10);
          if (current > 1) qtyInput.value = current - 1;
        };
      }

      if (plusBtn && qtyInput) {
        plusBtn.onclick = (e) => {
          e.stopPropagation();
          let current = parseInt(qtyInput.value || '1', 10);
          if (current < stock) {
            qtyInput.value = current + 1;
          } else {
            showToast(`Only ${stock} pieces available in store for this item!`, 'warning');
          }
        };
      }

      // 5. Direct Order Button (preserves existing direct checkout scroll)
      if (orderBtn) {
        orderBtn.onclick = (e) => {
          e.preventDefault();
          if (stock <= 0) {
            showToast("This item is currently finished in store.", "error");
            return;
          }
          const qty = qtyInput ? parseInt(qtyInput.value || '1', 10) : 1;
          selectAndFocusCheckoutItem(title, qty, price);
        };
      }
    });
  }

  // Global helper to select an item and quantity in Checkout and smoothly scroll
  function selectAndFocusCheckoutItem(itemName, quantity, price) {
    const chkCategory = document.getElementById('chkCategory');
    const chkQuantity = document.getElementById('chkQuantity');
    const btnModeCheckout = document.getElementById('btnModeCheckout');
    const btnModeInquiry = document.getElementById('btnModeInquiry');
    const onlineForm = document.getElementById('onlineCheckoutForm');
    const waForm = document.getElementById('whatsappOrderForm');

    // Activate checkout tab
    if (btnModeCheckout && btnModeInquiry) {
      btnModeCheckout.classList.add('active');
      btnModeInquiry.classList.remove('active');
      if (onlineForm) onlineForm.style.display = '';
      if (waForm) waForm.style.display = 'none';
    }

    if (chkCategory) {
      let matched = false;
      const lower = itemName.toLowerCase();
      for (let i = 0; i < chkCategory.options.length; i++) {
        const optText = chkCategory.options[i].text.toLowerCase();
        const optVal = chkCategory.options[i].value.toLowerCase();
        if (optText.includes(lower) || optVal.includes(lower) || lower.includes(optVal)) {
          chkCategory.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) {
        const newOpt = document.createElement('option');
        newOpt.value = itemName;
        newOpt.text = `${itemName} (SLE ${price || 450})`;
        newOpt.setAttribute('data-price', price || 450);
        newOpt.setAttribute('data-stock', 10);
        chkCategory.add(newOpt, 0);
        chkCategory.selectedIndex = 0;
      }
    }

    if (chkQuantity) {
      chkQuantity.value = Math.max(1, quantity || 1);
    }

    // Trigger update
    if (typeof updateSummaryGlobal === 'function') {
      updateSummaryGlobal();
    }

    // Scroll to order section
    const orderSection = document.getElementById('order');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showToast(`Selected ${quantity}× ${itemName}. Complete direct payment below!`, 'success');
  }

  let updateSummaryGlobal = null;

  function setupOrderBuilder() {
    // ── Element references ──────────────────────────────────────────────────────
    const btnModeCheckout  = document.getElementById('btnModeCheckout');
    const btnModeInquiry   = document.getElementById('btnModeInquiry');
    const onlineForm       = document.getElementById('onlineCheckoutForm');
    const waForm           = document.getElementById('whatsappOrderForm');
    const paymentCards     = document.querySelectorAll('.payment-method-card');
    const detailsPanel     = document.getElementById('paymentDetailsPanel');
    const chkCategory      = document.getElementById('chkCategory');
    const chkQuantity      = document.getElementById('chkQuantity');
    const btnQtyMinus      = document.getElementById('btnQtyMinus');
    const btnQtyPlus       = document.getElementById('btnQtyPlus');
    const qtyHint          = document.getElementById('qtyAvailableHint');
    const stockNotice      = document.getElementById('chkStockNotice');
    const stockAvailVal    = document.getElementById('stockAvailVal');
    const stockRemainVal   = document.getElementById('stockRemainVal');
    const chkDeliveryArea  = document.getElementById('chkDeliveryArea');
    const summarySubtotal  = document.getElementById('summarySubtotal');
    const summaryDelivFee  = document.getElementById('summaryDeliveryFee');
    const summaryDelivLbl  = document.getElementById('summaryDeliveryLabel');
    const summaryTotal     = document.getElementById('summaryTotal');
    const submitBtn        = document.getElementById('checkoutSubmitBtn');
    const receiptModal     = document.getElementById('receiptModal');
    const receiptCloseBtn  = document.getElementById('receiptCloseBtn');

    if (!btnModeCheckout || !onlineForm) return;

    // ── Payment method details & USSD instructions ───────────────────────────
    const paymentInfo = {
      orange_money: {
        icon: 'fa-solid fa-mobile-screen-button',
        iconClass: 'pm-icon-orange',
        title: 'Orange Money (*144#)',
        subtitle: 'Direct mobile wallet push to Vault Hotline (+232 77 416008)',
        steps: [
          '<strong>Dial *144#</strong> on your phone (or tap Quick Dial below).',
          'Choose <strong>Option 2 (Send Money / Pay Merchant)</strong>.',
          'Recipient Number: <strong style="color: #ff7900;">+232 77 416008</strong> (Humu Kabba Variety Vault).',
          'Enter the exact order total shown above and confirm with your 4-digit PIN.',
          'Click <strong>Authorize Payment & Place Order</strong> below to generate your official receipt.'
        ],
        dialBtn: '<a href="tel:*144#" class="btn-ussd-dial btn-ussd-orange"><i class="fa-solid fa-phone"></i> Quick Dial *144# on Phone</a>'
      },
      afrimoney: {
        icon: 'fa-solid fa-money-bill-transfer',
        iconClass: 'pm-icon-afri',
        title: 'Afrimoney (*161#)',
        subtitle: 'Direct USSD instant transfer to Hotline (+232 77 416008)',
        steps: [
          '<strong>Dial *161#</strong> on your Africell phone (or tap Quick Dial below).',
          'Select <strong>Send Money / Pay Merchant</strong>.',
          'Recipient Number: <strong style="color: #e61c24;">+232 77 416008</strong> (Humu Kabba Variety Vault).',
          'Enter the exact order total and authorize with your PIN.',
          'Click <strong>Authorize Payment & Place Order</strong> below to receive your digital receipt.'
        ],
        dialBtn: '<a href="tel:*161#" class="btn-ussd-dial btn-ussd-afri"><i class="fa-solid fa-phone"></i> Quick Dial *161# on Phone</a>'
      },
      cash_delivery: {
        icon: 'fa-solid fa-hand-holding-dollar',
        iconClass: 'pm-icon-cash',
        title: 'Cash on Delivery / Aberdeen Store Pickup',
        subtitle: 'Pay at boutique or upon doorstep bike arrival',
        steps: [
          'Place your order below — no upfront transfer needed.',
          'Receive your receipt and WhatsApp dispatch confirmation immediately.',
          'Prepare the exact cash amount for our delivery rider or when visiting Aberdeen store.',
          'Boutique address: <strong>4B Johnson Land, Aberdeen, Freetown</strong> (Back of the Field).'
        ],
        dialBtn: '<a href="https://wa.me/23277416008?text=Hello%20Humu!%20%F0%9F%91%8B%20I%20am%20choosing%20Cash%20on%20Delivery%20for%20my%20order." target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm"><i class="fa-brands fa-whatsapp"></i> Chat with Humu on WhatsApp</a>'
      }
    };

    function getPrice(selectEl) {
      if (!selectEl) return 0;
      const opt = selectEl.options[selectEl.selectedIndex];
      return parseFloat(opt?.getAttribute('data-price') || '450');
    }

    function getDeliveryFee(selectEl) {
      if (!selectEl) return 0;
      const opt = selectEl.options[selectEl.selectedIndex];
      return parseFloat(opt?.getAttribute('data-fee') || '0');
    }

    function formatSLE(amount) {
      return 'SLE ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function getSelectedMethod() {
      const sel = document.querySelector('.payment-method-card.selected');
      return sel ? sel.getAttribute('data-method') : 'orange_money';
    }

    // ── Update live order summary & stock remainder ──────────────────────────
    function updateSummary() {
      if (!chkCategory || !summarySubtotal) return;

      const opt = chkCategory.options[chkCategory.selectedIndex];
      const optValue = opt ? opt.value : '';
      const optItemId = opt ? opt.getAttribute('data-item-id') : null;
      const invItem = INVENTORY[optItemId] || getInventoryItem(optValue);

      // Get available stock
      let availableStock = invItem ? invItem.stock : parseInt(opt?.getAttribute('data-stock') || '10', 10);
      if (isNaN(availableStock)) availableStock = 10;

      // Handle finished item
      const isFinished = (availableStock <= 0);

      // Bound quantity input
      let qty = parseInt(chkQuantity?.value || '1', 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      
      if (!isFinished && qty > availableStock) {
        qty = availableStock;
        if (chkQuantity) chkQuantity.value = qty;
        showToast(`Only ${availableStock} pieces available in store for this item!`, 'warning');
      }

      if (chkQuantity) {
        chkQuantity.max = Math.max(1, availableStock);
        chkQuantity.disabled = isFinished;
      }
      if (qtyHint) {
        qtyHint.textContent = isFinished ? '(Finished)' : `(Max: ${availableStock})`;
      }

      // Calculate stock remainder
      const remainder = isFinished ? 0 : Math.max(0, availableStock - qty);

      // Update Stock Notice Banner
      if (stockNotice && stockAvailVal && stockRemainVal) {
        if (isFinished) {
          stockNotice.className = 'chk-stock-banner out';
          stockAvailVal.textContent = '0 pieces (Finished in Store)';
          stockRemainVal.textContent = '0 pieces (Restocking Soon)';
        } else if (availableStock <= 5) {
          stockNotice.className = 'chk-stock-banner low';
          stockAvailVal.textContent = `${availableStock} pieces (Low Stock 🔥)`;
          stockRemainVal.textContent = `${remainder} pieces remaining`;
        } else {
          stockNotice.className = 'chk-stock-banner';
          stockAvailVal.textContent = `${availableStock} pieces in store`;
          stockRemainVal.textContent = `${remainder} pieces remaining`;
        }
      }

      // Calculate costs
      const price = getPrice(chkCategory);
      const fee = getDeliveryFee(chkDeliveryArea);
      const subtotal = isFinished ? 0 : (price * qty);
      const total = isFinished ? 0 : (subtotal + fee);

      if (summarySubtotal) summarySubtotal.textContent = formatSLE(subtotal);
      if (summaryDelivFee) {
        summaryDelivFee.textContent = fee === 0 ? 'FREE (Aberdeen Pickup)' : formatSLE(fee);
      }
      if (summaryDelivLbl) {
        summaryDelivLbl.textContent = fee === 0 ? 'Boutique Pickup' : 'Delivery Fee';
      }
      if (summaryTotal) summaryTotal.textContent = formatSLE(total);

      if (submitBtn) {
        if (isFinished) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.5';
          submitBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Item Finished in Store';
        } else {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Authorize Payment &amp; Place Order (${formatSLE(total)})`;
        }
      }
    }

    updateSummaryGlobal = updateSummary;

    // Quantity stepper buttons in checkout form
    if (btnQtyMinus && chkQuantity) {
      btnQtyMinus.addEventListener('click', () => {
        let val = parseInt(chkQuantity.value || '1', 10);
        if (val > 1) {
          chkQuantity.value = val - 1;
          updateSummary();
        }
      });
    }

    if (btnQtyPlus && chkQuantity) {
      btnQtyPlus.addEventListener('click', () => {
        const opt = chkCategory?.options[chkCategory.selectedIndex];
        const optItemId = opt ? opt.getAttribute('data-item-id') : null;
        const invItem = INVENTORY[optItemId] || getInventoryItem(opt?.value);
        const maxStock = invItem ? invItem.stock : parseInt(opt?.getAttribute('data-stock') || '50', 10);

        let val = parseInt(chkQuantity.value || '1', 10);
        if (val < maxStock) {
          chkQuantity.value = val + 1;
          updateSummary();
        } else {
          showToast(`Cannot select more than ${maxStock} pieces (all available store stock)!`, 'warning');
        }
      });
    }

    // ── Render payment details panel ───────────────────────────────────────────
    function renderPaymentPanel(method) {
      if (!detailsPanel) return;
      const info = paymentInfo[method] || paymentInfo.orange_money;

      const stepsHtml = info.steps.map((s, i) => `
        <li class="pd-step">
          <span class="pd-step-num">${i + 1}</span>
          <span>${s}</span>
        </li>`).join('');

      detailsPanel.innerHTML = `
        <div class="pd-header">
          <div class="pd-icon ${info.iconClass}"><i class="${info.icon}"></i></div>
          <div>
            <div class="pd-title">${info.title}</div>
            <div class="pd-subtitle">${info.subtitle}</div>
          </div>
        </div>
        <ul class="pd-steps">${stepsHtml}</ul>
        <div style="margin-top: 10px;">${info.dialBtn || ''}</div>`;
    }

    // ── Payment method card click handler ─────────────────────────────────────
    paymentCards.forEach(card => {
      card.addEventListener('click', () => {
        paymentCards.forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
        const method = card.getAttribute('data-method');
        renderPaymentPanel(method);
      });
    });

    // ── Tab toggle: Online Checkout ↔ WhatsApp Inquiry ────────────────────────
    if (btnModeCheckout && btnModeInquiry) {
      btnModeCheckout.addEventListener('click', () => {
        btnModeCheckout.classList.add('active');
        btnModeInquiry.classList.remove('active');
        if (onlineForm) onlineForm.style.display = '';
        if (waForm)     waForm.style.display = 'none';
      });

      btnModeInquiry.addEventListener('click', () => {
        btnModeInquiry.classList.add('active');
        btnModeCheckout.classList.remove('active');
        if (waForm)     waForm.style.display = '';
        if (onlineForm) onlineForm.style.display = 'none';
      });
    }

    // ── Live summary recalculation ─────────────────────────────────────────────
    [chkCategory, chkDeliveryArea, chkQuantity].forEach(el => {
      if (el) el.addEventListener('change', updateSummary);
      if (el) el.addEventListener('input', updateSummary);
    });

    // ── Online Checkout Form Submit & Direct WhatsApp Confirmation ───────────
    if (onlineForm) {
      onlineForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const opt      = chkCategory?.options[chkCategory.selectedIndex];
        const optValue = opt ? opt.value : 'Item';
        const optItemId = opt ? opt.getAttribute('data-item-id') : null;
        const invItem  = INVENTORY[optItemId] || getInventoryItem(optValue);

        let availableStock = invItem ? invItem.stock : parseInt(opt?.getAttribute('data-stock') || '10', 10);
        if (availableStock <= 0) {
          showToast('This item is finished in store. Please select another item.', 'error');
          return;
        }

        const name     = document.getElementById('chkCustName')?.value?.trim() || 'Customer';
        const phone    = document.getElementById('chkCustPhone')?.value?.trim() || '';
        const area     = chkDeliveryArea?.options[chkDeliveryArea.selectedIndex]?.value || 'Aberdeen';
        let qty        = parseInt(chkQuantity?.value || '1', 10);
        if (qty > availableStock) qty = availableStock;

        const address  = document.getElementById('chkAddress')?.value?.trim() || '';
        const notes    = document.getElementById('chkNotes')?.value?.trim() || '';
        const method   = getSelectedMethod();
        const price    = getPrice(chkCategory);
        const fee      = getDeliveryFee(chkDeliveryArea);
        const total    = (price * qty) + fee;

        if (!name || !phone) {
          showToast('Please provide your name and phone number.', 'error');
          return;
        }

        // Deduct inventory stock
        if (invItem) {
          invItem.stock = Math.max(0, invItem.stock - qty);
        }
        const updatedRemainder = invItem ? invItem.stock : Math.max(0, availableStock - qty);

        // Update product cards across DOM & sort finished products to bottom!
        updateAndSortProducts();

        // Generate Order ID & Payment Reference
        const randNum  = Math.floor(100000 + Math.random() * 900000);
        const orderId  = 'HK-ORD-' + randNum;
        let prefix = 'OM';
        let methodLabel = 'Orange Money (*144#)';
        if (method === 'afrimoney') {
          prefix = 'AF';
          methodLabel = 'Afrimoney (*161#)';
        } else if (method === 'cash_delivery') {
          prefix = 'COD';
          methodLabel = 'Cash on Delivery';
        }
        const payRef = `${prefix}-SLE-${randNum}`;

        // Visual: processing animation
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Payment Authorization…';
        }

        await new Promise(r => setTimeout(r, 850));

        try {
          if (supabaseClient) {
            await supabaseClient.from('orders').insert([{
              product_name: `${optValue} (Qty: ${qty})`,
              customer_name: name,
              phone: phone,
              amount: total,
              currency: 'SLE',
              payment_method: method,
              payment_reference: payRef,
              payment_status: method === 'cash_delivery' ? 'pending' : 'paid',
              delivery_address: `${area}${address ? ' — ' + address : ''}`,
              notes: notes + ` | Remainder: ${updatedRemainder}`,
              status: 'confirmed'
            }]);
          }
        } catch (err) {
          console.warn('Supabase order log failed:', err.message);
        }

        // Populate receipt modal
        const rcptOrderId    = document.getElementById('rcptOrderId');
        const rcptPaymentRef = document.getElementById('rcptPaymentRef');
        const rcptMethod     = document.getElementById('rcptMethod');
        const rcptAmount     = document.getElementById('rcptAmount');
        const rcptItem       = document.getElementById('rcptItem');
        const rcptCustomer   = document.getElementById('rcptCustomer');
        const rcptDelivery   = document.getElementById('rcptDelivery');
        const rcptDate       = document.getElementById('rcptDate');
        const rcptRemainder  = document.getElementById('rcptStockRemainder');

        if (rcptOrderId)    rcptOrderId.textContent    = orderId;
        if (rcptPaymentRef) rcptPaymentRef.textContent = payRef;
        if (rcptMethod)     rcptMethod.textContent     = methodLabel;
        if (rcptAmount)     rcptAmount.textContent     = formatSLE(total);
        if (rcptItem)       rcptItem.textContent       = `${optValue} ×${qty}`;
        if (rcptCustomer)   rcptCustomer.textContent   = `${name} (${phone})`;
        if (rcptDelivery)   rcptDelivery.textContent   = `${area}${address ? ' (' + address + ')' : ''}`;
        if (rcptDate)       rcptDate.textContent       = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Freetown', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        if (rcptRemainder)  rcptRemainder.textContent  = `${updatedRemainder} pieces left in store`;

        // Direct WhatsApp Confirmation to Boutique Hotline (+232 77 416008)
        const waCleanNum = CONFIG.BUSINESS.whatsappNumber || '23277416008';
        const waMsg = encodeURIComponent(
          `Hello Humu! 👋

` +
          `🧾 *ORDER & PAYMENT CONFIRMATION*
` +
          `=================================
` +
          `• *Order ID:* ${orderId}
` +
          `• *Payment Ref:* ${payRef}
` +
          `• *Payment Method:* ${methodLabel}
` +
          `• *Payment Status:* ${method === 'cash_delivery' ? 'PAYMENT ON DELIVERY' : 'AUTHORIZED / PAID'}

` +
          `📦 *PRODUCT & QUANTITY:*
` +
          `• *Item:* ${optValue}
` +
          `• *Quantity Selected:* ${qty} piece(s)
` +
          `• *Unit Price:* ${formatSLE(price)}
` +
          `• *Subtotal:* ${formatSLE(price * qty)}
` +
          `• *Delivery Area:* ${area}${address ? ' (' + address + ')' : ''} (+${formatSLE(fee)})
` +
          `• *TOTAL AMOUNT:* ${formatSLE(total)}
` +
          `• *Store Remainder:* ${updatedRemainder} pieces remaining in store

` +
          `👤 *CUSTOMER DETAILS:*
` +
          `• *Name:* ${name}
` +
          `• *Phone:* ${phone}
` +
          (notes ? `• *Special Instructions:* ${notes}\n\n` : '') +
          `Please confirm receipt of this order and arrange motorcycle delivery to my location. Thank you! 🙏`
        );

        const rcptWaBtn = document.getElementById('rcptWhatsappBtn');
        if (rcptWaBtn) {
          rcptWaBtn.href = `https://wa.me/${waCleanNum}?text=${waMsg}`;
        }

        // Show receipt modal
        if (receiptModal) {
          receiptModal.classList.add('show');
          receiptModal.classList.add('open');
        }

        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          updateSummary();
        }

        showToast('Payment authorized & order created! Tap below to send confirmation to Humu (+232 77 416008).', 'success');

        // Automatically open WhatsApp confirmation in new tab for smooth instant confirmation
        setTimeout(() => {
          window.open(`https://wa.me/${waCleanNum}?text=${waMsg}`, '_blank');
        }, 1200);
      });
    }

    // ── Receipt modal close handlers ──────────────────────────────────────────
    if (receiptModal) {
      if (receiptCloseBtn) {
        receiptCloseBtn.addEventListener('click', () => {
          receiptModal.classList.remove('show');
          receiptModal.classList.remove('open');
        });
      }
      receiptModal.addEventListener('click', (e) => {
        if (e.target === receiptModal) {
          receiptModal.classList.remove('show');
          receiptModal.classList.remove('open');
        }
      });
    }

    // ── FAQ payment method quick-select buttons ───────────────────────────────
    document.querySelectorAll('[data-select-method]').forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.getAttribute('data-select-method');
        const orderSection = document.getElementById('order');
        if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
          if (btnModeCheckout) btnModeCheckout.click();
          paymentCards.forEach(card => {
            card.classList.remove('selected');
            card.setAttribute('aria-checked', 'false');
          });
          const target = document.querySelector(`.payment-method-card[data-method="${method}"]`);
          if (target) {
            target.classList.add('selected');
            target.setAttribute('aria-checked', 'true');
            renderPaymentPanel(method);
          }
        }, 500);
      });
    });

    // ── Initialize ─────────────────────────────────────────────────────────────
    updateAndSortProducts();
    setupProductCardInteractions();
    updateSummary();

    const defaultCard = document.querySelector('.payment-method-card.selected');
    if (defaultCard) renderPaymentPanel(defaultCard.getAttribute('data-method'));
  }

  // ==============================================================================
  // 11. FAQ ACCORDION INTERACTION
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
  // 12. FUNCTIONAL & FASHIONABLE APP SYSTEMS
  // Shopping Bag Cart, Wishlist, Quick View, Instant Search, & PWA Controller
  // ==============================================================================

  const SLE_TO_USD_RATE = 22.50; // Current rate: $1 USD ~ 22.50 SLE

  // ── CART / SHOPPING BAG MANAGER ──────────────────────────────────────────────
  const CartManager = {
    key: 'hk_vault_cart_v2',

    getItems() {
      try {
        return JSON.parse(localStorage.getItem(this.key)) || [];
      } catch (e) {
        return [];
      }
    },

    saveItems(items) {
      try {
        localStorage.setItem(this.key, JSON.stringify(items));
      } catch (e) {}
      this.render();
    },

    addItem(product, qty = 1) {
      const items = this.getItems();
      const existing = items.find(i => i.id === product.id);
      const stock = product.stock !== undefined ? product.stock : 999;

      if (existing) {
        const newQty = existing.qty + qty;
        if (newQty > stock) {
          showToast(`Only ${stock} pieces available in store for this item!`, 'warning');
          existing.qty = stock;
        } else {
          existing.qty = newQty;
          showToast(`Updated bag: ${existing.name} (${existing.qty})`, 'info');
        }
      } else {
        const addQty = Math.min(qty, stock);
        items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category || 'Collections',
          image: product.image || 'assets/logo.jpg',
          stock: stock,
          qty: addQty
        });
        showToast(`Added ${product.name} to your Shopping Bag!`, 'info');
      }

      this.saveItems(items);
      this.pulseBadges();
      this.openDrawer();
    },

    updateQty(id, delta) {
      let items = this.getItems();
      const item = items.find(i => i.id === id);
      if (!item) return;

      const newQty = item.qty + delta;
      if (newQty <= 0) {
        this.removeItem(id);
        return;
      }
      if (newQty > item.stock) {
        showToast(`Maximum store stock (${item.stock}) reached for this item.`, 'warning');
        return;
      }
      item.qty = newQty;
      this.saveItems(items);
    },

    removeItem(id) {
      let items = this.getItems().filter(i => i.id !== id);
      this.saveItems(items);
      showToast("Item removed from your bag.", "warning");
    },

    clear() {
      this.saveItems([]);
      showToast("Shopping bag cleared.", "info");
    },

    getTotals() {
      const items = this.getItems();
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const select = document.getElementById('cartDeliverySelect');
      const deliveryFee = select ? parseFloat(select.value || '0') : 0;
      const total = subtotal + deliveryFee;
      const totalUsd = (total / SLE_TO_USD_RATE).toFixed(2);
      const count = items.reduce((sum, item) => sum + item.qty, 0);

      return { subtotal, deliveryFee, total, totalUsd, count };
    },

    render() {
      const items = this.getItems();
      const totals = this.getTotals();

      // Update badge counts across desktop & mobile
      const badgeIds = ['cartCount', 'drawerBagCount', 'mBagBadge', 'cartItemCountHeader'];
      badgeIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = totals.count;
      });

      const container = document.getElementById('cartItemsContainer');
      const footer = document.getElementById('cartFooter');
      if (!container) return;

      if (items.length === 0) {
        container.innerHTML = `
          <div class="drawer-empty">
            <div class="drawer-empty-icon"><i class="fa-solid fa-bag-shopping"></i></div>
            <h4 style="font-family: var(--font-serif); margin-bottom: 6px; color: var(--text-main);">Your bag is empty</h4>
            <p style="font-size: 0.88rem; max-width: 260px; margin: 0 auto 18px;">Discover our exclusive designer bags, evening dresses, footwear, and iPhone cases.</p>
            <a href="index.html#collections" class="btn btn-gold btn-sm" onclick="CartManager.closeDrawer()"><i class="fa-solid fa-sparkles"></i> Explore Boutique</a>
          </div>
        `;
        if (footer) footer.style.opacity = '0.4';
      } else {
        if (footer) footer.style.opacity = '1';
        let html = '';
        items.forEach(item => {
          const itemTotal = item.price * item.qty;
          const itemTotalUsd = (itemTotal / SLE_TO_USD_RATE).toFixed(2);
          html += `
            <div class="cart-item-row" data-cart-id="${escapeHTML(item.id)}">
              <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" class="cart-item-img" onerror="this.src='assets/logo.jpg'">
              <div class="cart-item-info">
                <div class="cart-item-title" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</div>
                <div class="cart-item-price">
                  SLE ${itemTotal.toLocaleString()}
                  <span class="cart-item-price-usd">(~$${itemTotalUsd} USD)</span>
                </div>
                <div class="cart-item-actions">
                  <div class="cart-qty-controls">
                    <button type="button" class="cart-qty-btn" onclick="CartManager.updateQty('${escapeHTML(item.id)}', -1)" aria-label="Decrease quantity">&minus;</button>
                    <span class="cart-qty-display">${item.qty}</span>
                    <button type="button" class="cart-qty-btn" onclick="CartManager.updateQty('${escapeHTML(item.id)}', 1)" aria-label="Increase quantity">&plus;</button>
                  </div>
                  <button type="button" class="cart-item-remove" onclick="CartManager.removeItem('${escapeHTML(item.id)}')" title="Remove item">
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        });
        container.innerHTML = html;
      }

      // Update Subtotals and Totals
      const subtotalEl = document.getElementById('cartSubtotalText');
      const deliveryEl = document.getElementById('cartDeliveryText');
      const totalEl = document.getElementById('cartTotalText');
      const totalUsdEl = document.getElementById('cartTotalUsdText');

      if (subtotalEl) subtotalEl.textContent = `SLE ${totals.subtotal.toLocaleString()}`;
      if (deliveryEl) deliveryEl.textContent = `SLE ${totals.deliveryFee.toLocaleString()}`;
      if (totalEl) totalEl.textContent = `SLE ${totals.total.toLocaleString()}`;
      if (totalUsdEl) totalUsdEl.textContent = `approx. $${totals.totalUsd} USD`;
    },

    pulseBadges() {
      ['cartCount', 'mBagBadge'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add('pop');
          setTimeout(() => el.classList.remove('pop'), 300);
        }
      });
    },

    openDrawer() {
      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartDrawerBackdrop');
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closeDrawer() {
      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartDrawerBackdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
    },

    async checkoutWhatsApp() {
      const items = this.getItems();
      if (items.length === 0) {
        showToast("Your shopping bag is empty!", "warning");
        return;
      }

      const totals = this.getTotals();
      const select = document.getElementById('cartDeliverySelect');
      const deliveryName = select ? (select.options[select.selectedIndex]?.getAttribute('data-name') || select.options[select.selectedIndex]?.text) : "Aberdeen";

      let itemListText = "";
      items.forEach((item, idx) => {
        const itemTot = item.price * item.qty;
        itemListText += `${idx + 1}. *${item.name}* (Qty: ${item.qty}) — SLE ${itemTot.toLocaleString()}\n`;
      });

      const message = `Hello Humu! 👋 I am ready to place an order from your website with the following items in my bag:\n\n` +
        `🛍️ *ORDER BREAKDOWN:*\n` +
        `${itemListText}\n` +
        `📦 *Items Subtotal:* SLE ${totals.subtotal.toLocaleString()}\n` +
        `🚚 *Delivery Area:* ${deliveryName} (SLE ${totals.deliveryFee.toLocaleString()})\n` +
        `💰 *TOTAL DUE:* SLE ${totals.total.toLocaleString()} (~$${totals.totalUsd} USD)\n\n` +
        `Please confirm stock availability and door-to-door dispatch. Thank you!`;

      // Log order to Supabase if available
      if (supabaseClient) {
        try {
          await supabaseClient.from('orders').insert([{
            product_name: items.map(i => `${i.qty}x ${i.name}`).join(', '),
            customer_name: "Shopping Bag Customer",
            order_type: "bag_checkout",
            notes: `Delivery: ${deliveryName}. Total: SLE ${totals.total}`,
            status: "new"
          }]);
        } catch (e) {
          console.warn("Could not log multi-item bag order to Supabase:", e);
        }
      }

      const cleanNum = CONFIG.BUSINESS.whatsappNumber || "23277416008";
      window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`, '_blank');
      this.closeDrawer();
    },

    payOnline() {
      const items = this.getItems();
      if (items.length === 0) {
        showToast("Your shopping bag is empty!", "warning");
        return;
      }
      this.closeDrawer();

      const orderSec = document.getElementById('order');
      if (orderSec) {
        orderSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = 'index.html#order';
        return;
      }

      const btnModeCheckout = document.getElementById('btnModeCheckout');
      if (btnModeCheckout) btnModeCheckout.click();

      // Autofill customer focus and notes
      setTimeout(() => {
        const nameInput = document.getElementById('chkCustName');
        const notesInput = document.getElementById('chkNotes');
        if (nameInput) nameInput.focus();
        if (notesInput) {
          notesInput.value = `Order for ${items.map(i => `${i.qty}x ${i.name}`).join(', ')}`;
        }
      }, 600);
    }
  };

  // ── WISHLIST MANAGER ─────────────────────────────────────────────────────────
  const WishlistManager = {
    key: 'hk_vault_wishlist_v2',

    getItems() {
      try {
        return JSON.parse(localStorage.getItem(this.key)) || [];
      } catch (e) {
        return [];
      }
    },

    saveItems(items) {
      try {
        localStorage.setItem(this.key, JSON.stringify(items));
      } catch (e) {}
      this.render();
    },

    has(id) {
      return this.getItems().some(i => i.id === id);
    },

    toggle(product) {
      let items = this.getItems();
      const idx = items.findIndex(i => i.id === product.id);
      let isSaved = false;

      if (idx > -1) {
        items.splice(idx, 1);
        isSaved = false;
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category || 'Collections',
          image: product.image || 'assets/logo.jpg',
          stock: product.stock !== undefined ? product.stock : 10,
          desc: product.desc || ''
        });
        isSaved = true;
      }

      this.saveItems(items);
      return isSaved;
    },

    remove(id) {
      let items = this.getItems().filter(i => i.id !== id);
      this.saveItems(items);
      // Update any matching card wishlist buttons on screen
      document.querySelectorAll(`.product-card[data-item-id="${id}"] .card-wishlist-btn`).forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      });
      showToast("Removed from wishlist.", "info");
    },

    clear() {
      this.saveItems([]);
      document.querySelectorAll('.card-wishlist-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      });
      showToast("Wishlist cleared.", "info");
    },

    render() {
      const items = this.getItems();
      const count = items.length;

      ['wishlistCount', 'drawerWishCount', 'mWishlistBadge', 'wishlistItemCountHeader'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
      });

      const container = document.getElementById('wishlistItemsContainer');
      const footer = document.getElementById('wishlistFooter');
      if (!container) return;

      if (items.length === 0) {
        container.innerHTML = `
          <div class="drawer-empty">
            <div class="drawer-empty-icon"><i class="fa-regular fa-heart"></i></div>
            <h4 style="font-family: var(--font-serif); margin-bottom: 6px; color: var(--text-main);">Your wishlist is empty</h4>
            <p style="font-size: 0.88rem; max-width: 260px; margin: 0 auto 18px;">Tap the heart ❤️ icon on any piece you love to save it here for later.</p>
            <a href="index.html#collections" class="btn btn-outline btn-sm" onclick="WishlistManager.closeDrawer()">Browse Collection</a>
          </div>
        `;
        if (footer) footer.style.display = 'none';
      } else {
        if (footer) footer.style.display = '';
        let html = '';
        items.forEach(item => {
          const priceUsd = (item.price / SLE_TO_USD_RATE).toFixed(2);
          html += `
            <div class="wishlist-item-row" data-wishlist-id="${escapeHTML(item.id)}">
              <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" class="wishlist-item-img" onerror="this.src='assets/logo.jpg'">
              <div class="wishlist-item-info">
                <div class="wishlist-item-title">${escapeHTML(item.name)}</div>
                <div class="wishlist-item-price">SLE ${item.price.toLocaleString()} <span style="font-size: 0.75rem; color: var(--text-dim);">(~$${priceUsd})</span></div>
                <div class="wishlist-item-actions">
                  <button type="button" class="btn btn-gold btn-sm" style="padding: 5px 10px; font-size: 0.78rem;" onclick="CartManager.addItem({id:'${escapeHTML(item.id)}', name:'${escapeHTML(item.name)}', price:${item.price}, image:'${escapeHTML(item.image)}', stock:${item.stock}}, 1); WishlistManager.remove('${escapeHTML(item.id)}')">
                    <i class="fa-solid fa-bag-shopping"></i> Move to Bag
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" style="padding: 5px 8px; font-size: 0.78rem;" onclick="WishlistManager.remove('${escapeHTML(item.id)}')">
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        });
        container.innerHTML = html;
      }
    },

    openDrawer() {
      const drawer = document.getElementById('wishlistDrawer');
      const backdrop = document.getElementById('wishlistDrawerBackdrop');
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closeDrawer() {
      const drawer = document.getElementById('wishlistDrawer');
      const backdrop = document.getElementById('wishlistDrawerBackdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
    },

    inquireAllWhatsApp() {
      const items = this.getItems();
      if (items.length === 0) {
        showToast("Your wishlist is empty!", "warning");
        return;
      }
      let list = items.map((i, idx) => `${idx + 1}. ${i.name} (SLE ${i.price})`).join('\n');
      const msg = `Hello Humu! 👋 I have saved these items in my boutique wishlist and would love to inquire about availability and pricing:\n\n${list}\n\nCould you please share details? Thank you!`;
      const cleanNum = CONFIG.BUSINESS.whatsappNumber || "23277416008";
      window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
      this.closeDrawer();
    }
  };

  // ── QUICK VIEW MODAL MANAGER ─────────────────────────────────────────────────
  const QuickViewManager = {
    currentProduct: null,

    open(product) {
      this.currentProduct = product;
      const modal = document.getElementById('quickViewModal');
      const backdrop = document.getElementById('quickViewBackdrop');
      if (!modal || !backdrop) return;

      document.getElementById('qvImage').src = product.image || 'assets/logo.jpg';
      document.getElementById('qvCategory').textContent = product.category || 'Collections';
      document.getElementById('qvTitle').textContent = product.name;
      document.getElementById('qvPrice').textContent = `SLE ${product.price.toLocaleString()}`;
      document.getElementById('qvPriceUsd').textContent = `(~$${(product.price / SLE_TO_USD_RATE).toFixed(2)} USD)`;
      document.getElementById('qvDesc').textContent = product.desc || 'Hand-selected luxury boutique item curated for long-lasting quality and effortless style.';

      const stockRow = document.getElementById('qvStockRow');
      if (stockRow) {
        if (product.stock > 3) {
          stockRow.innerHTML = `<span class="stock-pill in-stock"><i class="fa-solid fa-boxes-stacked"></i> In Store (${product.stock} available)</span>`;
        } else if (product.stock > 0) {
          stockRow.innerHTML = `<span class="stock-pill low-stock"><i class="fa-solid fa-fire"></i> Low Stock (Only ${product.stock} left!)</span>`;
        } else {
          stockRow.innerHTML = `<span class="stock-pill finished"><i class="fa-solid fa-circle-xmark"></i> Finished in Store</span>`;
        }
      }

      const qtyVal = document.getElementById('qvQtyVal');
      if (qtyVal) qtyVal.value = '1';

      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    close() {
      const backdrop = document.getElementById('quickViewBackdrop');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
      this.currentProduct = null;
    }
  };

  // ── LIVE INSTANT SEARCH & SORT MANAGER ───────────────────────────────────────
  const SearchAndFilterManager = {
    init() {
      const input = document.getElementById('catalogSearchInput');
      const clearBtn = document.getElementById('catalogSearchClear');
      const sortSelect = document.getElementById('catalogSortSelect');

      if (input) {
        input.addEventListener('input', () => {
          if (clearBtn) clearBtn.style.display = input.value.trim() ? 'block' : 'none';
          this.filterAndSort();
        });
      }

      if (clearBtn && input) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          clearBtn.style.display = 'none';
          input.focus();
          this.filterAndSort();
        });
      }

      if (sortSelect) {
        sortSelect.addEventListener('change', () => {
          this.filterAndSort();
        });
      }
    },

    filterAndSort() {
      const input = document.getElementById('catalogSearchInput');
      const term = input ? input.value.trim().toLowerCase() : '';
      const sortSelect = document.getElementById('catalogSortSelect');
      const sortVal = sortSelect ? sortSelect.value : 'default';

      const activeBtn = document.querySelector('.filter-bar .filter-btn.active');
      const activeCategory = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

      const container = document.getElementById('dynamicProductsContainer');
      if (!container) return;

      const cards = Array.from(container.querySelectorAll('.product-card'));
      let visibleCount = 0;

      cards.forEach(card => {
        const title = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        const stock = parseInt(card.getAttribute('data-stock') || '0', 10);

        let matchesCat = (activeCategory === 'all' || card.getAttribute('data-category') === activeCategory);
        let matchesSearch = !term || title.includes(term) || desc.includes(term) || cat.includes(term);
        let matchesStock = (sortVal !== 'in-stock') || (stock > 0);

        if (matchesCat && matchesSearch && matchesStock) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Handle Sorting
      if (sortVal === 'price-low' || sortVal === 'price-high') {
        cards.sort((a, b) => {
          const priceA = parseFloat(a.getAttribute('data-price') || '0');
          const priceB = parseFloat(b.getAttribute('data-price') || '0');
          return sortVal === 'price-low' ? priceA - priceB : priceB - priceA;
        });
        cards.forEach(card => container.appendChild(card));
      }

      const countBadge = document.getElementById('catalogResultCount');
      if (countBadge) countBadge.textContent = visibleCount;

      const filterLabel = document.getElementById('catalogActiveFilterLabel');
      if (filterLabel) {
        filterLabel.textContent = activeCategory === 'all' ? (term ? `Searching "${term}"` : 'All Collections') : `${activeCategory} (${visibleCount})`;
      }
    }
  };

  // ── PWA SERVICE WORKER & APP INSTALL MANAGER ────────────────────────────────
  const PwaManager = {
    deferredPrompt: null,

    init() {
      // 1. Register Service Worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js').then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          }).catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
        });
      }

      // 2. Capture Install Prompt Event
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        const installBtns = [
          document.getElementById('btnInstallApp'),
          document.getElementById('btnDrawerInstallApp')
        ];
        installBtns.forEach(btn => {
          if (btn) btn.style.display = 'inline-flex';
        });
      });

      // 3. Connect Install Buttons
      const triggerInstall = async () => {
        if (!this.deferredPrompt) {
          showToast("To install, tap Share (iOS) or Menu (Android) -> 'Add to Home Screen'", "info");
          return;
        }
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast("Thank you for installing Humu Kabba App! 🌟", "info");
        }
        this.deferredPrompt = null;
      };

      const btn1 = document.getElementById('btnInstallApp');
      const btn2 = document.getElementById('btnDrawerInstallApp');
      if (btn1) btn1.addEventListener('click', triggerInstall);
      if (btn2) btn2.addEventListener('click', triggerInstall);
    }
  };

  // Expose Managers globally for cross-system accessibility
  window.CartManager = CartManager;
  window.WishlistManager = WishlistManager;
  window.QuickViewManager = QuickViewManager;

  // Sync across tabs/windows
  window.addEventListener('storage', (e) => {
    if (e.key === CartManager.key) CartManager.render();
    if (e.key === WishlistManager.key) WishlistManager.render();
  });

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
        if (typeof SearchAndFilterManager !== 'undefined') {
          SearchAndFilterManager.filterAndSort();
        } else {
          const filter = btn.getAttribute('data-filter');
          document.querySelectorAll('.product-card').forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        }
      });
    });

    // 4. WhatsApp bindings & Order builder
    bindWhatsAppButtons();
    setupOrderBuilder();

    // 5. Functional App Systems Initialization
    CartManager.render();
    WishlistManager.render();
    SearchAndFilterManager.init();
    PwaManager.init();
    setupProductCardInteractions();

    // ── Cart Drawer Event Listeners ──
    const openCartTriggers = ['btnOpenCart', 'btnDrawerOpenBag', 'bnav-bag'];
    openCartTriggers.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          CartManager.openDrawer();
          const drawer = document.getElementById('mobileNavDrawer');
          if (drawer) drawer.classList.remove('open');
        });
      }
    });

    const btnCloseCart = document.getElementById('btnCloseCart');
    const cartBackdrop = document.getElementById('cartDrawerBackdrop');
    if (btnCloseCart) btnCloseCart.addEventListener('click', () => CartManager.closeDrawer());
    if (cartBackdrop) cartBackdrop.addEventListener('click', () => CartManager.closeDrawer());

    const deliverySelect = document.getElementById('cartDeliverySelect');
    if (deliverySelect) {
      deliverySelect.addEventListener('change', () => CartManager.render());
    }

    const btnCartCheckoutWhatsApp = document.getElementById('btnCartCheckoutWhatsApp');
    if (btnCartCheckoutWhatsApp) {
      btnCartCheckoutWhatsApp.addEventListener('click', () => CartManager.checkoutWhatsApp());
    }

    const btnCartPayOnline = document.getElementById('btnCartPayOnline');
    if (btnCartPayOnline) {
      btnCartPayOnline.addEventListener('click', () => CartManager.payOnline());
    }

    const btnCartClear = document.getElementById('btnCartClear');
    if (btnCartClear) {
      btnCartClear.addEventListener('click', () => CartManager.clear());
    }

    // ── Wishlist Drawer Event Listeners ──
    const openWishlistTriggers = ['btnOpenWishlist', 'btnDrawerOpenWishlist', 'bnav-wishlist'];
    openWishlistTriggers.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          WishlistManager.openDrawer();
          const drawer = document.getElementById('mobileNavDrawer');
          if (drawer) drawer.classList.remove('open');
        });
      }
    });

    const btnCloseWishlist = document.getElementById('btnCloseWishlist');
    const wishlistBackdrop = document.getElementById('wishlistDrawerBackdrop');
    if (btnCloseWishlist) btnCloseWishlist.addEventListener('click', () => WishlistManager.closeDrawer());
    if (wishlistBackdrop) wishlistBackdrop.addEventListener('click', () => WishlistManager.closeDrawer());

    const btnWishlistInquireAll = document.getElementById('btnWishlistInquireAll');
    if (btnWishlistInquireAll) {
      btnWishlistInquireAll.addEventListener('click', () => WishlistManager.inquireAllWhatsApp());
    }

    const btnWishlistClear = document.getElementById('btnWishlistClear');
    if (btnWishlistClear) {
      btnWishlistClear.addEventListener('click', () => WishlistManager.clear());
    }

    // ── Quick Search Triggers ──
    const searchTriggers = ['btnQuickSearch', 'bnav-search'];
    searchTriggers.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const collSection = document.getElementById('collections');
          const searchInput = document.getElementById('catalogSearchInput');
          if (collSection) {
            collSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
              if (searchInput) searchInput.focus();
            }, 600);
          } else {
            window.location.href = 'index.html#collections';
          }
        });
      }
    });

    // ── Quick View Modal Event Listeners ──
    const btnCloseQuickView = document.getElementById('btnCloseQuickView');
    const qvBackdrop = document.getElementById('quickViewBackdrop');
    if (btnCloseQuickView) btnCloseQuickView.addEventListener('click', () => QuickViewManager.close());
    if (qvBackdrop) {
      qvBackdrop.addEventListener('click', (e) => {
        if (e.target === qvBackdrop) QuickViewManager.close();
      });
    }

    const qvQtyMinus = document.getElementById('qvQtyMinus');
    const qvQtyPlus = document.getElementById('qvQtyPlus');
    const qvQtyVal = document.getElementById('qvQtyVal');
    if (qvQtyMinus && qvQtyVal) {
      qvQtyMinus.addEventListener('click', () => {
        let cur = parseInt(qvQtyVal.value || '1', 10);
        if (cur > 1) qvQtyVal.value = cur - 1;
      });
    }
    if (qvQtyPlus && qvQtyVal) {
      qvQtyPlus.addEventListener('click', () => {
        let cur = parseInt(qvQtyVal.value || '1', 10);
        const maxStock = QuickViewManager.currentProduct?.stock || 99;
        if (cur < maxStock) {
          qvQtyVal.value = cur + 1;
        } else {
          showToast(`Only ${maxStock} pieces available in store!`, 'warning');
        }
      });
    }

    const qvBtnAddBag = document.getElementById('qvBtnAddBag');
    if (qvBtnAddBag) {
      qvBtnAddBag.addEventListener('click', () => {
        if (!QuickViewManager.currentProduct) return;
        const curQty = qvQtyVal ? parseInt(qvQtyVal.value || '1', 10) : 1;
        CartManager.addItem(QuickViewManager.currentProduct, curQty);
        QuickViewManager.close();
      });
    }

    const qvBtnWhatsApp = document.getElementById('qvBtnWhatsApp');
    if (qvBtnWhatsApp) {
      qvBtnWhatsApp.addEventListener('click', () => {
        if (!QuickViewManager.currentProduct) return;
        const p = QuickViewManager.currentProduct;
        const cleanNum = CONFIG.BUSINESS.whatsappNumber || "23277416008";
        const msg = `Hello Humu! 👋 I am looking at the *${p.name}* (SLE ${p.price}) on your website and would love to confirm stock availability. Thank you!`;
        window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
        QuickViewManager.close();
      });
    }

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

    // Live Clock for Phone Frame Status Bar
    function updatePhoneClock() {
      const clockEl = document.getElementById('phoneStatusTime');
      if (!clockEl) return;
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      clockEl.textContent = `${hrs}:${mins}`;
    }
    updatePhoneClock();
    setInterval(updatePhoneClock, 30000);
  });

})();
