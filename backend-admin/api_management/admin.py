"""
API Management Admin Interface
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import render
from django.http import JsonResponse
from .models import APIKey, APIEndpoint, APIUsageLog
import secrets


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ['name', 'key_prefix_display', 'status', 'rate_limit', 'total_requests', 'created_at', 'expires_at', 'actions_display']
    list_filter = ['status', 'created_at', 'expires_at']
    search_fields = ['name', 'description', 'key_prefix']
    readonly_fields = ['key_hash', 'key_prefix', 'created_at', 'last_used_at', 'total_requests', 'created_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'created_by')
        }),
        ('Key Details', {
            'fields': ('key_prefix', 'key_hash', 'status')
        }),
        ('Permissions', {
            'fields': ('allowed_endpoints', 'rate_limit')
        }),
        ('Usage Statistics', {
            'fields': ('total_requests', 'last_used_at')
        }),
        ('Expiration', {
            'fields': ('created_at', 'expires_at')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )
    
    def key_prefix_display(self, obj):
        return format_html(
            '<code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">{}</code>',
            f"{obj.key_prefix}..."
        )
    key_prefix_display.short_description = 'Key Prefix'
    
    def actions_display(self, obj):
        if obj.status == 'active':
            return format_html(
                '<a class="button" href="{}">Revoke</a>',
                f'/admin/api_management/apikey/{obj.id}/revoke/'
            )
        return '-'
    actions_display.short_description = 'Actions'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new API key
            obj.created_by = request.user
            raw_key = APIKey.generate_key()
            obj.key_prefix = raw_key[:8]
            obj.key_hash = APIKey.hash_key(raw_key)
            obj.save()
            # Show the key to the user (only once)
            self.message_user(request, f"API Key created: {raw_key} - Save this key, it won't be shown again!", level='success')
        else:
            obj.save()
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:pk>/revoke/', self.admin_site.admin_view(self.revoke_key), name='revoke_apikey'),
        ]
        return custom_urls + urls
    
    def revoke_key(self, request, pk):
        """Revoke an API key"""
        api_key = APIKey.objects.get(pk=pk)
        api_key.status = 'revoked'
        api_key.save()
        self.message_user(request, f"API Key '{api_key.name}' has been revoked.")
        return JsonResponse({'status': 'success'})


@admin.register(APIEndpoint)
class APIEndpointAdmin(admin.ModelAdmin):
    list_display = ['method_badge', 'path', 'name', 'category', 'is_active', 'rate_limit', 'requires_admin', 'updated_at']
    list_filter = ['method', 'category', 'is_active', 'is_public', 'requires_admin']
    search_fields = ['path', 'name', 'description']
    
    fieldsets = (
        ('Endpoint Details', {
            'fields': ('path', 'method', 'name', 'category', 'description')
        }),
        ('Access Control', {
            'fields': ('is_active', 'is_public', 'requires_admin', 'rate_limit')
        }),
        ('Schemas', {
            'fields': ('request_schema', 'response_schema'),
            'classes': ('collapse',)
        }),
    )
    
    def method_badge(self, obj):
        colors = {
            'GET': '#28a745',
            'POST': '#007bff',
            'PUT': '#ffc107',
            'PATCH': '#17a2b8',
            'DELETE': '#dc3545',
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.method, '#6c757d'),
            obj.method
        )
    method_badge.short_description = 'Method'


@admin.register(APIUsageLog)
class APIUsageLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'method', 'path', 'status_badge', 'response_time_ms', 'ip_address', 'api_key']
    list_filter = ['method', 'status_code', 'timestamp']
    search_fields = ['path', 'ip_address', 'user_agent']
    readonly_fields = ['api_key', 'endpoint', 'method', 'path', 'status_code', 'response_time_ms', 'ip_address', 'user_agent', 'timestamp', 'error_message']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def status_badge(self, obj):
        color = '#28a745' if obj.status_code < 300 else '#ffc107' if obj.status_code < 400 else '#dc3545'
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.status_code
        )
    status_badge.short_description = 'Status'
    
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        # Add usage statistics
        from django.db.models import Count, Avg
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        
        stats = {
            'total_requests_24h': APIUsageLog.objects.filter(timestamp__gte=last_24h).count(),
            'avg_response_time_24h': APIUsageLog.objects.filter(timestamp__gte=last_24h).aggregate(Avg('response_time_ms'))['response_time_ms__avg'] or 0,
            'error_rate_24h': APIUsageLog.objects.filter(timestamp__gte=last_24h, status_code__gte=400).count(),
        }
        extra_context['stats'] = stats
        return super().changelist_view(request, extra_context)
