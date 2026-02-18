"""
Script to precompute CLIP features for all dataset images.
Run this after loading dataset images to speed up similarity search.
"""
import os
import sys
import django
from pathlib import Path
import torch
import clip
from PIL import Image
import numpy as np

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbir_backend.settings')
django.setup()

from api.models import DatasetImage


def extract_clip_features(image_path, model, preprocess, device):
    """Extract CLIP feature vector from an image."""
    image = preprocess(Image.open(image_path).convert("RGB")).unsqueeze(0).to(device)
    with torch.no_grad():
        features = model.encode_image(image)
        features /= features.norm(dim=-1, keepdim=True)
    return features.cpu().numpy().flatten().tolist()


def main():
    print("🚀 Starting CLIP feature extraction...")

    # Device setup
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"⚙️  Using device: {device}")

    # Load CLIP model
    model, preprocess = clip.load("ViT-B/32", device=device)
    print("✅ CLIP model loaded successfully!")

    # Get unprocessed images
    images = DatasetImage.objects.filter(feature_vector__isnull=True)
    total = images.count()
    print(f"📸 Found {total} unprocessed images in database.")

    for i, img_obj in enumerate(images, start=1):
        try:
            print(f"[{i}/{total}] Processing: {img_obj.filename}")
            img_path = img_obj.image.path
            features = extract_clip_features(img_path, model, preprocess, device)
            img_obj.feature_vector = features
            img_obj.save()
        except Exception as e:
            print(f"❌ Error processing {img_obj.filename}: {e}")

    print("🎯 Feature extraction complete!")


if __name__ == "__main__":
    main()
