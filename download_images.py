"""
Download royalty-free men's fashion images from Unsplash CDN
for FOMO Guntur — Men's Ready-Made Dress Store
"""
import urllib.request
import os
import time

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "assets", "images")
PRODUCTS_DIR = os.path.join(IMAGES_DIR, "products")
os.makedirs(PRODUCTS_DIR, exist_ok=True)

# Unsplash source URLs — free, no API key, royalty-free
# Using specific photo IDs for relevant men's fashion images
GALLERY_IMAGES = [
    # store interior / fashion retail
    ("gallery-1.jpg", "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80&fit=crop"),
    # men formal wear
    ("gallery-2.jpg", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop"),
    # men casual wear
    ("gallery-3.jpg", "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&fit=crop"),
    # men party / occasion wear
    ("gallery-4.jpg", "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=800&q=80&fit=crop"),
    # men accessories
    ("gallery-5.jpg", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&fit=crop"),
    # new arrivals / fashion
    ("gallery-6.jpg", "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80&fit=crop"),
]

INSTA_IMAGES = [
    ("insta-1.jpg", "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&fit=crop"),
    ("insta-2.jpg", "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80&fit=crop"),
    ("insta-3.jpg", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80&fit=crop"),
    ("insta-4.jpg", "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80&fit=crop"),
    ("insta-5.jpg", "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80&fit=crop"),
    ("insta-6.jpg", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80&fit=crop"),
]

OG_IMAGE = [
    ("og-image.jpg", "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=630&q=80&fit=crop"),
]

# Product images — all men's fashion, grouped by category
PRODUCT_IMAGES = [
    # --- Formal Wear ---
    # fomo-001: Classic White Formal Shirt
    ("products/fomo-001-formal-shirt.jpg",   "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80&fit=crop"),
    # fomo-002: Navy Blue Blazer
    ("products/fomo-002-navy-blazer.jpg",    "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80&fit=crop"),
    # fomo-010: Classic Black Trousers
    ("products/fomo-010-black-trousers.jpg", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80&fit=crop"),
    # fomo-016: Beige Oxford Shirt
    ("products/fomo-016-beige-shirt.jpg",    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80&fit=crop"),
    # fomo-018: Two-Piece Formal Suit
    ("products/fomo-018-formal-suit.jpg",    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80&fit=crop"),
    # fomo-026: All-Black Blazer
    ("products/fomo-026-black-blazer.jpg",   "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&fit=crop"),
    # fomo-032: Slim Fit Formal Trousers
    ("products/fomo-032-slim-trousers.jpg",  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop"),
    # fomo-038: Blue Striped Shirt
    ("products/fomo-038-striped-shirt.jpg",  "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80&fit=crop"),
    # fomo-046: Formal Waistcoat
    ("products/fomo-046-formal-waistcoat.jpg","https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80&fit=crop"),

    # --- Casual Wear ---
    # fomo-003: Black Casual Polo
    ("products/fomo-003-black-polo.jpg",     "https://images.unsplash.com/photo-1588731247530-4076fc99173e?w=600&q=80&fit=crop"),
    # fomo-004: Slate Grey Chinos
    ("products/fomo-004-grey-chinos.jpg",    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80&fit=crop"),
    # fomo-007: Black Graphic Oversized Tee
    ("products/fomo-007-oversized-tee.jpg",  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80&fit=crop"),
    # fomo-008: Cream Linen Shirt
    ("products/fomo-008-linen-shirt.jpg",    "https://images.unsplash.com/photo-1604006852748-903fccbc4019?w=600&q=80&fit=crop"),
    # fomo-009: Olive Cargo Pants
    ("products/fomo-009-cargo-pants.jpg",    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80&fit=crop"),
    # fomo-013: White Textured Polo
    ("products/fomo-013-white-polo.jpg",     "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80&fit=crop"),
    # fomo-014: Classic Denim Jacket
    ("products/fomo-014-denim-jacket.jpg",   "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80&fit=crop"),
    # fomo-017: Black Jogger Pants
    ("products/fomo-017-joggers-black.jpg",  "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80&fit=crop"),
    # fomo-019: Olive Linen Shirt
    ("products/fomo-019-olive-shirt.jpg",    "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80&fit=crop"),
    # fomo-020: Charcoal Grey T-Shirt
    ("products/fomo-020-grey-tshirt.jpg",    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80&fit=crop"),
    # fomo-021: Indigo Slim-Fit Jeans
    ("products/fomo-021-blue-jeans.jpg",     "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80&fit=crop"),
    # fomo-022: Black Bomber Jacket
    ("products/fomo-022-bomber-jacket.jpg",  "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=600&q=80&fit=crop"),
    # fomo-025: White Oversized T-Shirt
    ("products/fomo-025-white-tshirt.jpg",   "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80&fit=crop"),
    # fomo-027: Maroon Half-Sleeve Shirt
    ("products/fomo-027-maroon-shirt.jpg",   "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&q=80&fit=crop"),
    # fomo-028: Black Track Pants
    ("products/fomo-028-track-pants.jpg",    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80&fit=crop"),
    # fomo-031: Floral Printed Shirt
    ("products/fomo-031-printed-shirt.jpg",  "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=80&fit=crop"),
    # fomo-034: Beige Overshirt
    ("products/fomo-034-overshirt.jpg",      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80&fit=crop"),
    # fomo-035: Beige Cargo Pants
    ("products/fomo-035-cargo-beige.jpg",    "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&q=80&fit=crop"),
    # fomo-037: Black Slim Chinos
    ("products/fomo-037-black-chinos.jpg",   "https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=600&q=80&fit=crop"),
    # fomo-040: Indigo Baggy Jeans
    ("products/fomo-040-indigo-denim.jpg",   "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80&fit=crop"),
    # fomo-041: Casual Tan Blazer
    ("products/fomo-041-casual-blazer.jpg",  "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80&fit=crop"),
    # fomo-043: Burgundy Polo Shirt
    ("products/fomo-043-burgundy-polo.jpg",  "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80&fit=crop"),
    # fomo-044: White Linen Trousers
    ("products/fomo-044-linen-trousers.jpg", "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80&fit=crop"),
    # fomo-045: Black Graphic Hoodie
    ("products/fomo-045-graphic-hoodie.jpg", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80&fit=crop"),
    # fomo-049: Navy Slim Chinos
    ("products/fomo-049-navy-chinos.jpg",    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80&fit=crop"),

    # --- Ethnic Wear (men's kurtas, sherwanis — all male models) ---
    # fomo-005: Ethnic Kurta — Ivory
    ("products/fomo-005-ethnic-kurta.jpg",   "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80&fit=crop"),
    # fomo-015: All-Black Kurta
    ("products/fomo-015-black-kurta.jpg",    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80&fit=crop"),
    # fomo-023: Cream Printed Kurta
    ("products/fomo-023-cream-kurta.jpg",    "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=600&q=80&fit=crop"),
    # fomo-033: White Cotton Kurta
    ("products/fomo-033-white-kurta.jpg",    "https://images.unsplash.com/photo-1615886753866-79396abc446e?w=600&q=80&fit=crop"),
    # fomo-036: Nehru Collar Jacket
    ("products/fomo-036-nehru-jacket.jpg",   "https://images.unsplash.com/photo-1604537466158-719b1972feb8?w=600&q=80&fit=crop"),
    # fomo-042: Ethnic Printed Waistcoat
    ("products/fomo-042-ethnic-waistcoat.jpg","https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80&fit=crop"),
    # fomo-047: Festival Embroidered Kurta
    ("products/fomo-047-festival-kurta.jpg", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80&fit=crop"),

    # --- Party Wear ---
    # fomo-006: Indo-Western Party Kurta
    ("products/fomo-006-party-kurta.jpg",    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80&fit=crop"),
    # fomo-029: Ivory Sherwani
    ("products/fomo-029-sherwani.jpg",       "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=600&q=80&fit=crop"),

    # --- Accessories ---
    # fomo-011: Premium Leather Belt
    ("products/fomo-011-leather-belt.jpg",   "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop"),
    # fomo-012: Structured Baseball Cap
    ("products/fomo-012-baseball-cap.jpg",   "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80&fit=crop"),
    # fomo-024: Classic Aviator Sunglasses
    ("products/fomo-024-sunglasses.jpg",     "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80&fit=crop"),
    # fomo-030: Stainless Steel Watch
    ("products/fomo-030-watch.jpg",          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&fit=crop"),
    # fomo-039: Genuine Leather Wallet
    ("products/fomo-039-wallet.jpg",         "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80&fit=crop"),
    # fomo-048: Canvas Tote Bag
    ("products/fomo-048-canvas-bag.jpg",     "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop"),
    # fomo-050: Brown Leather Loafers
    ("products/fomo-050-brown-loafers.jpg",  "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80&fit=crop"),
]

ALL = GALLERY_IMAGES + INSTA_IMAGES + OG_IMAGE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
}

def download(filename, url, force=False):
    dest = os.path.join(IMAGES_DIR, filename)
    if not force and os.path.exists(dest) and os.path.getsize(dest) > 5000:
        print(f"  SKIP  {filename} (already exists)")
        return True
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
        with open(dest, "wb") as f:
            f.write(data)
        size_kb = len(data) // 1024
        print(f"  OK    {filename}  ({size_kb} KB)")
        return True
    except Exception as e:
        print(f"  FAIL  {filename}  {e}")
        return False

print("Downloading gallery/insta/og images for FOMO Guntur...\n")
ok = 0
for name, url in ALL:
    if download(name, url):
        ok += 1
    time.sleep(0.3)

print(f"\nDownloading product images (force re-download)...\n")
for name, url in PRODUCT_IMAGES:
    if download(name, url, force=True):
        ok += 1
    time.sleep(0.3)

total = len(ALL) + len(PRODUCT_IMAGES)
print(f"\nDone: {ok}/{total} images downloaded to assets/images/")
