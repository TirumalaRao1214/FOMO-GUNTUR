/**
 * FOMO Guntur — styleAdvisorUI.js
 * Rendering components and user interaction for the Style Advisor chat interface.
 * Reuses existing FOMO design tokens, product modal, and shopping cart.
 */

'use strict';

// ── HTML Escaper Helper ──────────────────────────────────────────
const escAdvisorHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// ── Render Assistant Message ─────────────────────────────────────
function renderAdvisorMessage(content, options = {}, isUser = false) {
  const container = document.getElementById('advisor-chat-log');
  if (!container) return;

  const msgRow = document.createElement('div');
  msgRow.className = `advisor-msg-row ${isUser ? 'advisor-msg-row--user' : 'advisor-msg-row--bot'}`;

  const bubble = document.createElement('div');
  bubble.className = `advisor-bubble ${isUser ? 'advisor-bubble--user' : 'advisor-bubble--bot'}`;

  if (typeof content === 'string') {
    bubble.innerHTML = `<div class="advisor-text-block">${content}</div>`;
  } else if (content instanceof HTMLElement) {
    bubble.appendChild(content);
  }

  msgRow.appendChild(bubble);
  container.appendChild(msgRow);

  // Auto scroll to bottom smoothly
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });

  return msgRow;
}

// ── Render Quick Option Buttons ──────────────────────────────────
function renderAdvisorButtons(options = [], onSelect) {
  const container = document.getElementById('advisor-chat-log');
  if (!container || !options || options.length === 0) return;

  const btnWrap = document.createElement('div');
  btnWrap.className = 'advisor-options-wrap';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `advisor-option-btn ${opt.accent ? 'advisor-option-btn--accent' : ''}`;
    btn.innerHTML = `${opt.icon ? `<span class="opt-icon">${opt.icon}</span> ` : ''}${escAdvisorHtml(opt.label)}`;
    
    btn.addEventListener('click', () => {
      // Disable this button group after selection to avoid duplicate branch state
      btnWrap.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        b.classList.add('disabled');
      });
      btn.classList.add('selected');
      if (typeof onSelect === 'function') {
        onSelect(opt);
      }
    });

    btnWrap.appendChild(btn);
  });

  container.appendChild(btnWrap);
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}

// ── Render Color Palette Card Component ──────────────────────────
function renderColorPaletteUI(palette) {
  const card = document.createElement('div');
  card.className = 'advisor-palette-card';

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return '';
    const swatches = items.map(c => `
      <div class="advisor-color-pill">
        <span class="color-dot" style="background-color: ${c.hex}; ${c.textDark ? 'border: 1px solid rgba(255,255,255,0.3);' : ''}"></span>
        <div class="color-text-wrap">
          <strong class="color-name">${escAdvisorHtml(c.name)}</strong>
          <span class="color-desc">${escAdvisorHtml(c.desc)}</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="palette-group">
        <span class="palette-sub">${title}</span>
        <div class="palette-items">${swatches}</div>
      </div>
    `;
  };

  card.innerHTML = `
    <div class="palette-header">
      <span class="palette-eyebrow">✦ PERSONALIZED GUIDE ✦</span>
      <h4 class="palette-title">YOUR COLOR PALETTE</h4>
      <p class="palette-note">Complementary shades chosen based on your style, occasion, and preferences.</p>
    </div>
    ${renderSection('PRIMARY FOUNDATION', palette.primary)}
    ${renderSection('VERSATILE ACCENTS', palette.versatile)}
    ${renderSection('STATEMENT & OCCASION', palette.accent || palette.occasionSpecific)}
  `;

  return card;
}

