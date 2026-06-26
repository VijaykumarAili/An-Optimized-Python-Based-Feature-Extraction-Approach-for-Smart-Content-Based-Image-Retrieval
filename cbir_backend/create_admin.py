import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cbir_backend.settings")
django.setup()

User = get_user_model()
username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "AdminPassword123!")

if not User.objects.filter(username=username).exists():
    print(f"Creating superuser: {username}")
    user = User.objects.create_superuser(username=username, email=email, password=password)
    user.role = 'admin'
    user.save()
    print("Superuser created successfully.")
else:
    # Update password/role if requested
    user = User.objects.get(username=username)
    user.set_password(password)
    user.role = 'admin'
    user.save()
    print(f"Superuser {username} already exists. Credentials updated.")
