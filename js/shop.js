/**
 * FOMO Guntur — shop.js
 * Product rendering, search, category filter, fit filter, sorting,
 * product count, product detail modal, mobile filter drawer.
 */

'use strict';

// ── State ────────────────────────────────────────────────────────
let ALL_PRODUCTS = [];

const shopState = {
  search:   '',
  category: 'all',   // categorySlug or 'all'
  fit:      'all',
  sort:     'featured',
  isNewDrop: false,  // true when triggered from "New Drop" button
};

// ── Inline product catalogue (fallback for file:// and fetch failures) ──
const INLINE_PRODUCTS = [
  { id:"fomo-001", name:"Classic White Formal Shirt",      category:"Formal Wear",   categorySlug:"formal",      price:1299, sizes:["S","M","L","XL","XXL"],         colors:["White"],                fit:"Regular",      occasion:["Formal","Office"],        tags:["white","formal","shirt","men"],             images:["assets/images/products/fomo-001-formal-shirt.jpg"],   badge:"BESTSELLER", available:true, isNew:false },
  { id:"fomo-002", name:"Navy Blue Blazer",                category:"Formal Wear",   categorySlug:"formal",      price:3499, sizes:["S","M","L","XL"],               colors:["Navy Blue"],            fit:"Slim",         occasion:["Formal","Party"],         tags:["navy","blazer","formal","slim","men"],       images:["assets/images/products/fomo-002-navy-blazer.jpg"],    badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-003", name:"Black Casual Polo",               category:"Casual Wear",   categorySlug:"casual",      price:899,  sizes:["S","M","L","XL","XXL"],         colors:["Black"],                fit:"Regular",      occasion:["Casual","Everyday"],      tags:["black","polo","casual","men"],              images:["assets/images/products/fomo-003-black-polo.jpg"],     badge:"",           available:true, isNew:false },
  { id:"fomo-004", name:"Slate Grey Chinos",               category:"Casual Wear",   categorySlug:"casual",      price:1499, sizes:["28","30","32","34","36"],        colors:["Slate Grey"],           fit:"Slim",         occasion:["Casual","Everyday"],      tags:["grey","chinos","slim","men"],               images:["assets/images/products/fomo-004-grey-chinos.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-005", name:"Ethnic Kurta — Ivory",            category:"Ethnic Wear",   categorySlug:"ethnic",      price:1799, sizes:["S","M","L","XL","XXL"],         colors:["Ivory"],                fit:"Straight Cut", occasion:["Ethnic","Festive"],       tags:["kurta","ethnic","ivory","festive","men"],   images:["assets/images/products/fomo-005-ethnic-kurta.jpg"],   badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-006", name:"Indo-Western Party Kurta",        category:"Party Wear",    categorySlug:"party",       price:2299, sizes:["S","M","L","XL","XXL"],         colors:["Charcoal"],             fit:"Relaxed",      occasion:["Party","Festive"],        tags:["party","kurta","charcoal","men"],           images:["assets/images/products/fomo-006-party-kurta.jpg"],    badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-007", name:"Black Graphic Oversized Tee",     category:"Casual Wear",   categorySlug:"casual",      price:799,  sizes:["S","M","L","XL","XXL"],         colors:["Black"],                fit:"Oversized",    occasion:["Casual","Streetwear"],    tags:["black","oversized","tshirt","streetwear"],  images:["assets/images/products/fomo-007-oversized-tee.jpg"],  badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-008", name:"Cream Linen Shirt",               category:"Casual Wear",   categorySlug:"casual",      price:1199, sizes:["S","M","L","XL"],               colors:["Cream"],                fit:"Relaxed",      occasion:["Casual","Travel"],        tags:["cream","linen","shirt","relaxed","men"],    images:["assets/images/products/fomo-008-linen-shirt.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-009", name:"Olive Cargo Pants",               category:"Casual Wear",   categorySlug:"casual",      price:1699, sizes:["28","30","32","34","36"],        colors:["Olive"],                fit:"Relaxed",      occasion:["Casual","Streetwear"],    tags:["olive","cargo","pants","streetwear"],       images:["assets/images/products/fomo-009-cargo-pants.jpg"],    badge:"TRENDING",   available:true, isNew:true  },
  { id:"fomo-010", name:"Classic Black Trousers",          category:"Formal Wear",   categorySlug:"formal",      price:1399, sizes:["28","30","32","34","36"],        colors:["Black"],                fit:"Slim",         occasion:["Formal","Office"],        tags:["black","trousers","formal","slim","men"],   images:["assets/images/products/fomo-010-black-trousers.jpg"], badge:"BESTSELLER", available:true, isNew:false },
  { id:"fomo-011", name:"Premium Leather Belt",            category:"Accessories",   categorySlug:"accessories", price:599,  sizes:["32","34","36","38","40"],        colors:["Black"],                fit:"",             occasion:["Formal","Casual"],        tags:["belt","leather","accessories","men"],       images:["assets/images/products/fomo-011-leather-belt.jpg"],   badge:"",           available:true, isNew:false },
  { id:"fomo-012", name:"Structured Baseball Cap",         category:"Accessories",   categorySlug:"accessories", price:499,  sizes:["Free Size"],                    colors:["Black"],                fit:"",             occasion:["Casual","Streetwear"],    tags:["cap","baseball","accessories","men"],       images:["assets/images/products/fomo-012-baseball-cap.jpg"],   badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-013", name:"White Textured Polo",             category:"Casual Wear",   categorySlug:"casual",      price:949,  sizes:["S","M","L","XL","XXL"],         colors:["White"],                fit:"Regular",      occasion:["Casual","Semi-Formal"],   tags:["white","polo","casual","men"],              images:["assets/images/products/fomo-013-white-polo.jpg"],     badge:"",           available:true, isNew:false },
  { id:"fomo-014", name:"Classic Denim Jacket",            category:"Casual Wear",   categorySlug:"casual",      price:2499, sizes:["S","M","L","XL"],               colors:["Mid Blue"],             fit:"Regular",      occasion:["Casual","Streetwear"],    tags:["denim","jacket","blue","streetwear","men"], images:["assets/images/products/fomo-014-denim-jacket.jpg"],   badge:"TRENDING",   available:true, isNew:true  },
  { id:"fomo-015", name:"All-Black Kurta",                 category:"Ethnic Wear",   categorySlug:"ethnic",      price:1899, sizes:["S","M","L","XL","XXL"],         colors:["Black"],                fit:"Straight Cut", occasion:["Ethnic","Party"],         tags:["black","kurta","ethnic","minimal","men"],   images:["assets/images/products/fomo-015-black-kurta.jpg"],    badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-016", name:"Beige Oxford Shirt",              category:"Formal Wear",   categorySlug:"formal",      price:1199, sizes:["S","M","L","XL","XXL"],         colors:["Beige"],                fit:"Regular",      occasion:["Formal","Office"],        tags:["beige","oxford","shirt","formal","men"],    images:["assets/images/products/fomo-016-beige-shirt.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-017", name:"Black Jogger Pants",              category:"Casual Wear",   categorySlug:"casual",      price:1099, sizes:["S","M","L","XL","XXL"],         colors:["Black"],                fit:"Relaxed",      occasion:["Casual","Streetwear"],    tags:["joggers","black","casual","streetwear"],    images:["assets/images/products/fomo-017-joggers-black.jpg"],  badge:"",           available:true, isNew:false },
  { id:"fomo-018", name:"Two-Piece Formal Suit",           category:"Formal Wear",   categorySlug:"formal",      price:5999, sizes:["S","M","L","XL"],               colors:["Charcoal"],             fit:"Slim",         occasion:["Formal","Events"],        tags:["suit","formal","charcoal","men"],           images:["assets/images/products/fomo-018-formal-suit.jpg"],    badge:"PREMIUM",    available:true, isNew:true  },
  { id:"fomo-019", name:"Olive Linen Shirt",               category:"Casual Wear",   categorySlug:"casual",      price:1199, sizes:["S","M","L","XL"],               colors:["Olive"],                fit:"Relaxed",      occasion:["Casual","Travel"],        tags:["olive","linen","shirt","relaxed","men"],    images:["assets/images/products/fomo-019-olive-shirt.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-020", name:"Charcoal Grey T-Shirt",           category:"Casual Wear",   categorySlug:"casual",      price:699,  sizes:["S","M","L","XL","XXL","XXXL"],  colors:["Charcoal Grey"],        fit:"Regular",      occasion:["Casual","Everyday"],      tags:["grey","tshirt","casual","men"],             images:["assets/images/products/fomo-020-grey-tshirt.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-021", name:"Indigo Slim-Fit Jeans",           category:"Casual Wear",   categorySlug:"casual",      price:1799, sizes:["28","30","32","34","36"],        colors:["Indigo"],               fit:"Slim",         occasion:["Casual","Everyday"],      tags:["jeans","denim","indigo","slim","men"],      images:["assets/images/products/fomo-021-blue-jeans.jpg"],     badge:"BESTSELLER", available:true, isNew:false },
  { id:"fomo-022", name:"Black Bomber Jacket",             category:"Casual Wear",   categorySlug:"casual",      price:2999, sizes:["S","M","L","XL"],               colors:["Black"],                fit:"Regular",      occasion:["Casual","Streetwear"],    tags:["bomber","jacket","black","streetwear"],     images:["assets/images/products/fomo-022-bomber-jacket.jpg"],  badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-023", name:"Cream Printed Kurta",             category:"Ethnic Wear",   categorySlug:"ethnic",      price:1699, sizes:["S","M","L","XL","XXL"],         colors:["Cream"],                fit:"Straight Cut", occasion:["Ethnic","Festive"],       tags:["kurta","cream","printed","ethnic","men"],   images:["assets/images/products/fomo-023-cream-kurta.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-024", name:"Classic Aviator Sunglasses",      category:"Accessories",   categorySlug:"accessories", price:799,  sizes:["Free Size"],                    colors:["Gold Frame","Black"],   fit:"",             occasion:["Casual","Travel"],        tags:["sunglasses","aviator","accessories","men"], images:["assets/images/products/fomo-024-sunglasses.jpg"],     badge:"",           available:true, isNew:false },
  { id:"fomo-025", name:"White Oversized T-Shirt",         category:"Casual Wear",   categorySlug:"casual",      price:699,  sizes:["S","M","L","XL","XXL"],         colors:["White"],                fit:"Oversized",    occasion:["Casual","Streetwear"],    tags:["white","oversized","tshirt","streetwear"],  images:["assets/images/products/fomo-025-white-tshirt.jpg"],   badge:"",           available:true, isNew:false },
  { id:"fomo-026", name:"All-Black Blazer",                category:"Formal Wear",   categorySlug:"formal",      price:3999, sizes:["S","M","L","XL"],               colors:["Black"],                fit:"Slim",         occasion:["Formal","Party"],         tags:["blazer","black","formal","slim","men"],     images:["assets/images/products/fomo-026-black-blazer.jpg"],   badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-027", name:"Maroon Half-Sleeve Shirt",        category:"Casual Wear",   categorySlug:"casual",      price:999,  sizes:["S","M","L","XL","XXL"],         colors:["Maroon"],               fit:"Regular",      occasion:["Casual","Everyday"],      tags:["maroon","shirt","casual","men"],            images:["assets/images/products/fomo-027-maroon-shirt.jpg"],   badge:"",           available:true, isNew:false },
  { id:"fomo-028", name:"Black Track Pants",               category:"Casual Wear",   categorySlug:"casual",      price:999,  sizes:["S","M","L","XL","XXL"],         colors:["Black"],                fit:"Relaxed",      occasion:["Casual","Streetwear"],    tags:["track","pants","black","casual","men"],     images:["assets/images/products/fomo-028-track-pants.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-029", name:"Ivory Sherwani",                  category:"Party Wear",    categorySlug:"party",       price:6999, sizes:["S","M","L","XL","XXL"],         colors:["Ivory"],                fit:"Straight Cut", occasion:["Weddings","Festive"],     tags:["sherwani","ivory","wedding","party","men"], images:["assets/images/products/fomo-029-sherwani.jpg"],        badge:"PREMIUM",    available:true, isNew:true  },
  { id:"fomo-030", name:"Stainless Steel Watch",           category:"Accessories",   categorySlug:"accessories", price:2499, sizes:["Free Size"],                    colors:["Silver","Gold"],        fit:"",             occasion:["Formal","Casual"],        tags:["watch","steel","accessories","men"],        images:["assets/images/products/fomo-030-watch.jpg"],          badge:"",           available:true, isNew:false },
  { id:"fomo-031", name:"Floral Printed Shirt",            category:"Casual Wear",   categorySlug:"casual",      price:1099, sizes:["S","M","L","XL"],               colors:["Multi"],                fit:"Relaxed",      occasion:["Casual","Party"],         tags:["printed","floral","shirt","casual","men"],  images:["assets/images/products/fomo-031-printed-shirt.jpg"],  badge:"TRENDING",   available:true, isNew:true  },
  { id:"fomo-032", name:"Slim Fit Formal Trousers",        category:"Formal Wear",   categorySlug:"formal",      price:1499, sizes:["28","30","32","34","36"],        colors:["Charcoal","Navy"],      fit:"Slim",         occasion:["Formal","Office"],        tags:["trousers","slim","formal","office","men"],  images:["assets/images/products/fomo-032-slim-trousers.jpg"],  badge:"",           available:true, isNew:false },
  { id:"fomo-033", name:"White Cotton Kurta",              category:"Ethnic Wear",   categorySlug:"ethnic",      price:1599, sizes:["S","M","L","XL","XXL"],         colors:["White"],                fit:"Straight Cut", occasion:["Ethnic","Festive"],       tags:["kurta","white","cotton","ethnic","men"],    images:["assets/images/products/fomo-033-white-kurta.jpg"],    badge:"BESTSELLER", available:true, isNew:false },
  { id:"fomo-034", name:"Beige Overshirt",                 category:"Casual Wear",   categorySlug:"casual",      price:1399, sizes:["S","M","L","XL"],               colors:["Beige"],                fit:"Relaxed",      occasion:["Casual","Travel"],        tags:["overshirt","beige","casual","relaxed","men"],images:["assets/images/products/fomo-034-overshirt.jpg"],      badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-035", name:"Beige Cargo Pants",               category:"Casual Wear",   categorySlug:"casual",      price:1699, sizes:["28","30","32","34","36"],        colors:["Beige"],                fit:"Relaxed",      occasion:["Casual","Streetwear"],    tags:["cargo","beige","pants","relaxed","men"],    images:["assets/images/products/fomo-035-cargo-beige.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-036", name:"Nehru Collar Jacket",             category:"Ethnic Wear",   categorySlug:"ethnic",      price:2799, sizes:["S","M","L","XL"],               colors:["Black","Navy"],         fit:"Slim",         occasion:["Ethnic","Weddings"],      tags:["nehru","jacket","ethnic","festive","men"],  images:["assets/images/products/fomo-036-nehru-jacket.jpg"],   badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-037", name:"Black Slim Chinos",               category:"Casual Wear",   categorySlug:"casual",      price:1499, sizes:["28","30","32","34","36"],        colors:["Black"],                fit:"Slim",         occasion:["Casual","Semi-Formal"],   tags:["black","chinos","slim","casual","men"],     images:["assets/images/products/fomo-037-black-chinos.jpg"],   badge:"",           available:true, isNew:false },
  { id:"fomo-038", name:"Blue Striped Shirt",              category:"Formal Wear",   categorySlug:"formal",      price:1099, sizes:["S","M","L","XL","XXL"],         colors:["Blue"],                 fit:"Regular",      occasion:["Formal","Office"],        tags:["blue","striped","shirt","formal","men"],    images:["assets/images/products/fomo-038-striped-shirt.jpg"],  badge:"",           available:true, isNew:false },
  { id:"fomo-039", name:"Genuine Leather Wallet",          category:"Accessories",   categorySlug:"accessories", price:849,  sizes:["Free Size"],                    colors:["Tan","Black"],          fit:"",             occasion:["Formal","Casual"],        tags:["wallet","leather","accessories","men"],     images:["assets/images/products/fomo-039-wallet.jpg"],         badge:"",           available:true, isNew:false },
  { id:"fomo-040", name:"Indigo Baggy Jeans",              category:"Casual Wear",   categorySlug:"casual",      price:1999, sizes:["28","30","32","34","36"],        colors:["Indigo"],               fit:"Relaxed",      occasion:["Casual","Streetwear"],    tags:["jeans","baggy","indigo","relaxed","men"],   images:["assets/images/products/fomo-040-indigo-denim.jpg"],   badge:"TRENDING",   available:true, isNew:true  },
  { id:"fomo-041", name:"Casual Tan Blazer",               category:"Casual Wear",   categorySlug:"casual",      price:3299, sizes:["S","M","L","XL"],               colors:["Tan"],                  fit:"Relaxed",      occasion:["Casual","Semi-Formal"],   tags:["blazer","tan","casual","relaxed","men"],    images:["assets/images/products/fomo-041-casual-blazer.jpg"],  badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-042", name:"Ethnic Printed Waistcoat",        category:"Ethnic Wear",   categorySlug:"ethnic",      price:1499, sizes:["S","M","L","XL"],               colors:["Multi"],                fit:"Regular",      occasion:["Ethnic","Festive"],       tags:["waistcoat","ethnic","printed","festive"],   images:["assets/images/products/fomo-042-ethnic-waistcoat.jpg"],badge:"",         available:true, isNew:false },
  { id:"fomo-043", name:"Burgundy Polo Shirt",             category:"Casual Wear",   categorySlug:"casual",      price:949,  sizes:["S","M","L","XL","XXL"],         colors:["Burgundy"],             fit:"Regular",      occasion:["Casual","Everyday"],      tags:["burgundy","polo","casual","men"],           images:["assets/images/products/fomo-043-burgundy-polo.jpg"],  badge:"",           available:true, isNew:false },
  { id:"fomo-044", name:"White Linen Trousers",            category:"Casual Wear",   categorySlug:"casual",      price:1599, sizes:["28","30","32","34","36"],        colors:["White"],                fit:"Relaxed",      occasion:["Casual","Travel"],        tags:["linen","trousers","white","relaxed","men"], images:["assets/images/products/fomo-044-linen-trousers.jpg"], badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-045", name:"Black Graphic Hoodie",            category:"Casual Wear",   categorySlug:"casual",      price:1799, sizes:["S","M","L","XL","XXL"],         colors:["Black"],                fit:"Oversized",    occasion:["Casual","Streetwear"],    tags:["hoodie","black","graphic","oversized"],     images:["assets/images/products/fomo-045-graphic-hoodie.jpg"], badge:"TRENDING",   available:true, isNew:true  },
  { id:"fomo-046", name:"Formal Waistcoat",                category:"Formal Wear",   categorySlug:"formal",      price:1999, sizes:["S","M","L","XL"],               colors:["Charcoal"],             fit:"Slim",         occasion:["Formal","Weddings"],      tags:["waistcoat","formal","charcoal","slim"],     images:["assets/images/products/fomo-046-formal-waistcoat.jpg"],badge:"",         available:true, isNew:false },
  { id:"fomo-047", name:"Festival Embroidered Kurta",      category:"Ethnic Wear",   categorySlug:"ethnic",      price:2199, sizes:["S","M","L","XL","XXL"],         colors:["Multi","Yellow","Green"],fit:"Straight Cut",occasion:["Ethnic","Festive","Party"],tags:["kurta","embroidered","festival","ethnic"],  images:["assets/images/products/fomo-047-festival-kurta.jpg"], badge:"NEW",        available:true, isNew:true  },
  { id:"fomo-048", name:"Canvas Tote Bag",                 category:"Accessories",   categorySlug:"accessories", price:699,  sizes:["Free Size"],                    colors:["Black","Natural"],      fit:"",             occasion:["Casual","Everyday"],      tags:["bag","canvas","tote","accessories","men"],  images:["assets/images/products/fomo-048-canvas-bag.jpg"],     badge:"",           available:true, isNew:false },
  { id:"fomo-049", name:"Navy Slim Chinos",                category:"Casual Wear",   categorySlug:"casual",      price:1499, sizes:["28","30","32","34","36"],        colors:["Navy"],                 fit:"Slim",         occasion:["Casual","Semi-Formal"],   tags:["navy","chinos","slim","casual","men"],      images:["assets/images/products/fomo-049-navy-chinos.jpg"],    badge:"",           available:true, isNew:false },
  { id:"fomo-050", name:"Brown Leather Loafers",           category:"Accessories",   categorySlug:"accessories", price:2299, sizes:["6","7","8","9","10","11"],       colors:["Brown"],                fit:"",             occasion:["Formal","Casual"],        tags:["loafers","leather","brown","shoes","men"],  images:["assets/images/products/fomo-050-brown-loafers.jpg"],  badge:"NEW",        available:true, isNew:true  }
];

// ── Load Products ────────────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch('data/products.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    // Only use fetched data if it returned products
    if (Array.isArray(data) && data.length > 0) {
      ALL_PRODUCTS = data;
    } else {
      ALL_PRODUCTS = INLINE_PRODUCTS;
    }
  } catch (e) {
    // file:// or server error — use inline catalogue
    ALL_PRODUCTS = INLINE_PRODUCTS;
  }
}

// ── Filter & Sort ────────────────────────────────────────────────
function getFilteredProducts() {
  let list = ALL_PRODUCTS.filter(p => p.available !== false);

  // New Drop filter
  if (shopState.isNewDrop) {
    list = list.filter(p => p.isNew === true);
  }

  // Category
  if (shopState.category !== 'all') {
    list = list.filter(p => p.categorySlug === shopState.category);
  }

  // Fit
  if (shopState.fit !== 'all') {
    list = list.filter(p => p.fit === shopState.fit);
  }

  // Search
  if (shopState.search.trim()) {
    const q = shopState.search.trim().toLowerCase();
    list = list.filter(p => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.fit && p.fit.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.occasion && p.occasion.some(o => o.toLowerCase().includes(q))) ||
        (p.colors && p.colors.some(c => c.toLowerCase().includes(q))) ||
        (p.sizes && p.sizes.some(s => s.toLowerCase().includes(q)))
      );
    });
  }

  // Sort
  switch (shopState.sort) {
    case 'newest':
      list = list.filter(p => p.isNew).concat(list.filter(p => !p.isNew));
      break;
    case 'price-asc':
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case 'name-az':
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default: break; // featured = original order
  }

  return list;
}

// ── Image error fallback (JS-based, no inline onerror) ──────────
function attachImageErrorHandlers(container) {
  container.querySelectorAll('img[data-fallback-cat]').forEach(img => {
    img.addEventListener('error', function() {
      const cat = this.getAttribute('data-fallback-cat') || '';
      const wrap = this.parentNode;
      if (wrap) {
        wrap.innerHTML = `<div class="product-img-placeholder"><span>FOMO</span><small>${escHtml(cat)}</small></div>`;
      }
    }, { once: true });
  });
}

// ── Render Product Grid ──────────────────────────────────────────
function renderProducts() {
  const grid    = document.getElementById('product-grid');
  const counter = document.getElementById('product-count');
  const empty   = document.getElementById('shop-empty');
  if (!grid) return;

  const products = getFilteredProducts();

  if (counter) {
    counter.textContent = products.length === 1
      ? '1 PRODUCT'
      : `${products.length} PRODUCTS`;
  }

  if (!products.length) {
    grid.innerHTML = '';
    if (empty) empty.removeAttribute('hidden');
    return;
  }
  if (empty) empty.setAttribute('hidden', '');

  grid.innerHTML = products.map(p => renderProductCard(p)).join('');

  // Attach image error handlers (JS-based, no inline onerror)
  attachImageErrorHandlers(grid);

  // Attach click handlers
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const product = ALL_PRODUCTS.find(p => p.id === id);
      if (product) openProductModal(product);
    });
  });

  // Re-run reveal for new cards
  requestAnimationFrame(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.05 });
    grid.querySelectorAll('.product-card').forEach(el => obs.observe(el));
  });
}

