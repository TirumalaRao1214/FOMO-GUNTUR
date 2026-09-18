/**
 * FOMO Guntur — interactions.js
 * IntersectionObserver reveals, card tilt, scroll progress, lightbox
 */

'use strict';

// ── Scroll Progress Bar ──────────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ── Reveal on Scroll (IntersectionObserver) ──────────────────────
function initReveal() {
  const items = document.querySelectorAll('.reveal-item');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => obs.observe(el));
}

// ── Card Tilt (mouse parallax on cards) ─────────────────────────
function initCardTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const cards = document.querySelectorAll('.ambience-card, .vibe-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── Navigation scroll-spy ────────────────────────────────────────
function initScrollSpy() {
  const links = document.querySelectorAll('.nav-link');
  const header = document.getElementById('site-header');

  // Only observe sections that exist and have matching nav links
  const sections = Array.from(links)
    .map(l => {
      const href = l.getAttribute('href');
      return href ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (sections.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      });
    }, { threshold: 0.2 });
    sections.forEach(s => obs.observe(s));
  }

  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── Kinetic scroll text (horizontal marquee follow) ──────────────
function initKineticScroll() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const marquees = document.querySelectorAll('.trending-track');
  if (!marquees.length) return;

  // Pause marquee briefly when user scrolls fast
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    marquees.forEach(m => m.style.animationPlayState = 'paused');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      marquees.forEach(m => m.style.animationPlayState = 'running');
    }, 200);
  }, { passive: true });
}

// ── Product card tilt (extend to product-card too) ───────────────
function initProductCardTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Use event delegation on the product grid
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -3;
    const rotY = ((x - rect.width  / 2) / (rect.width  / 2)) *  3;
    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
  });

  grid.addEventListener('mouseleave', (e) => {
    const card = e.target.closest?.('.product-card');
    // Reset all cards on grid mouseleave
    grid.querySelectorAll('.product-card').forEach(c => c.style.transform = '');
  });
}

// ── Lightbox ─────────────────────────────────────────────────────
let lbItems = [];
let lbCurrent = 0;

function openLightbox(items, idx) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lbItems = items;
  lbCurrent = idx;
  renderLightboxItem();
  lb.removeAttribute('hidden');
  lb.focus();
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function renderLightboxItem() {
  const item = lbItems[lbCurrent];
  const img = document.getElementById('lb-img');
  const cap = document.getElementById('lb-caption');
  if (!img || !item) return;
  img.src = item.src || '';
  img.alt = item.alt || 'Gallery image';
  if (cap) cap.textContent = item.alt || '';
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lb-prev')?.addEventListener('click', () => {
    lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length;
    renderLightboxItem();
  });
  document.getElementById('lb-next')?.addEventListener('click', () => {
    lbCurrent = (lbCurrent + 1) % lbItems.length;
    renderLightboxItem();
  });

  // Click backdrop to close
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (lb.hasAttribute('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length;
      renderLightboxItem();
    }
    if (e.key === 'ArrowRight') {
      lbCurrent = (lbCurrent + 1) % lbItems.length;
      renderLightboxItem();
    }
  });

  // Touch swipe
  let touchStartX = 0;
  lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) {
      lbCurrent = (lbCurrent + 1) % lbItems.length;
    } else {
      lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length;
    }
    renderLightboxItem();
  }, { passive: true });
}

// ── Mobile hamburger ─────────────────────────────────────────────
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const overlay = document.getElementById('mobile-overlay');
  const closeBtn = document.getElementById('mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  if (!btn || !overlay) return;

  function openMenu() {
    overlay.removeAttribute('hidden');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    overlay.setAttribute('hidden', '');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    overlay.hasAttribute('hidden') ? openMenu() : closeMenu();
  });
  closeBtn?.addEventListener('click', closeMenu);
  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));
  overlay.addEventListener('click', e => { if (e.target === overlay) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) closeMenu();
  });
}

// ── Init all interactions ────────────────────────────────────────
function initInteractions() {
  initScrollProgress();
  initReveal();
  initCardTilt();
  initScrollSpy();
  initLightbox();
  initMobileMenu();
  initKineticScroll();
  initProductCardTilt();
}

// Expose openLightbox globally for main.js
window.FOMO = window.FOMO || {};
window.FOMO.openLightbox = openLightbox;

// Auto-init when DOM is ready (if main.js hasn't done it yet)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractions);
} else {
  initInteractions();
}
