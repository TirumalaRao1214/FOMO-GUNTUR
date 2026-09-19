/**
 * FOMO Guntur — styleAdvisor.js
 * Main orchestration module for FOMO Style Advisor.
 * Features:
 * - Conversational Style Profile Builder (One question at a time)
 * - Future AI-Ready Engine Abstraction (`styleAdvisorEngine.recommend`)
 * - LocalStorage Profile Persistence (`fomo_style_profile_v1`)
 * - Product Context Integration with shop.js
 * - WhatsApp Style Profile Handoff
 * - Student / Employee Modes, Budget Looks, Capsule Wardrobes, Color Palettes
 */

'use strict';

const STYLE_PROFILE_STORAGE_KEY = 'fomo_style_profile_v1';

// ── Profile State Structure ──────────────────────────────────────
const initialProfile = {
  userType: null,         // 'student' | 'employee' | 'other'
  heightCm: null,         // number in cm
  weightKg: null,         // number in kg
  bodyBuild: null,        // 'Slim' | 'Average' | 'Athletic' | 'Broad' | null
  skinTone: null,         // 'Fair' | 'Light/Medium' | 'Medium' | 'Dusky' | 'Deep' | null
  ageGroup: null,         // 'Under 18' | '18–21' | '22–25' | '26–30' | '31–35' | '36+'
  occasion: null,         // 'College Daily' | 'Office' | 'Interview' | 'Party' | 'Wedding' | ...
  style: [],              // ['Classic', 'Modern', 'Streetwear', ...]
  fitPreference: null,    // 'Slim' | 'Regular' | 'Relaxed' | 'Oversized' | 'Straight'
  budget: null,           // target price or range string
  favoriteColors: []      // ['Black', 'Navy', 'White', ...]
};

let currentProfile = { ...initialProfile };
let conversationHistory = [];
let activeContextProduct = null;

// ── Future-AI Ready Engine Abstraction ───────────────────────────
const styleAdvisorEngine = {
  /**
   * Recommends colors, outfits, products, and insights.
   * Can be connected to remote AI/backend service in the future without changing UI.
   * @param {Object} profile 
   * @param {Array} products 
   * @returns {Promise<Object>}
   */
  async recommend(profile, products) {
    return localRecommendationEngine(profile, products);
  }
};

/**
 * Local Recommendation Engine Implementation
 */
function localRecommendationEngine(profile, products) {
  const rules = window.FOMO_STYLE_RULES;
  if (!rules) throw new Error('FOMO_STYLE_RULES not loaded');

  const colors = rules.getRecommendedColors(profile);
  const productsRanked = rules.getRecommendedProducts(profile, products, 6);
  const outfits = rules.generateOutfits(profile, products);

  return {
    colors,
    products: productsRanked,
    outfits,
    profile
  };
}

