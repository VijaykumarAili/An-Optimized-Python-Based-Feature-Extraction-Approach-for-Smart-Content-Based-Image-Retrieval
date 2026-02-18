"""
Download Caltech-101 (diverse dataset with 101 categories including animals,
vehicles, objects) and index all images using BATCH CLIP inference for speed.

Optimizations:
  - Batch CLIP inference (32 images at a time) → ~10x faster
  - bulk_create / bulk_update for DB operations
  - Skip already-indexed images
"""

import os
import sys
import shutil
import django
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cbir_backend.settings")
django.setup()

import torch
import clip
import numpy as np
from PIL import Image as PILImage
from api.models import DatasetImage

BATCH_SIZE = 32  # Process 32 images at once for speed


def download_caltech101():
    """Download and extract Caltech-101 dataset."""
    import tarfile
    import urllib.request

    BASE_DIR = Path(__file__).resolve().parents[1]
    DOWNLOAD_DIR = BASE_DIR / "dataset_download" / "caltech101"
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

    tar_path = DOWNLOAD_DIR / "101_ObjectCategories.tar.gz"
    extract_dir = DOWNLOAD_DIR / "101_ObjectCategories"

    if extract_dir.exists() and any(extract_dir.iterdir()):
        print("✅ Caltech-101 already downloaded!")
        return extract_dir

    url = "https://data.caltech.edu/records/mzrjq-6wc02/files/caltech-101.zip"
    # Use torchvision to download instead
    print("📥 Downloading Caltech-101 via torchvision...")
    from torchvision.datasets import Caltech101
    ds = Caltech101(root=str(DOWNLOAD_DIR), download=True)
    
    # Find the extracted directory
    for d in DOWNLOAD_DIR.rglob("101_ObjectCategories"):
        if d.is_dir():
            return d
    
    # Fallback: search for category directories
    for d in DOWNLOAD_DIR.rglob("*"):
        if d.is_dir() and (d / "BACKGROUND_Google").exists():
            return d
        if d.is_dir() and len(list(d.iterdir())) > 50:
            # Likely the categories directory
            subdirs = [x for x in d.iterdir() if x.is_dir()]
            if len(subdirs) > 50:
                return d

    return DOWNLOAD_DIR


def collect_images(dataset_dir):
    """Collect all image paths organized by category."""
    exts = {".jpg", ".jpeg", ".png", ".bmp", ".gif"}
    images = []
    
    for category_dir in sorted(dataset_dir.iterdir()):
        if not category_dir.is_dir():
            continue
        category = category_dir.name
        if category.startswith(".") or category == "BACKGROUND_Google":
            continue
        
        for img_path in sorted(category_dir.iterdir()):
            if img_path.suffix.lower() in exts:
                images.append((category, img_path))
    
    return images


def copy_to_media(images, media_dir):
    """Copy images to media directory organized by category."""
    media_dir.mkdir(parents=True, exist_ok=True)
    copied = 0
    
    for category, img_path in images:
        dest_dir = media_dir / category
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / img_path.name
        if not dest.exists():
            shutil.copy2(str(img_path), str(dest))
            copied += 1
    
    print(f"  📁 Copied {copied} new images")
    return copied


def create_db_records(media_dir, base_media_dir):
    """Create DatasetImage records in bulk."""
    exts = {".jpg", ".jpeg", ".png", ".bmp", ".gif"}
    all_images = [p for p in media_dir.rglob("*") if p.suffix.lower() in exts]
    
    existing = set(DatasetImage.objects.values_list("filename", flat=True))
    
    new_records = []
    for img_path in all_images:
        rel_path = str(img_path.relative_to(base_media_dir)).replace(os.sep, "/")
        filename = str(img_path.relative_to(media_dir)).replace(os.sep, "/")
        
        if filename not in existing:
            new_records.append(DatasetImage(
                image=rel_path,
                filename=filename,
            ))
    
    if new_records:
        DatasetImage.objects.bulk_create(new_records, batch_size=500)
    
    print(f"  💾 Created {len(new_records)} new DB records")
    return len(new_records)


