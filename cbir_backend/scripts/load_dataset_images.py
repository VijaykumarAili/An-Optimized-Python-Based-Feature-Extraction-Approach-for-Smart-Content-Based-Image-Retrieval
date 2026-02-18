"""
Load all images in media/images/ into the DatasetImage table.
"""

import os
import sys
import django
from pathlib import Path

# Django setup
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cbir_backend.settings")
django.setup()

from api.models import DatasetImage

def main():
    # ✅ Updated to match your folder structure
    DATASET_DIR = Path(__file__).resolve().parents[1] / "media" / "images"
    print(f"📂 Scanning dataset folder: {DATASET_DIR}")

    if not DATASET_DIR.exists():
        print("❌ Dataset folder not found.")
        return

    # Supported image formats
    exts = {".jpg", ".jpeg", ".png", ".bmp"}
    all_images = [p for p in DATASET_DIR.rglob("*") if p.suffix.lower() in exts]
    print(f"🔍 Found {len(all_images)} image files.")

    created = 0
    for img_path in all_images:
        rel_path = str(img_path.relative_to(DATASET_DIR))
        if not DatasetImage.objects.filter(filename=rel_path).exists():
            DatasetImage.objects.create(
                image=f"images/{rel_path.replace(os.sep, '/')}",  # ✅ Updated folder path
                filename=rel_path,
            )
            created += 1

    print(f"✅ Loaded {created} new images into DatasetImage table.")

if __name__ == "__main__":
    main()
