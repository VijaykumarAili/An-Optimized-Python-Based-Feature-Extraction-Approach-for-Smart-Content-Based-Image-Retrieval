import io
import json
import logging
import os
from typing import Tuple

import numpy as np
import torch
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile

logger = logging.getLogger(__name__)

# Detect if running on Render Free Tier (memory limit: 512MB)
IS_RENDER = os.environ.get("RENDER") == "true"

_model = None
_preprocess = None
_device = None


def _detect_device() -> str:
    """Detect the execution device and log it."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU only"
    logger.info("Using device: %s (%s)", device.upper(), gpu_name)
    return device


def get_device() -> str:
    """Return CUDA device if available, otherwise CPU."""
    global _device
    if _device is None:
        _device = _detect_device()
    return _device


if IS_RENDER:
    # -------------------------------------------------------------------------
    # ⚡ LIGHTWEIGHT RESNET-18 (For Render Free Tier <512MB RAM)
    # -------------------------------------------------------------------------
    import torchvision.models as models
    import torchvision.transforms as transforms

    class ResNet18Extractor(torch.nn.Module):
        """ResNet-18 feature extractor that outputs 512-dimensional normalized vectors."""
        def __init__(self):
            super().__init__()
            resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
            # Remove the final classification layer (fc)
            self.features = torch.nn.Sequential(*list(resnet.children())[:-1])
            self.features.eval()

        def forward(self, x):
            with torch.no_grad():
                out = self.features(x)
                out = torch.flatten(out, 1)  # Flatten to [batch, 512]
                out = out / out.norm(dim=-1, keepdim=True)  # Normalize
                return out

    def load_clip_model():
        """Load lightweight ResNet-18 model on Render."""
        global _model, _preprocess
        if _model is None or _preprocess is None:
            logger.info("Render platform detected. Loading lightweight ResNet-18 model (~45MB) to prevent Out-Of-Memory crashes...")
            _model = ResNet18Extractor().to(get_device())
            _preprocess = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])
        return _model, _preprocess

else:
    # -------------------------------------------------------------------------
    # 🧠 STANDARD OPENAI CLIP (For local development / high performance)
    # -------------------------------------------------------------------------
    import clip

    def load_clip_model() -> Tuple[torch.nn.Module, clip.model.CLIP]:
        """Load the CLIP ViT-B/32 model on the detected device."""
        global _model, _preprocess
        if _model is None or _preprocess is None:
            device = get_device()
            _model, _preprocess = clip.load("ViT-B/32", device=device)
            _model.eval()
            if device == "cuda":
                logger.info("Loaded CLIP ViT-B/32 model on GPU")
            else:
                logger.info("Loaded CLIP ViT-B/32 model on CPU")
        return _model, _preprocess


def _prepare_image(image_file) -> Image.Image:
    """Normalize different file inputs to a PIL image."""
    if isinstance(image_file, InMemoryUploadedFile):
        data = image_file.read()
        image = Image.open(io.BytesIO(data))
        image_file.seek(0)
    elif isinstance(image_file, Image.Image):
        image = image_file
    else:
        image = Image.open(image_file)
    if image.mode == "RGBA":
        image = image.convert("RGB")
    return image


def extract_features(image_file) -> np.ndarray:
    """Extract normalized features for the supplied image."""
    model, preprocess = load_clip_model()
    device = get_device()

    image = _prepare_image(image_file)
    image_tensor = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        if IS_RENDER:
            # ResNet-18 custom extractor module handles norm internally
            features = model(image_tensor)
        else:
            features = model.encode_image(image_tensor)
            features = features / features.norm(dim=-1, keepdim=True)

    return features.detach().cpu().numpy().astype(np.float32).flatten()


def features_to_json(features: np.ndarray) -> str:
    """Serialize feature vector to JSON."""
    return json.dumps(features.tolist())


def json_to_features(json_str: str) -> np.ndarray:
    """Deserialize JSON feature vector to numpy array."""
    return np.array(json.loads(json_str), dtype=np.float32)
