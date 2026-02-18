"""
Download snake + animal images using urllib (no imghdr dependency).
Scrapes Bing image search directly, downloads images, and indexes with batch CLIP.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import ssl
import django
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cbir_backend.settings")
django.setup()

import torch
import clip
import numpy as np
from PIL import Image as PILImage
from api.models import DatasetImage

BATCH_SIZE = 32

# Disable SSL verification for image downloads
ssl._create_default_https_context = ssl._create_unverified_context

CATEGORIES = {
    "snake animal": 60,
    "green snake": 40,
    "cobra snake": 40,
    "python snake reptile": 40,
    "viper snake": 30,
    "king cobra snake": 30,
    "rattlesnake": 30,
    "boa constrictor": 20,
    "cat animal": 40,
    "dog animal": 40,
    "tiger animal": 30,
    "lion animal": 30,
    "eagle bird": 30,
    "sports car": 30,
    "motorcycle vehicle": 20,
}


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def fetch_bing_image_urls(query, count=30):
    """Fetch image URLs from Bing image search."""
    urls = []
    encoded_query = urllib.parse.quote(query)
    
    for offset in range(0, count, 35):
        url = (
            f"https://www.bing.com/images/search?q={encoded_query}"
            f"&first={offset}&count=35&qft=+filterui:photo-photo&FORM=IRFLTR"
        )
        
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode("utf-8", errors="ignore")
            
            # Extract image URLs from murl patterns
            import re
            matches = re.findall(r'murl&quot;:&quot;(https?://[^&]+?)&quot;', html)
            urls.extend(matches)
            
            if len(urls) >= count:
                break
        except Exception as e:
            print(f"    ⚠️ Search error: {e}")
            break
    
    return urls[:count]


def download_image(url, dest_path):
    """Download a single image."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
        
        # Verify it's a valid image by trying to open with PIL
        import io
        img = PILImage.open(io.BytesIO(data))
        img.verify()
        
        # Save
        with open(dest_path, "wb") as f:
            f.write(data)
        return True
    except Exception:
        return False


def download_all_categories():
    """Download images for all categories."""
    BASE_DIR = Path(__file__).resolve().parents[1]
    MEDIA_DIR = BASE_DIR / "media" / "images" / "animals"
    
    total_downloaded = 0
    
    for query, count in CATEGORIES.items():
        category = query.replace(" ", "_").lower()
        dest_dir = MEDIA_DIR / category
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        # Skip if already have enough images
        existing = len(list(dest_dir.glob("*")))
        if existing >= count:
            print(f"  ✅ '{query}' already has {existing} images, skipping")
            total_downloaded += existing
            continue
        
        print(f"  🔍 Fetching URLs for '{query}'...")
        urls = fetch_bing_image_urls(query, count)
        print(f"    Found {len(urls)} URLs")
        
        downloaded = 0
        for idx, url in enumerate(urls):
            ext = ".jpg"
            if ".png" in url.lower():
                ext = ".png"
            elif ".webp" in url.lower():
                ext = ".webp"
            
            dest_path = dest_dir / f"{category}_{idx:04d}{ext}"
            if dest_path.exists():
                downloaded += 1
                continue
            
            if download_image(url, dest_path):
                downloaded += 1
        
        print(f"    ✅ Downloaded {downloaded}/{len(urls)} images for '{query}'")
        total_downloaded += downloaded
    
    print(f"\n  📊 Total downloaded: {total_downloaded} images")
    return MEDIA_DIR


def create_db_records(media_dir):
    """Create DatasetImage records in bulk."""
    BASE_DIR = Path(__file__).resolve().parents[1]
    BASE_MEDIA_DIR = BASE_DIR / "media"
    
    exts = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"}
    existing = set(DatasetImage.objects.values_list("filename", flat=True))
    
    new_records = []
    for img_path in media_dir.rglob("*"):
        if img_path.suffix.lower() not in exts:
            continue
        
        # Verify valid image
        try:
            img = PILImage.open(img_path)
            img.verify()
        except Exception:
            continue
        
        rel_path = str(img_path.relative_to(BASE_MEDIA_DIR)).replace(os.sep, "/")
        filename = str(img_path.relative_to(media_dir)).replace(os.sep, "/")
        
        if filename not in existing:
            new_records.append(DatasetImage(image=rel_path, filename=filename))
            existing.add(filename)
    
    if new_records:
        DatasetImage.objects.bulk_create(new_records, batch_size=500)
    
    print(f"  💾 Created {len(new_records)} new DB records")


def batch_extract():
    """Extract CLIP features in batches."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, preprocess = clip.load("ViT-B/32", device=device)
    model.eval()
    
    unprocessed = list(DatasetImage.objects.filter(feature_vector__isnull=True))
    total = len(unprocessed)
    
    if total == 0:
        print("  ✅ All images already indexed!")
        return
    
    print(f"  🧠 Processing {total} images in batches of {BATCH_SIZE}...")
    processed = 0
    errors = 0
    
    for i in range(0, total, BATCH_SIZE):
        batch = unprocessed[i:i + BATCH_SIZE]
        tensors = []
        valid = []
        
        for img_obj in batch:
            try:
                img = PILImage.open(img_obj.image.path).convert("RGB")
                tensors.append(preprocess(img).unsqueeze(0))
                valid.append(img_obj)
            except Exception:
                errors += 1
        
        if not tensors:
            continue
        
        batch_tensor = torch.cat(tensors, dim=0).to(device)
        with torch.no_grad():
            features = model.encode_image(batch_tensor)
            features /= features.norm(dim=-1, keepdim=True)
        
        features_np = features.cpu().numpy().astype(np.float32)
        for j, img_obj in enumerate(valid):
            img_obj.feature_vector = features_np[j].tolist()
        
        DatasetImage.objects.bulk_update(valid, ["feature_vector"], batch_size=100)
        processed += len(valid)
        
        if processed % (BATCH_SIZE * 3) == 0 or (i + BATCH_SIZE) >= total:
            print(f"    ✅ {processed}/{total} done")
    
    print(f"  🎯 Done! Processed: {processed}, Errors: {errors}")


def main():
    print("=" * 60)
    print("🐍 Step 1: Downloading snake & animal images from Bing...")
    print("=" * 60)
    media_dir = download_all_categories()
    
    print("\n" + "=" * 60)
    print("💾 Step 2: Creating database records...")
    print("=" * 60)
    create_db_records(media_dir)
    
    print("\n" + "=" * 60)
    print("🧠 Step 3: Batch CLIP feature extraction...")
    print("=" * 60)
    batch_extract()
    
    total = DatasetImage.objects.count()
    indexed = DatasetImage.objects.exclude(feature_vector__isnull=True).count()
    print(f"\n🚀 DONE! Total: {total}, Indexed: {indexed}")
    print("🐍 Now search for snakes and you'll get snake results!")


if __name__ == "__main__":
    main()
