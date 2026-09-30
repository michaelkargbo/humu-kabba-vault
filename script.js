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
  // ==============================================================================
  // 3. ONLINE PAYMENTS, CHECKOUT & WHATSAPP ORDER BUILDER (Section 14 & 13)
  // ==============================================================================
  function setupOrderBuilder() {
    const btnCheckout = document.getElementById('btnModeCheckout');
    const btnInquiry = document.getElementById('btnModeInquiry');
    const formCheckout = document.getElementById('onlineCheckoutForm');
    const formInquiry = document.getElementById('whatsappOrderForm');

    // 3.1 Toggle between Checkout and WhatsApp Inquiry Mode
    if (btnCheckout && btnInquiry && formCheckout && formInquiry) {
      btnCheckout.addEventListener('click', () => {
        btnCheckout.classList.add('active');
        btnInquiry.classList.remove('active');
        formCheckout.style.display = 'flex';
        formInquiry.style.display = 'none';
      });

      btnInquiry.addEventListener('click', () => {
        btnInquiry.classList.add('active');
        btnCheckout.classList.remove('active');
        formInquiry.style.display = 'flex';
        formCheckout.style.display = 'none';
      });
    }

    // 3.2 Dynamic Total Calculation
    const categorySelect = document.getElementById('chkCategory');
    const deliverySelect = document.getElementById('chkDeliveryArea');
    const quantityInput = document.getElementById('chkQuantity');
    const subtotalEl = document.getElementById('summarySubtotal');
    const deliveryFeeEl = document.getElementById('summaryDeliveryFee');
    const totalEl = document.getElementById('summaryTotal');
    const checkoutSubmitBtn = document.getElementById('checkoutSubmitBtn');

    function calculateOrderTotals() {
      if (!categorySelect || !deliverySelect || !quantityInput) return { subtotal: 0, deliveryFee: 0, total: 0 };
      const selectedOption = categorySelect.options[categorySelect.selectedIndex];
      const itemPrice = parseFloat(selectedOption?.getAttribute('data-price')) || 450;
      const qty = Math.max(1, parseInt(quantityInput.value) || 1);
      const subtotal = itemPrice * qty;

      const selectedDelivery = deliverySelect.options[deliverySelect.selectedIndex];
      const deliveryFee = parseFloat(selectedDelivery?.getAttribute('data-fee')) || 0;
      const total = subtotal + deliveryFee;

      if (subtotalEl) subtotalEl.textContent = `SLE ${subtotal.toFixed(2)}`;
      if (deliveryFeeEl) {
        if (deliveryFee === 0) {
          deliveryFeeEl.textContent = "FREE (Aberdeen Pickup)";
        } else {
          deliveryFeeEl.textContent = `SLE ${deliveryFee.toFixed(2)}`;
        }
      }
      if (totalEl) totalEl.textContent = `SLE ${total.toFixed(2)}`;
      if (checkoutSubmitBtn) {
        checkoutSubmitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Authorize Payment & Place Order (SLE ${total.toFixed(2)})`;
      }
      return { subtotal, deliveryFee, total, qty, itemPrice, productName: selectedOption?.text || "Boutique Item" };
    }

    if (categorySelect) categorySelect.addEventListener('change', calculateOrderTotals);
    if (deliverySelect) deliverySelect.addEventListener('change', calculateOrderTotals);
    if (quantityInput) quantityInput.addEventListener('input', calculateOrderTotals);

    // 3.3 Payment Method Selection
    let currentPaymentMethod = 'orange_money';
    const methodCards = document.querySelectorAll('.payment-method-card');
    const panel = document.getElementById('paymentDetailsPanel');

    function renderPaymentPanel(method) {
      if (!panel) return;
      const customerPhone = document.getElementById('chkCustPhone')?.value.trim() || "+232 75 416008";

      if (method === 'orange_money') {
        panel.innerHTML = `
          <div class="payment-notice-tag">
            <i class="fa-solid fa-mobile-screen"></i> Orange Money Merchant Checkout (*144#)
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            Official Merchant Code: <strong style="color: #ff8b1f;">HK-VAULT</strong>. After tapping authorize, verify via the Orange Money prompt on your phone or dial *144*4*1#.
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">Orange Money Subscriber Number</label>
            <input type="tel" id="omSubscriberPhone" class="form-control" value="${escapeHTML(customerPhone)}" placeholder="e.g. +232 75 000000" style="background: rgba(0,0,0,0.5);">
          </div>
        `;
      } else if (method === 'afrimoney') {
        panel.innerHTML = `
          <div class="payment-notice-tag">
            <i class="fa-solid fa-money-bill-transfer"></i> Afrimoney Merchant Checkout (*161#)
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            Official Afrimoney Code: <strong style="color: #ff4d58;">AFRI-HKVAULT</strong>. Authorize payment directly with your mobile wallet PIN.
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">Afrimoney Subscriber Number</label>
            <input type="tel" id="afriSubscriberPhone" class="form-control" value="${escapeHTML(customerPhone)}" placeholder="e.g. +232 88 000000" style="background: rgba(0,0,0,0.5);">
          </div>
        `;
      } else if (method === 'credit_card') {
        panel.innerHTML = `
          <div class="payment-notice-tag">
            <i class="fa-regular fa-credit-card"></i> Visa / Mastercard Encrypted Checkout
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" style="font-size: 0.8rem;">Cardholder Name</label>
              <input type="text" id="cardHolderName" class="form-control" placeholder="Name as on card" value="${escapeHTML(document.getElementById('chkCustName')?.value.trim() || '')}" style="background: rgba(0,0,0,0.5);">
            </div>
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" style="font-size: 0.8rem;">Card Number</label>
              <input type="text" id="cardNumber" class="form-control" maxlength="19" placeholder="4242 •••• •••• 4242" value="4242 8891 2045 7192" style="background: rgba(0,0,0,0.5); font-family: monospace;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.8rem;">Expiry (MM/YY)</label>
              <input type="text" id="cardExpiry" class="form-control" placeholder="12/28" value="09/28" style="background: rgba(0,0,0,0.5); text-align: center;">
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.8rem;">Security Code (CVV)</label>
              <input type="password" id="cardCvv" maxlength="4" class="form-control" placeholder="•••" value="882" style="background: rgba(0,0,0,0.5); text-align: center;">
            </div>
          </div>
          <p style="font-size: 0.73rem; color: var(--text-dim); margin-top: 8px; margin-bottom: 0;">
            <i class="fa-solid fa-lock"></i> Client-side tokenized checkout. Compliant with Section 14: Card numbers and CVVs are never saved to database.
          </p>
        `;
      } else if (method === 'debit_card') {
        panel.innerHTML = `
          <div class="payment-notice-tag">
            <i class="fa-solid fa-credit-card"></i> Sierra Leone Bank Debit Card
          </div>
          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 0.8rem;">Issuing Bank</label>
            <select class="form-control" id="debitBankSelect" style="background: rgba(0,0,0,0.5);">
              <option value="Rokel Commercial Bank">Rokel Commercial Bank (RCBank)</option>
              <option value="Sierra Leone Commercial Bank">Sierra Leone Commercial Bank (SLCB)</option>
              <option value="Ecobank Sierra Leone">Ecobank Sierra Leone</option>
              <option value="Zenith Bank Sierra Leone">Zenith Bank SL</option>
              <option value="United Bank for Africa">UBA Sierra Leone</option>
              <option value="Standard Chartered Bank">Standard Chartered Bank</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">Debit Card Number</label>
            <input type="text" class="form-control" maxlength="19" placeholder="5399 •••• •••• 1029" value="5399 2100 8492 1029" style="background: rgba(0,0,0,0.5); font-family: monospace;">
          </div>
        `;
      } else {
        panel.innerHTML = `
          <div class="payment-notice-tag">
            <i class="fa-solid fa-hand-holding-dollar"></i> Cash on Delivery / In-Store Aberdeen
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0; line-height: 1.5;">
            You can pay in cash directly to our boutique at 4B Johnson Land, Aberdeen or hand payment to our bike dispatch courier upon delivery. Please ensure exact change where possible.
          </p>
        `;
      }
    }

    function selectAndFocusPaymentMethod(method, targetItem = null, targetPrice = null) {
      // 1. Activate Checkout Tab
      if (btnCheckout && btnInquiry && formCheckout && formInquiry) {
        btnCheckout.classList.add('active');
        btnInquiry.classList.remove('active');
        formCheckout.style.display = 'flex';
        formInquiry.style.display = 'none';
      }

      // 2. Select product if provided
      if (targetItem && categorySelect) {
        let matched = false;
        for (let i = 0; i < categorySelect.options.length; i++) {
          if (categorySelect.options[i].text.toLowerCase().includes(targetItem.toLowerCase()) || 
              categorySelect.options[i].value.toLowerCase().includes(targetItem.toLowerCase())) {
            categorySelect.selectedIndex = i;
            matched = true;
            break;
          }
        }
        if (!matched && targetItem) {
          const opt = document.createElement('option');
          opt.value = targetItem;
          opt.text = `${targetItem} (SLE ${targetPrice || 450})`;
          opt.setAttribute('data-price', targetPrice || 450);
          categorySelect.add(opt, 0);
          categorySelect.selectedIndex = 0;
        }
      }

      // 3. Update payment method cards & dropdown option
      currentPaymentMethod = method || 'orange_money';
      const paymentDropdown = document.getElementById('chkPaymentOption');
      if (paymentDropdown) {
        paymentDropdown.value = currentPaymentMethod;
      }

      methodCards.forEach(c => {
        const isMatch = (c.getAttribute('data-method') === currentPaymentMethod);
        c.classList.toggle('selected', isMatch);
        c.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        if (isMatch) {
          c.classList.remove('just-activated');
          void c.offsetWidth; // trigger reflow
          c.classList.add('just-activated');
        }
      });

      // 4. Render panel & calculate totals
      calculateOrderTotals();
      renderPaymentPanel(currentPaymentMethod);

      // 5. Smooth scroll to order section
      const orderEl = document.getElementById('order');
      if (orderEl) {
        orderEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // 6. Focus on relevant input
      setTimeout(() => {
        const targetInput = document.getElementById('omSubscriberPhone') || 
                            document.getElementById('afriSubscriberPhone') || 
                            document.getElementById('cardHolderName') || 
                            document.getElementById('chkCustName');
        if (targetInput) targetInput.focus();
      }, 450);
    }

    // Payment Option Dropdown change handler
    const paymentDropdown = document.getElementById('chkPaymentOption');
    if (paymentDropdown) {
      paymentDropdown.addEventListener('change', (e) => {
        selectAndFocusPaymentMethod(e.target.value);
      });
    }

    methodCards.forEach(card => {
      card.addEventListener('click', () => {
        const method = card.getAttribute('data-method') || 'orange_money';
        selectAndFocusPaymentMethod(method);
      });
    });

    // Wire up all external payment method triggers across the entire page
    document.querySelectorAll('[data-select-method]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const m = btn.getAttribute('data-select-method');
        selectAndFocusPaymentMethod(m);
      });
    });

    // Wire up all instant checkout item buttons across the product catalog
    document.querySelectorAll('[data-checkout-item]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const item = btn.getAttribute('data-checkout-item');
        const price = btn.getAttribute('data-checkout-price');
        selectAndFocusPaymentMethod('orange_money', item, price);
      });
    });

    // Initialize panel and totals
    calculateOrderTotals();
    renderPaymentPanel(currentPaymentMethod);

    // Deep link support via hash or query param: #orange_money, ?method=afrimoney, etc.
    const urlParams = new URLSearchParams(window.location.search);
    const methodParam = urlParams.get('method') || (window.location.hash ? window.location.hash.replace('#', '') : '');
    if (['orange_money', 'afrimoney', 'credit_card', 'debit_card', 'cash_delivery'].includes(methodParam)) {
      setTimeout(() => selectAndFocusPaymentMethod(methodParam), 350);
    } else if (window.location.hash === '#order' || window.location.hash === '#checkout' || window.location.hash === '#payment') {
      setTimeout(() => selectAndFocusPaymentMethod('orange_money'), 350);
    }

    // Sync phone number to mobile money field
    const phoneInput = document.getElementById('chkCustPhone');
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        const omInput = document.getElementById('omSubscriberPhone');
        const afriInput = document.getElementById('afriSubscriberPhone');
        if (omInput) omInput.value = phoneInput.value;
        if (afriInput) afriInput.value = phoneInput.value;
      });
    }

    // 3.4 Handle Online Checkout Form Submit
    if (formCheckout) {
      formCheckout.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('chkCustName')?.value.trim();
        const phone = document.getElementById('chkCustPhone')?.value.trim();
        const address = document.getElementById('chkAddress')?.value.trim() || "Freetown Delivery";
        const notes = document.getElementById('chkNotes')?.value.trim() || "";
        const deliveryArea = deliverySelect ? deliverySelect.value : "Aberdeen";

        if (!name || !phone) {
          showToast("Please provide your name and phone number.", "error");
          return;
        }

        const totals = calculateOrderTotals();
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const orderId = `HK-ORD-${randomNum}`;

        let paymentPrefix = "OM";
        let methodNameDisplay = "Orange Money (*144#)";
        if (currentPaymentMethod === 'afrimoney') {
          paymentPrefix = "AF";
          methodNameDisplay = "Afrimoney (*161#)";
        } else if (currentPaymentMethod === 'credit_card') {
          paymentPrefix = "CC";
          methodNameDisplay = "Credit Card (Visa/Mastercard)";
        } else if (currentPaymentMethod === 'debit_card') {
          paymentPrefix = "DB";
          methodNameDisplay = "Debit Card";
        } else if (currentPaymentMethod === 'cash_delivery') {
          paymentPrefix = "COD";
          methodNameDisplay = "Cash on Delivery";
        }
        const paymentRef = `${paymentPrefix}-SLE-${randomNum}`;
        const paymentStatus = (currentPaymentMethod === 'cash_delivery') ? 'pending' : 'paid';

        // Animate processing button
        if (checkoutSubmitBtn) {
          checkoutSubmitBtn.disabled = true;
          checkoutSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authorizing with Payment Provider...`;
        }

        // Simulate provider communication
        await new Promise(r => setTimeout(r, 900));

        // Insert into Supabase orders table
        if (supabaseClient) {
          try {
            await supabaseClient.from('orders').insert([{
              product_name: `${totals.productName} (Qty: ${totals.qty})`,
              customer_name: name,
              phone: phone,
              order_type: 'retail',
              amount: totals.total,
              currency: 'SLE',
              payment_method: currentPaymentMethod,
              payment_reference: paymentRef,
              payment_status: paymentStatus,
              delivery_address: `${deliveryArea} — ${address}`,
              notes: notes,
              status: 'confirmed'
            }]);
          } catch (err) {
            console.warn("Could not log order to Supabase:", err);
          }
        }

        if (checkoutSubmitBtn) {
          checkoutSubmitBtn.disabled = false;
          checkoutSubmitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Authorize Payment & Place Order (SLE ${totals.total.toFixed(2)})`;
        }

        // Populate and show Receipt Modal
        const rcptModal = document.getElementById('receiptModal');
        const rcptOrderId = document.getElementById('rcptOrderId');
        const rcptPaymentRef = document.getElementById('rcptPaymentRef');
        const rcptMethod = document.getElementById('rcptMethod');
        const rcptAmount = document.getElementById('rcptAmount');
        const rcptItem = document.getElementById('rcptItem');
        const rcptDelivery = document.getElementById('rcptDelivery');
        const rcptWhatsAppBtn = document.getElementById('rcptWhatsAppBtn');

        if (rcptOrderId) rcptOrderId.textContent = orderId;
        if (rcptPaymentRef) rcptPaymentRef.textContent = paymentRef;
        if (rcptMethod) rcptMethod.textContent = methodNameDisplay;
        if (rcptAmount) rcptAmount.textContent = `SLE ${totals.total.toFixed(2)}`;
        if (rcptItem) rcptItem.textContent = `${totals.productName} (Qty: ${totals.qty})`;
        if (rcptDelivery) rcptDelivery.textContent = `${deliveryArea} (${address})`;

        // Build WhatsApp deep-link message
        const waCleanNum = CONFIG.BUSINESS.whatsappNumber || "23275416008";
        const waMsg = 
          `Hello Humu! 👋%0A%0A` +
          `I have just placed an order and confirmed payment on your website:%0A%0A` +
          `🧾 *ORDER RECEIPT*%0A` +
          `• *Order ID:* ${encodeURIComponent(orderId)}%0A` +
          `• *Payment Reference:* ${encodeURIComponent(paymentRef)}%0A` +
          `• *Payment Method:* ${encodeURIComponent(methodNameDisplay)}%0A` +
          `• *Amount:* SLE ${totals.total.toFixed(2)} (${paymentStatus.toUpperCase()})%0A` +
          `• *Item:* ${encodeURIComponent(totals.productName)} (Qty: ${totals.qty})%0A` +
          `• *Customer:* ${encodeURIComponent(name)} (${encodeURIComponent(phone)})%0A` +
          `• *Delivery Destination:* ${encodeURIComponent(deliveryArea)} - ${encodeURIComponent(address)}%0A` +
          (notes ? `• *Special Notes:* ${encodeURIComponent(notes)}%0A` : '') +
          `%0APlease confirm my receipt and let me know when the bike rider will dispatch my parcel. Thank you!`;

        if (rcptWhatsAppBtn) {
          rcptWhatsAppBtn.href = `https://wa.me/${waCleanNum}?text=${waMsg}`;
        }

        if (rcptModal) {
          rcptModal.classList.add('show');
        }

        showToast("Order placed & payment authorized successfully!", "success");
        formCheckout.reset();
        calculateOrderTotals();
        renderPaymentPanel(currentPaymentMethod);
      });
    }

    // Modal Close
    const closeBtn = document.getElementById('receiptCloseBtn');
    const rcptModal = document.getElementById('receiptModal');
    if (closeBtn && rcptModal) {
      closeBtn.addEventListener('click', () => rcptModal.classList.remove('show'));
      rcptModal.addEventListener('click', (e) => {
        if (e.target === rcptModal) rcptModal.classList.remove('show');
      });
    }

    // 3.5 Quick WhatsApp Inquiry Form (Legacy Mode)
    if (formInquiry) {
      formInquiry.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('orderCustName')?.value.trim() || "A valued customer";
        const category = document.getElementById('orderCustCategory')?.value || "General Fashion";
        const orderType = document.getElementById('orderCustType')?.value || "Retail";
        const contact = document.getElementById('orderCustPhone')?.value.trim() || "Via WhatsApp";
        const details = document.getElementById('orderCustDetails')?.value.trim() || "Inquiring about stock and sizes";

        const formattedMessage = 
          `Hello Humu! 👋%0A%0A` +
          `I would love to place an inquiry from your boutique:%0A` +
          `• *Name:* ${encodeURIComponent(name)}%0A` +
          `• *Looking for:* ${encodeURIComponent(category)} (${encodeURIComponent(orderType)})%0A` +
          `• *Contact / Phone:* ${encodeURIComponent(contact)}%0A` +
          `• *Preferences / Notes:* ${encodeURIComponent(details)}%0A%0A` +
          `Could you please let me know current availability and price? Thank you!`;

        logOrderAndRedirect(`${category} (${orderType})`, name, orderType.toLowerCase(), details, decodeURIComponent(formattedMessage));
      });
    }
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
  // 10a. ONLINE CHECKOUT & PAYMENT METHOD BUILDER (Section 14)
  // ==============================================================================
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
    const chkDeliveryArea  = document.getElementById('chkDeliveryArea');
    const summarySubtotal  = document.getElementById('summarySubtotal');
    const summaryDelivFee  = document.getElementById('summaryDeliveryFee');
    const summaryDelivLbl  = document.getElementById('summaryDeliveryLabel');
    const summaryTotal     = document.getElementById('summaryTotal');
    const submitBtn        = document.getElementById('checkoutSubmitBtn');
    const receiptModal     = document.getElementById('receiptModal');
    const receiptCloseBtn  = document.getElementById('receiptCloseBtn');

    if (!btnModeCheckout || !onlineForm) return; // guard if elements absent

    // ── Payment method descriptions ────────────────────────────────────────────
    const paymentInfo = {
      orange_money: {
        icon: 'fa-solid fa-mobile-screen-button',
        iconClass: 'pm-icon-orange',
        title: 'Orange Money',
        subtitle: 'Fast mobile money — works 24/7',
        steps: [
          '<strong>Dial *144#</strong> on your Orange SIM to open the menu.',
          'Choose <strong>Pay for Goods & Services</strong> → enter Merchant Code.',
          'Enter the total amount shown above and confirm with your PIN.',
          'Screenshot your <strong>Orange Money receipt</strong> and send it to our WhatsApp.',
          'Your order will be dispatched once payment is verified.'
        ]
      },
      afrimoney: {
        icon: 'fa-solid fa-money-bill-transfer',
        iconClass: 'pm-icon-afri',
        title: 'Afrimoney',
        subtitle: 'Africell mobile money — USSD instant transfer',
        steps: [
          '<strong>Dial *161#</strong> on your Africell SIM.',
          'Select <strong>Pay Bill / Merchant Payment</strong>.',
          'Enter our Afrimoney business number and the order total.',
          'Confirm with your 4-digit PIN.',
          'Send the <strong>Afrimoney confirmation SMS</strong> screenshot on WhatsApp to complete.'
        ]
      },
      credit_card: {
        icon: 'fa-regular fa-credit-card',
        iconClass: 'pm-icon-card',
        title: 'Credit Card (Visa / Mastercard)',
        subtitle: 'Secure card checkout — processed by Stripe',
        steps: [
          'Click <strong>Authorize Payment</strong> below to open the secure card form.',
          'Enter your 16-digit card number, expiry, and CVV.',
          'We use <strong>256-bit SSL encryption</strong> — your card data is never stored.',
          'A charge reference will appear on your statement as <em>HUMU KABBA VAULT</em>.',
          'Order dispatches automatically after bank authorization.'
        ]
      },
      debit_card: {
        icon: 'fa-solid fa-credit-card',
        iconClass: 'pm-icon-card',
        title: 'Debit Card (Local Bank)',
        subtitle: 'Sierra Leonean bank debit cards accepted',
        steps: [
          'Click <strong>Authorize Payment</strong> below to open the secure card form.',
          'Enter your debit card number, expiry, and CVV.',
          'Supported banks: <strong>Rokel Commercial, Sierra Leone Commercial Bank, UBA, Ecobank</strong>.',
          'Your bank may send an <strong>OTP</strong> — enter it to complete the payment.',
          'Order dispatches once your bank confirms the transaction.'
        ]
      },
      cash_delivery: {
        icon: 'fa-solid fa-hand-holding-dollar',
        iconClass: 'pm-icon-cash',
        title: 'Cash on Delivery / In-Store',
        subtitle: 'Pay our delivery rider or in-boutique',
        steps: [
          'Place your order below — no upfront payment needed.',
          'Our team will <strong>WhatsApp you</strong> to confirm delivery time and address.',
          'Prepare the <strong>exact cash amount</strong> shown above at delivery.',
          'You can also pay in-store at <strong>4B Johnson Land, Aberdeen</strong> (Mon–Sat 9 AM – 7 PM).',
          'Receive your item and payment is complete — no receipts needed!'
        ]
      }
    };

    // ── Helpers ────────────────────────────────────────────────────────────────
    function getPrice(selectEl) {
      const opt = selectEl.options[selectEl.selectedIndex];
      return parseFloat(opt.getAttribute('data-price') || '0');
    }

    function getDeliveryFee(selectEl) {
      const opt = selectEl.options[selectEl.selectedIndex];
      return parseFloat(opt.getAttribute('data-fee') || '0');
    }

    function formatSLE(amount) {
      return 'SLE ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function getSelectedMethod() {
      const sel = document.querySelector('.payment-method-card.selected');
      return sel ? sel.getAttribute('data-method') : 'cash_delivery';
    }

    // ── Update live order summary ──────────────────────────────────────────────
    function updateSummary() {
      if (!chkCategory || !summarySubtotal) return;
      const price    = getPrice(chkCategory);
      const qty      = Math.max(1, parseInt(chkQuantity?.value || '1', 10));
      const fee      = getDeliveryFee(chkDeliveryArea);
      const subtotal = price * qty;
      const total    = subtotal + fee;

      if (summarySubtotal) summarySubtotal.textContent = formatSLE(subtotal);
      if (summaryDelivFee) {
        summaryDelivFee.textContent = fee === 0 ? 'FREE (Aberdeen Pickup)' : formatSLE(fee);
      }
      if (summaryDelivLbl) {
        const area = chkDeliveryArea?.options[chkDeliveryArea.selectedIndex]?.text || 'Delivery';
        summaryDelivLbl.textContent = fee === 0 ? 'Boutique Pickup' : 'Delivery Fee';
      }
      if (summaryTotal) summaryTotal.textContent = formatSLE(total);
      if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Authorize Payment &amp; Place Order (${formatSLE(total)})`;
      }
    }

    // ── Render payment details panel ───────────────────────────────────────────
    function renderPaymentPanel(method) {
      if (!detailsPanel) return;
      const info = paymentInfo[method];
      if (!info) { detailsPanel.innerHTML = ''; return; }

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
        <ul class="pd-steps">${stepsHtml}</ul>`;
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
    });

    // ── Online Checkout form submit ────────────────────────────────────────────
    if (onlineForm) {
      onlineForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name     = document.getElementById('chkCustName')?.value?.trim() || 'Customer';
        const phone    = document.getElementById('chkCustPhone')?.value?.trim() || '';
        const item     = chkCategory?.options[chkCategory.selectedIndex]?.value || 'Item';
        const area     = chkDeliveryArea?.options[chkDeliveryArea.selectedIndex]?.value || 'Aberdeen';
        const qty      = parseInt(chkQuantity?.value || '1', 10);
        const address  = document.getElementById('chkAddress')?.value?.trim() || '';
        const notes    = document.getElementById('chkNotes')?.value?.trim() || '';
        const method   = getSelectedMethod();
        const price    = getPrice(chkCategory);
        const fee      = getDeliveryFee(chkDeliveryArea);
        const total    = (price * qty) + fee;

        // Generate order ID and payment reference
        const orderId  = 'HK-' + Date.now().toString(36).toUpperCase();
        const payRef   = method.toUpperCase().replace('_','').slice(0, 4) + '-' +
                         Math.random().toString(36).slice(2, 8).toUpperCase();

        const methodLabels = {
          orange_money: 'Orange Money',
          afrimoney: 'Afrimoney',
          credit_card: 'Credit Card',
          debit_card: 'Debit Card',
          cash_delivery: 'Cash on Delivery'
        };
        const methodLabel = methodLabels[method] || method;

        // Visual: disable button while processing
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing…';
        }

        try {
          // Log to Supabase if configured
          if (supabaseClient) {
            await supabaseClient.from('orders').insert([{
              product_name: item,
              customer_name: name,
              quantity: qty,
              notes: notes + (address ? ' | Delivery: ' + address : ''),
              amount: total,
              currency: 'SLE',
              payment_method: method,
              payment_reference: payRef,
              payment_status: method === 'cash_delivery' ? 'pending' : 'authorised',
              delivery_address: (area + (address ? ', ' + address : ''))
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

        if (rcptOrderId)    rcptOrderId.textContent    = orderId;
        if (rcptPaymentRef) rcptPaymentRef.textContent = payRef;
        if (rcptMethod)     rcptMethod.textContent     = methodLabel;
        if (rcptAmount)     rcptAmount.textContent     = formatSLE(total);
        if (rcptItem)       rcptItem.textContent       = item + ' ×' + qty;
        if (rcptCustomer)   rcptCustomer.textContent   = name;
        if (rcptDelivery)   rcptDelivery.textContent   = area;
        if (rcptDate)       rcptDate.textContent       = new Date().toLocaleString('en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        // WhatsApp share button in receipt
        const rcptWaBtn = document.getElementById('rcptWhatsappBtn');
        if (rcptWaBtn) {
          const waMsg = encodeURIComponent(
            `🛍️ *Order Confirmation — Humu Kabba Variety Vault*\n\n` +
            `Order ID: ${orderId}\n` +
            `Item: ${item} ×${qty}\n` +
            `Customer: ${name} | ${phone}\n` +
            `Delivery: ${area}${address ? ', ' + address : ''}\n` +
            `Payment: ${methodLabel}\n` +
            `Ref: ${payRef}\n` +
            `Total: ${formatSLE(total)}\n\n` +
            (notes ? `Notes: ${notes}\n\n` : '') +
            `Please confirm my order. Thank you! 🙏`
          );
          rcptWaBtn.href = `https://wa.me/23275416008?text=${waMsg}`;
        }

        // Show receipt modal
        if (receiptModal) receiptModal.classList.add('open');

        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          updateSummary();
        }

        showToast('Order placed! Check your receipt for details.', 'success');
      });
    }

    // ── Receipt modal close ────────────────────────────────────────────────────
    if (receiptModal) {
      if (receiptCloseBtn) {
        receiptCloseBtn.addEventListener('click', () => receiptModal.classList.remove('open'));
      }
      receiptModal.addEventListener('click', (e) => {
        if (e.target === receiptModal) receiptModal.classList.remove('open');
      });
    }

    // ── FAQ payment method quick-select buttons (data-select-method) ──────────
    document.querySelectorAll('[data-select-method]').forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.getAttribute('data-select-method');
        // Scroll to order section
        const orderSection = document.getElementById('order');
        if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
          // Switch to checkout tab
          if (btnModeCheckout) btnModeCheckout.click();
          // Select the matching payment card
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
        }, 600);
      });
    });

    // ── Initialize ─────────────────────────────────────────────────────────────
    updateSummary();
    // Render panel for default selected card
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
