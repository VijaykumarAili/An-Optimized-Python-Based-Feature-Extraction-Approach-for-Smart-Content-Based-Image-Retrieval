from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.contrib.auth import get_user_model
import os

class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self):
        post_migrate.connect(create_superuser, sender=self)

def create_superuser(sender, **kwargs):
    User = get_user_model()

    username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

    if not username or not password:
        return

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email or "",
            password=password,
        )
        print("✅ Superuser created")
    else:
        print("ℹ️ Superuser already exists")