function renderProductCard(p) {
  const img = p.images && p.images[0];
  const badgeCls = p.badge
    ? `product-badge badge-${p.badge.toLowerCase()}` : '';
  const sizeTags = (p.sizes || []).slice(0, 5).map(s =>
    `<span class="product-size-tag">${escHtml(s)}</span>`).join('');

  // Build image HTML without any onerror attributes — error handled via JS after render
  const imgHtml = img
    ? `<img src="${escHtml(img)}" alt="${escHtml(p.name)}" loading="lazy" data-fallback-cat="${escHtml(p.category)}" />`
    : `<div class="product-img-placeholder"><span>FOMO</span><small>${escHtml(p.category)}</small></div>`;

  return `
    <div class="product-card reveal-item" data-id="${escHtml(p.id)}" tabindex="0"
         role="listitem" aria-label="${escHtml(p.name)} — ₹${p.price}">
      <div class="product-img-wrap">
        ${imgHtml}
        ${p.badge ? `<span class="${badgeCls}">${escHtml(p.badge)}</span>` : ''}
        <div class="product-card-overlay" aria-hidden="true">
          <button class="btn-quick-view">VIEW</button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category-tag">${escHtml(p.category)}</span>
        <p class="product-name">${escHtml(p.name)}</p>
        <p class="product-price">₹${p.price.toLocaleString('en-IN')}</p>
        <div class="product-sizes" aria-label="Available sizes">${sizeTags}</div>
      </div>
    </div>
  `.trim();
}

