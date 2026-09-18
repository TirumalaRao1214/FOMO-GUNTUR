"""
Download royalty-free men's fashion images from Unsplash CDN
for FOMO Guntur — Men's Ready-Made Dress Store
"""
import urllib.request
import os
import time

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "assets", "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

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

ALL = GALLERY_IMAGES + INSTA_IMAGES + OG_IMAGE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
}

def download(filename, url):
    dest = os.path.join(IMAGES_DIR, filename)
    if os.path.exists(dest) and os.path.getsize(dest) > 5000:
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

print("Downloading images for FOMO Guntur...\n")
ok = 0
for name, url in ALL:
    if download(name, url):
        ok += 1
    time.sleep(0.3)

print(f"\nDone: {ok}/{len(ALL)} images downloaded to assets/images/")
