"""
Download and index a large image dataset for the CBIR system.
Uses Oxford Flowers 102 dataset (8,189 images across 102 flower categories).

Steps:
1. Download the dataset using torchvision
2. Copy images into media/images/ organized by category
3. Create DatasetImage records in the database
4. Extract CLIP features for each image

Usage:
    python scripts/setup_dataset.py
"""

import os
import sys
import shutil
import django
from pathlib import Path

# Django setup
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cbir_backend.settings")
django.setup()

import torch
import clip
import numpy as np
from PIL import Image as PILImage
from torchvision.datasets import Flowers102
from scipy.io import loadmat

from api.models import DatasetImage


def setup_dataset():
    BASE_DIR = Path(__file__).resolve().parents[1]
    MEDIA_DIR = BASE_DIR / "media" / "images" / "flowers"
    DOWNLOAD_DIR = BASE_DIR / "dataset_download"

    # ---------------------------------------------------
    # Step 1: Download Flowers102 dataset
    # ---------------------------------------------------
    print("=" * 60)
    print("📥 Step 1: Downloading Flowers 102 dataset...")
    print("=" * 60)

    dataset = Flowers102(
        root=str(DOWNLOAD_DIR),
        split="train",
        download=True,
    )

    # Also get test and val splits
    dataset_val = Flowers102(root=str(DOWNLOAD_DIR), split="val", download=True)
    dataset_test = Flowers102(root=str(DOWNLOAD_DIR), split="test", download=True)

    # The images are stored at: dataset_download/flowers-102/jpg/
    JPG_DIR = DOWNLOAD_DIR / "flowers-102" / "jpg"
    if not JPG_DIR.exists():
        # Try alternative path
        JPG_DIR = DOWNLOAD_DIR / "flowers-102" / "102flowers" / "jpg"

    if not JPG_DIR.exists():
        # Find the jpg directory
        for p in DOWNLOAD_DIR.rglob("*.jpg"):
            JPG_DIR = p.parent
            break

    print(f"📂 Source images found at: {JPG_DIR}")

    # Load labels
    labels_path = DOWNLOAD_DIR / "flowers-102" / "imagelabels.mat"
    if not labels_path.exists():
        # Search for it
        for p in DOWNLOAD_DIR.rglob("imagelabels.mat"):
            labels_path = p
            break

    # Flower category names
    FLOWER_NAMES = [
        "pink primrose", "hard-leaved pocket orchid", "canterbury bells",
        "sweet pea", "english marigold", "tiger lily", "moon orchid",
        "bird of paradise", "monkshood", "globe thistle", "snapdragon",
        "colts foot", "king protea", "spear thistle", "yellow iris",
        "globe flower", "purple coneflower", "peruvian lily",
        "balloon flower", "giant white arum lily", "fire lily",
        "pincushion flower", "fritillary", "red ginger", "grape hyacinth",
        "corn poppy", "prince of wales feathers", "stemless gentian",
        "artichoke", "sweet william", "carnation", "garden phlox",
        "love in the mist", "mexican aster", "alpine sea holly",
        "ruby-lipped cattleya", "cape flower", "great masterwort",
        "siam tulip", "lenten rose", "barbeton daisy", "daffodil",
        "sword lily", "poinsettia", "bolero deep blue",
        "wallflower", "marigold", "buttercup", "oxeye daisy",
        "common dandelion", "petunia", "wild pansy", "primula",
        "sunflower", "pelargonium", "bishop of llandaff", "gaura",
        "geranium", "orange dahlia", "pink-yellow dahlia",
        "cautleya spicata", "japanese anemone", "black-eyed susan",
        "silverbush", "californian poppy", "osteospermum",
        "spring crocus", "bearded iris", "windflower",
        "tree poppy", "gazania", "azalea", "water lily",
        "rose", "thorn apple", "morning glory", "passion flower",
        "lotus", "toad lily", "anthurium", "frangipani", "clematis",
        "hibiscus", "columbine", "desert-rose", "tree mallow",
        "magnolia", "cyclamen", "watercress", "canna lily",
        "hippeastrum", "bee balm", "ball moss", "foxglove",
        "bougainvillea", "camellia", "mallow", "mexican petunia",
        "bromelia", "blanket flower", "trumpet creeper", "blackberry lily",
    ]

    # ---------------------------------------------------
    # Step 2: Organize images by category
    # ---------------------------------------------------
    print("\n" + "=" * 60)
    print("📁 Step 2: Organizing images into categories...")
    print("=" * 60)

    labels = None
    if labels_path.exists():
        mat = loadmat(str(labels_path))
        labels = mat["labels"][0]  # 1-indexed
        print(f"📋 Loaded {len(labels)} image labels")

    # Get all jpg images sorted
    all_images = sorted(JPG_DIR.glob("image_*.jpg"))
    print(f"🔍 Found {len(all_images)} images")

    # Copy images to media directory organized by category
    copied = 0
    for idx, img_path in enumerate(all_images):
        if labels is not None and idx < len(labels):
            label_idx = int(labels[idx]) - 1  # 0-indexed
            if label_idx < len(FLOWER_NAMES):
                category = FLOWER_NAMES[label_idx].replace(" ", "_")
            else:
                category = f"category_{label_idx}"
        else:
            category = "uncategorized"

        dest_dir = MEDIA_DIR / category
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / img_path.name

        if not dest_path.exists():
            shutil.copy2(str(img_path), str(dest_path))
            copied += 1

        if (idx + 1) % 500 == 0:
            print(f"  Copied {idx + 1}/{len(all_images)} images...")

    print(f"✅ Copied {copied} images into {MEDIA_DIR}")

    # ---------------------------------------------------
    # Step 3: Create DatasetImage records
    # ---------------------------------------------------
    print("\n" + "=" * 60)
    print("💾 Step 3: Loading images into database...")
    print("=" * 60)

    exts = {".jpg", ".jpeg", ".png", ".bmp"}
    all_media_images = [p for p in MEDIA_DIR.rglob("*") if p.suffix.lower() in exts]
    print(f"🔍 Found {len(all_media_images)} images to index")

    created = 0
    for img_path in all_media_images:
        rel_path = str(img_path.relative_to(BASE_DIR / "media")).replace(os.sep, "/")
        filename = str(img_path.relative_to(MEDIA_DIR)).replace(os.sep, "/")

        if not DatasetImage.objects.filter(filename=filename).exists():
            DatasetImage.objects.create(
                image=rel_path,
                filename=filename,
            )
            created += 1

        if created % 500 == 0 and created > 0:
            print(f"  Created {created} database records...")

    print(f"✅ Created {created} new DatasetImage records (total: {DatasetImage.objects.count()})")

    # ---------------------------------------------------
    # Step 4: Extract CLIP features
    # ---------------------------------------------------
    print("\n" + "=" * 60)
    print("🧠 Step 4: Extracting CLIP features...")
    print("=" * 60)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"⚙️  Using device: {device}")

    model, preprocess = clip.load("ViT-B/32", device=device)
    model.eval()
    print("✅ CLIP model loaded!")

    unprocessed = DatasetImage.objects.filter(feature_vector__isnull=True)
    total = unprocessed.count()
    print(f"📸 {total} images need feature extraction")

    processed = 0
    errors = 0
    for img_obj in unprocessed.iterator():
        try:
            img_path = img_obj.image.path
            image = PILImage.open(img_path).convert("RGB")
            image_tensor = preprocess(image).unsqueeze(0).to(device)

            with torch.no_grad():
                features = model.encode_image(image_tensor)
                features /= features.norm(dim=-1, keepdim=True)

            feature_list = features.cpu().numpy().flatten().tolist()
            img_obj.feature_vector = feature_list
            img_obj.save()
            processed += 1

            if processed % 100 == 0:
                print(f"  ✅ Processed {processed}/{total} images...")

        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"  ❌ Error on {img_obj.filename}: {e}")

    print(f"\n🎯 Feature extraction complete!")
    print(f"   ✅ Processed: {processed}")
    print(f"   ❌ Errors: {errors}")
    print(f"   📊 Total indexed images: {DatasetImage.objects.exclude(feature_vector__isnull=True).count()}")
    print("\n🚀 Dataset is ready! You can now search for similar images.")


if __name__ == "__main__":
    setup_dataset()