// ── Product Modal ────────────────────────────────────────────────
let currentProduct = null;

function openProductModal(product) {
  currentProduct = product;
  const modal = document.getElementById('product-modal');
  const inner = document.getElementById('product-modal-inner');
  if (!modal || !inner) return;

  const img = product.images && product.images[0];

  // Build colors
  const colorsBtns = (product.colors || []).map((c, i) =>
    `<button class="color-btn${i === 0 ? ' selected' : ''}" data-color="${escHtml(c)}">${escHtml(c)}</button>`
  ).join('');

  // Build sizes
  const sizeBtns = (product.sizes || []).map(s =>
    `<button class="size-btn" data-size="${escHtml(s)}">${escHtml(s)}</button>`
  ).join('');

  const modalImgHtml = img
    ? `<div class="modal-gallery-main">
         <img src="${escHtml(img)}" alt="${escHtml(product.name)}" data-fallback-modal="1" />
       </div>`
    : `<div class="modal-gallery-placeholder"><span>FOMO</span></div>`;

  inner.innerHTML = `
    <div class="modal-gallery">
      ${modalImgHtml}
    </div>
    <div class="modal-info">
      <span class="modal-category">${escHtml(product.category)}</span>
      <h2 class="modal-name">${escHtml(product.name)}</h2>
      <p class="modal-price">₹${product.price.toLocaleString('en-IN')}</p>
      <p class="modal-desc">${escHtml(product.description || '')}</p>

      ${product.colors && product.colors.length > 1 ? `
        <div>
          <span class="modal-label">COLOR</span>
          <div class="modal-colors" id="modal-colors">${colorsBtns}</div>
        </div>
      ` : (product.colors && product.colors.length === 1 ? `
        <div>
          <span class="modal-label">COLOR</span>
          <p style="font-size:13px;color:var(--color-off-white)">${escHtml(product.colors[0])}</p>
        </div>
      ` : '')}

      ${product.sizes && product.sizes.length ? `
        <div>
          <span class="modal-label">SIZE</span>
          <div class="modal-sizes" id="modal-sizes">${sizeBtns}</div>
          <p class="modal-size-error" id="modal-size-error">Please select a size.</p>
        </div>
      ` : ''}

      <div>
        <span class="modal-label">QUANTITY</span>
        <div class="modal-qty-row">
          <button class="qty-btn" id="modal-qty-minus" aria-label="Decrease quantity">−</button>
          <input class="qty-val" id="modal-qty-val" type="number" value="1" min="1" max="10" readonly />
          <button class="qty-btn" id="modal-qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <div class="modal-cta">
        <button class="btn-add-to-bag" id="modal-btn-add">ADD TO BAG</button>
        <button class="btn-buy-now" id="modal-btn-buy">BUY NOW</button>
      </div>
    </div>
  `.trim();

  // Modal image error fallback
  inner.querySelectorAll('img[data-fallback-modal]').forEach(img => {
    img.addEventListener('error', function() {
      const wrap = this.parentNode;
      if (wrap) wrap.innerHTML = '<div class="modal-gallery-placeholder"><span>FOMO</span></div>';
    }, { once: true });
  });

  // Init modal interactions
  initModalInteractions(product);

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function initModalInteractions(product) {
  // Color selection
  document.getElementById('modal-colors')?.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#modal-colors .color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Size selection
  document.getElementById('modal-sizes')?.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#modal-sizes .size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('modal-size-error')?.classList.remove('visible');
    });
  });

  // Quantity
  const qtyVal = document.getElementById('modal-qty-val');
  document.getElementById('modal-qty-minus')?.addEventListener('click', () => {
    const cur = parseInt(qtyVal.value, 10) || 1;
    if (cur > 1) qtyVal.value = cur - 1;
  });
  document.getElementById('modal-qty-plus')?.addEventListener('click', () => {
    const cur = parseInt(qtyVal.value, 10) || 1;
    if (cur < 10) qtyVal.value = cur + 1;
  });

  // Add to bag
  document.getElementById('modal-btn-add')?.addEventListener('click', () => {
    if (!attemptAddToCart(product)) return;
    const btn = document.getElementById('modal-btn-add');
    btn.textContent = '✓ ADDED TO BAG';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = 'ADD TO BAG';
      btn.classList.remove('added');
    }, 2000);
  });

  // Buy now
  document.getElementById('modal-btn-buy')?.addEventListener('click', () => {
    if (!attemptAddToCart(product)) return;
    closeProductModal();
    openBag();
  });
}

