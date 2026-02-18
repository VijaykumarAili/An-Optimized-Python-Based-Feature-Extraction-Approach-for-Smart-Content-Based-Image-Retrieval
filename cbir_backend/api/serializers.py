from rest_framework import serializers
from .models import Image, SearchHistory


class ImageSerializer(serializers.ModelSerializer):
    """Serializer for Image model."""
    user = serializers.StringRelatedField(read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Image
        fields = ('id', 'user', 'image', 'image_url', 'filename', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at', 'user')
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class SearchResultSerializer(serializers.Serializer):
    """Serializer for search results."""
    image_id = serializers.IntegerField()
    similarity = serializers.FloatField()
    distance = serializers.FloatField()
    image = ImageSerializer(read_only=True)


class SearchHistorySerializer(serializers.ModelSerializer):
    """Serializer for search history."""
    class Meta:
        model = SearchHistory
        fields = ('id', 'results_count', 'searched_at')
        read_only_fields = ('id', 'searched_at')

