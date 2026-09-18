/**
 * FOMO Guntur — cart.js
 * localStorage cart, bag panel rendering, quantity management,
 * subtotal computation, delivery charge from content.json.
 */

'use strict';

const CART_KEY = 'fomo_cart_v1';

// ── Delivery config (overridden once content.json loads) ─────────
let deliveryConfig = {
  enabled: true,
  charge: 99,
  freeAbove: 1000,
  note: 'Free delivery on orders above ₹1,000',
};

// ── Cart state ───────────────────────────────────────────────────
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (_) { /* storage full */ }
}

function getCart() {
  return loadCart();
}

// ── Cart operations ──────────────────────────────────────────────

/**
 * Add an item to the cart.
 * @param {{ id, name, category, price, size, color, image }} product
 * @param {number} qty
 */
function addItem(product, qty = 1) {
  const cart = loadCart();
  const key  = `${product.id}__${product.size}__${product.color}`;
  const existing = cart.find(i => i.key === key);

  if (existing) {
    existing.qty = Math.min(10, existing.qty + qty);
  } else {
    cart.push({
      key,
      id:       product.id,
      name:     product.name,
      category: product.category,
      price:    product.price,
      size:     product.size,
      color:    product.color,
      image:    product.image || '',
      qty:      Math.min(10, qty),
    });
  }

  saveCart(cart);
  updateCartCount();
  renderBag();
}

function removeItem(key) {
  const cart = loadCart().filter(i => i.key !== key);
  saveCart(cart);
  updateCartCount();
  renderBag();
}

function updateItemQty(key, qty) {
  const cart = loadCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  if (qty < 1) {
    removeItem(key);
    return;
  }
  item.qty = Math.min(10, qty);
  saveCart(cart);
  updateCartCount();
  renderBag();
}

function clearCart() {
  saveCart([]);
  updateCartCount();
  renderBag();
}