function attemptAddToCart(product) {
  const needsSize = product.sizes && product.sizes.length > 0;
  const selectedSizeBtn = document.querySelector('#modal-sizes .size-btn.selected');
  const selectedColorBtn = document.querySelector('#modal-colors .color-btn.selected');
  const qtyVal = document.getElementById('modal-qty-val');

  if (needsSize && !selectedSizeBtn) {
    document.getElementById('modal-size-error')?.classList.add('visible');
    return false;
  }

  const size  = selectedSizeBtn ? selectedSizeBtn.dataset.size : (product.sizes[0] || '');
  const color = selectedColorBtn ? selectedColorBtn.dataset.color : (product.colors[0] || '');
  const qty   = Math.max(1, Math.min(10, parseInt(qtyVal?.value || '1', 10)));

  window.FOMO_CART?.addItem({
    id:       product.id,
    name:     product.name,
    category: product.category,
    price:    product.price,
    size,
    color,
    image:    product.images && product.images[0] || '',
  }, qty);

  return true;
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
  currentProduct = null;
}

// ── Search input ─────────────────────────────────────────────────
function initShopSearch() {
  const input = document.getElementById('shop-search');
  const clearBtn = document.getElementById('search-clear');
  if (!input) return;

  input.addEventListener('input', () => {
    shopState.search = input.value;
    if (clearBtn) clearBtn.hidden = !input.value;
    renderProducts();
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    shopState.search = '';
    clearBtn.hidden = true;
    renderProducts();
    input.focus();
  });

  document.getElementById('btn-clear-search')?.addEventListener('click', () => {
    input.value = '';
    shopState.search = '';
    shopState.category = 'all';
    shopState.fit = 'all';
    shopState.isNewDrop = false;
    if (clearBtn) clearBtn.hidden = true;
    syncCategoryUI('all');
    syncFitUI('all');
    renderProducts();
  });
}