// ── Render Outfit Card Component (3 Looks) ───────────────────────
function renderOutfitLooksUI(looks, onBuildLook, onOpenProduct) {
  const container = document.createElement('div');
  container.className = 'advisor-looks-container';

  looks.forEach(look => {
    const lookCard = document.createElement('div');
    lookCard.className = 'advisor-look-card';

    const itemsHtml = look.products.map(p => `
      <div class="look-product-row">
        <div class="look-p-thumb">
          ${p.images && p.images[0]
            ? `<img src="${escAdvisorHtml(p.images[0])}" alt="${escAdvisorHtml(p.name)}" loading="lazy" />`
            : `<div class="look-p-placeholder">FOMO</div>`
          }
        </div>
        <div class="look-p-meta">
          <span class="look-p-cat">${escAdvisorHtml(p.category)}</span>
          <p class="look-p-name">${escAdvisorHtml(p.name)}</p>
          <span class="look-p-price">₹${p.price.toLocaleString('en-IN')}</span>
        </div>
        <button type="button" class="btn-look-view" data-pid="${escAdvisorHtml(p.id)}" aria-label="View ${escAdvisorHtml(p.name)}">
          VIEW
        </button>
      </div>
    `).join('');

    const whyHtml = (look.why || []).map(w => `<li>✓ ${escAdvisorHtml(w)}</li>`).join('');

    lookCard.innerHTML = `
      <div class="look-card-header">
        <span class="look-badge">${escAdvisorHtml(look.label)}</span>
        <h4 class="look-title">${escAdvisorHtml(look.tagline)}</h4>
        <p class="look-concept">${escAdvisorHtml(look.concept)}</p>
      </div>

      <div class="look-products-list">
        ${itemsHtml}
      </div>

      <div class="look-total-bar">
        <span>ESTIMATED LOOK TOTAL</span>
        <strong>₹${look.totalPrice.toLocaleString('en-IN')}</strong>
      </div>

      <div class="look-why-box">
        <span class="why-title">Why this look works:</span>
        <ul class="why-list">${whyHtml}</ul>
      </div>

      <div class="look-card-actions">
        <button type="button" class="btn-build-look" data-lookid="${look.id}">
          🛍 BUILD THIS LOOK
        </button>
      </div>
    `;

    // Bind item quick views
    lookCard.querySelectorAll('.btn-look-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = look.products.find(item => item.id === btn.dataset.pid);
        if (p && typeof onOpenProduct === 'function') onOpenProduct(p);
      });
    });

    // Bind build look
    lookCard.querySelector('.btn-build-look')?.addEventListener('click', () => {
      if (typeof onBuildLook === 'function') onBuildLook(look);
    });

    container.appendChild(lookCard);
  });

  return container;
}

// ── Render Product Grid Inside Advisor ───────────────────────────
function renderAdvisorProductCards(products, onOpenProduct) {
  const grid = document.createElement('div');
  grid.className = 'advisor-products-grid';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'advisor-p-card';

    card.innerHTML = `
      <div class="advisor-p-img">
        ${product.images && product.images[0]
          ? `<img src="${escAdvisorHtml(product.images[0])}" alt="${escAdvisorHtml(product.name)}" loading="lazy" />`
          : `<div class="advisor-p-ph">FOMO</div>`
        }
        ${product.badge ? `<span class="advisor-p-badge">${escAdvisorHtml(product.badge)}</span>` : ''}
      </div>
      <div class="advisor-p-body">
        <span class="advisor-p-cat">${escAdvisorHtml(product.category)}</span>
        <h5 class="advisor-p-title">${escAdvisorHtml(product.name)}</h5>
        <div class="advisor-p-price">₹${product.price.toLocaleString('en-IN')}</div>
        <button type="button" class="btn-advisor-p-action" data-pid="${escAdvisorHtml(product.id)}">
          VIEW &amp; ADD TO BAG
        </button>
      </div>
    `;

    card.querySelector('.btn-advisor-p-action')?.addEventListener('click', () => {
      if (typeof onOpenProduct === 'function') onOpenProduct(product);
    });

    grid.appendChild(card);
  });

  return grid;
}