// ── Height / Weight Parser Helpers ───────────────────────────────
function parseHeightToCm(input) {
  if (!input) return null;
  const str = String(input).trim().toLowerCase();

  // Handle cm like "175", "175cm"
  const cmMatch = str.match(/^(\d{2,3})\s*(?:cm)?$/);
  if (cmMatch) {
    const val = parseInt(cmMatch[1], 10);
    if (val >= 100 && val <= 250) return val;
  }

  // Handle feet-inches like 5'8", 5ft 8in, 5 8, 5.8
  const feetInchMatch = str.match(/^(\d)['’ft\s]+(\d{1,2})?["”in\s]*$/);
  if (feetInchMatch) {
    const feet = parseInt(feetInchMatch[1], 10);
    const inches = parseInt(feetInchMatch[2] || '0', 10);
    return Math.round((feet * 30.48) + (inches * 2.54));
  }

  return null;
}

function parseWeightToKg(input) {
  if (!input) return null;
  const str = String(input).trim().toLowerCase();
  const match = str.match(/^(\d{2,3})\s*(?:kg|kgs)?$/);
  if (match) {
    const val = parseInt(match[1], 10);
    if (val >= 35 && val <= 200) return val;
  }
  return null;
}

// ── Profile Storage Management ───────────────────────────────────
function loadStoredProfile() {
  try {
    const raw = localStorage.getItem(STYLE_PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function saveCurrentProfile() {
  try {
    localStorage.setItem(STYLE_PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
  } catch (_) { /* storage limit */ }
}

function clearStoredProfile() {
  try {
    localStorage.removeItem(STYLE_PROFILE_STORAGE_KEY);
    currentProfile = { ...initialProfile };
  } catch (_) {}
}

// ── Conversational Flow Management ───────────────────────────────
const UI = () => window.FOMO_STYLE_UI;
const RULES = () => window.FOMO_STYLE_RULES;

function getProductsCatalog() {
  return window.FOMO_SHOP?.getAllProducts() || [];
}

/**
 * Welcomes the user with a luxury opening message & main starting actions.
 */
function startWelcomeExperience() {
  const chatLog = document.getElementById('advisor-chat-log');
  if (chatLog) chatLog.innerHTML = '';
  conversationHistory = [];

  const stored = loadStoredProfile();

  if (stored && (stored.userType || stored.occasion || stored.style?.length)) {
    UI().renderAdvisorMessage(`
      <strong>Welcome back 👋</strong><br>
      We saved your style profile from your previous visit.<br>
      <em>User Type:</em> <strong>${stored.userType || 'Gentleman'}</strong> · <em>Style:</em> <strong>${stored.style?.join(', ') || 'Modern'}</strong>
    `);

    UI().renderAdvisorButtons([
      { label: '✨ Continue with Saved Profile', value: 'continue_saved', accent: true },
      { label: '🔄 Start Fresh Profile', value: 'start_fresh' },
      { label: '🎨 Find My Colors', value: 'find_colors' },
      { label: '👔 Build My Outfit', value: 'build_outfit' }
    ], handleWelcomeAction);
    return;
  }

  // First-time welcome greeting
  UI().renderAdvisorMessage(`
    <strong>👋 Welcome to FOMO Style Advisor.</strong><br><br>
    I'll help you find:<br>
    🎨 <strong>Colors</strong> that complement your look<br>
    👔 <strong>Fits</strong> that work with your build<br>
    🔥 <strong>Outfits</strong> tailored for your occasion<br>
    🛍 <strong>Products</strong> available in the FOMO catalog<br><br>
    <em>Let's create your style profile.</em>
  `);

  UI().renderAdvisorButtons([
    { label: "🎓 I'm a Student", value: 'role_student', icon: '🎓' },
    { label: "💼 I'm an Employee", value: 'role_employee', icon: '💼' },
    { label: '🎨 Find My Colors', value: 'find_colors', icon: '🎨' },
    { label: '👔 Build My Outfit', value: 'build_outfit', icon: '👔' },
    { label: '💰 Budget Look', value: 'budget_look', icon: '💰' },
    { label: '🛍 Browse Catalog', value: 'browse_catalog', icon: '🛍' }
  ], handleWelcomeAction);
}

function handleWelcomeAction(opt) {
  conversationHistory.push({ role: 'user', content: opt.label });
  UI().renderAdvisorMessage(opt.label, {}, true);

  if (opt.value === 'continue_saved') {
    const stored = loadStoredProfile();
    if (stored) currentProfile = { ...stored };
    presentRecommendations();
  } else if (opt.value === 'start_fresh') {
    clearStoredProfile();
    askUserTypeQuestion();
  } else if (opt.value === 'role_student') {
    currentProfile.userType = 'student';
    askOccasionQuestion();
  } else if (opt.value === 'role_employee') {
    currentProfile.userType = 'employee';
    askOccasionQuestion();
  } else if (opt.value === 'find_colors') {
    askSkinToneQuestion();
  } else if (opt.value === 'build_outfit') {
    askOccasionQuestion();
  } else if (opt.value === 'budget_look') {
    askBudgetQuestion();
  } else if (opt.value === 'browse_catalog') {
    showPopularCatalogPicks();
  }
}

// ── Step 1: User Type ────────────────────────────────────────────
function askUserTypeQuestion() {
  UI().renderAdvisorMessage('To tailor our styling to your daily routine, what best describes you?');

  UI().renderAdvisorButtons([
    { label: '🎓 Student (College / University)', value: 'student' },
    { label: '💼 Working Professional / Employee', value: 'employee' },
    { label: '⚡ Everyday Sharp Dresser', value: 'everyday' }
  ], (opt) => {
    currentProfile.userType = opt.value;
    UI().renderAdvisorMessage(opt.label, {}, true);
    askOccasionQuestion();
  });
}

// ── Step 2: Occasion ─────────────────────────────────────────────
function askOccasionQuestion() {
  const isStudent = currentProfile.userType === 'student';
  const isEmployee = currentProfile.userType === 'employee';

  let occasionOptions = [];

  if (isStudent) {
    occasionOptions = [
      { label: '🎓 College Daily', value: 'College Daily' },
      { label: '🎉 College Event / Fest', value: 'Party' },
      { label: '🎤 Campus Interview / Placement', value: 'Interview' },
      { label: '☕ Weekend / Hangout', value: 'Casual Outing' },
      { label: '💍 Family Wedding / Festive', value: 'Wedding' }
    ];
  } else if (isEmployee) {
    occasionOptions = [
      { label: '💼 Office Daily / Corporate', value: 'Office Daily' },
      { label: '👔 Business Meeting / Presentation', value: 'Business Meeting' },
      { label: '🎤 Job Interview', value: 'Interview' },
      { label: '🍸 Friday Casual / Office Party', value: 'Party' },
      { label: '☕ Casual Outing', value: 'Casual Outing' }
    ];
  } else {
    occasionOptions = [
      { label: '💼 Office / Work', value: 'Office Daily' },
      { label: '🎓 College / Campus', value: 'College Daily' },
      { label: '🎤 Interview', value: 'Interview' },
      { label: '🎉 Party / Clubbing', value: 'Party' },
      { label: '💍 Wedding / Traditional', value: 'Wedding' },
      { label: '☕ Casual Outing', value: 'Casual Outing' }
    ];
  }

  UI().renderAdvisorMessage('What are you dressing for?');
  UI().renderAdvisorButtons(occasionOptions, (opt) => {
    currentProfile.occasion = opt.value;
    UI().renderAdvisorMessage(opt.label, {}, true);
    askStylePreferenceQuestion();
  });
}

// ── Step 3: Style Preference ─────────────────────────────────────
function askStylePreferenceQuestion() {
  UI().renderAdvisorMessage('What aesthetic or style do you naturally gravitate toward?');

  UI().renderAdvisorButtons([
    { label: '✨ Classic & Clean', value: 'Classic' },
    { label: '⚡ Modern Smart Casual', value: 'Modern' },
    { label: '🔥 Streetwear & Oversized', value: 'Streetwear' },
    { label: '🖤 Minimal & Monochrome', value: 'Minimal' },
    { label: '👑 Traditional / Ethnic', value: 'Traditional' }
  ], (opt) => {
    currentProfile.style = [opt.value];
    UI().renderAdvisorMessage(opt.label, {}, true);
    askHeightQuestion();
  });
}

// ── Step 4: Height (Optional with Skip) ───────────────────────────
function askHeightQuestion() {
  UI().renderAdvisorMessage(`
    What is your approximate height?<br>
    <small style="color:var(--color-grey);">Used for styling outfit proportions. You can pick below or type your height.</small>
  `);

  UI().renderAdvisorButtons([
    { label: '5\'4" (~163 cm)', value: '163' },
    { label: '5\'6" (~168 cm)', value: '168' },
    { label: '5\'8" (~173 cm)', value: '173' },
    { label: '5\'10" (~178 cm)', value: '178' },
    { label: '6\'0"+ (~183 cm+)', value: '183' },
    { label: '⏭ Skip this step', value: 'skip' }
  ], (opt) => {
    if (opt.value !== 'skip') {
      currentProfile.heightCm = parseInt(opt.value, 10);
    }
    UI().renderAdvisorMessage(opt.label, {}, true);
    askBodyBuildQuestion();
  });
}

// ── Step 5: Body Build (Optional with Skip) ───────────────────────
function askBodyBuildQuestion() {
  UI().renderAdvisorMessage('How would you describe your body build?');

  UI().renderAdvisorButtons([
    { label: 'Slim', value: 'Slim' },
    { label: 'Average / Regular', value: 'Average' },
    { label: 'Athletic', value: 'Athletic' },
    { label: 'Broad / Solid', value: 'Broad' },
    { label: '⏭ Skip', value: 'skip' }
  ], (opt) => {
    if (opt.value !== 'skip') {
      currentProfile.bodyBuild = opt.value;
    }
    UI().renderAdvisorMessage(opt.label, {}, true);
    askSkinToneQuestion();
  });
}

// ── Step 6: Skin Tone (Optional for Colors) ───────────────────────
function askSkinToneQuestion() {
  UI().renderAdvisorMessage(`
    Which skin tone is closest to yours?<br>
    <small style="color:var(--color-grey);">We only use this to suggest flattering, complementary color palettes.</small>
  `);

  UI().renderAdvisorButtons([
    { label: 'Fair', value: 'Fair' },
    { label: 'Light / Medium', value: 'Light/Medium' },
    { label: 'Medium / Olive', value: 'Medium' },
    { label: 'Dusky / Tan', value: 'Dusky' },
    { label: 'Deep', value: 'Deep' },
    { label: '⏭ Not sure / Skip', value: 'skip' }
  ], (opt) => {
    if (opt.value !== 'skip') {
      currentProfile.skinTone = opt.value;
    }
    UI().renderAdvisorMessage(opt.label, {}, true);
    askFavoriteColorsQuestion();
  });
}

// ── Step 7: Favorite Colors ──────────────────────────────────────
function askFavoriteColorsQuestion() {
  UI().renderAdvisorMessage('Which colors do you feel most confident wearing?');

  UI().renderAdvisorButtons([
    { label: '🖤 Black & Charcoal', value: 'Black' },
    { label: '🌊 Navy & Royal Blue', value: 'Navy' },
    { label: '🤍 Crisp White & Cream', value: 'White' },
    { label: '🌿 Olive & Earthy Khaki', value: 'Olive' },
    { label: '🍷 Burgundy & Maroon', value: 'Maroon' },
    { label: '✨ No Preference / Open to all', value: 'no preference' }
  ], (opt) => {
    if (opt.value !== 'no preference') {
      currentProfile.favoriteColors = [opt.value];
    }
    UI().renderAdvisorMessage(opt.label, {}, true);
    askBudgetQuestion();
  });
}

// ── Step 8: Budget ───────────────────────────────────────────────
function askBudgetQuestion() {
  UI().renderAdvisorMessage('What is your ideal budget for an outfit combination?');

  UI().renderAdvisorButtons([
    { label: 'Under ₹1,500 (Budget Fit)', value: '1500' },
    { label: '₹1,500 – ₹2,500 (Popular)', value: '2500' },
    { label: '₹2,500 – ₹4,000 (Premium Look)', value: '3500' },
    { label: '₹4,000+ (Full Luxury Set)', value: '5000' },
    { label: '✨ No Limit', value: 'none' }
  ], (opt) => {
    if (opt.value !== 'none') {
      currentProfile.budget = parseInt(opt.value, 10);
    }
    UI().renderAdvisorMessage(opt.label, {}, true);
    presentRecommendations();
  });
}

// ── Present Generated Recommendations ────────────────────────────
async function presentRecommendations() {
  saveCurrentProfile();
  const products = getProductsCatalog();

  if (!products || products.length === 0) {
    UI().renderAdvisorMessage(`
      I'm having trouble loading the current FOMO collection.<br>
      You can still explore our main storefront or speak with the store directly.
    `);
    UI().renderAdvisorButtons([
      { label: '🛍 Browse Store', value: 'browse' },
      { label: '📲 Talk to FOMO', value: 'whatsapp' }
    ], (opt) => {
      if (opt.value === 'browse') {
        closeAdvisorPanel();
        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        openWhatsAppHandoff();
      }
    });
    return;
  }

  // Visual thinking indicator
  UI().renderAdvisorMessage('✨ <em>Analyzing your preferences and curating tailored looks from FOMO...</em>');

  try {
    const result = await styleAdvisorEngine.recommend(currentProfile, products);

    // 1. Color Palette UI
    const paletteEl = UI().renderColorPaletteUI(result.colors);
    UI().renderAdvisorMessage(paletteEl);

    // 2. Outfit Recommendations (3 Looks)
    UI().renderAdvisorMessage(`
      🔥 <strong>CURATED LOOK RECOMMENDATIONS</strong><br>
      Here are 3 distinct outfit combinations crafted from our actual ready-made catalog:
    `);

    const looksEl = UI().renderOutfitLooksUI(
      result.outfits,
      (selectedLook) => handleBuildLookAction(selectedLook),
      (selectedProduct) => handleOpenProductModal(selectedProduct)
    );
    UI().renderAdvisorMessage(looksEl);

    // 3. Recommended Individual Catalog Pieces
    if (result.products && result.products.length > 0) {
      UI().renderAdvisorMessage('🛍 <strong>MATCHING PRODUCTS IN YOUR FIT &amp; PALETTE:</strong>');
      const prodGrid = UI().renderAdvisorProductCards(result.products, handleOpenProductModal);
      UI().renderAdvisorMessage(prodGrid);
    }

    // Follow-up Actions
    UI().renderAdvisorMessage('How would you like to proceed?');
    UI().renderAdvisorButtons([
      { label: '🎓 Build Student Wardrobe', value: 'wardrobe_student' },
      { label: '💼 Build Office Wardrobe', value: 'wardrobe_employee' },
      { label: '💰 Build Under ₹1,500', value: 'budget_1500' },
      { label: '📲 Talk to FOMO (WhatsApp)', value: 'whatsapp', accent: true },
      { label: '🔄 Update Style Profile', value: 'restart' }
    ], handleFollowupAction);

  } catch (err) {
    console.error('FOMO Style Advisor recommendation error:', err);
    UI().renderAdvisorMessage('An error occurred while building your recommendation. Let us connect you directly with FOMO.');
  }
}

// ── Follow-Up Handlers ───────────────────────────────────────────
function handleFollowupAction(opt) {
  UI().renderAdvisorMessage(opt.label, {}, true);

  const products = getProductsCatalog();

  if (opt.value === 'wardrobe_student') {
    const cap = RULES().buildCapsuleWardrobe('student', 3500, products);
    renderCapsuleUI(cap);
  } else if (opt.value === 'wardrobe_employee') {
    const cap = RULES().buildCapsuleWardrobe('employee', 5000, products);
    renderCapsuleUI(cap);
  } else if (opt.value === 'budget_1500') {
    const bLook = RULES().buildBudgetLook(1500, 'casual', products);
    renderBudgetLookUI(bLook);
  } else if (opt.value === 'whatsapp') {
    openWhatsAppHandoff();
  } else if (opt.value === 'restart') {
    clearStoredProfile();
    startWelcomeExperience();
  }
}

function renderCapsuleUI(capsule) {
  const card = document.createElement('div');
  card.className = 'advisor-capsule-card';

  const itemsHtml = capsule.items.map(p => `
    <div class="capsule-item-pill">
      <img src="${UI().escAdvisorHtml(p.images[0])}" alt="${UI().escAdvisorHtml(p.name)}" />
      <div>
        <strong>${UI().escAdvisorHtml(p.name)}</strong>
        <span>₹${p.price.toLocaleString('en-IN')}</span>
      </div>
    </div>
  `).join('');

  const highlights = capsule.highlights.map(h => `<li>✓ ${UI().escAdvisorHtml(h)}</li>`).join('');

  card.innerHTML = `
    <div class="capsule-header">
      <h4>${UI().escAdvisorHtml(capsule.title)}</h4>
      <p>${UI().escAdvisorHtml(capsule.subtitle)}</p>
    </div>
    <div class="capsule-items">${itemsHtml}</div>
    <div class="capsule-total">
      <span>TOTAL CAPSULE INVESTMENT</span>
      <strong>₹${capsule.totalPrice.toLocaleString('en-IN')}</strong>
    </div>
    <ul class="capsule-highlights">${highlights}</ul>
  `;

  UI().renderAdvisorMessage(card);

  UI().renderAdvisorButtons([
    { label: '🛍 Add Capsule to Bag', value: 'add_capsule', accent: true },
    { label: '📲 Confirm with FOMO Store', value: 'whatsapp' }
  ], (opt) => {
    if (opt.value === 'add_capsule') {
      capsule.items.forEach(p => {
        const size = (p.sizes && p.sizes.length > 0) ? p.sizes[0] : '';
        const color = (p.colors && p.colors.length > 0) ? p.colors[0] : '';
        window.FOMO_CART?.addItem({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          size: size,
          color: color,
          image: p.images[0] || ''
        }, 1);
      });
      UI().renderAdvisorMessage('✓ <strong>Added all capsule pieces to your shopping bag!</strong>');
      window.FOMO_CART?.openBag();
    } else {
      openWhatsAppHandoff();
    }
  });
}

function renderBudgetLookUI(bLook) {
  if (!bLook.items || bLook.items.length === 0) {
    UI().renderAdvisorMessage('No items found strictly under this budget.');
    return;
  }

  const card = document.createElement('div');
  card.className = 'advisor-budget-card';

  const itemsHtml = bLook.items.map(p => `
    <div class="budget-item-row">
      <span>${UI().escAdvisorHtml(p.name)}</span>
      <strong>₹${p.price.toLocaleString('en-IN')}</strong>
    </div>
  `).join('');

  card.innerHTML = `
    <div class="budget-card-header">
      <span class="budget-badge">BUDGET OUTFIT</span>
      <h4>COMPLETE LOOK UNDER ₹${bLook.budget.toLocaleString('en-IN')}</h4>
    </div>
    <div class="budget-breakdown">
      ${itemsHtml}
      <div class="budget-total-row">
        <span>Combined Price:</span>
        <strong>₹${bLook.totalPrice.toLocaleString('en-IN')}</strong>
      </div>
    </div>
  `;

  UI().renderAdvisorMessage(card);

  UI().renderAdvisorButtons([
    { label: '🛍 Add This Budget Look to Bag', value: 'add_budget', accent: true },
    { label: '👔 View Other Outfits', value: 'view_looks' }
  ], (opt) => {
    if (opt.value === 'add_budget') {
      bLook.items.forEach(p => {
        const size = (p.sizes && p.sizes.length > 0) ? p.sizes[0] : '';
        const color = (p.colors && p.colors.length > 0) ? p.colors[0] : '';
        window.FOMO_CART?.addItem({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          size: size,
          color: color,
          image: p.images[0] || ''
        }, 1);
      });
      UI().renderAdvisorMessage('✓ <strong>Added budget outfit to your shopping bag!</strong>');
      window.FOMO_CART?.openBag();
    } else {
      presentRecommendations();
    }
  });
}

// ── Look Builder Multi-Item Add to Bag ───────────────────────────
function handleBuildLookAction(look) {
  UI().renderLookBuilderModal(look, (configuredItems) => {
    configuredItems.forEach(item => {
      const p = item.product;
      window.FOMO_CART?.addItem({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        size: item.selectedSize || '',
        color: item.selectedColor || '',
        image: p.images[0] || ''
      }, item.qty || 1);
    });

    UI().renderAdvisorMessage(`
      ✓ <strong>${look.label} added to your bag!</strong><br>
      Total items: <strong>${configuredItems.length}</strong> · Ready for checkout.
    `);

    // Open shopping bag to review
    window.FOMO_CART?.openBag();
  });
}

// ── Open Product Modal ───────────────────────────────────────────
function handleOpenProductModal(product) {
  if (!product) return;
  activeContextProduct = product;
  window.FOMO_SHOP?.openProductModal(product);
}

// ── Product Context Trigger (When modal is open) ─────────────────
function openAdvisorWithProductContext(product) {
  activeContextProduct = product;
  openAdvisorPanel();

  const chatLog = document.getElementById('advisor-chat-log');
  if (chatLog) chatLog.innerHTML = '';

  const pairingsData = RULES().getProductContextPairings(product, getProductsCatalog());

  UI().renderAdvisorMessage(`
    <strong>You're checking:</strong><br>
    👔 <strong>${UI().escAdvisorHtml(product.name)}</strong> (₹${product.price})<br><br>
    <em>${UI().escAdvisorHtml(pairingsData.advice)}</em>
  `);

  if (pairingsData.pairings && pairingsData.pairings.length > 0) {
    UI().renderAdvisorMessage('🔥 <strong>RECOMMENDED PIECES TO PAIR WITH THIS:</strong>');
    const cards = UI().renderAdvisorProductCards(pairingsData.pairings, handleOpenProductModal);
    UI().renderAdvisorMessage(cards);
  }

  UI().renderAdvisorButtons([
    { label: '👔 Build Complete Outfit', value: 'build_look', accent: true },
    { label: '🎨 Colors that Match This', value: 'match_colors' },
    { label: '🎓 Student Style Guidance', value: 'student_guide' },
    { label: '💼 Office Appropriateness', value: 'office_guide' },
    { label: '📲 Ask FOMO Stylist on WhatsApp', value: 'whatsapp' }
  ], (opt) => {
    if (opt.value === 'build_look') {
      currentProfile.occasion = product.occasion ? product.occasion[0] : 'Casual';
      presentRecommendations();
    } else if (opt.value === 'match_colors') {
      currentProfile.favoriteColors = product.colors || [];
      const palette = RULES().getRecommendedColors(currentProfile);
      UI().renderAdvisorMessage(UI().renderColorPaletteUI(palette));
    } else if (opt.value === 'student_guide') {
      currentProfile.userType = 'student';
      askOccasionQuestion();
    } else if (opt.value === 'office_guide') {
      const isFormal = product.categorySlug === 'formal' || (product.occasion || []).includes('Office');
      UI().renderAdvisorMessage(isFormal
        ? `✓ <strong>Yes!</strong> The <em>${product.name}</em> is fully approved for corporate and smart office environments.`
        : `⚡ The <em>${product.name}</em> is great for casual Fridays and creative agency settings, but pair it with structured chinos or a dark jacket for a polished finish.`
      );
    } else if (opt.value === 'whatsapp') {
      openWhatsAppHandoff(product);
    }
  });
}

// ── WhatsApp Stylist Handoff ─────────────────────────────────────
function openWhatsAppHandoff(specificProduct = null) {
  const content = window.FOMO_CONTENT || window.INLINE_CONTENT;
  const whatsappNum = content?.business?.whatsapp?.replace(/\+/g, '') || '919885416143';

  let msg = `*FOMO STYLE ADVISOR — CUSTOMER CONSULTATION*\n\n`;
  msg += `*Customer Style Profile:*\n`;
  if (currentProfile.userType) msg += `• *Role:* ${currentProfile.userType.toUpperCase()}\n`;
  if (currentProfile.occasion) msg += `• *Occasion:* ${currentProfile.occasion}\n`;
  if (currentProfile.style && currentProfile.style.length > 0) msg += `• *Style:* ${currentProfile.style.join(', ')}\n`;
  if (currentProfile.fitPreference) msg += `• *Fit:* ${currentProfile.fitPreference}\n`;
  if (currentProfile.heightCm) msg += `• *Height:* ${currentProfile.heightCm} cm\n`;
  if (currentProfile.favoriteColors && currentProfile.favoriteColors.length > 0) {
    msg += `• *Preferred Colors:* ${currentProfile.favoriteColors.join(', ')}\n`;
  }

  if (specificProduct) {
    msg += `\n*Interested Product:*\n`;
    msg += `• ${specificProduct.name} (₹${specificProduct.price})\n`;
  }

  msg += `\n_Customer is looking for personalized recommendations, sizes, and style assistance._`;

  const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ── Free-Text Input Parser ───────────────────────────────────────
function handleFreeTextInput(text) {
  if (!text || !text.trim()) return;
  const clean = text.trim();
  conversationHistory.push({ role: 'user', content: clean });
  UI().renderAdvisorMessage(clean, {}, true);

  const lower = clean.toLowerCase();

  // 1. Check height input
  const heightVal = parseHeightToCm(clean);
  if (heightVal) {
    currentProfile.heightCm = heightVal;
    UI().renderAdvisorMessage(`Got it — height noted as <strong>${heightVal} cm</strong>.`);
    askBodyBuildQuestion();
    return;
  }

  // 2. Check weight input
  const weightVal = parseWeightToKg(clean);
  if (weightVal) {
    currentProfile.weightKg = weightVal;
    UI().renderAdvisorMessage(`Noted! We'll factor that into comfortable fit proportions.`);
    askSkinToneQuestion();
    return;
  }

  // 3. Keyword matching for user intent
  if (lower.includes('student') || lower.includes('college')) {
    currentProfile.userType = 'student';
    UI().renderAdvisorMessage('Great, student mode enabled!');
    askOccasionQuestion();
  } else if (lower.includes('employee') || lower.includes('office') || lower.includes('work') || lower.includes('corporate')) {
    currentProfile.userType = 'employee';
    UI().renderAdvisorMessage('Great, workplace and professional styling activated!');
    askOccasionQuestion();
  } else if (lower.includes('interview')) {
    currentProfile.occasion = 'Interview';
    currentProfile.style = ['Classic'];
    presentRecommendations();
  } else if (lower.includes('party') || lower.includes('club') || lower.includes('birthday')) {
    currentProfile.occasion = 'Party';
    presentRecommendations();
  } else if (lower.includes('wedding') || lower.includes('traditional') || lower.includes('festive') || lower.includes('ethnic')) {
    currentProfile.occasion = 'Wedding';
    presentRecommendations();
  } else if (lower.includes('color') || lower.includes('colour') || lower.includes('palette')) {
    askSkinToneQuestion();
  } else if (lower.includes('budget') || lower.includes('under') || lower.includes('cheap') || lower.includes('1500') || lower.includes('2000')) {
    const bLook = RULES().buildBudgetLook(1500, 'casual', getProductsCatalog());
    renderBudgetLookUI(bLook);
  } else if (lower.includes('whatsapp') || lower.includes('call') || lower.includes('human') || lower.includes('talk')) {
    openWhatsAppHandoff();
  } else {
    // General semantic response
    UI().renderAdvisorMessage(`
      I'd love to help with that! Let's find the best fit and look for you:
    `);
    UI().renderAdvisorButtons([
      { label: '🎨 Find My Colors', value: 'find_colors' },
      { label: '👔 Build My Outfit', value: 'build_outfit' },
      { label: '🎓 Student Style', value: 'role_student' },
      { label: '💼 Office Style', value: 'role_employee' },
      { label: '💰 Budget Look', value: 'budget_look' },
      { label: '📲 Talk to FOMO', value: 'whatsapp' }
    ], handleWelcomeAction);
  }
}

// ── Panel Visibility Controls ────────────────────────────────────
function openAdvisorPanel() {
  const panel = document.getElementById('advisor-panel');
  const overlay = document.getElementById('advisor-overlay');
  if (!panel) return;

  panel.removeAttribute('hidden');
  panel.classList.add('active');
  if (overlay) overlay.removeAttribute('hidden');

  const input = document.getElementById('advisor-input');
  setTimeout(() => input?.focus(), 150);

  // If conversation is empty, start welcome
  const log = document.getElementById('advisor-chat-log');
  if (log && log.children.length === 0) {
    startWelcomeExperience();
  }
}

function closeAdvisorPanel() {
  const panel = document.getElementById('advisor-panel');
  const overlay = document.getElementById('advisor-overlay');
  if (!panel) return;

  panel.classList.remove('active');
  setTimeout(() => {
    panel.setAttribute('hidden', '');
    if (overlay) overlay.setAttribute('hidden', '');
  }, 250);
}

// ── DOM Initialization ───────────────────────────────────────────
function initStyleAdvisor() {
  // Floating trigger button
  const triggerBtn = document.getElementById('btn-advisor-trigger');
  triggerBtn?.addEventListener('click', () => openAdvisorPanel());

  // Close button & overlay
  const closeBtn = document.getElementById('advisor-panel-close');
  closeBtn?.addEventListener('click', () => closeAdvisorPanel());

  const overlay = document.getElementById('advisor-overlay');
  overlay?.addEventListener('click', () => closeAdvisorPanel());

  // Quick Action Chips in panel footer
  document.querySelectorAll('.advisor-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const action = chip.dataset.action;
      if (action === 'colors') askSkinToneQuestion();
      else if (action === 'outfit') askOccasionQuestion();
      else if (action === 'student') { currentProfile.userType = 'student'; askOccasionQuestion(); }
      else if (action === 'office') { currentProfile.userType = 'employee'; askOccasionQuestion(); }
      else if (action === 'budget') {
        const b = RULES().buildBudgetLook(1500, 'casual', getProductsCatalog());
        renderBudgetLookUI(b);
      }
      else if (action === 'browse') {
        closeAdvisorPanel();
        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
      }
      else if (action === 'whatsapp') openWhatsAppHandoff();
    });
  });

  // Chat input submit
  const form = document.getElementById('advisor-chat-form');
  const input = document.getElementById('advisor-input');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input) return;
    const val = input.value;
    input.value = '';
    handleFreeTextInput(val);
  });

  // Keyboard escape handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('advisor-panel');
      if (panel && !panel.hasAttribute('hidden')) closeAdvisorPanel();
    }
  });
}

// ── Global Exports ───────────────────────────────────────────────
window.FOMO_STYLE_ADVISOR = {
  open: openAdvisorPanel,
  close: closeAdvisorPanel,
  openWithProduct: openAdvisorWithProductContext,
  getProfile: () => currentProfile,
  setProfile: (p) => { currentProfile = { ...currentProfile, ...p }; },
  resetProfile: clearStoredProfile,
  init: initStyleAdvisor
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStyleAdvisor);
} else {
  initStyleAdvisor();
}