// ── Category buttons ─────────────────────────────────────────────
function initCategoryNav() {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  nav.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      shopState.category = btn.dataset.cat;
      shopState.isNewDrop = false;
      syncCategoryUI(shopState.category);
      renderProducts();
    });
  });
}

function syncCategoryUI(cat) {
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  document.querySelectorAll('[data-dcat]').forEach(b => {
    b.classList.toggle('active', b.dataset.dcat === cat);
  });
  shopState.category = cat;
}

// ── Fit filter ───────────────────────────────────────────────────
function initFitFilter() {
  document.getElementById('filter-fits')?.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      shopState.fit = btn.dataset.fit;
      syncFitUI(shopState.fit);
      renderProducts();
    });
  });
}

function syncFitUI(fit) {
  document.querySelectorAll('#filter-fits .filter-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.fit === fit);
  });
  document.querySelectorAll('.fit-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.dfit === fit);
  });
  shopState.fit = fit;
}

// ── Sort ─────────────────────────────────────────────────────────
function initSort() {
  document.getElementById('shop-sort')?.addEventListener('change', (e) => {
    shopState.sort = e.target.value;
    renderProducts();
  });
}

// ── Mobile filter drawer ─────────────────────────────────────────
function initMobileFilterDrawer() {
  const drawer    = document.getElementById('mobile-filter-drawer');
  const openBtn   = document.getElementById('mobile-filter-btn');
  const closeBtn  = document.getElementById('drawer-close');
  const applyBtn  = document.getElementById('drawer-apply');
  const clearBtn2 = document.getElementById('drawer-clear');
  if (!drawer) return;

  function openDrawer()  { drawer.removeAttribute('hidden'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { drawer.setAttribute('hidden', ''); document.body.style.overflow = ''; }

  openBtn?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  applyBtn?.addEventListener('click', closeDrawer);

  // Drawer category
  drawer.querySelectorAll('[data-dcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      shopState.category = btn.dataset.dcat;
      drawer.querySelectorAll('[data-dcat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      syncCategoryUI(shopState.category);
      renderProducts();
    });
  });

  // Drawer sort
  drawer.querySelectorAll('.sort-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      shopState.sort = btn.dataset.sort;
      drawer.querySelectorAll('.sort-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sel = document.getElementById('shop-sort');
      if (sel) sel.value = shopState.sort;
      renderProducts();
    });
  });

  // Drawer fit
  drawer.querySelectorAll('.fit-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      shopState.fit = btn.dataset.dfit;
      drawer.querySelectorAll('.fit-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      syncFitUI(shopState.fit);
      renderProducts();
    });
  });

  clearBtn2?.addEventListener('click', () => {
    shopState.search = '';
    shopState.category = 'all';
    shopState.fit = 'all';
    shopState.sort = 'featured';
    shopState.isNewDrop = false;
    syncCategoryUI('all');
    syncFitUI('all');
    const inp = document.getElementById('shop-search');
    if (inp) inp.value = '';
    const clr = document.getElementById('search-clear');
    if (clr) clr.hidden = true;
    const sel = document.getElementById('shop-sort');
    if (sel) sel.value = 'featured';
    renderProducts();
    closeDrawer();
  });
}

