"""
Service Manager Admin Configuration
Secure admin interface for managing third-party integrations
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import ServiceIntegration, ExternalAPI, WebhookEvent, ServiceCredential


@admin.register(ServiceIntegration)
class ServiceIntegrationAdmin(admin.ModelAdmin):
    list_display = ['name', 'provider_display', 'service_type_badge', 'status_badge', 'health_display', 'webhook_status', 'last_health_check', 'action_buttons']
    list_filter = ['service_type', 'status', 'provider']
    search_fields = ['name', 'provider', 'api_url']
    readonly_fields = ['created_at', 'updated_at', 'last_health_check', 'health_status', 'api_key_display', 'api_secret_display']
    
    fieldsets = [
        ('Basic Information', {
            'fields': ['name', 'service_type', 'provider', 'status']
        }),
        ('API Connection', {
            'fields': ['api_url', 'api_key_display', 'api_secret_display'],
            'description': '🔒 Credentials are encrypted. Use the secure forms below to update.'
        }),
        ('Configuration', {
            'fields': ['config_json'],
            'classes': ['collapse']
        }),
        ('Webhook Settings', {
            'fields': ['webhook_url', 'webhook_secret'],
            'classes': ['collapse']
        }),
        ('Health & Monitoring', {
            'fields': ['last_health_check', 'health_status', 'error_message'],
            'classes': ['collapse']
        }),
        ('Notes', {
            'fields': ['notes', 'created_by', 'created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    ]
    
    def provider_display(self, obj):
        icons = {
            'Stripe': '💳',
            'SendGrid': '📧',
            'AWS': '☁️',
            'Google': '🔍',
            'OpenAI': '🤖',
        }
        icon = icons.get(obj.provider, '🔌')
        return format_html('{} {}', icon, obj.provider)
    provider_display.short_description = "Provider"
    
    def service_type_badge(self, obj):
        colors = {
            'payment': '#28a745',
            'email': '#007bff',
            'storage': '#ffc107',
            'analytics': '#17a2b8',
            'social': '#e83e8c',
            'ml': '#9333EA',
            'database': '#6c757d',
            'messaging': '#fd7e14',
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            colors.get(obj.service_type, '#6c757d'),
            obj.get_service_type_display()
        )
    service_type_badge.short_description = "Type"
    
    def status_badge(self, obj):
        colors = {
            'active': '#28a745',
            'inactive': '#6c757d',
            'error': '#dc3545',
            'testing': '#ffc107'
        }
        icons = {
            'active': '✓',
            'inactive': '○',
            'error': '✗',
            'testing': '⚙'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 10px; border-radius: 3px;">{} {}</span>',
            colors.get(obj.status, '#6c757d'),
            icons.get(obj.status, '?'),
            obj.status.upper()
        )
    status_badge.short_description = "Status"
    
    def health_display(self, obj):
        if obj.health_status == 'healthy':
            return format_html('<span style="color: #28a745;">💚 Healthy</span>')
        elif obj.health_status == 'degraded':
            return format_html('<span style="color: #ffc107;">💛 Degraded</span>')
        elif obj.health_status == 'down':
            return format_html('<span style="color: #dc3545;">❤️ Down</span>')
        return format_html('<span style="color: #6c757d;">⚪ Unknown</span>')
    health_display.short_description = "Health"
    
    def webhook_status(self, obj):
        if obj.webhook_url:
            return format_html('<span style="color: #28a745;">✓ Configured</span>')
        return format_html('<span style="color: #6c757d;">○ Not Set</span>')
    webhook_status.short_description = "Webhook"
    
    def action_buttons(self, obj):
        return format_html(
            '<a class="button" href="#" onclick="testConnection({}); return false;">Test Connection</a> '
            '<a class="button" href="#" onclick="viewLogs({}); return false;">View Logs</a>',
            obj.pk, obj.pk
        )
    action_buttons.short_description = "Actions"
    
    def api_key_display(self, obj):
        if obj.api_key_encrypted:
            return format_html('<code>••••••••••••</code> <em>(encrypted)</em>')
        return "Not set"
    api_key_display.short_description = "API Key"
    
    def api_secret_display(self, obj):
        if obj.api_secret_encrypted:
            return format_html('<code>••••••••••••</code> <em>(encrypted)</em>')
        return "Not set"
    api_secret_display.short_description = "API Secret"
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ExternalAPI)
class ExternalAPIAdmin(admin.ModelAdmin):
    list_display = ['name', 'service', 'method_badge', 'endpoint_url_short', 'success_rate', 'avg_response', 'total_calls_display', 'is_active']
    list_filter = ['service', 'method', 'is_active']
    search_fields = ['name', 'endpoint_url']
    readonly_fields = ['total_calls', 'successful_calls', 'failed_calls', 'average_response_time']
    
    fieldsets = [
        ('Endpoint Information', {
            'fields': ['service', 'name', 'endpoint_url', 'method', 'description']
        }),
        ('Request Configuration', {
            'fields': ['headers_template', 'request_template'],
            'classes': ['collapse']
        }),
        ('Response Handling', {
            'fields': ['success_status_codes', 'response_mapping'],
            'classes': ['collapse']
        }),
        ('Retry Settings', {
            'fields': ['max_retries', 'retry_delay']
        }),
        ('Statistics', {
            'fields': ['total_calls', 'successful_calls', 'failed_calls', 'average_response_time'],
            'classes': ['collapse']
        }),
        ('Status', {
            'fields': ['is_active']
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
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.method, '#6c757d'),
            obj.method
        )
    method_badge.short_description = "Method"
    
    def endpoint_url_short(self, obj):
        url = obj.endpoint_url
        return url[:50] + '...' if len(url) > 50 else url
    endpoint_url_short.short_description = "Endpoint URL"
    
    def success_rate(self, obj):
        if obj.total_calls == 0:
            return "-"
        rate = (obj.successful_calls / obj.total_calls * 100)
        color = '#28a745' if rate >= 95 else '#ffc107' if rate >= 80 else '#dc3545'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, rate
        )
    success_rate.short_description = "Success Rate"
    
    def avg_response(self, obj):
        if obj.average_response_time > 2000:
            color = '#dc3545'
        elif obj.average_response_time > 1000:
            color = '#ffc107'
        else:
            color = '#28a745'
        return format_html(
            '<span style="color: {};">{:.0f}ms</span>',
            color, obj.average_response_time
        )
    avg_response.short_description = "Avg Response"
    
    def total_calls_display(self, obj):
        return format_html('<strong>{:,}</strong>', obj.total_calls)
    total_calls_display.short_description = "Calls"


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ['received_at', 'service', 'event_type', 'processed_badge', 'signature_badge', 'view_payload']
    list_filter = ['service', 'processed', 'signature_valid', 'received_at']
    search_fields = ['event_type', 'payload']
    readonly_fields = ['service', 'event_type', 'payload', 'headers', 'received_at', 'processed_at', 'processing_result', 'error_message', 'signature_valid']
    date_hierarchy = 'received_at'
    
    def has_add_permission(self, request):
        return False  # Webhooks are received automatically
    
    def has_change_permission(self, request, obj=None):
        return False  # Webhooks are read-only
    
    def processed_badge(self, obj):
        if obj.processed:
            return format_html('<span style="color: #28a745;">✓ Processed</span>')
        return format_html('<span style="color: #ffc107;">⏳ Pending</span>')
    processed_badge.short_description = "Status"
    
    def signature_badge(self, obj):
        if obj.signature_valid:
            return format_html('<span style="color: #28a745;">🔒 Valid</span>')
        return format_html('<span style="color: #dc3545;">⚠️ Invalid</span>')
    signature_badge.short_description = "Signature"
    
    def view_payload(self, obj):
        return format_html(
            '<a class="button" href="#" onclick="viewPayload({}); return false;">View Details</a>',
            obj.pk
        )
    view_payload.short_description = "Actions"


@admin.register(ServiceCredential)
class ServiceCredentialAdmin(admin.ModelAdmin):
    list_display = ['name', 'credential_type_badge', 'service', 'expiration_status', 'last_rotated', 'created_by']
    list_filter = ['credential_type', 'service']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'last_rotated', 'value_display']
    
    fieldsets = [
        ('Credential Information', {
            'fields': ['name', 'credential_type', 'service', 'description']
        }),
        ('Secure Value', {
            'fields': ['value_display'],
            'description': '🔒 The actual credential value is encrypted and cannot be displayed.'
        }),
        ('Expiration & Rotation', {
            'fields': ['expires_at', 'last_rotated']
        }),
        ('Metadata', {
            'fields': ['created_by', 'created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    ]
    
    def credential_type_badge(self, obj):
        icons = {
            'api_key': '🔑',
            'oauth_token': '🎫',
            'ssh_key': '🔐',
            'certificate': '📜',
            'password': '🔒',
            'connection_string': '🔗',
        }
        return format_html(
            '{} {}',
            icons.get(obj.credential_type, '🔑'),
            obj.get_credential_type_display()
        )
    credential_type_badge.short_description = "Type"
    
    def expiration_status(self, obj):
        if not obj.expires_at:
            return format_html('<span style="color: #6c757d;">No Expiration</span>')
        
        if obj.expires_at < timezone.now():
            return format_html('<span style="color: #dc3545;">❌ Expired</span>')
        elif obj.expires_at < timezone.now() + timezone.timedelta(days=30):
            return format_html('<span style="color: #ffc107;">⚠️ Expires Soon</span>')
        return format_html('<span style="color: #28a745;">✓ Valid</span>')
    expiration_status.short_description = "Status"
    
    def value_display(self, obj):
        return format_html('<code>••••••••••••••••</code> <em>(encrypted)</em>')
    value_display.short_description = "Encrypted Value"
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