// ── Totals ───────────────────────────────────────────────────────
function getSubtotal() {
  return loadCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getDeliveryCharge(subtotal) {
  if (!deliveryConfig.enabled) return 0;
  return subtotal >= deliveryConfig.freeAbove ? 0 : deliveryConfig.charge;
}

function getTotal() {
  const sub = getSubtotal();
  return sub + getDeliveryCharge(sub);
}

// ── Cart count badge ─────────────────────────────────────────────
function updateCartCount() {
  const cart  = loadCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const els   = [
    document.getElementById('nav-cart-count'),
    document.getElementById('mobile-cart-count'),
  ];
  els.forEach(el => { if (el) el.textContent = total; });
}

// ── Bag panel rendering ──────────────────────────────────────────
function renderBag() {
  const body   = document.getElementById('bag-body');
  const footer = document.getElementById('bag-footer');
  const sub    = document.getElementById('bag-subtotal');
  const note   = document.getElementById('bag-delivery-note');
  if (!body) return;

  const cart     = loadCart();
  const subtotal = getSubtotal();
  const delivery = getDeliveryCharge(subtotal);
  const escH     = window.FOMO_SHOP?.escHtml || (s => String(s));

  if (!cart.length) {
    body.innerHTML = `
      <div class="bag-empty">
        <p class="bag-empty-title">YOUR BAG IS EMPTY</p>
        <p class="bag-empty-sub">Find something you want to wear.</p>
        <button class="btn-outline" id="bag-shop-now">SHOP NOW</button>
      </div>`;
    if (footer) footer.setAttribute('hidden', '');
    // Wire shop now
    document.getElementById('bag-shop-now')?.addEventListener('click', () => {
      closeBag();
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
    });
    return;
  }

  if (footer) footer.removeAttribute('hidden');

  body.innerHTML = cart.map(item => `
    <div class="bag-item" data-key="${escH(item.key)}">
      <div class="bag-item-img">
        ${item.image
          ? `<img src="${escH(item.image)}" alt="${escH(item.name)}" loading="lazy" data-fallback-bag="1" />`
          : `<div class="bag-item-placeholder"><span>FOMO</span></div>`
        }
      </div>
      <div class="bag-item-info">
        <p class="bag-item-name">${escH(item.name)}</p>
        <p class="bag-item-meta">${item.size ? escH(item.size) : ''}${item.size && item.color ? ' · ' : ''}${item.color ? escH(item.color) : ''}</p>
        <div class="bag-item-qty-row">
          <button class="bag-item-qty-btn" data-key="${escH(item.key)}" data-action="dec" aria-label="Decrease quantity">−</button>
          <input class="bag-item-qty-val" type="number" value="${item.qty}" min="1" max="10"
                 data-key="${escH(item.key)}" readonly />
          <button class="bag-item-qty-btn" data-key="${escH(item.key)}" data-action="inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div>
        <p class="bag-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
        <button class="bag-item-remove" data-key="${escH(item.key)}" aria-label="Remove ${escH(item.name)} from bag">✕</button>
      </div>
    </div>
  `).join('');

  // Bag image error fallback
  body.querySelectorAll('img[data-fallback-bag]').forEach(img => {
    img.addEventListener('error', function() {
      const wrap = this.parentNode;
      if (wrap) wrap.innerHTML = '<div class="bag-item-placeholder"><span>FOMO</span></div>';
    }, { once: true });
  });

  // Subtotal
  if (sub) sub.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (note) {
    if (delivery === 0 && deliveryConfig.enabled) {
      note.textContent = '✓ Free delivery applied';
    } else if (deliveryConfig.enabled) {
      const remaining = deliveryConfig.freeAbove - subtotal;
      note.textContent = `Add ₹${remaining.toLocaleString('en-IN')} more for free delivery · Delivery: ₹${delivery}`;
    } else {
      note.textContent = '';
    }
  }

  // Wire qty buttons and remove
  body.querySelectorAll('.bag-item-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key     = btn.dataset.key;
      const action  = btn.dataset.action;
      const item    = loadCart().find(i => i.key === key);
      if (!item) return;
      updateItemQty(key, action === 'inc' ? item.qty + 1 : item.qty - 1);
    });
  });

  body.querySelectorAll('.bag-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeItem(btn.dataset.key));
  });
}

// ── Open / Close Bag ─────────────────────────────────────────────
function openBag() {
  const panel = document.getElementById('bag-panel');
  if (!panel) return;
  renderBag();
  panel.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeBag() {
  const panel = document.getElementById('bag-panel');
  if (!panel) return;
  panel.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// ── Init cart UI wiring ──────────────────────────────────────────
function initCart() {
  // Open bag buttons
  const openTriggers = [
    document.getElementById('nav-cart-btn'),
    document.getElementById('mobile-bag-btn'),
    document.getElementById('mobile-cta-bag'),
  ];
  openTriggers.forEach(el => el?.addEventListener('click', openBag));

  // Close bag
  document.getElementById('bag-close')?.addEventListener('click', closeBag);
  document.getElementById('bag-overlay')?.addEventListener('click', closeBag);

  // Checkout button
  document.getElementById('btn-checkout')?.addEventListener('click', () => {
    closeBag();
    window.FOMO_CHECKOUT?.openCheckout();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    const panel = document.getElementById('bag-panel');
    if (e.key === 'Escape' && panel && !panel.hasAttribute('hidden')) closeBag();
  });

  // Restore count on page load
  updateCartCount();
}

// ── Set delivery config from content.json ────────────────────────
function setDeliveryConfig(cfg) {
  if (cfg && typeof cfg === 'object') {
    deliveryConfig = { ...deliveryConfig, ...cfg };
  }
}

// ── Expose globally ──────────────────────────────────────────────
window.FOMO_CART = {
  addItem,
  removeItem,
  updateItemQty,
  clearCart,
  getCart,
  getSubtotal,
  getDeliveryCharge,
  getTotal,
  updateCartCount,
  openBag,
  closeBag,
  renderBag,
  setDeliveryConfig,
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
}
