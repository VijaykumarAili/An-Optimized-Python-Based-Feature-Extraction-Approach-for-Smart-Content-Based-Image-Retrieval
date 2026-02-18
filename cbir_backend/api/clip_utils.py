import io
import json
import logging
from typing import Tuple

import clip
import numpy as np
import torch
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile

logger = logging.getLogger(__name__)

_clip_model = None
_clip_preprocess = None
_device = None


def _detect_device() -> str:
    """Detect the execution device and log it."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU only"
    print(f"🚀 Using device: {device.upper()} ({gpu_name})")
    if torch.cuda.is_available():
        logger.info("CLIP configured to use GPU: %s", gpu_name)
    else:
        logger.info("CLIP configured to use CPU")
    return device



def get_device() -> str:
    """Return CUDA device if available, otherwise CPU."""
    global _device
    if _device is None:
        _device = _detect_device()
    return _device



def load_clip_model() -> Tuple[torch.nn.Module, clip.model.CLIP]:
    """Load the CLIP ViT-B/32 model on the detected device."""
    global _clip_model, _clip_preprocess
    if _clip_model is None or _clip_preprocess is None:
        device = get_device()
        _clip_model, _clip_preprocess = clip.load("ViT-B/32", device=device)
        _clip_model.eval()
        if device == "cuda":
            logger.info("Loaded CLIP ViT-B/32 model on GPU")
        else:
            logger.info("Loaded CLIP ViT-B/32 model on CPU")
    return _clip_model, _clip_preprocess


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
    """Extract normalized CLIP features for the supplied image."""
    model, preprocess = load_clip_model()
    device = get_device()

    image = _prepare_image(image_file)
    image_tensor = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        features = model.encode_image(image_tensor)
        features = features / features.norm(dim=-1, keepdim=True)

    return features.detach().cpu().numpy().astype(np.float32).flatten()


def features_to_json(features: np.ndarray) -> str:
    """Serialize feature vector to JSON."""
    return json.dumps(features.tolist())


def json_to_features(json_str: str) -> np.ndarray:
    """Deserialize JSON feature vector to numpy array."""
    return np.array(json.loads(json_str), dtype=np.float32)
