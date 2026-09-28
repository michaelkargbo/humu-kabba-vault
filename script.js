/**
 * Humu Kabba Variety Vault - Interactive Controller
 * Handles WhatsApp deep-linking, store status, category filtering, and direct inquiry generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '23275416008';
  const WHATSAPP_DISPLAY = '+232 754 16008';

  // 1. Live Store Hours Status (Sierra Leone is UTC / GMT)
  function updateStoreStatus() {
    const statusBadges = document.querySelectorAll('.store-status-badge');
    if (!statusBadges.length) return;

    const now = new Date();
    // Get UTC hours and day (Sierra Leone uses GMT/UTC all year round)
    const utcDay = now.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const utcHour = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const currentTimeInMinutes = utcHour * 60 + utcMinutes;

    let isOpen = false;

    if (utcDay === 0) {
      // Sunday: 13:00 to 17:00
      const openTime = 13 * 60;
      const closeTime = 17 * 60;
      isOpen = currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime;
    } else {
      // Monday - Saturday: 09:00 to 19:00
      const openTime = 9 * 60;
      const closeTime = 19 * 60;
      isOpen = currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime;
    }

    statusBadges.forEach(badge => {
      if (isOpen) {
        badge.className = 'store-status-badge open';
        badge.innerHTML = `<span class="status-dot"></span> Open Today in Aberdeen until ${utcDay === 0 ? '5:00 PM' : '7:00 PM'}`;
      } else {
        badge.className = 'store-status-badge closed';
        badge.innerHTML = `<span class="status-dot"></span> Opens ${utcDay === 0 ? 'Mon 9:00 AM' : 'Today/Tomorrow at 9:00 AM'}`;
      }
    });
  }

  updateStoreStatus();
  setInterval(updateStoreStatus, 60000); // Check every minute

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      }
    });

    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  // 3. Category Filter Tabs
  const tabBtns = document.querySelectorAll('.category-tab-btn');
  const productCards = document.querySelectorAll('.product-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // 4. Quick WhatsApp Order Generator Form
  const orderForm = document.getElementById('quickOrderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const customerName = document.getElementById('customerName')?.value.trim() || 'A valued customer';
      const category = document.getElementById('orderCategory')?.value || 'Fashion Collection';
      const orderType = document.getElementById('orderType')?.value || 'Retail';
      const itemDetails = document.getElementById('itemDetails')?.value.trim() || 'Inquiring about current boutique collection';

      const message = `Hello Humu Kabba Variety Vault!%0A%0A` +
        `*New Inquiry / Order via Website*%0A` +
        `━━━━━━━━━━━━━━━━━━━━%0A` +
        `👤 *Name:* ${encodeURIComponent(customerName)}%0A` +
        `🏷️ *Category:* ${encodeURIComponent(category)}%0A` +
        `💼 *Order Type:* ${encodeURIComponent(orderType)}%0A` +
        `📝 *Items / Request:* ${encodeURIComponent(itemDetails)}%0A` +
        `━━━━━━━━━━━━━━━━━━━━%0A` +
        `Please let me know availability and pricing. Thank you!`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // 5. Ensure all direct phone number clicks connect straight to WhatsApp
  document.querySelectorAll('[data-whatsapp-action]').forEach(el => {
    el.addEventListener('click', (e) => {
      const customMsg = el.getAttribute('data-whatsapp-message') || 
        'Hello Humu Kabba Variety Vault! I saw your website and would like to make an inquiry.';
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(customMsg)}`;
      window.open(url, '_blank');
    });
  });

  console.log('Humu Kabba Variety Vault website initialized successfully.');
});
