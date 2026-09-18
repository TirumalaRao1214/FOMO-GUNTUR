/**
 * FOMO Guntur — checkout.js
 * Customer + delivery form, validation, order review, WhatsApp message.
 */

'use strict';

// ── Helpers ──────────────────────────────────────────────────────
const escH = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

function validateMobile(raw) {
  // Strip spaces / dashes / +91 prefix
  const stripped = raw.replace(/[\s\-]/g, '');
  const m = stripped.match(/^(?:\+91|91)?([6-9]\d{9})$/);
  return m ? m[1] : null;
}

function generateRef() {
  const now  = new Date();
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `FOMO-${yyyymmdd}-${rand}`;
}

// ── Validation ───────────────────────────────────────────────────
function getField(id)       { return document.getElementById(id); }
function getVal(id)         { return (getField(id)?.value || '').trim(); }
function showErr(id, show)  {
  const el = getField(id);
  if (el) { show ? el.removeAttribute('hidden') : el.setAttribute('hidden', ''); }
}
function markField(id, invalid) {
  const el = getField(id);
  if (el) el.classList.toggle('invalid', invalid);
}

function validateForm() {
  let valid = true;
  let firstInvalid = null;

  function check(fieldId, errId, test) {
    const ok = test(getVal(fieldId));
    showErr(errId, !ok);
    markField(fieldId, !ok);
    if (!ok && !firstInvalid) firstInvalid = getField(fieldId);
    if (!ok) valid = false;
  }

  check('cf-name',    'err-name',    v => v.length > 0);
  check('cf-phone',   'err-phone',   v => !!validateMobile(v));
  check('cf-house',   'err-house',   v => v.length > 0);
  check('cf-street',  'err-street',  v => v.length > 0);
  check('cf-city',    'err-city',    v => v.length > 0);
  check('cf-state',   'err-state',   v => v.length > 0);
  check('cf-pincode', 'err-pincode', v => /^\d{6}$/.test(v));

  if (!valid && firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalid.focus();
  }

  return valid;
}

// ── Build order review HTML ──────────────────────────────────────
function buildOrderReview(ref) {
  const cart     = window.FOMO_CART.getCart();
  const subtotal = window.FOMO_CART.getSubtotal();
  const delivery = window.FOMO_CART.getDeliveryCharge(subtotal);
  const total    = subtotal + delivery;

  const name         = getVal('cf-name');
  const phone        = validateMobile(getVal('cf-phone')) || getVal('cf-phone');
  const house        = getVal('cf-house');
  const street       = getVal('cf-street');
  const city         = getVal('cf-city');
  const state        = getVal('cf-state');
  const pincode      = getVal('cf-pincode');
  const landmark     = getVal('cf-landmark');
  const instructions = getVal('cf-instructions');

  const itemsHTML = cart.map(item => `
    <div class="review-item">
      <div class="review-item-img">
        ${item.image
          ? `<img src="${escH(item.image)}" alt="${escH(item.name)}" data-fallback-review="1" />`
          : `<div class="review-item-img-placeholder"><span>FOMO</span></div>`
        }
      </div>
      <div>
        <p class="review-item-name">${escH(item.name)}</p>
        <p class="review-item-meta">${escH(item.category)}${item.size ? ' · ' + escH(item.size) : ''}${item.color ? ' · ' + escH(item.color) : ''} · Qty: ${item.qty}</p>
        <p class="review-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
      </div>
    </div>
  `).join('');

  return `
    <p class="review-ref">ORDER REF: ${escH(ref)}</p>

    <div class="review-block">
      <span class="review-block-title">CUSTOMER</span>
      <div class="review-row"><span class="review-row-label">Name</span><span class="review-row-value">${escH(name)}</span></div>
      <div class="review-row"><span class="review-row-label">Phone</span><span class="review-row-value">+91 ${escH(phone)}</span></div>
    </div>

    <div class="review-block">
      <span class="review-block-title">DELIVERY</span>
      <div class="review-row"><span class="review-row-label">House / Door</span><span class="review-row-value">${escH(house)}</span></div>
      <div class="review-row"><span class="review-row-label">Street / Area</span><span class="review-row-value">${escH(street)}</span></div>
      <div class="review-row"><span class="review-row-label">City</span><span class="review-row-value">${escH(city)}</span></div>
      <div class="review-row"><span class="review-row-label">State</span><span class="review-row-value">${escH(state)}</span></div>
      <div class="review-row"><span class="review-row-label">Pincode</span><span class="review-row-value">${escH(pincode)}</span></div>
      ${landmark ? `<div class="review-row"><span class="review-row-label">Landmark</span><span class="review-row-value">${escH(landmark)}</span></div>` : ''}
      ${instructions ? `<div class="review-row"><span class="review-row-label">Instructions</span><span class="review-row-value">${escH(instructions)}</span></div>` : ''}
    </div>

    <div class="review-block">
      <span class="review-block-title">ORDER ITEMS</span>
      ${itemsHTML}
      <div class="review-total-block">
        <div class="review-total-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
        <div class="review-total-row"><span>Delivery</span><span>${delivery === 0 ? 'FREE' : '₹' + delivery.toLocaleString('en-IN')}</span></div>
        <div class="review-total-final"><span>TOTAL</span><span>₹${total.toLocaleString('en-IN')}</span></div>
      </div>
    </div>
  `.trim();
}

