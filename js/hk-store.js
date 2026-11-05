/**
 * Shared store helpers for Humu Kabba Variety Vault.
 * Cart persistence, catalogue loading, honest checkout, WhatsApp messages.
 */
(function (global) {
  'use strict';

  var CART_KEY = 'hk_vault_cart_v2';
  var WISH_KEY = 'hk_vault_wishlist_v2';
  var WA_NUMBER = '23277416008';
  var client = null;

  function cfg() {
    return global.APP_CONFIG || {};
  }

  function business() {
    return (cfg().BUSINESS) || {
      name: 'Humu Kabba Variety Vault',
      whatsappNumber: WA_NUMBER,
      whatsappLink: 'https://wa.me/' + WA_NUMBER
    };
  }

  function waNumber() {
    return business().whatsappNumber || WA_NUMBER;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatSLE(n) {
    if (n === null || n === undefined || n === '' || isNaN(Number(n))) return 'Price on request';
    return 'NLe ' + Number(n).toLocaleString('en-SL', { maximumFractionDigits: 0 });
  }

  function imgSrc(url) {
    if (!url) return 'assets/dresses.jpg';
    return url;
  }

  function getClient() {
    if (client) return client;
    var c = cfg();
    if (typeof global.supabase === 'undefined') return null;
    if (!c.isSupabaseConfigured || !c.isSupabaseConfigured()) return null;
    try {
      client = global.supabase.createClient(c.SUPABASE.url, c.SUPABASE.anonKey);
    } catch (e) {
      client = null;
    }
    return client;
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items || []));
    try {
      global.dispatchEvent(new CustomEvent('hk-cart-changed'));
    } catch (e) {}
  }

  function cartCount(items) {
    return (items || loadCart()).reduce(function (s, i) { return s + (i.qty || 1); }, 0);
  }

  function cartSubtotal(items) {
    return (items || loadCart()).reduce(function (s, i) {
      return s + ((Number(i.price) || 0) * (i.qty || 1));
    }, 0);
  }

  function addToCart(product, qty) {
    var items = loadCart();
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var existing = items.find(function (i) { return String(i.id) === String(product.id); });
    if (existing) existing.qty = Math.min(99, (existing.qty || 1) + qty);
    else {
      items.push({
        id: product.id,
        name: product.name,
        category: product.category || '',
        price: product.price == null ? null : Number(product.price),
        image_url: product.image_url || '',
        colors: product.colors || '',
        is_sample: !!product.is_sample,
        qty: qty
      });
    }
    saveCart(items);
    return items;
  }

  function stockOf(p) {
    if (p.stock_quantity !== undefined && p.stock_quantity !== null && p.stock_quantity !== '') {
      return parseInt(p.stock_quantity, 10);
    }
    if (p.in_stock === false) return 0;
    return null;
  }

  function inStock(p) {
    var s = stockOf(p);
    if (s === 0) return false;
    if (p.in_stock === false) return false;
    return true;
  }

  function catalogCategory(cat) {
    var c = String(cat || '').toLowerCase();
    if (c.indexOf('dress') !== -1 || c.indexOf('apparel') !== -1) return 'Dresses';
    if (c.indexOf('bag') !== -1) return 'Bags';
    if (c.indexOf('perfume') !== -1 || c.indexOf('beauty') !== -1) return 'Perfumes';
    if (c.indexOf('cosmetic') !== -1) return 'Cosmetics';
    if (c.indexOf('shoe') !== -1 || c.indexOf('foot') !== -1 || c.indexOf('denim') !== -1) return 'Shoes';
    if (c.indexOf('case') !== -1 || c.indexOf('phone') !== -1) return 'Phone Cases';
    if (c.indexOf('accessor') !== -1) return 'Accessories';
    return cat || 'Other';
  }

  async function loadProducts() {
    var sb = getClient();
    if (!sb) return { products: [], source: 'none' };
    var res = await sb.from('products').select('*').order('created_at', { ascending: false });
    if (res.error) throw res.error;
    return { products: res.data || [], source: 'supabase' };
  }

  async function loadProduct(id) {
    var sb = getClient();
    if (!sb || !id) return null;
    var res = await sb.from('products').select('*').eq('id', id).maybeSingle();
    if (res.error) throw res.error;
    return res.data || null;
  }

  async function loadBanners() {
    var sb = getClient();
    if (!sb) return [];
    try {
      var res = await sb.from('banners').select('*').eq('active', true).order('sort_order', { ascending: true });
      if (res.error) return [];
      return res.data || [];
    } catch (e) {
      return [];
    }
  }

  function buildWhatsAppOrderMessage(details) {
    var items = details.items || loadCart();
    var lines = [
      '🛍️ *New Order — Humu Kabba Variety Vault*',
      ''
    ];
    if (details.order_reference) lines.push('🔖 *Ref:* ' + details.order_reference);
    if (details.name) lines.push('👤 *Customer:* ' + details.name);
    if (details.phone) lines.push('📞 *Phone:* ' + details.phone);
    if (details.email) lines.push('✉️ *Email:* ' + details.email);
    if (details.address) lines.push('📍 *Delivery:* ' + details.address);
    if (details.notes) lines.push('📝 *Notes:* ' + details.notes);
    lines.push('');
    lines.push('*Items:*');
    items.forEach(function (i) {
      var line = '• ' + i.name + ' ×' + (i.qty || 1);
      if (i.price != null && i.price !== '') line += ' — ' + formatSLE((Number(i.price) || 0) * (i.qty || 1));
      if (i.is_sample) line += ' (sample listing — confirm price)';
      lines.push(line);
    });
    lines.push('');
    if (details.deliveryZone) lines.push('📦 *Delivery:* ' + details.deliveryZone);
    if (details.total != null) lines.push('💰 *Total: ' + formatSLE(details.total) + '*');
    if (details.payment) lines.push('💳 *Payment requested:* ' + details.payment);
    lines.push('⚠️ Payment is *not* confirmed by the website. Please confirm this order and payment with the shop.');
    lines.push('');
    lines.push('Please confirm my order. Thank you! 🙏');
    return lines.join('\n');
  }

  function waUrl(message) {
    return 'https://wa.me/' + waNumber() + '?text=' + encodeURIComponent(message);
  }

  async function placeOrder(details) {
    var sb = getClient();
    if (!sb) {
      throw new Error('The order database is not available. Your order was not saved.');
    }
    var items = details.items || [];
    if (!items.length) throw new Error('Your bag is empty.');

    var payload = {
      customer_name: details.name,
      phone: details.phone,
      customer_email: details.email || '',
      delivery_address: details.address,
      delivery_instructions: details.notes || '',
      notes: details.notes || '',
      payment_method: details.payment_method || 'cash_on_delivery',
      items: items.map(function (i) {
        return {
          id: i.id,
          name: i.name,
          qty: i.qty || 1,
          price: i.price,
          category: i.category || '',
          is_sample: !!i.is_sample
        };
      }),
      delivery_fee: details.delivery_fee || 0
    };

    var rpc = await sb.rpc('place_customer_order', { payload: payload });
    if (!rpc.error && rpc.data) {
      var data = rpc.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
      }
      if (data && (data.order_reference || data.id)) return data;
    }

    var fallbackRef = 'HKV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    var row = {
      product_name: items.map(function (i) { return i.name + ' ×' + (i.qty || 1); }).join(', '),
      customer_name: details.name,
      phone: details.phone,
      order_type: 'online',
      amount: details.total,
      currency: 'SLE',
      payment_method: details.payment_method || 'cash_on_delivery',
      payment_reference: fallbackRef,
      payment_status: 'pending',
      delivery_address: details.address,
      notes: details.notes || '',
      status: 'new'
    };

    var insert = await sb.from('orders').insert([row]);
    if (insert.error) {
      var extra = {
        order_reference: fallbackRef,
        customer_email: details.email || '',
        items: payload.items,
        delivery_instructions: details.notes || ''
      };
      var retry = await sb.from('orders').insert([Object.assign({}, row, extra)]);
      if (retry.error) {
        throw new Error(insert.error.message || retry.error.message || 'Order could not be saved.');
      }
    }
    return { order_reference: fallbackRef, payment_status: 'pending', status: 'new', id: null };
  }

  async function lookupOrder(ref, phone) {
    var sb = getClient();
    if (!sb) throw new Error('Tracking is not available.');
    var rpc = await sb.rpc('lookup_customer_order', { p_ref: ref, p_phone: phone });
    if (!rpc.error) return rpc.data || [];
    throw new Error('Enter both your order reference and the phone number used at checkout.');
  }

  global.HKStore = {
    CART_KEY: CART_KEY,
    WISH_KEY: WISH_KEY,
    escapeHTML: escapeHTML,
    formatSLE: formatSLE,
    imgSrc: imgSrc,
    getClient: getClient,
    business: business,
    waNumber: waNumber,
    loadCart: loadCart,
    saveCart: saveCart,
    cartCount: cartCount,
    cartSubtotal: cartSubtotal,
    addToCart: addToCart,
    stockOf: stockOf,
    inStock: inStock,
    catalogCategory: catalogCategory,
    loadProducts: loadProducts,
    loadProduct: loadProduct,
    loadBanners: loadBanners,
    buildWhatsAppOrderMessage: buildWhatsAppOrderMessage,
    waUrl: waUrl,
    placeOrder: placeOrder,
    lookupOrder: lookupOrder
  };
})(window);
