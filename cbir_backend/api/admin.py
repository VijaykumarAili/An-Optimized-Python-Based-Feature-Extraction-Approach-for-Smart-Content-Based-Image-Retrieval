from django.contrib import admin
from .models import Image, SearchHistory


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ('filename', 'user', 'uploaded_at')
    list_filter = ('uploaded_at', 'user')
    search_fields = ('filename', 'user__username')


@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'results_count', 'searched_at')
    list_filter = ('searched_at',)
    search_fields = ('user__username',)

