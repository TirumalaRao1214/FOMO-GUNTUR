/**
 * FOMO Guntur — styleAdvisorRules.js
 * Rule-based recommendation engine for colors, styles, outfits, wardrobes, and catalog scoring.
 * Pure logic module — decoupled from DOM / UI.
 */

'use strict';

// ── Color Library & Metadata ─────────────────────────────────────
const COLOR_METADATA = {
  'Navy': {
    name: 'Navy',
    hex: '#1b2a4a',
    textDark: false,
    desc: 'A timeless, versatile classic for office, college, and evening wear.',
    tags: ['navy', 'blue', 'dark']
  },
  'Charcoal': {
    name: 'Charcoal',
    hex: '#2e3033',
    textDark: false,
    desc: 'Sharp, modern neutral that pairs seamlessly with any shirt or layer.',
    tags: ['charcoal', 'grey', 'dark']
  },
  'White': {
    name: 'White',
    hex: '#f5f5f5',
    textDark: true,
    desc: 'Crisp, fresh foundation color that elevates both casual and formal looks.',
    tags: ['white', 'light', 'clean']
  },
  'Black': {
    name: 'Black',
    hex: '#111111',
    textDark: false,
    desc: 'Sleek, powerful, and universally slimming for streetwear and night occasions.',
    tags: ['black', 'dark', 'minimal']
  },
  'Light Blue': {
    name: 'Light Blue',
    hex: '#8eaec4',
    textDark: false,
    desc: 'Approachable, clean shade ideal for daytime office, interviews, and campus.',
    tags: ['blue', 'light']
  },
  'Olive': {
    name: 'Olive',
    hex: '#556b2f',
    textDark: false,
    desc: 'Rich, earthy tone offering a stylish rugged edge for casual and travel wear.',
    tags: ['olive', 'green', 'earthy']
  },
  'Beige': {
    name: 'Beige',
    hex: '#d8cbb5',
    textDark: true,
    desc: 'Subtle, sophisticated neutral perfect for sunny days, linen, and layering.',
    tags: ['beige', 'cream', 'earthy']
  },
  'Burgundy': {
    name: 'Burgundy / Maroon',
    hex: '#6b1d2f',
    textDark: false,
    desc: 'Bold, statement accent adding rich depth for party and festive events.',
    tags: ['maroon', 'burgundy', 'red']
  },
  'Ivory': {
    name: 'Ivory / Cream',
    hex: '#eee8d5',
    textDark: true,
    desc: 'Regal, warm alternative to stark white for festive occasions and kurtas.',
    tags: ['ivory', 'cream', 'ethnic']
  },
  'Slate Grey': {
    name: 'Slate Grey',
    hex: '#5b6770',
    textDark: false,
    desc: 'Understated, contemporary neutral that balances casual tees and formal blazers.',
    tags: ['grey', 'slate']
  },
  'Indigo': {
    name: 'Indigo',
    hex: '#264366',
    textDark: false,
    desc: 'The essential denim hue that bridges everyday casual and smart-casual fits.',
    tags: ['indigo', 'blue', 'denim']
  },
  'Gold / Tan': {
    name: 'Gold / Tan',
    hex: '#c9a84c',
    textDark: true,
    desc: 'Luxe accent tone for accessories, watch bezels, belts, and festive trims.',
    tags: ['gold', 'tan', 'leather']
  }
};

// ── Color Recommendation Engine ──────────────────────────────────
/**
 * Calculates a structured color palette based on multi-factor style profile.
 * Multi-factor inputs: skinTone, occasion, style, favoriteColors, userType, ageGroup.
 * @param {Object} profile 
 * @returns {{ primary: Array, versatile: Array, accent: Array, occasionSpecific: Array }}
 */
