from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import User
from .serializers import UserSerializer, RegisterSerializer
from .permissions import IsAdmin


# ✅ CORRECT WAY TO DISABLE CSRF FOR CLASS-BASED VIEW
@method_decorator(csrf_exempt, name="dispatch")
class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


# ✅ FUNCTION-BASED VIEW → csrf_exempt is OK here
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint."""
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_view(request):
    """Get current user info."""
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def promote_user_view(request, user_id):
    """Promote user to admin (admin-only)."""
    try:
        user = User.objects.get(id=user_id)
        user.role = "admin"
        user.save()
        return Response(
            {
                "message": f"User {user.username} promoted to admin.",
                "user": UserSerializer(user).data,
            }
        )
    except User.DoesNotExist:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
