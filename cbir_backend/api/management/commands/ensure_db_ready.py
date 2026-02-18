from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Ensures database migrations are up-to-date before starting the server."

    def handle(self, *args, **kwargs):
        self.stdout.write("⚙️ Checking for missing migrations...")
        try:
            call_command("makemigrations", interactive=False)
            call_command("migrate", interactive=False)
            self.stdout.write(self.style.SUCCESS("✅ Database is up-to-date!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Migration check failed: {e}"))
