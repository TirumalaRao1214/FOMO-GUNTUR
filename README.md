# FOMO Guntur — Immersive Static Website

A premium, cinematic static website for **FOMO Guntur** built with HTML5, CSS3, and vanilla JavaScript. No frameworks, no backend, no dependencies except Google Fonts (CDN).

## Live Demo

Deploy to any static host:
- **Netlify**: drag-and-drop the `fomo-guntur/` folder
- **Vercel**: `vercel --prod`
- **GitHub Pages**: push `fomo-guntur/` to a repo and enable Pages
- **Render**: new static site, root directory `fomo-guntur/`

---

## Run Locally

**Option 1 — VS Code Live Server**
Open `fomo-guntur/` in VS Code, right-click `index.html` → Open with Live Server.

**Option 2 — Python**
```bash
cd fomo-guntur
python -m http.server 8080
# open http://localhost:8080
```

**Option 3 — Node http-server**
```bash
npx http-server fomo-guntur -p 8080
```

> Note: `data/content.json` is loaded via `fetch()`. Opening `index.html` directly from the file system (`file://`) may fail the JSON fetch in some browsers. Use a local server.

---

## Customise Your Business Content

### 1. Business details
Edit `data/content.json`:
- `business.phone` — replace `+91-XXXXXXXXXX` with your number
- `business.whatsapp` — replace `+91XXXXXXXXXX` with your WhatsApp number
- `business.hours` — fill in your opening hours
- `business.address` — update if needed

Also update the phone/WhatsApp links in `index.html` (search for `XXXXXXXXXX`).

### 2. Menu items
Edit `data/content.json` → `menu[]`. Each item has:
```json
{
  "category": "Starters",
  "icon": "◈",
  "description": "Your description here."
}
```
The "View Details" button on each card links to your Instagram. To link to a separate menu page, update the `href` in `js/main.js` → `renderMenuCards()`.

### 3. Gallery photos
1. Add your photos to `assets/images/` named `gallery-1.jpg` through `gallery-6.jpg`
2. Update `data/content.json` → `gallery.images[].src` with the correct paths

Until you add photos, CSS gradient placeholders are shown.

### 4. Instagram wall
1. Download 6 post images from your Instagram
2. Save them as `assets/images/insta-1.jpg` through `insta-6.jpg`
3. Update `data/content.json` → `instagram.images[].src`

All Instagram panels link to `https://www.instagram.com/fomo.guntur/`.

### 5. Logo
Place your logo file in `assets/logo/`. Update the `<header>` nav logo in `index.html` to use an `<img>` tag if desired.

### 6. OG image
Add an `assets/images/og-image.jpg` (1200×630px) for social sharing previews.

---

## Project Structure

```
fomo-guntur/
├── index.html          — Full semantic HTML
├── css/
│   └── styles.css      — All styles, design tokens, animations
├── js/
│   ├── main.js         — Loading, particles, content injection
│   └── interactions.js — Scroll reveal, tilt, lightbox, nav
├── data/
│   └── content.json    — All editable business content
├── assets/
│   ├── images/         — Add gallery + Instagram photos here
│   ├── logo/           — Place logo here
│   └── audio/          — Optional ambient audio
└── README.md
```

---

## Features

- **Cinematic loading screen** with animated progress bar and gold wordmark
- **Full-screen hero** with CSS particle system, fog, parallax, grid overlay
- **Camera entrance animation** on "ENTER FOMO" click
- **Scroll-driven reveals** — sections animate in as you scroll
- **Experience & Ambience** — 3D-tilt vibe cards
- **Menu** — CSS 3D flip cards (hover/tap to reveal)
- **Gallery** — CSS perspective photo grid with lightbox (keyboard + swipe)
- **Instagram wall** — floating panels linking to @fomo.guntur
- **Location** — Google Maps embed + GET DIRECTIONS / CALL / WHATSAPP
- **Mobile sticky CTA bar** — CALL / WHATSAPP / DIRECTIONS always visible
- **Skip link** + **Skip 3D Experience** accessibility buttons
- **`prefers-reduced-motion`** — all animations disabled if user prefers
- **Keyboard navigation** throughout
- **SEO** — meta tags, Open Graph, LocalBusiness JSON-LD schema
- **No WebGL** — 100% CSS/JS, works on all devices including old phones

---

## Deployment Checklist

- [ ] Replace `+91-XXXXXXXXXX` phone/WhatsApp links
- [ ] Fill in opening hours in `data/content.json`
- [ ] Add gallery images (`assets/images/gallery-1.jpg` … `gallery-6.jpg`)
- [ ] Add Instagram images (`assets/images/insta-1.jpg` … `insta-6.jpg`)
- [ ] Add OG image (`assets/images/og-image.jpg`)
- [ ] Update `og:url` and `rel=canonical` in `index.html` to your live domain
- [ ] Test on iPhone and Android before going live

---

## Instagram

[@fomo.guntur](https://www.instagram.com/fomo.guntur/)
