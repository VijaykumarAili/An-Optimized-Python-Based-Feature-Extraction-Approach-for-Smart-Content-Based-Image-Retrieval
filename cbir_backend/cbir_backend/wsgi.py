"""
WSGI config for cbir_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cbir_backend.settings')
from django.core.management import call_command

# Auto-run migrations before app starts
try:
    call_command("ensure_db_ready")
except Exception as e:
    print(f"⚠️ Auto migration failed: {e}")

application = get_wsgi_application()

