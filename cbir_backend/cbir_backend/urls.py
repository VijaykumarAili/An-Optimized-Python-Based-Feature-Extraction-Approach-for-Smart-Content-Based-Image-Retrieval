"""
URL configuration for cbir_backend project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework import permissions
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from api.views import search_view, stats_view

# =========================
# Swagger configuration
# =========================
schema_view = get_schema_view(
    openapi.Info(
        title="VisionFind CBIR API",
        default_version="v1",
        description="Content-Based Image Retrieval System API",
        contact=openapi.Contact(email="contact@visionfind.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# =========================
# URL patterns
# =========================
urlpatterns = [
    # 🔧 Admin
    path("admin/", admin.site.urls),

    # 🔐 JWT Authentication
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 👤 User Auth (register, login, profile, promote)
    path("api/auth/", include("users.urls")),

    # 🖼 Image APIs
    path("api/images/", include("api.urls")),

    # 🔍 Search & Stats
    path("api/search/", search_view, name="search"),
    path("api/stats/", stats_view, name="stats"),

    # 📘 API Documentation
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="redoc"),
]

# =========================
# Static & Media (DEV only)
# =========================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