// ── Build WhatsApp message ───────────────────────────────────────
function buildWhatsAppMessage(ref) {
  const cart      = window.FOMO_CART.getCart();
  const subtotal  = window.FOMO_CART.getSubtotal();
  const delivery  = window.FOMO_CART.getDeliveryCharge(subtotal);
  const total     = subtotal + delivery;

  const name         = getVal('cf-name');
  const phone        = validateMobile(getVal('cf-phone')) || getVal('cf-phone');
  const house        = getVal('cf-house');
  const street       = getVal('cf-street');
  const city         = getVal('cf-city');
  const state        = getVal('cf-state');
  const pincode      = getVal('cf-pincode');
  const landmark     = getVal('cf-landmark');
  const instructions = getVal('cf-instructions');

  const items = cart.map((item, idx) => {
    const itemTotal = item.price * item.qty;
    return [
      `${idx + 1}. ${item.name}`,
      `   Category: ${item.category}`,
      item.size  ? `   Size: ${item.size}`  : '',
      item.color ? `   Color: ${item.color}` : '',
      `   Quantity: ${item.qty}`,
      `   Unit Price: ₹${item.price.toLocaleString('en-IN')}`,
      `   Item Total: ₹${itemTotal.toLocaleString('en-IN')}`,
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  const lines = [
    'FOMO — NEW ORDER',
    '',
    `Order Reference: ${ref}`,
    '',
    '──────────────────────',
    'CUSTOMER DETAILS',
    '──────────────────────',
    `Name: ${name}`,
    `Phone: +91 ${phone}`,
    '',
    '──────────────────────',
    'DELIVERY DETAILS',
    '──────────────────────',
    `House / Door: ${house}`,
    `Street / Area: ${street}`,
    `City: ${city}`,
    `State: ${state}`,
    `Pincode: ${pincode}`,
    landmark     ? `Landmark: ${landmark}` : '',
    instructions ? `Instructions: ${instructions}` : '',
    '',
    '──────────────────────',
    'ORDER ITEMS',
    '──────────────────────',
    items,
    '',
    '──────────────────────',
    `Subtotal: ₹${subtotal.toLocaleString('en-IN')}`,
    `Delivery: ${delivery === 0 ? 'FREE' : '₹' + delivery.toLocaleString('en-IN')}`,
    `TOTAL: ₹${total.toLocaleString('en-IN')}`,
    '',
    'Please confirm my order.',
  ].filter(l => l !== undefined).join('\n');

  return lines.trim();
}

// ── Open / close checkout ────────────────────────────────────────
let currentRef = null;

function openCheckout() {
  const panel = document.getElementById('checkout-panel');
  if (!panel) return;

  // Reset to step 1
  showStep('details');
  document.getElementById('checkout-panel-title').textContent = 'CHECKOUT';
  panel.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const panel = document.getElementById('checkout-panel');
  if (!panel) return;
  panel.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function showStep(name) {
  const details = document.getElementById('checkout-step-details');
  const review  = document.getElementById('checkout-step-review');
  if (!details || !review) return;

  if (name === 'details') {
    details.removeAttribute('hidden');
    details.classList.add('active');
    review.setAttribute('hidden', '');
    review.classList.remove('active');
    document.getElementById('checkout-panel-title').textContent = 'CHECKOUT';
  } else {
    details.setAttribute('hidden', '');
    details.classList.remove('active');
    review.removeAttribute('hidden');
    review.classList.add('active');
    document.getElementById('checkout-panel-title').textContent = 'REVIEW ORDER';
  }
}

// ── Checkout interactions ────────────────────────────────────────
function initCheckout() {
  // Close / back
  document.getElementById('checkout-close')?.addEventListener('click', closeCheckout);
  document.getElementById('checkout-back')?.addEventListener('click', () => {
    const reviewVisible = !document.getElementById('checkout-step-review')?.hasAttribute('hidden');
    if (reviewVisible) {
      showStep('details');
    } else {
      closeCheckout();
      window.FOMO_CART?.openBag();
    }
  });
  document.getElementById('checkout-overlay')?.addEventListener('click', closeCheckout);
  document.addEventListener('keydown', (e) => {
    const panel = document.getElementById('checkout-panel');
    if (e.key === 'Escape' && panel && !panel.hasAttribute('hidden')) closeCheckout();
  });

  // Review order button
  document.getElementById('btn-review-order')?.addEventListener('click', () => {
    if (!validateForm()) return;
    currentRef = generateRef();
    const reviewBody = document.getElementById('order-review-body');
    if (reviewBody) {
      reviewBody.innerHTML = buildOrderReview(currentRef);
      // Review image error fallback
      reviewBody.querySelectorAll('img[data-fallback-review]').forEach(img => {
        img.addEventListener('error', function() {
          const wrap = this.parentNode;
          if (wrap) wrap.innerHTML = '<div class="review-item-img-placeholder"><span>FOMO</span></div>';
        }, { once: true });
      });
    }
    showStep('review');
  });

  // Edit details
  document.getElementById('btn-edit-details')?.addEventListener('click', () => {
    showStep('details');
  });

  // Order on WhatsApp
  document.getElementById('btn-whatsapp-order')?.addEventListener('click', () => {
    // Double-check validation
    if (!validateForm()) {
      showStep('details');
      return;
    }

    const cart = window.FOMO_CART?.getCart() || [];
    if (!cart.length) {
      alert('Your bag is empty. Please add items before ordering.');
      return;
    }

    const ref = currentRef || generateRef();
    const msg = buildWhatsAppMessage(ref);

    // Get WhatsApp number from content config or fallback
    const waNum = getWhatsAppNumber();
    const url   = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank', 'noopener,noreferrer');

    // Clear the cart after sending the order to WhatsApp
    window.FOMO_CART?.clearCart();
  });

  // Inline validation on blur
  ['cf-name','cf-house','cf-street','cf-city','cf-state'].forEach(id => {
    getField(id)?.addEventListener('blur', () => {
      const ok = getVal(id).length > 0;
      markField(id, !ok);
      showErr('err-' + id.replace('cf-',''), !ok);
    });
  });
  getField('cf-phone')?.addEventListener('blur', () => {
    const ok = !!validateMobile(getVal('cf-phone'));
    markField('cf-phone', !ok);
    showErr('err-phone', !ok);
  });
  getField('cf-pincode')?.addEventListener('blur', () => {
    const ok = /^\d{6}$/.test(getVal('cf-pincode'));
    markField('cf-pincode', !ok);
    showErr('err-pincode', !ok);
  });

  // Only allow digits in pincode
  getField('cf-pincode')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
  });
}

function getWhatsAppNumber() {
  // Try to read from content.json cached value
  const cached = window.FOMO_CONTENT?.business?.whatsapp;
  if (cached) return cached.replace(/\D/g, '');
  return '919885416143'; // owner WhatsApp
}

// ── Expose ───────────────────────────────────────────────────────
window.FOMO_CHECKOUT = {
  openCheckout,
  closeCheckout,
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckout);
} else {
  initCheckout();
}
