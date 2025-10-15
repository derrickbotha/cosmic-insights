"""
API Management Serializers
"""
from rest_framework import serializers
from .models import APIKey, APIEndpoint


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['id', 'name', 'key_prefix', 'status', 'rate_limit', 'created_at', 'expires_at', 'total_requests']
        read_only_fields = ['key_prefix', 'created_at', 'total_requests']


class APIEndpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIEndpoint
        fields = ['id', 'path', 'method', 'name', 'category', 'description', 'is_public', 'requires_admin', 'rate_limit']
