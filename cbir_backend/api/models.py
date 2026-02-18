from django.db import models
from django.conf import settings
import os


def upload_to(instance, filename):
    """Generate upload path for user-uploaded images."""
    return f'images/{instance.user.id}/{filename}'


class Image(models.Model):
    """Image model with CLIP feature vector storage."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=upload_to)
    filename = models.CharField(max_length=255)
    feature_vector = models.JSONField(null=True, blank=True, help_text="Stores CLIP feature vector")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'images'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.filename} ({self.user.username})"

    def delete(self, *args, **kwargs):
        """Delete image file when model is deleted."""
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)
        super().delete(*args, **kwargs)


class SearchHistory(models.Model):
    """Track image search queries for analytics."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='searches')
    query_image = models.ForeignKey(Image, on_delete=models.SET_NULL, null=True, related_name='query_searches')
    results_count = models.IntegerField(default=0)
    searched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'search_history'
        ordering = ['-searched_at']


class DatasetImage(models.Model):
    """Stores dataset images used for similarity search."""
    image = models.ImageField(upload_to='images/')
    filename = models.CharField(max_length=255, unique=True)
    feature_vector = models.JSONField(null=True, blank=True, help_text="Stores CLIP feature vector")

    def __str__(self):
        return self.filename