// ── Render Look Builder / Selection Drawer ───────────────────────
function renderLookBuilderModal(look, onCompleteAddToCart) {
  let modal = document.getElementById('advisor-look-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'advisor-look-modal';
    modal.className = 'advisor-look-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Build Your Outfit Look');
    document.body.appendChild(modal);
  }

  const itemsConfig = look.products.map(p => ({
    product: p,
    selectedSize: (p.sizes && p.sizes.length > 0) ? p.sizes[0] : null,
    selectedColor: (p.colors && p.colors.length > 0) ? p.colors[0] : null,
    qty: 1
  }));

  const renderContent = () => {
    const productsHtml = itemsConfig.map((item, idx) => {
      const p = item.product;
      const sizeButtons = (p.sizes || []).map(sz => `
        <button type="button" class="lb-size-btn ${item.selectedSize === sz ? 'selected' : ''}" data-idx="${idx}" data-size="${escAdvisorHtml(sz)}">
          ${escAdvisorHtml(sz)}
        </button>
      `).join('');

      const colorButtons = (p.colors || []).map(col => `
        <button type="button" class="lb-color-btn ${item.selectedColor === col ? 'selected' : ''}" data-idx="${idx}" data-color="${escAdvisorHtml(col)}">
          ${escAdvisorHtml(col)}
        </button>
      `).join('');

      return `
        <div class="lb-item-row" data-idx="${idx}">
          <div class="lb-item-img">
            <img src="${escAdvisorHtml(p.images[0])}" alt="${escAdvisorHtml(p.name)}" />
          </div>
          <div class="lb-item-details">
            <p class="lb-item-name">${escAdvisorHtml(p.name)}</p>
            <p class="lb-item-price">₹${p.price.toLocaleString('en-IN')}</p>
            
            ${sizeButtons ? `
              <div class="lb-choice-group">
                <span class="lb-choice-label">SIZE:</span>
                <div class="lb-sizes-wrap">${sizeButtons}</div>
              </div>` : ''
            }

            ${colorButtons && p.colors.length > 1 ? `
              <div class="lb-choice-group">
                <span class="lb-choice-label">COLOR:</span>
                <div class="lb-colors-wrap">${colorButtons}</div>
              </div>` : ''
            }
          </div>
        </div>
      `;
    }).join('');

    const currentTotal = itemsConfig.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

    modal.innerHTML = `
      <div class="advisor-look-overlay" id="lb-modal-overlay"></div>
      <div class="advisor-look-panel">
        <div class="advisor-look-header">
          <div>
            <span class="lb-eyebrow">${escAdvisorHtml(look.label)}</span>
            <h3 class="lb-title">CHOOSE SIZES FOR THIS LOOK</h3>
          </div>
          <button type="button" class="advisor-look-close" id="lb-modal-close" aria-label="Close look builder">&times;</button>
        </div>

        <div class="advisor-look-body">
          ${productsHtml}
        </div>

        <div class="advisor-look-footer">
          <div class="lb-total-row">
            <span>TOTAL COMBINED PRICE</span>
            <strong>₹${currentTotal.toLocaleString('en-IN')}</strong>
          </div>
          <button type="button" class="btn-hero-cta btn-add-look-cart" id="btn-add-look-to-cart">
            ADD SELECTED LOOK TO BAG →
          </button>
        </div>
      </div>
    `;

    // Size clicks
    modal.querySelectorAll('.lb-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        itemsConfig[idx].selectedSize = btn.dataset.size;
        renderContent();
      });
    });

    // Color clicks
    modal.querySelectorAll('.lb-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        itemsConfig[idx].selectedColor = btn.dataset.color;
        renderContent();
      });
    });

    // Close handlers
    modal.querySelector('#lb-modal-close')?.addEventListener('click', () => closeModal());
    modal.querySelector('#lb-modal-overlay')?.addEventListener('click', () => closeModal());

    // Submit add to bag
    modal.querySelector('#btn-add-look-to-cart')?.addEventListener('click', () => {
      if (typeof onCompleteAddToCart === 'function') {
        onCompleteAddToCart(itemsConfig);
      }
      closeModal();
    });
  };

  const closeModal = () => {
    modal.removeAttribute('open');
    modal.style.display = 'none';
  };

  renderContent();
  modal.setAttribute('open', 'true');
  modal.style.display = 'block';
}

// ── Export UI helper methods ─────────────────────────────────────
window.FOMO_STYLE_UI = {
  escAdvisorHtml,
  renderAdvisorMessage,
  renderAdvisorButtons,
  renderColorPaletteUI,
  renderOutfitLooksUI,
  renderAdvisorProductCards,
  renderLookBuilderModal
};
