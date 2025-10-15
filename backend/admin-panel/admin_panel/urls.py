"""
URL configuration for Backend API Admin Panel.
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
        title="Cosmic Insights Backend API",
        default_version='v1',
        description="""
        Comprehensive API Management Interface for Cosmic Insights
        
        Features:
        - User Management & Authentication
        - API Key Generation & Management
        - Service Integration Management
        - ML Model Deployment & Monitoring
        - Real-time Analytics & Logs
        - Secure Third-party API Connections
        """,
        terms_of_service="https://www.cosmicinsights.com/terms/",
        contact=openapi.Contact(email="admin@cosmicinsights.com"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Management
    path('api/', include('api_management.urls')),
    path('api/services/', include('service_manager.urls')),
    path('api/users/', include('user_management.urls')),
    
    # API Documentation - Swagger UI
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='api-docs'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='api-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='api-schema'),
    
    # Authentication
    path('api-auth/', include('rest_framework.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin site
admin.site.site_header = settings.ADMIN_SITE_HEADER
admin.site.site_title = settings.ADMIN_SITE_TITLE
admin.site.index_title = settings.ADMIN_INDEX_TITLE
