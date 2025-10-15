"""
API Management Views
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import APIKey, APIEndpoint, APIUsageLog
from .serializers import APIKeySerializer, APIEndpointSerializer
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta


class APIKeyListView(generics.ListAPIView):
    queryset = APIKey.objects.all()
    serializer_class = APIKeySerializer


class APIKeyCreateView(APIView):
    def post(self, request):
        raw_key = APIKey.generate_key()
        api_key = APIKey.objects.create(
            name=request.data.get('name'),
            key_prefix=raw_key[:8],
            key_hash=APIKey.hash_key(raw_key),
            created_by=request.user,
            rate_limit=request.data.get('rate_limit', 1000),
            description=request.data.get('description', '')
        )
        return Response({
            'api_key': raw_key,
            'prefix': api_key.key_prefix,
            'message': 'Save this key securely - it won\'t be shown again'
        }, status=status.HTTP_201_CREATED)


class APIEndpointListView(generics.ListAPIView):
    queryset = APIEndpoint.objects.filter(is_active=True)
    serializer_class = APIEndpointSerializer


class APIUsageStatsView(APIView):
    def get(self, request):
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)
        
        stats = {
            '24h': {
                'total_requests': APIUsageLog.objects.filter(timestamp__gte=last_24h).count(),
                'avg_response_time': APIUsageLog.objects.filter(timestamp__gte=last_24h).aggregate(Avg('response_time_ms'))['response_time_ms__avg'] or 0,
                'error_count': APIUsageLog.objects.filter(timestamp__gte=last_24h, status_code__gte=400).count(),
            },
            '7d': {
                'total_requests': APIUsageLog.objects.filter(timestamp__gte=last_7d).count(),
                'avg_response_time': APIUsageLog.objects.filter(timestamp__gte=last_7d).aggregate(Avg('response_time_ms'))['response_time_ms__avg'] or 0,
                'error_count': APIUsageLog.objects.filter(timestamp__gte=last_7d, status_code__gte=400).count(),
            },
            'top_endpoints': list(
                APIUsageLog.objects.filter(timestamp__gte=last_24h)
                .values('path', 'method')
                .annotate(count=Count('id'))
                .order_by('-count')[:10]
            )
        }
        return Response(stats)