function getRecommendedColors(profile) {
  const skinTone = (profile.skinTone || '').toLowerCase();
  const occasion = (profile.occasion || '').toLowerCase();
  const styles = (profile.style || []).map(s => s.toLowerCase());
  const favColors = (profile.favoriteColors || []).map(c => c.toLowerCase());
  const userType = (profile.userType || '').toLowerCase();

  let primary = [];
  let versatile = [];
  let accent = [];
  let occasionSpecific = [];

  // 1. Skin tone baseline suggestions
  if (skinTone.includes('deep') || skinTone.includes('dusky')) {
    primary.push('Navy', 'White', 'Ivory');
    versatile.push('Light Blue', 'Olive', 'Beige');
    accent.push('Burgundy', 'Gold / Tan');
  } else if (skinTone.includes('medium')) {
    primary.push('Navy', 'Charcoal', 'White');
    versatile.push('Light Blue', 'Olive', 'Slate Grey');
    accent.push('Burgundy', 'Indigo');
  } else if (skinTone.includes('light') || skinTone.includes('fair')) {
    primary.push('Navy', 'Charcoal', 'Black');
    versatile.push('Olive', 'Burgundy', 'Indigo');
    accent.push('Beige', 'Slate Grey');
  } else {
    // Default balanced palette
    primary.push('Navy', 'Charcoal', 'White');
    versatile.push('Light Blue', 'Olive');
    accent.push('Burgundy', 'Black');
  }

  // 2. Occasion context adjustments
  if (occasion.includes('office') || occasion.includes('interview') || occasion.includes('business')) {
    if (!primary.includes('Navy')) primary.unshift('Navy');
    if (!primary.includes('White')) primary.push('White');
    if (!versatile.includes('Light Blue')) versatile.unshift('Light Blue');
    occasionSpecific.push('Charcoal', 'Slate Grey');
  } else if (occasion.includes('party') || occasion.includes('date')) {
    if (!primary.includes('Black')) primary.unshift('Black');
    accent.push('Burgundy', 'Charcoal');
    occasionSpecific.push('Burgundy', 'Indigo');
  } else if (occasion.includes('wedding') || occasion.includes('festival')) {
    primary = ['Ivory', 'Navy', 'Burgundy'];
    versatile = ['Black', 'Olive'];
    accent = ['Gold / Tan', 'White'];
    occasionSpecific.push('Ivory', 'Burgundy');
  } else if (occasion.includes('college') || occasion.includes('casual') || occasion.includes('weekend')) {
    if (!versatile.includes('Indigo')) versatile.unshift('Indigo');
    if (!versatile.includes('Olive')) versatile.push('Olive');
    if (!primary.includes('Black')) primary.push('Black');
    occasionSpecific.push('Olive', 'Beige');
  }

  // 3. Style preferences
  if (styles.includes('streetwear') || styles.includes('minimal')) {
    if (!primary.includes('Black')) primary.unshift('Black');
    if (!primary.includes('White')) primary.push('White');
    versatile.push('Charcoal', 'Slate Grey');
  }
  if (styles.includes('classic') || styles.includes('smart casual')) {
    if (!primary.includes('Navy')) primary.unshift('Navy');
    if (!versatile.includes('Beige')) versatile.push('Beige');
  }

  // 4. Boost favorite colors to primary/versatile
  favColors.forEach(fav => {
    Object.keys(COLOR_METADATA).forEach(cName => {
      if (cName.toLowerCase().includes(fav) || fav.includes(cName.toLowerCase())) {
        if (!primary.includes(cName) && !versatile.includes(cName)) {
          primary.unshift(cName);
        }
      }
    });
  });

  // Map to full metadata objects with deduplication
  const formatList = (list) => {
    const seen = new Set();
    return list
      .filter(name => {
        if (!COLOR_METADATA[name] || seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .map(name => COLOR_METADATA[name]);
  };

  return {
    primary: formatList(primary).slice(0, 3),
    versatile: formatList(versatile).slice(0, 3),
    accent: formatList(accent).slice(0, 2),
    occasionSpecific: formatList(occasionSpecific).slice(0, 2)
  };
}

// ── Product Scoring Engine ───────────────────────────────────────
/**
 * Scores a product based on how well it fits a customer's style profile.
 * Scoring rules:
 * - Occasion match: +30
 * - Style match: +20
 * - Color match: +20
 * - Fit match: +15
 * - Budget match: +10
 * - Category match: +10
 * - Favorite color: +10
 * - New Drop: +5
 * @param {Object} profile 
 * @param {Object} product 
 * @returns {number} Internal score
 */
function calculateProductScore(profile, product) {
  let score = 0;

  const occasion = (profile.occasion || '').toLowerCase();
  const styles = (profile.style || []).map(s => s.toLowerCase());
  const favColors = (profile.favoriteColors || []).map(c => c.toLowerCase());
  const fitPref = (profile.fitPreference || '').toLowerCase();
  const userType = (profile.userType || '').toLowerCase();
  const budget = profile.budget;

  const pCategory = (product.category || '').toLowerCase();
  const pOccasions = (product.occasion || []).map(o => o.toLowerCase());
  const pTags = (product.tags || []).map(t => t.toLowerCase());
  const pColors = (product.colors || []).map(c => c.toLowerCase());
  const pFit = (product.fit || '').toLowerCase();
  const pName = (product.name || '').toLowerCase();
  const pDesc = (product.description || '').toLowerCase();

  // 1. Occasion Matching (+30)
  if (occasion) {
    if (occasion.includes('office') || occasion.includes('interview') || occasion.includes('business')) {
      if (pCategory.includes('formal') || pOccasions.includes('formal') || pOccasions.includes('office')) score += 30;
      else if (pOccasions.includes('semi-formal')) score += 15;
    } else if (occasion.includes('party') || occasion.includes('date')) {
      if (pCategory.includes('party') || pOccasions.includes('party')) score += 30;
      else if (pTags.includes('party') || pCategory.includes('casual')) score += 15;
    } else if (occasion.includes('wedding') || occasion.includes('festival')) {
      if (pCategory.includes('ethnic') || pCategory.includes('party') || pOccasions.includes('festive') || pOccasions.includes('weddings')) score += 30;
    } else if (occasion.includes('college') || occasion.includes('casual') || occasion.includes('weekend')) {
      if (pCategory.includes('casual') || pOccasions.includes('casual') || pOccasions.includes('everyday')) score += 30;
    }
  }

  // 2. Style Matching (+20)
  styles.forEach(st => {
    if (st.includes('streetwear') && (pFit.includes('oversized') || pTags.includes('streetwear') || pTags.includes('cargo'))) score += 20;
    if (st.includes('minimal') && (pTags.includes('minimal') || pColors.includes('black') || pColors.includes('white') || pFit.includes('slim'))) score += 15;
    if (st.includes('classic') && (pCategory.includes('formal') || pTags.includes('classic') || pFit.includes('regular'))) score += 20;
    if (st.includes('smart casual') && (pTags.includes('polo') || pTags.includes('chinos') || pTags.includes('oxford'))) score += 20;
    if (st.includes('traditional') && pCategory.includes('ethnic')) score += 20;
    if (st.includes('trendy') && (product.badge === 'TRENDING' || product.isNew)) score += 15;
  });

  // 3. Color Matching (+20) & Favorite Color (+10)
  favColors.forEach(fav => {
    if (fav === 'no preference') return;
    const match = pColors.some(c => c.includes(fav)) || pTags.some(t => t.includes(fav)) || pName.includes(fav);
    if (match) {
      score += 20;
      score += 10; // Extra favorite color boost
    }
  });

  // Recommended color palette matching
  const palette = getRecommendedColors(profile);
  const topColorNames = [...palette.primary, ...palette.versatile].map(c => c.name.toLowerCase());
  topColorNames.forEach(cName => {
    if (pColors.some(c => cName.includes(c.toLowerCase())) || pTags.some(t => cName.includes(t.toLowerCase()))) {
      score += 10;
    }
  });

  // 4. Fit Matching (+15)
  if (fitPref && fitPref !== 'not sure') {
    if (pFit && pFit.includes(fitPref)) score += 15;
  }

  // 5. Budget Matching (+10)
  if (budget) {
    if (typeof budget === 'number') {
      if (product.price <= budget) score += 10;
      else if (product.price > budget * 1.3) score -= 15; // penalty if well over budget
    } else if (typeof budget === 'string') {
      if (budget.includes('500') && product.price <= 700) score += 10;
      else if (budget.includes('1,000') && product.price <= 1200) score += 10;
      else if (budget.includes('2,000') && product.price <= 2200) score += 10;
      else if (budget.includes('3,500') && product.price <= 3700) score += 10;
      else if (budget.includes('3,500+')) score += 10;
    }
  }

  // 6. UserType Context
  if (userType === 'student') {
    if (product.price <= 1500) score += 10;
    if (pCategory.includes('casual') || pTags.includes('tshirt') || pTags.includes('jeans')) score += 10;
  } else if (userType === 'employee') {
    if (pCategory.includes('formal') || pTags.includes('shirt') || pTags.includes('trousers') || pTags.includes('blazer')) score += 10;
  }

  // 7. New Drop / Trending Boost (+5)
  if (product.isNew || product.badge === 'NEW' || product.badge === 'TRENDING' || product.badge === 'BESTSELLER') {
    score += 5;
  }

  // Ensure available items get a slight preference over out-of-stock items
  if (product.available === false) {
    score -= 10;
  }

  return score;
}

/**
 * Filter and rank products from the catalog.
 * @param {Object} profile 
 * @param {Array} products 
 * @param {number} limit 
 * @returns {Array} Array of product objects
 */
function getRecommendedProducts(profile, products, limit = 6) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const scored = products.map(product => ({
    product,
    score: calculateProductScore(profile, product)
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter(item => item.score > 0)
    .slice(0, limit)
    .map(item => item.product);
}

// ── Outfit Generator (3 Dynamic Looks) ───────────────────────────
/**
 * Assembles 3 curated look concepts (Classic, Modern, Expressive/Trendy)
 * and pairs them with actual products from the catalog.
 * @param {Object} profile 
 * @param {Array} products 
 * @returns {Array<{ id: string, label: string, subtitle: string, desc: string, items: Array, products: Array, totalPrice: number }>}
 */
function generateOutfits(profile, products) {
  const occasion = (profile.occasion || '').toLowerCase();
  const userType = (profile.userType || '').toLowerCase();

  // Helper to find real products by keywords/criteria
  const findProduct = (filterFn, excludeIds = []) => {
    const pool = products.filter(p => !excludeIds.includes(p.id));
    const match = pool.find(filterFn);
    return match || pool[0] || null;
  };

  const looks = [];

  if (occasion.includes('office') || occasion.includes('interview') || userType === 'employee') {
    // LOOK 01 — CLASSIC / SAFE
    const top1 = findProduct(p => p.categorySlug === 'formal' && (p.name.includes('White') || p.name.includes('Oxford')));
    const btm1 = findProduct(p => p.categorySlug === 'formal' && p.name.includes('Trousers'), [top1?.id]);
    const acc1 = findProduct(p => p.categorySlug === 'accessories' && p.name.includes('Belt'), [top1?.id, btm1?.id]);
    const items1 = [top1, btm1, acc1].filter(Boolean);

    looks.push({
      id: 'look-1',
      label: 'LOOK 01 — CLASSIC',
      tagline: 'Timeless Professional',
      concept: 'Crisp Formal Shirt + Structured Trousers + Full-Grain Leather Belt',
      why: [
        'Clean, sharp silhouette respected in every workplace',
        'Neutral high-contrast tones ensure effortless authority',
        'Versatile core pieces suitable for meetings and client presentations'
      ],
      products: items1,
      totalPrice: items1.reduce((sum, p) => sum + p.price, 0)
    });

    // LOOK 02 — MODERN / SMART CASUAL
    const top2 = findProduct(p => (p.categorySlug === 'formal' || p.categorySlug === 'casual') && (p.name.includes('Beige') || p.name.includes('Polo') || p.name.includes('Oxford')), [top1?.id]);
    const btm2 = findProduct(p => p.name.includes('Chinos') || (p.name.includes('Trousers') && p.id !== btm1?.id), [top2?.id]);
    const acc2 = findProduct(p => p.name.includes('Watch'), [top2?.id, btm2?.id]);
    const items2 = [top2, btm2, acc2].filter(Boolean);

    looks.push({
      id: 'look-2',
      label: 'LOOK 02 — MODERN',
      tagline: 'Contemporary Smart Casual',
      concept: 'Oxford / Tailored Polo + Slate Chinos + Steel Watch',
      why: [
        'Bridges formal office standards with modern, relaxed comfort',
        'Subtle earthy and cool tones convey approachable confidence',
        'Transitions smoothly from daytime work to after-hours dinners'
      ],
      products: items2,
      totalPrice: items2.reduce((sum, p) => sum + p.price, 0)
    });

    // LOOK 03 — EXPRESSIVE / POWER
    const blazer = findProduct(p => p.name.includes('Blazer') || p.name.includes('Suit'));
    const innerShirt = findProduct(p => p.name.includes('Shirt') && p.id !== top1?.id, [blazer?.id]);
    const btm3 = findProduct(p => p.name.includes('Trousers') || p.name.includes('Jeans'), [blazer?.id, innerShirt?.id]);
    const items3 = [blazer, innerShirt, btm3].filter(Boolean);

    looks.push({
      id: 'look-3',
      label: 'LOOK 03 — EXPRESSIVE',
      tagline: 'Executive Statement',
      concept: 'Tailored Blazer + Contrast Shirt + Slim Trousers',
      why: [
        'High-impact tailored layering that makes a bold first impression',
        'Structured shoulder line enhances presence and posture',
        'Ideal for interviews, key milestone presentations, and dinners'
      ],
      products: items3,
      totalPrice: items3.reduce((sum, p) => sum + p.price, 0)
    });

  } else if (occasion.includes('party') || occasion.includes('wedding') || occasion.includes('festival')) {
    // FESTIVE / PARTY LOOKS
    const kurta1 = findProduct(p => p.categorySlug === 'ethnic' || p.categorySlug === 'party');
    const acc1 = findProduct(p => p.name.includes('Watch') || p.name.includes('Belt'), [kurta1?.id]);
    const items1 = [kurta1, acc1].filter(Boolean);

    looks.push({
      id: 'look-1',
      label: 'LOOK 01 — CLASSIC ETHNIC',
      tagline: 'Pure & Traditional',
      concept: 'Signature Kurta + Minimal Accents',
      why: [
        'Clean, timeless festival silhouette that never fails',
        'Breathable fabric keeps you comfortable throughout events',
        'Understated detailing lets natural elegance take center stage'
      ],
      products: items1,
      totalPrice: items1.reduce((sum, p) => sum + p.price, 0)
    });

    const partyShirt = findProduct(p => p.categorySlug === 'party' || p.name.includes('Printed') || p.name.includes('Indo-Western'), [kurta1?.id]);
    const partyBtm = findProduct(p => p.name.includes('Trousers') || p.name.includes('Chinos'), [partyShirt?.id]);
    const items2 = [partyShirt, partyBtm].filter(Boolean);

    looks.push({
      id: 'look-2',
      label: 'LOOK 02 — MODERN STATEMENT',
      tagline: 'Evening Occasion',
      concept: 'Statement Indo-Western / Party Shirt + Dark Slim Trousers',
      why: [
        'Rich texture and rich tones create an eye-catching focal point',
        'Clean tapered bottom balances statement top',
        'Perfect for cocktail parties, sangeets, and celebrations'
      ],
      products: items2,
      totalPrice: items2.reduce((sum, p) => sum + p.price, 0)
    });

    const sherwani = findProduct(p => p.name.includes('Sherwani') || p.name.includes('Nehru') || p.name.includes('Blazer'), [partyShirt?.id, kurta1?.id]);
    const items3 = [sherwani, acc1].filter(Boolean);

    looks.push({
      id: 'look-3',
      label: 'LOOK 03 — ROYAL CELEBRATION',
      tagline: 'Grand Occasion',
      concept: 'Regal Layered Silhouette + Premium Finishes',
      why: [
        'Maximum luxury feel tailored for milestone functions and weddings',
        'Gold and ivory accents deliver dignified presence',
        'Crafted to stand out in photographs and ceremonies'
      ],
      products: items3,
      totalPrice: items3.reduce((sum, p) => sum + p.price, 0)
    });

  } else {
    // CASUAL / COLLEGE / STREETWEAR LOOKS
    // LOOK 01 — EASY CASUAL
    const top1 = findProduct(p => p.categorySlug === 'casual' && (p.name.includes('Polo') || p.name.includes('Linen') || p.name.includes('T-Shirt')));
    const btm1 = findProduct(p => p.name.includes('Jeans') || p.name.includes('Chinos'), [top1?.id]);
    const items1 = [top1, btm1].filter(Boolean);

    looks.push({
      id: 'look-1',
      label: 'LOOK 01 — CLASSIC CASUAL',
      tagline: 'Effortless Daily Wear',
      concept: 'Comfort Polo / Linen Shirt + Indigo Denim',
      why: [
        'Everyday staple that looks put-together with zero effort',
        'Durable materials built for daily campus and city commute',
        'Neutral indigo matches nearly every top in your closet'
      ],
      products: items1,
      totalPrice: items1.reduce((sum, p) => sum + p.price, 0)
    });

    // LOOK 02 — STREETWEAR FITS
    const top2 = findProduct(p => p.name.includes('Oversized') || p.name.includes('Graphic'), [top1?.id]);
    const btm2 = findProduct(p => p.name.includes('Cargo') || p.name.includes('Jogger'), [top2?.id]);
    const cap = findProduct(p => p.name.includes('Cap'), [top2?.id, btm2?.id]);
    const items2 = [top2, btm2, cap].filter(Boolean);

    looks.push({
      id: 'look-2',
      label: 'LOOK 02 — STREETWEAR',
      tagline: 'Urban Drop Silhouette',
      concept: 'Oversized Boxy Tee + Utility Cargos + Structured Cap',
      why: [
        'Relaxed drop-shoulder silhouette on point with current streetwear trends',
        'Utility cargo pockets add practical depth and rugged styling',
        'All-day comfort designed specifically for campus and hangout vibes'
      ],
      products: items2,
      totalPrice: items2.reduce((sum, p) => sum + p.price, 0)
    });

    // LOOK 03 — LAYERED TRENDY
    const jacket = findProduct(p => p.name.includes('Jacket') || p.name.includes('Overshirt'));
    const inner = findProduct(p => p.name.includes('Tee') || p.name.includes('T-Shirt'), [jacket?.id]);
    const btm3 = findProduct(p => p.name.includes('Jeans') || p.name.includes('Chinos'), [jacket?.id, inner?.id]);
    const items3 = [jacket, inner, btm3].filter(Boolean);

    looks.push({
      id: 'look-3',
      label: 'LOOK 03 — LAYERED TRENDY',
      tagline: 'Modern Layering',
      concept: 'Denim/Bomber Jacket + Contrast Base Tee + Slim Jeans',
      why: [
        'Layering instantly adds visual maturity and depth to simple fits',
        'Allows easy adaptation throughout the day as temperature changes',
        'Strong masculine silhouette that stands out in any crowd'
      ],
      products: items3,
      totalPrice: items3.reduce((sum, p) => sum + p.price, 0)
    });
  }

  return looks;
}

// ── Budget Outfit Generator ──────────────────────────────────────
/**
 * Assembles a complete outfit from the real product catalog that fits within a target budget.
 * @param {number} maxBudget 
 * @param {string} categoryPreference 
 * @param {Array} products 
 * @returns {{ items: Array, totalPrice: number, withinBudget: boolean }}
 */
function buildBudgetLook(maxBudget, categoryPreference, products) {
  const target = Number(maxBudget) || 1500;
  const avail = products.filter(p => p.available !== false);

  // Group by tops and bottoms
  const tops = avail.filter(p => 
    p.tags.some(t => ['shirt', 'tshirt', 'polo', 'kurta', 'oversized'].includes(t)) ||
    p.name.toLowerCase().includes('shirt') || p.name.toLowerCase().includes('tee') || p.name.toLowerCase().includes('polo')
  ).sort((a, b) => a.price - b.price);

  const bottoms = avail.filter(p => 
    p.tags.some(t => ['jeans', 'chinos', 'trousers', 'cargo', 'joggers', 'pants'].includes(t)) ||
    p.name.toLowerCase().includes('jeans') || p.name.toLowerCase().includes('chinos') || p.name.toLowerCase().includes('trousers') || p.name.toLowerCase().includes('cargo')
  ).sort((a, b) => a.price - b.price);

  let bestCombo = null;
  let bestSum = 0;

  // Search for the best 2-piece combo under or closest to target
  for (const top of tops) {
    for (const btm of bottoms) {
      if (top.id === btm.id) continue;
      const sum = top.price + btm.price;
      if (sum <= target) {
        if (!bestCombo || sum > bestSum) {
          bestCombo = [top, btm];
          bestSum = sum;
        }
      }
    }
  }

  // If no combo found under budget, pick the most affordable combination available
  if (!bestCombo && tops.length > 0 && bottoms.length > 0) {
    bestCombo = [tops[0], bottoms[0]];
    bestSum = tops[0].price + bottoms[0].price;
  }

  return {
    items: bestCombo || [],
    totalPrice: bestSum,
    withinBudget: bestSum <= target,
    budget: target
  };
}

// ── Wardrobe Capsule Builders (Student / Employee) ───────────────
/**
 * Assembles capsule wardrobe collections with versatile mix-and-match pieces.
 * @param {'student'|'employee'} type 
 * @param {number} budgetTier 
 * @param {Array} products 
 * @returns {{ title: string, subtitle: string, items: Array, totalPrice: number, combinationsCount: number, highlights: Array }}
 */
function buildCapsuleWardrobe(type, budgetTier, products) {
  const avail = products.filter(p => p.available !== false);

  if (type === 'student') {
    // Student capsule focus: versatility, daily campus, streetwear, budget
    const tee = avail.find(p => p.name.includes('Oversized') || p.name.includes('T-Shirt')) || avail[0];
    const polo = avail.find(p => p.name.includes('Polo') && p.id !== tee?.id) || avail[1];
    const bottom1 = avail.find(p => p.name.includes('Jeans') || p.name.includes('Cargo')) || avail[2];
    const shirt = avail.find(p => p.name.includes('Linen') || p.name.includes('Casual')) || avail[3];

    let items = [tee, polo, bottom1, shirt].filter(Boolean);
    if (budgetTier >= 5000) {
      const jacket = avail.find(p => p.name.includes('Jacket') && !items.some(i => i.id === p.id));
      if (jacket) items.push(jacket);
    }

    return {
      title: '🎓 ESSENTIAL STUDENT CAPSULE',
      subtitle: `Curated mix-and-match rotation under ₹${budgetTier.toLocaleString('en-IN')}`,
      items: items,
      totalPrice: items.reduce((sum, p) => sum + p.price, 0),
      combinationsCount: 8,
      highlights: [
        '1 Shirt + 1 Polo + 1 Heavyweight Tee + Denim/Cargos',
        'Easily generates 6+ distinct weekly outfits with zero repetition fatigue',
        'Wash-and-wear fabrics designed for high rotation on campus'
      ]
    };
  } else {
    // Employee capsule focus: office rotation, business casual, presentation-ready
    const shirt1 = avail.find(p => p.name.includes('White Formal') || p.name.includes('Oxford')) || avail[0];
    const shirt2 = avail.find(p => p.name.includes('Beige') || p.name.includes('Striped') || (p.name.includes('Formal') && p.id !== shirt1?.id)) || avail[1];
    const trouser = avail.find(p => p.name.includes('Trousers') || p.name.includes('Chinos')) || avail[2];
    const polo = avail.find(p => p.name.includes('Polo') && !p.id.includes(shirt1?.id)) || avail[3];

    let items = [shirt1, shirt2, trouser, polo].filter(Boolean);
    if (budgetTier >= 5000) {
      const blazer = avail.find(p => p.name.includes('Blazer') && !items.some(i => i.id === p.id));
      if (blazer) items.push(blazer);
    }

    return {
      title: '💼 PROFESSIONAL WORK ROTATION',
      subtitle: `Corporate capsule rotation under ₹${budgetTier.toLocaleString('en-IN')}`,
      items: items,
      totalPrice: items.reduce((sum, p) => sum + p.price, 0),
      combinationsCount: 10,
      highlights: [
        '2 Formal Shirts + 1 Smart Polo + 1 Tailored Trouser/Chino + Blazer option',
        'Flawlessly covers Monday client meetings through Friday smart casual',
        'Sharp, clean lines crafted for career advancement and executive presence'
      ]
    };
  }
}

// ── Product Context Pairings (When modal is open) ────────────────
/**
 * Given a currently viewed product, suggest matching pairings from the catalog.
 * @param {Object} product 
 * @param {Array} products 
 * @returns {{ pairings: Array, occasions: Array, advice: string }}
 */
function getProductContextPairings(product, products) {
  if (!product) return { pairings: [], occasions: [], advice: '' };

  const cat = (product.categorySlug || '').toLowerCase();
  const name = product.name.toLowerCase();
  const tags = (product.tags || []).map(t => t.toLowerCase());

  let targetFilter;
  let advice = '';

  if (tags.some(t => ['shirt', 'tshirt', 'polo', 'kurta', 'oversized'].includes(t)) || cat === 'casual' || cat === 'formal') {
    // If top, recommend matching bottoms
    if (name.includes('formal') || name.includes('oxford')) {
      targetFilter = p => p.name.toLowerCase().includes('trousers') || p.name.toLowerCase().includes('belt');
      advice = `Pair this sharp ${product.name} with tailored charcoal trousers and a leather belt for a powerful formal look.`;
    } else if (name.includes('oversized') || name.includes('graphic')) {
      targetFilter = p => p.name.toLowerCase().includes('cargo') || p.name.toLowerCase().includes('jeans') || p.name.toLowerCase().includes('cap');
      advice = `Style this ${product.name} with relaxed cargos or baggy denim for an effortless streetwear drop.`;
    } else {
      targetFilter = p => p.name.toLowerCase().includes('chinos') || p.name.toLowerCase().includes('jeans');
      advice = `This ${product.name} pairs cleanly with slim chinos or dark indigo jeans for an everyday smart fit.`;
    }
  } else if (tags.some(t => ['jeans', 'trousers', 'cargo', 'chinos', 'pants'].includes(t))) {
    // If bottom, recommend tops and layers
    if (name.includes('trousers')) {
      targetFilter = p => p.name.toLowerCase().includes('shirt') || p.name.toLowerCase().includes('blazer');
      advice = `Pair these structured trousers with a crisp white shirt or navy blazer for meetings and events.`;
    } else {
      targetFilter = p => p.name.toLowerCase().includes('polo') || p.name.toLowerCase().includes('overshirt') || p.name.toLowerCase().includes('tee');
      advice = `Style these versatile bottoms with a textured polo, linen shirt, or layered overshirt.`;
    }
  } else if (cat === 'ethnic' || cat === 'party') {
    targetFilter = p => p.categorySlug === 'accessories' || p.categorySlug === 'formal';
    advice = `Complete this occasion outfit with minimal footwear, a steel watch, and clean groom detailing.`;
  } else {
    // Accessories
    targetFilter = p => p.categorySlug === 'formal' || p.categorySlug === 'casual';
    advice = `This accessory serves as the finishing accent for both casual streetwear and formal suiting.`;
  }

  const pairings = products
    .filter(p => p.id !== product.id && targetFilter(p))
    .slice(0, 3);

  return {
    pairings,
    occasions: product.occasion || ['Casual', 'Everyday'],
    advice
  };
}

// ── Expose rules engine globally ─────────────────────────────────
window.FOMO_STYLE_RULES = {
  COLOR_METADATA,
  getRecommendedColors,
  calculateProductScore,
  getRecommendedProducts,
  generateOutfits,
  buildBudgetLook,
  buildCapsuleWardrobe,
  getProductContextPairings
};