def batch_extract_features(model, preprocess, device):
    """Extract CLIP features in batches for maximum speed."""
    unprocessed = list(DatasetImage.objects.filter(feature_vector__isnull=True))
    total = len(unprocessed)
    
    if total == 0:
        print("  ✅ All images already have features!")
        return
    
    print(f"  🧠 Processing {total} images in batches of {BATCH_SIZE}...")
    
    processed = 0
    errors = 0
    
    for batch_start in range(0, total, BATCH_SIZE):
        batch = unprocessed[batch_start:batch_start + BATCH_SIZE]
        
        # Load and preprocess batch
        tensors = []
        valid_items = []
        
        for img_obj in batch:
            try:
                img = PILImage.open(img_obj.image.path).convert("RGB")
                tensor = preprocess(img).unsqueeze(0)
                tensors.append(tensor)
                valid_items.append(img_obj)
            except Exception:
                errors += 1
                continue
        
        if not tensors:
            continue
        
        # Batch CLIP inference (FAST!)
        batch_tensor = torch.cat(tensors, dim=0).to(device)
        with torch.no_grad():
            features = model.encode_image(batch_tensor)
            features /= features.norm(dim=-1, keepdim=True)
        
        features_np = features.cpu().numpy().astype(np.float32)
        
        # Update DB records
        for i, img_obj in enumerate(valid_items):
            img_obj.feature_vector = features_np[i].tolist()
        
        # Bulk update
        DatasetImage.objects.bulk_update(valid_items, ["feature_vector"], batch_size=100)
        
        processed += len(valid_items)
        if processed % (BATCH_SIZE * 5) == 0 or processed == total:
            print(f"    ✅ {processed}/{total} done ({errors} errors)")
    
    print(f"  🎯 Complete! Processed: {processed}, Errors: {errors}")


def main():
    BASE_DIR = Path(__file__).resolve().parents[1]
    MEDIA_DIR = BASE_DIR / "media" / "images" / "caltech101"
    BASE_MEDIA_DIR = BASE_DIR / "media"

    # Step 1: Download
    print("=" * 60)
    print("📥 Step 1: Downloading Caltech-101 dataset...")
    print("=" * 60)
    dataset_dir = download_caltech101()
    print(f"  📂 Dataset at: {dataset_dir}")

    # Step 2: Collect images
    print("\n" + "=" * 60)
    print("🔍 Step 2: Collecting images...")
    print("=" * 60)
    images = collect_images(dataset_dir)
    categories = set(cat for cat, _ in images)
    print(f"  Found {len(images)} images across {len(categories)} categories")
    print(f"  Categories: {', '.join(sorted(list(categories))[:15])}...")

    # Step 3: Copy to media
    print("\n" + "=" * 60)
    print("📁 Step 3: Copying to media directory...")
    print("=" * 60)
    copy_to_media(images, MEDIA_DIR)

    # Step 4: Create DB records
    print("\n" + "=" * 60)
    print("💾 Step 4: Creating database records...")
    print("=" * 60)
    create_db_records(MEDIA_DIR, BASE_MEDIA_DIR)

    # Step 5: Batch feature extraction
    print("\n" + "=" * 60)
    print("🧠 Step 5: Extracting CLIP features (BATCH mode)...")
    print("=" * 60)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"  ⚙️ Device: {device}")
    
    model, preprocess = clip.load("ViT-B/32", device=device)
    model.eval()
    print("  ✅ CLIP model loaded!")
    
    batch_extract_features(model, preprocess, device)

    # Summary
    total = DatasetImage.objects.count()
    indexed = DatasetImage.objects.exclude(feature_vector__isnull=True).count()
    print("\n" + "=" * 60)
    print(f"🚀 DONE! Total: {total} images, Indexed: {indexed}")
    print("=" * 60)


if __name__ == "__main__":
    main()
