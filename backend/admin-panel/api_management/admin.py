"""
API Management Admin Configuration
Beautiful admin interface for managing API keys, endpoints, and logs
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import APIKey, APIEndpoint, APILog


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ['name', 'key_prefix_display', 'key_type', 'status_badge', 'rate_limit_display', 'created_at', 'expires_at', 'actions_column']
    list_filter = ['key_type', 'status', 'created_at']
    search_fields = ['name', 'key_prefix', 'created_by__username']
    readonly_fields = ['key', 'key_prefix', 'hashed_key', 'created_at', 'last_used', 'current_usage', 'usage_reset_at', 'key_display']
    
    fieldsets = [
        ('Basic Information', {
            'fields': ['name', 'key_type', 'status', 'created_by']
        }),
        ('API Key', {
            'fields': ['key_display', 'key_prefix', 'hashed_key'],
            'classes': ['collapse']
        }),
        ('Permissions & Limits', {
            'fields': ['rate_limit', 'allowed_endpoints', 'allowed_ips']
        }),
        ('Usage Statistics', {
            'fields': ['current_usage', 'usage_reset_at', 'last_used'],
            'classes': ['collapse']
        }),
        ('Expiration', {
            'fields': ['expires_at']
        }),
        ('Notes', {
            'fields': ['notes'],
            'classes': ['collapse']
        }),
    ]
    
    def key_prefix_display(self, obj):
        return f"{obj.key_prefix}..."
    key_prefix_display.short_description = "Key Prefix"
    
    def key_display(self, obj):
        """Display full key only once after creation"""
        if obj.key and obj.pk:
            return format_html(
                '<div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">'
                '<strong>⚠️ Save this key now! It won\'t be shown again.</strong><br>'
                '<code style="color: #d63031;">{}</code>'
                '</div>',
                obj.key
            )
        return "Key will be generated after saving"
    key_display.short_description = "Full API Key"
    
    def status_badge(self, obj):
        colors = {
            'active': '#28a745',
            'revoked': '#dc3545',
            'expired': '#ffc107'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#6c757d'),
            obj.status.upper()
        )
    status_badge.short_description = "Status"
    
    def rate_limit_display(self, obj):
        percentage = (obj.current_usage / obj.rate_limit * 100) if obj.rate_limit > 0 else 0
        color = '#28a745' if percentage < 70 else '#ffc107' if percentage < 90 else '#dc3545'
        return format_html(
            '<div style="width: 100px;">'
            '<div style="background: #e9ecef; border-radius: 3px; overflow: hidden;">'
            '<div style="width: {}%; background: {}; padding: 2px 5px; color: white; font-size: 11px;">{}/{}</div>'
            '</div>'
            '</div>',
            percentage, color, obj.current_usage, obj.rate_limit
        )
    rate_limit_display.short_description = "Rate Limit"
    
    def actions_column(self, obj):
        if obj.status == 'active':
            return format_html(
                '<a class="button" href="#" onclick="if(confirm(\'Revoke this API key?\')){{ /* Add revoke logic */ }} return false;">Revoke</a>'
            )
        return "-"
    actions_column.short_description = "Actions"
    
    def save_model(self, request, obj, form, change):
        if not change:  # New object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(APIEndpoint)
class APIEndpointAdmin(admin.ModelAdmin):
    list_display = ['name', 'method_badge', 'path', 'service_badge', 'auth_display', 'calls_display', 'avg_response_time', 'status_display']
    list_filter = ['service', 'method', 'requires_auth', 'requires_admin', 'is_public', 'is_deprecated']
    search_fields = ['name', 'path', 'description']
    readonly_fields = ['total_calls', 'average_response_time', 'last_called', 'created_at', 'updated_at']
    
    fieldsets = [
        ('Endpoint Information', {
            'fields': ['name', 'service', 'method', 'path', 'description']
        }),
        ('Security', {
            'fields': ['requires_auth', 'requires_admin', 'is_public']
        }),
        ('Documentation', {
            'fields': ['request_example', 'response_example'],
            'classes': ['collapse']
        }),
        ('Analytics', {
            'fields': ['total_calls', 'average_response_time', 'last_called'],
            'classes': ['collapse']
        }),
        ('Status', {
            'fields': ['is_deprecated']
        }),
    ]
    
    def method_badge(self, obj):
        colors = {
            'GET': '#007bff',
            'POST': '#28a745',
            'PUT': '#ffc107',
            'PATCH': '#17a2b8',
            'DELETE': '#dc3545'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold; font-size: 11px;">{}</span>',
            colors.get(obj.method, '#6c757d'),
            obj.method
        )
    method_badge.short_description = "Method"
    
    def service_badge(self, obj):
        colors = {'backend': '#4F46E5', 'ml': '#9333EA'}
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            colors.get(obj.service, '#6c757d'),
            obj.service.upper()
        )
    service_badge.short_description = "Service"
    
    def auth_display(self, obj):
        if obj.requires_admin:
            return format_html('<span style="color: #dc3545;">🔒 Admin</span>')
        elif obj.requires_auth:
            return format_html('<span style="color: #ffc107;">🔐 Auth</span>')
        return format_html('<span style="color: #28a745;">🌐 Public</span>')
    auth_display.short_description = "Access"
    
    def calls_display(self, obj):
        return format_html('<strong>{:,}</strong>', obj.total_calls)
    calls_display.short_description = "Total Calls"
    
    def avg_response_time(self, obj):
        if obj.average_response_time > 1000:
            color = '#dc3545'
        elif obj.average_response_time > 500:
            color = '#ffc107'
        else:
            color = '#28a745'
        return format_html(
            '<span style="color: {};">{:.2f}ms</span>',
            color, obj.average_response_time
        )
    avg_response_time.short_description = "Avg Response"
    
    def status_display(self, obj):
        if obj.is_deprecated:
            return format_html('<span style="color: #dc3545;">⚠️ Deprecated</span>')
        return format_html('<span style="color: #28a745;">✓ Active</span>')
    status_display.short_description = "Status"


@admin.register(APILog)
class APILogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'method_badge', 'path_short', 'status_badge', 'response_time_display', 'ip_address', 'api_key_display']
    list_filter = ['method', 'response_status', 'timestamp']
    search_fields = ['path', 'ip_address', 'api_key__name']
    readonly_fields = ['timestamp', 'method', 'path', 'request_headers', 'request_body', 'response_status', 'response_time', 'ip_address', 'user_agent', 'error_message']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False  # Logs are created automatically
    
    def has_change_permission(self, request, obj=None):
        return False  # Logs are read-only
    
    def method_badge(self, obj):
        colors = {
            'GET': '#007bff',
            'POST': '#28a745',
            'PUT': '#ffc107',
            'PATCH': '#17a2b8',
            'DELETE': '#dc3545'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">{}</span>',
            colors.get(obj.method, '#6c757d'),
            obj.method
        )
    method_badge.short_description = "Method"
    
    def path_short(self, obj):
        return obj.path[:50] + '...' if len(obj.path) > 50 else obj.path
    path_short.short_description = "Path"
    
    def status_badge(self, obj):
        if 200 <= obj.response_status < 300:
            color = '#28a745'
        elif 300 <= obj.response_status < 400:
            color = '#17a2b8'
        elif 400 <= obj.response_status < 500:
            color = '#ffc107'
        else:
            color = '#dc3545'
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.response_status
        )
    status_badge.short_description = "Status"
    
    def response_time_display(self, obj):
        if obj.response_time > 1000:
            color = '#dc3545'
            icon = '🐌'
        elif obj.response_time > 500:
            color = '#ffc107'
            icon = '⚠️'
        else:
            color = '#28a745'
            icon = '⚡'
        return format_html(
            '<span style="color: {};">{} {:.2f}ms</span>',
            color, icon, obj.response_time
        )
    response_time_display.short_description = "Response Time"
    
    def api_key_display(self, obj):
        if obj.api_key:
            return obj.api_key.name
        return "-"
    api_key_display.short_description = "API Key"
