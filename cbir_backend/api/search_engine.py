import logging
from typing import List, Tuple

import faiss
import numpy as np

from .clip_utils import json_to_features

logger = logging.getLogger(__name__)

_faiss_index = None


def initialize_faiss_index(dimension: int = 512):
    """Initialise a CPU-based FAISS index."""
    global _faiss_index

    if _faiss_index is not None:
        return _faiss_index

    _faiss_index = faiss.IndexFlatL2(dimension)
    logger.info("FAISS index initialised on CPU")
    return _faiss_index


def rebuild_faiss_index() -> Tuple[faiss.Index, List[int]]:
    """Rebuild FAISS index from all stored image features."""
    from .models import Image

    index = initialize_faiss_index()
    index.reset()

    images = Image.objects.all()
    if not images.exists():
        return index, []

    vectors: List[np.ndarray] = []
    image_ids: List[int] = []

    for img in images:
        try:
            features = json_to_features(img.feature_vector)
            vectors.append(features)
            image_ids.append(img.id)
        except Exception as exc:  # pylint: disable=broad-except
            logger.warning("Skipping image %s due to feature decode error: %s", img.id, exc)
            continue

    if vectors:
        vectors_array = np.stack(vectors).astype("float32")
        index.add(vectors_array)
        logger.info("FAISS index rebuilt with %d vectors", len(vectors))
    else:
        logger.info("FAISS index reset with no vectors")

    return index, image_ids


def search_similar_images(query_features: np.ndarray, top_k: int = 10, user=None):
    """Return the top-k most similar images for the given feature vector."""
    from .models import Image

    index, image_ids = rebuild_faiss_index()
    if index.ntotal == 0:
        return []

    query_features = query_features.reshape(1, -1).astype("float32")
    distances, indices = index.search(query_features, min(top_k * 2, index.ntotal))

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx >= len(image_ids):
            continue
        image_id = image_ids[idx]
        try:
            image = Image.objects.get(id=image_id)
        except Image.DoesNotExist:
            continue

        if user is not None and not user.is_admin() and image.user != user:
            continue

        similarity = max(0, 1 - dist) * 100
        results.append(
            {
                "image_id": image_id,
                "similarity": round(similarity, 2),
                "distance": float(dist),
            }
        )

        if len(results) >= top_k:
            break

    return results
