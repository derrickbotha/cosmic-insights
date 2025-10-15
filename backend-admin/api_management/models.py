"""
API Management Models
Stores API keys, usage statistics, and access control
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import secrets
import hashlib


class APIKey(models.Model):
    """
    API Key model for external service authentication
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('revoked', 'Revoked'),
        ('expired', 'Expired'),
    ]
    
    name = models.CharField(max_length=255, help_text="Friendly name for this API key")
    key_hash = models.CharField(max_length=64, unique=True, help_text="SHA-256 hash of the API key")
    key_prefix = models.CharField(max_length=8, help_text="First 8 characters of the key for identification")
    
    # Owner
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Permissions
    allowed_endpoints = models.JSONField(default=list, help_text="List of allowed endpoint patterns")
    rate_limit = models.IntegerField(default=1000, help_text="Requests per hour")
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Expiration date (null = never expires)")
    last_used_at = models.DateTimeField(null=True, blank=True)
    
    # Usage stats
    total_requests = models.IntegerField(default=0)
    
    # Metadata
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, help_text="Additional metadata")
    
    class Meta:
        db_table = 'api_keys'
        ordering = ['-created_at']
        verbose_name = 'API Key'
        verbose_name_plural = 'API Keys'
    
    def __str__(self):
        return f"{self.name} ({self.key_prefix}...)"
    
    @staticmethod
    def generate_key():
        """Generate a new API key"""
        return f"csk_{secrets.token_urlsafe(32)}"
    
    @staticmethod
    def hash_key(key):
        """Hash an API key"""
        return hashlib.sha256(key.encode()).hexdigest()
    
    def is_valid(self):
        """Check if API key is valid"""
        if self.status != 'active':
            return False
        if self.expires_at and self.expires_at < timezone.now():
            self.status = 'expired'
            self.save()
            return False
        return True
    
    def record_usage(self):
        """Record API key usage"""
        self.total_requests += 1
        self.last_used_at = timezone.now()
        self.save(update_fields=['total_requests', 'last_used_at'])


class APIEndpoint(models.Model):
    """
    Backend API Endpoints catalog
    """
    METHOD_CHOICES = [
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
    ]
    
    CATEGORY_CHOICES = [
        ('auth', 'Authentication'),
        ('users', 'User Management'),
        ('analytics', 'Analytics'),
        ('ml', 'Machine Learning'),
        ('admin', 'Administration'),
        ('other', 'Other'),
    ]
    
    # Endpoint details
    path = models.CharField(max_length=500, help_text="API endpoint path (e.g., /api/auth/login)")
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    
    # Documentation
    name = models.CharField(max_length=255, help_text="Human-readable endpoint name")
    description = models.TextField(help_text="What this endpoint does")
    
    # Request/Response
    request_schema = models.JSONField(default=dict, help_text="Expected request body schema")
    response_schema = models.JSONField(default=dict, help_text="Expected response schema")
    
    # Status
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False, help_text="Public (no auth required) endpoint")
    requires_admin = models.BooleanField(default=False)
    
    # Rate limiting
    rate_limit = models.IntegerField(default=100, help_text="Requests per minute")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'api_endpoints'
        ordering = ['category', 'path']
        unique_together = [['path', 'method']]
        verbose_name = 'API Endpoint'
        verbose_name_plural = 'API Endpoints'
    
    def __str__(self):
        return f"{self.method} {self.path}"


class APIUsageLog(models.Model):
    """
    API Usage logging for monitoring and analytics
    """
    # Request details
    api_key = models.ForeignKey(APIKey, on_delete=models.CASCADE, null=True, blank=True, related_name='usage_logs')
    endpoint = models.ForeignKey(APIEndpoint, on_delete=models.CASCADE, null=True, blank=True, related_name='usage_logs')
    
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    
    # Response details
    status_code = models.IntegerField()
    response_time_ms = models.IntegerField(help_text="Response time in milliseconds")
    
    # Client info
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=500, blank=True)
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # Error details
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'api_usage_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp', 'status_code']),
            models.Index(fields=['api_key', 'timestamp']),
        ]
        verbose_name = 'API Usage Log'
        verbose_name_plural = 'API Usage Logs'
    
    def __str__(self):
        return f"{self.method} {self.path} - {self.status_code} ({self.timestamp})"
