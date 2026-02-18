from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

from .models import Image, SearchHistory
from .serializers import ImageSerializer
from .utils import extract_features, features_to_json, search_similar_images
from .permissions import IsOwner, IsAdmin
from .gpu_status import get_gpu_status
from users.models import User


# =====================================================================
# 📸 Upload Image View
# =====================================================================

class ImageUploadView(generics.CreateAPIView):
    """Upload an image, extract features, and save to DB."""
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    serializer_class = ImageSerializer

    def create(self, request, *args, **kwargs):
        if 'image' not in request.FILES:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.FILES['image']

        # Validate image type
        if not image_file.content_type.startswith('image/'):
            return Response({'error': 'File must be an image.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Extract CLIP or CNN features (GPU if available)
            features = extract_features(image_file)
            features_json = features_to_json(features)

            # Reset file pointer
            image_file.seek(0)

            # Save image record
            image = Image.objects.create(
                user=request.user,
                image=image_file,
                filename=image_file.name,
                feature_vector=features_json,
            )

            serializer = self.get_serializer(image, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Error processing image: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =====================================================================
# 🖼️ List Images View
# =====================================================================
class ImageListView(generics.ListAPIView):
    """List user's images (or all if admin)."""
    permission_classes = [IsAuthenticated]
    serializer_class = ImageSerializer

    def get_queryset(self):
        user = self.request.user
        print(f"📸 Listing images for: {user.username} (role={getattr(user, 'role', '')}, staff={user.is_staff}, super={user.is_superuser})")

        # ✅ Allow admins/staff/custom-role admins to see all images
        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False) or getattr(user, "role", "") == "admin":
            return Image.objects.all().order_by('-uploaded_at')

        # ✅ Normal users see only their images
        return Image.objects.filter(user=user).order_by('-uploaded_at')

    def get_serializer_context(self):
        """Add request context for full image URLs."""
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


# =====================================================================
# 🗑️ Retrieve / Delete Image View
# =====================================================================

class ImageDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve or delete a specific image."""
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = ImageSerializer

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False) or getattr(user, "role", "") == "admin":
            return Image.objects.all()

        return Image.objects.filter(user=user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


# =====================================================================
# 🔍 Image Search View
# =====================================================================
from api.models import DatasetImage, Image
import numpy as np
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_view(request):
    """Search across dataset and uploaded images for visually similar matches."""
    if 'image' not in request.FILES:
        return Response({'error': 'No query image provided.'}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    top_k = min(int(request.data.get('top_k', 10)), 200)  # prevent huge queries

    if not image_file.content_type.startswith('image/'):
        return Response({'error': 'File must be an image.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Step 1: Extract and normalize query features
        query_features = np.array(extract_features(image_file)).astype(np.float32)
        query_features /= np.linalg.norm(query_features)

        all_results = []

        # Step 2: Search in user-uploaded images (Image table)
        for user_img in Image.objects.exclude(feature_vector__isnull=True):
            try:
                fv = np.array(eval(user_img.feature_vector)).astype(np.float32)
                fv /= np.linalg.norm(fv)
                sim = float(np.dot(query_features, fv))
                all_results.append({
                    "filename": user_img.filename,
                    "folder": "user_uploads",
                    "image_url": request.build_absolute_uri(user_img.image.url),
                    "score": round(sim * 100, 2)
                })
            except Exception:
                continue

        # Step 3: Search in preloaded dataset images (DatasetImage table)
        for dataset_img in DatasetImage.objects.exclude(feature_vector__isnull=True):
            try:
                fv = np.array(dataset_img.feature_vector).astype(np.float32)
                fv /= np.linalg.norm(fv)
                sim = float(np.dot(query_features, fv))
                folder_name = os.path.dirname(dataset_img.filename).replace("\\", "/")
                all_results.append({
                    "filename": dataset_img.filename.replace("\\", "/"),
                    "folder": folder_name.split("/")[-1] if "/" in folder_name else folder_name,
                    "image_url": request.build_absolute_uri(dataset_img.image.url),
                    "score": round(sim * 100, 2)
                })
            except Exception:
                continue

        # Step 4: Sort by similarity
        all_results = sorted(all_results, key=lambda x: x['score'], reverse=True)[:top_k]

        # Step 5: Save search history
        SearchHistory.objects.create(user=request.user, results_count=len(all_results))

        return Response({"results": all_results, "count": len(all_results)})

    except Exception as e:
        return Response({'error': f'Error during search: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =====================================================================
# 📊 System Statistics (Admin Only)
# =====================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def stats_view(request):
    """Return admin-only system and usage stats."""
    gpu_status = get_gpu_status()

    total_users = User.objects.count()
    total_images = Image.objects.count()
    total_searches = SearchHistory.objects.count()

    # Past 7 days activity
    week_ago = timezone.now() - timedelta(days=7)
    recent_uploads = Image.objects.filter(uploaded_at__gte=week_ago).count()
    recent_searches = SearchHistory.objects.filter(searched_at__gte=week_ago).count()

    users_by_role = User.objects.values('role').annotate(count=Count('id'))

    return Response({
        'gpu': {
            'available': gpu_status['gpu_available'],
            'name': gpu_status['gpu_name'],
        },
        'users': {
            'total': total_users,
            'by_role': list(users_by_role),
        },
        'images': {
            'total': total_images,
            'recent_uploads': recent_uploads,
        },
        'searches': {
            'total': total_searches,
            'recent': recent_searches,
        },
    })
