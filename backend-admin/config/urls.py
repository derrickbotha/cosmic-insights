"""
URL configuration for Backend Admin Service
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI schema
schema_view = get_schema_view(
    openapi.Info(
        title="Backend API Management",
        default_version='v1',
        description="Admin interface for managing Backend API (Node.js) endpoints, API keys, and service connections",
        terms_of_service="https://www.cosmicinsights.com/terms/",
        contact=openapi.Contact(email="admin@cosmicinsights.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API Management
    path('api/management/', include('api_management.urls')),
    
    # Service Manager
    path('api/services/', include('service_manager.urls')),
    
    # Endpoint Explorer
    path('api/explorer/', include('endpoint_explorer.urls')),
    
    # Swagger/OpenAPI Documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # DRF Browsable API
    path('api-auth/', include('rest_framework.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize admin site
admin.site.site_header = "Cosmic Insights - Backend API Admin"
admin.site.site_title = "Backend Admin Portal"
admin.site.index_title = "Manage Backend API & Services"
