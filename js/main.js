/**
 * FOMO Guntur — main.js
 * Orchestrates: loading, particles, entrance, hero parallax,
 * content injection (vibes, ambience, menu, gallery, Instagram),
 * menu flip cards, footer year.
 */

'use strict';

// ── Utility ──────────────────────────────────────────────────────
const rnd = (min, max) => Math.random() * (max - min) + min;
const isMobile = () => window.innerWidth < 768;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Content JSON ─────────────────────────────────────────────────
let CONTENT = null;
async function loadContent() {
  try {
    const res = await fetch('data/content.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    CONTENT = await res.json();
  } catch (e) {
    console.warn('FOMO: content.json not loaded, using inline fallback.', e);
    CONTENT = INLINE_CONTENT;
  }
  // Expose content globally for checkout.js WhatsApp number
  window.FOMO_CONTENT = CONTENT;
  // Pass delivery config to cart
  if (CONTENT?.delivery && window.FOMO_CART?.setDeliveryConfig) {
    window.FOMO_CART.setDeliveryConfig(CONTENT.delivery);
  }
}

// Inline fallback if fetch fails (e.g. file:// protocol)
const INLINE_CONTENT = {
  business: {
    name: 'FOMO',
    tagline: 'Dress Sharp. Stand Out.',
    description: 'FOMO Guntur is the city\'s premier ready-made dress store — exclusively for men. Sharp fits, premium fabrics, styles that make you impossible to ignore.',
    address: 'FOMO, Guntur, Andhra Pradesh',
    phone: '+91-9885416143',
    whatsapp: '+919885416143',
    instagram: 'https://www.instagram.com/fomo.guntur/',
    instagramHandle: '@fomo.guntur',
    hours: 'Open Daily · Hours: [Owner to fill in]',
    mapsUrl: 'https://www.google.com/maps/search/FOMO+Guntur+Andhra+Pradesh',
  },
  vibes: [
    { icon: '✦', title: 'Style', description: 'Handpicked ready-made outfits that define the modern man.' },
    { icon: '◈', title: 'Fit', description: 'Every piece cut to perfection — sharp, clean, and made to impress.' },
    { icon: '◉', title: 'Trends', description: 'Always stocked with the latest in men\'s fashion, from casual to formal.' },
    { icon: '◇', title: 'Quality', description: 'Premium fabrics and finishes — because you deserve nothing less.' },
  ],
  menu: [
    { category: 'Formal Wear', icon: '◉', description: 'Crisp shirts, tailored trousers, blazers and suits for every occasion.' },
    { category: 'Casual Wear', icon: '◈', description: 'T-shirts, polos, chinos and co-ords for effortless everyday style.' },
    { category: 'Party & Occasion', icon: '✦', description: 'Statement kurtas, indo-westerns and party-ready outfits that turn heads.' },
    { category: 'Accessories', icon: '◇', description: 'Belts, caps, wallets and the finishing touches that complete your look.' },
  ],
  gallery: {
    images: [
      { src: 'assets/images/gallery-1.jpg', alt: 'FOMO men\'s fashion store' },
      { src: 'assets/images/gallery-2.jpg', alt: 'Men\'s formal wear at FOMO' },
      { src: 'assets/images/gallery-3.jpg', alt: 'Men\'s casual wear at FOMO' },
      { src: 'assets/images/gallery-4.jpg', alt: 'Men\'s party and occasion wear at FOMO' },
      { src: 'assets/images/gallery-5.jpg', alt: 'Men\'s accessories at FOMO' },
      { src: 'assets/images/gallery-6.jpg', alt: 'New arrivals at FOMO' },
    ]
  },
  instagram: {
    images: [
      { src: 'assets/images/insta-1.jpg', alt: 'FOMO men\'s fashion — sharp fits' },
      { src: 'assets/images/insta-2.jpg', alt: 'FOMO men\'s fashion — premium styles' },
      { src: 'assets/images/insta-3.jpg', alt: 'FOMO men\'s fashion — latest collection' },
      { src: 'assets/images/insta-4.jpg', alt: 'FOMO men\'s fashion — street style' },
      { src: 'assets/images/insta-5.jpg', alt: 'FOMO men\'s fashion — casual look' },
      { src: 'assets/images/insta-6.jpg', alt: 'FOMO men\'s fashion — outfit of the day' },
    ]
  }
};

// ── Loading Screen ────────────────────────────────────────────────
function initLoading() {
  const screen  = document.getElementById('loading-screen');
  const bar     = document.getElementById('loader-bar');
  const btnEnter = document.getElementById('btn-enter');
  if (!screen) return;

  // Generate loader particles
  spawnParticles('loader-particles', isMobile() ? 20 : 40, 2, 5);

  // Animate progress bar
  let pct = 0;
  const interval = setInterval(() => {
    pct += rnd(8, 18);
    if (pct >= 100) {
      pct = 100;
      clearInterval(interval);
      if (bar) bar.style.width = '100%';
      setTimeout(showEnterButton, 300);
    } else {
      if (bar) bar.style.width = pct + '%';
    }
  }, 180);

  // If assets slow, show button after max 3s anyway
  setTimeout(showEnterButton, 3000);

  function showEnterButton() {
    if (!btnEnter) return;
    btnEnter.style.display = 'inline-block';
    if (bar) bar.style.width = '100%';
  }

  function dismissLoader() {
    screen.classList.add('hidden');
    document.body.classList.remove('loading');
    // Init hero particles after loader dismissed
    spawnParticles('hero-particles', isMobile() ? 24 : 55, 4, 8);
    setTimeout(() => {
      if (screen.classList.contains('hidden')) screen.remove();
    }, 900);
  }

  btnEnter?.addEventListener('click', dismissLoader);
}

// ── Particles ─────────────────────────────────────────────────────
function spawnParticles(containerId, count, minSz, maxSz) {
  const container = document.getElementById(containerId);
  if (!container || prefersReduced) return;

  // Clear existing
  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'p';
    const size = rnd(minSz, maxSz);
    p.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${rnd(5, 95)}%;
      top:${rnd(10, 90)}%;
      --dur:${rnd(6, 14)}s;
      --delay:-${rnd(0, 12)}s;
      --ty:-${rnd(60, 160)}px;
      --tx:${rnd(-40, 40)}px;
      --op:${rnd(0.15, 0.5)};
    `;
    container.appendChild(p);
  }
}

// ── Hero Entrance ─────────────────────────────────────────────────
function initHeroEntrance() {
  // shop.js now handles the btn-hero-enter click (scrolls to #shop).
  // Keep the cinematic entering class for the animation effect.
  const btn = document.getElementById('btn-hero-enter');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (prefersReduced) return; // shop.js already handles scroll
    document.body.classList.add('entering');
    setTimeout(() => {
      document.body.classList.remove('entering');
    }, 1200);
  });
}

// ── Hero Parallax (desktop mouse move) ────────────────────────────
function initHeroParallax() {
  if (isMobile() || prefersReduced) return;
  const hero = document.querySelector('.section-hero');
  const title = document.querySelector('.hero-title');
  const particles = document.getElementById('hero-particles');
  if (!hero) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) / cx;
    const dy = (e.clientY - rect.top  - cy) / cy;

    if (title) {
      title.style.transform = `translate(${dx * 12}px, ${dy * 6}px)`;
    }
    if (particles) {
      particles.style.transform = `translate(${dx * 20}px, ${dy * 10}px)`;
    }
  });

  hero.addEventListener('mouseleave', () => {
    if (title) title.style.transform = '';
    if (particles) particles.style.transform = '';
  });
}

// ── Inject Vibe Cards ─────────────────────────────────────────────
function renderVibeCards(vibes) {
  const grid = document.getElementById('vibe-grid');
  if (!grid || !vibes) return;
  grid.innerHTML = vibes.map((v, i) => `
    <div class="vibe-card reveal-item" style="transition-delay:${i * 0.1}s" role="listitem">
      <span class="vibe-icon" aria-hidden="true">${v.icon}</span>
      <h3 class="vibe-title">${v.title}</h3>
      <p class="vibe-desc">${v.description}</p>
    </div>
  `).join('');
}

// ── Inject Ambience Cards ─────────────────────────────────────────
function renderAmbienceCards(vibes) {
  const container = document.getElementById('ambience-cards');
  if (!container || !vibes) return;
  container.innerHTML = vibes.map((v, i) => `
    <div class="ambience-card reveal-item" style="transition-delay:${i * 0.12}s" role="listitem">
      <span class="ambience-icon" aria-hidden="true">${v.icon}</span>
      <h3 class="ambience-title">${v.title}</h3>
      <p class="ambience-desc">${v.description}</p>
    </div>
  `).join('');
}

// ── Inject Menu Category Image Cards ─────────────────────────────
function renderMenuCards(menu) {
  const grid = document.getElementById('menu-grid');
  if (!grid || !menu) return;

  grid.innerHTML = menu.map((item, i) => {
    const hasImg = item.image && item.image.trim() !== '';
    const slug   = item.slug || '';
    return `
    <div class="menu-card cat-img-card reveal-item" role="listitem" tabindex="0"
         aria-label="Shop ${item.category}"
         style="transition-delay:${i * 0.1}s"
         data-slug="${slug}">
      <div class="cat-img-wrap">
        ${hasImg
          ? `<img class="cat-img" src="${item.image}" alt="${item.category}" loading="lazy"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
             <div class="cat-img-fallback" style="display:none">
               <span>${item.icon || '◈'}</span>
             </div>`
          : `<div class="cat-img-fallback">
               <span>${item.icon || '◈'}</span>
             </div>`
        }
        <div class="cat-img-overlay" aria-hidden="true"></div>
      </div>
      <div class="cat-card-info">
        <h3 class="cat-card-title">${item.category}</h3>
        <p class="cat-card-desc">${item.description}</p>
        <span class="cat-card-explore">EXPLORE →</span>
      </div>
    </div>`;
  }).join('');

  // Click → filter shop section by category slug
  grid.querySelectorAll('.cat-img-card').forEach(card => {
    function handleActivate() {
      const slug = card.dataset.slug;
      if (!slug) return;
      // Set shop filter
      if (window.FOMO_SHOP) {
        // Trigger category filter via category nav buttons
        const btn = document.querySelector(`.cat-btn[data-cat="${slug}"]`);
        if (btn) btn.click();
      }
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
    }
    card.addEventListener('click', handleActivate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivate(); }
    });
  });
}

// ── Gallery gradient colors ───────────────────────────────────────
const GALLERY_GRADIENTS = [
  ['#1a1208','#2a1f0a'],
  ['#0f1a12','#1a2f1a'],
  ['#1a0f0f','#2a1515'],
  ['#0f0f1a','#15152a'],
  ['#1a1508','#2a2010'],
  ['#1a0a10','#2a1018'],
];

// ── Inject Gallery ────────────────────────────────────────────────
function renderGallery(galleryData) {
  const grid = document.getElementById('gallery-grid');
  if (!grid || !galleryData?.images) return;

  const items = galleryData.images;
  grid.innerHTML = items.map((img, i) => {
    const [c1, c2] = GALLERY_GRADIENTS[i % GALLERY_GRADIENTS.length];
    const hasSrc = img.src && img.src.trim() !== '';
    return `
      <div class="gallery-item reveal-item" role="listitem" tabindex="0"
           style="transition-delay:${i * 0.08}s"
           data-index="${i}"
           aria-label="View ${img.alt}">
        ${hasSrc
          ? `<img class="gallery-img" src="${img.src}" alt="${img.alt}" loading="lazy" />`
          : `<div class="gallery-placeholder"
                  style="background:linear-gradient(135deg,${c1},${c2})">
               <span>FOMO</span>
             </div>`
        }
        <div class="gallery-overlay" aria-hidden="true">
          <span class="gallery-overlay-label">LOOK 0${i + 1}</span>
          <span class="gallery-overlay-text">${img.alt.toUpperCase()}</span>
        </div>
      </div>
    `;
  }).join('');

  // Attach lightbox
  grid.querySelectorAll('.gallery-item').forEach((item, i) => {
    function open() {
      if (window.FOMO?.openLightbox) {
        window.FOMO.openLightbox(items, i);
      }
    }
    item.addEventListener('click', open);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

// Instagram gradient colors
const INSTA_GRADIENTS = [
  ['#1a1208','#241b0c'],
  ['#0e1812','#16241a'],
  ['#180e0e','#241414'],
  ['#0e0e18','#141424'],
  ['#18150a','#241e0e'],
  ['#180a10','#240e18'],
];

// ── Inject Instagram Wall ─────────────────────────────────────────
function renderInstagram(instaData) {
  const grid = document.getElementById('instagram-grid');
  if (!grid || !instaData?.images) return;

  const items = instaData.images;
  grid.innerHTML = items.map((img, i) => {
    const [c1, c2] = INSTA_GRADIENTS[i % INSTA_GRADIENTS.length];
    const hasSrc = img.src && img.src.trim() !== '';
    return `
      <a class="insta-panel reveal-item" role="listitem"
         href="https://www.instagram.com/fomo.guntur/"
         target="_blank" rel="noopener noreferrer"
         aria-label="View FOMO on Instagram"
         style="transition-delay:${i * 0.08}s">
        <div class="insta-img-wrap">
          ${hasSrc
            ? `<img src="${img.src}" alt="${img.alt}" loading="lazy" />`
            : `<div class="insta-placeholder insta-p-${(i % 6) + 1}"
                    style="background:linear-gradient(135deg,${c1},${c2});min-height:220px;width:100%;display:flex;align-items:center;justify-content:center;">
                 <span style="font-family:'Playfair Display',serif;letter-spacing:0.2em;font-size:20px;color:#c9a84c;opacity:0.4">✦</span>
               </div>`
          }
        </div>
        <div class="insta-footer">
          <span class="insta-handle">@fomo.guntur</span>
          <span class="insta-arrow" aria-hidden="true">↗</span>
        </div>
      </a>
    `;
  }).join('');
}

// ── Footer year ───────────────────────────────────────────────────
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

// ── Main Init ─────────────────────────────────────────────────────
async function init() {
  // Loading screen runs immediately
  initLoading();

  // Load content (fetch or fallback)
  await loadContent();

  // Inject dynamic sections
  if (CONTENT) {
    renderVibeCards(CONTENT.vibes);
    renderAmbienceCards(CONTENT.vibes);
    renderMenuCards(CONTENT.menu);
    renderGallery(CONTENT.gallery);
    renderInstagram(CONTENT.instagram);
  }

  // Hero interactions
  initHeroEntrance();
  initHeroParallax();

  // Footer
  setYear();

  // Re-run IntersectionObserver after content injection
  // (interactions.js may have already run, reinitialize reveals for injected nodes)
  requestAnimationFrame(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal-item').forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal-item:not(.visible)').forEach(el => obs.observe(el));

    // Re-init card tilt for newly injected cards
    const cards = document.querySelectorAll('.ambience-card, .vibe-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -8;
        const rotY = ((x - rect.width  / 2) / (rect.width  / 2)) *  8;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  });
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
