"""
API Management Models
Manages API keys, endpoints, rate limits, and access controls
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import secrets
import hashlib


class APIKey(models.Model):
    """API Key model for third-party integrations"""
    
    KEY_TYPES = [
        ('read', 'Read Only'),
        ('write', 'Read & Write'),
        ('admin', 'Administrative'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('revoked', 'Revoked'),
        ('expired', 'Expired'),
    ]
    
    name = models.CharField(max_length=200, help_text="Descriptive name for this API key")
    key = models.CharField(max_length=64, unique=True, editable=False)
    key_prefix = models.CharField(max_length=8, editable=False)
    hashed_key = models.CharField(max_length=64, editable=False)
    
    key_type = models.CharField(max_length=10, choices=KEY_TYPES, default='read')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Rate limiting
    rate_limit = models.IntegerField(default=1000, help_text="Requests per hour")
    current_usage = models.IntegerField(default=0)
    usage_reset_at = models.DateTimeField(default=timezone.now)
    
    # IP restrictions
    allowed_ips = models.TextField(blank=True, help_text="Comma-separated list of allowed IP addresses")
    
    # Scope restrictions
    allowed_endpoints = models.TextField(blank=True, help_text="Comma-separated list of allowed endpoints (e.g., /api/users, /api/ml)")
    
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"
    
    def __str__(self):
        return f"{self.name} ({self.key_prefix}...)"
    
    def save(self, *args, **kwargs):
        if not self.key:
            # Generate new API key
            self.key = secrets.token_urlsafe(32)
            self.key_prefix = self.key[:8]
            self.hashed_key = hashlib.sha256(self.key.encode()).hexdigest()
        super().save(*args, **kwargs)
    
    def is_valid(self):
        """Check if API key is valid and not expired"""
        if self.status != 'active':
            return False
        if self.expires_at and self.expires_at < timezone.now():
            self.status = 'expired'
            self.save()
            return False
        return True
    
    def check_rate_limit(self):
        """Check if rate limit is exceeded"""
        if self.usage_reset_at < timezone.now():
            # Reset usage counter
            self.current_usage = 0
            self.usage_reset_at = timezone.now() + timezone.timedelta(hours=1)
            self.save()
        
        return self.current_usage < self.rate_limit
    
    def increment_usage(self):
        """Increment usage counter"""
        self.current_usage += 1
        self.last_used = timezone.now()
        self.save()


class APIEndpoint(models.Model):
    """Registry of all available API endpoints"""
    
    METHOD_CHOICES = [
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
    ]
    
    SERVICE_CHOICES = [
        ('backend', 'Backend API'),
        ('ml', 'ML Service'),
    ]
    
    name = models.CharField(max_length=200)
    path = models.CharField(max_length=500, unique=True)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    service = models.CharField(max_length=20, choices=SERVICE_CHOICES)
    
    description = models.TextField()
    request_example = models.JSONField(null=True, blank=True)
    response_example = models.JSONField(null=True, blank=True)
    
    requires_auth = models.BooleanField(default=True)
    requires_admin = models.BooleanField(default=False)
    
    is_public = models.BooleanField(default=False)
    is_deprecated = models.BooleanField(default=False)
    
    # Analytics
    total_calls = models.IntegerField(default=0)
    average_response_time = models.FloatField(default=0)
    last_called = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['service', 'path']
        verbose_name = "API Endpoint"
        verbose_name_plural = "API Endpoints"
    
    def __str__(self):
        return f"{self.method} {self.path}"


class APILog(models.Model):
    """API call logs for monitoring and debugging"""
    
    api_key = models.ForeignKey(APIKey, on_delete=models.SET_NULL, null=True, blank=True)
    endpoint = models.ForeignKey(APIEndpoint, on_delete=models.SET_NULL, null=True, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    
    request_headers = models.JSONField(null=True, blank=True)
    request_body = models.JSONField(null=True, blank=True)
    response_status = models.IntegerField()
    response_time = models.FloatField(help_text="Response time in milliseconds")
    
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "API Log"
        verbose_name_plural = "API Logs"
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['api_key', '-timestamp']),
            models.Index(fields=['endpoint', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.method} {self.path} - {self.response_status} ({self.timestamp})"
