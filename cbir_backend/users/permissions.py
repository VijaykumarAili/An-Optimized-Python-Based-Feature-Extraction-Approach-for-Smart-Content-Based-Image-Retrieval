from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission class for admin-only access."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin()


class IsOwner(permissions.BasePermission):
    """Permission class for object owner access."""
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or request.user.is_admin()