// ── New Drop button ──────────────────────────────────────────────
function initNewDropBtn() {
  document.getElementById('btn-shop-new-drop')?.addEventListener('click', () => {
    shopState.isNewDrop = true;
    shopState.category  = 'all';
    shopState.fit       = 'all';
    shopState.search    = '';
    syncCategoryUI('all');
    syncFitUI('all');
    renderProducts();
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('btn-hero-enter')?.addEventListener('click', () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── Modal close ──────────────────────────────────────────────────
function initModalClose() {
  document.getElementById('product-modal-close')?.addEventListener('click', closeProductModal);
  document.getElementById('product-modal-overlay')?.addEventListener('click', closeProductModal);
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('product-modal');
    if (e.key === 'Escape' && modal && !modal.hasAttribute('hidden')) closeProductModal();
  });
}

// ── Open bag (exposed globally) ──────────────────────────────────
function openBag() {
  window.FOMO_CART?.openBag();
}

// ── Utility ─────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Init ─────────────────────────────────────────────────────────
async function initShop() {
  await loadProducts();
  renderProducts();
  initShopSearch();
  initCategoryNav();
  initFitFilter();
  initSort();
  initMobileFilterDrawer();
  initNewDropBtn();
  initModalClose();
}

// Expose for cart.js / checkout.js
window.FOMO_SHOP = {
  getAllProducts: () => ALL_PRODUCTS,
  openProductModal,
  closeProductModal,
  escHtml,
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShop);
} else {
  initShop();
}
