from django.urls import path
from .views import (
    RegisterView,
    login_view,
    user_view,
    promote_user_view,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", login_view, name="login"),
    path("user/", user_view, name="user"),
    path("promote/<int:user_id>/", promote_user_view, name="promote"),
]
