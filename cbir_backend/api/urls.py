from django.urls import path
from .views import (
    ImageUploadView, ImageListView, ImageDetailView,
    search_view, stats_view
)

urlpatterns = [
    path('upload/', ImageUploadView.as_view(), name='image-upload'),
    path('list/', ImageListView.as_view(), name='image-list'),
    path('<int:pk>/', ImageDetailView.as_view(), name='image-detail'),
]

