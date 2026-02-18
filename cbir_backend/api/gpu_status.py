import logging
from typing import Optional

import torch


def get_gpu_status() -> dict:
    """Return GPU availability and name information."""
    available = torch.cuda.is_available()
    name = torch.cuda.get_device_name(0) if available else None
    return {
        "gpu_available": available,
        "gpu_name": name,
    }
