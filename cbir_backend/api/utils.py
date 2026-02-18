"""Compatibility layer for CLIP and FAISS utilities."""

from .clip_utils import (  # noqa: F401
    extract_features,
    features_to_json,
    get_device,
    json_to_features,
    load_clip_model,
)
from .search_engine import (  # noqa: F401
    initialize_faiss_index,
    rebuild_faiss_index,
    search_similar_images,
)

__all__ = [
    "extract_features",
    "features_to_json",
    "get_device",
    "json_to_features",
    "load_clip_model",
    "initialize_faiss_index",
    "rebuild_faiss_index",
    "search_similar_images",
]

