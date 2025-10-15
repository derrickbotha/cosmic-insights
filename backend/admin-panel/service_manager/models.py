"""
Service Manager Models
Manages third-party service integrations, API connections, and webhooks
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import URLValidator
from cryptography.fernet import Fernet
import os


class ServiceIntegration(models.Model):
    """Third-party service integrations"""
    
    SERVICE_TYPES = [
        ('payment', 'Payment Gateway'),
        ('email', 'Email Service'),
        ('storage', 'Cloud Storage'),
        ('analytics', 'Analytics'),
        ('social', 'Social Media'),
        ('ml', 'ML/AI Service'),
        ('database', 'Database'),
        ('messaging', 'Messaging'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('error', 'Error'),
        ('testing', 'Testing'),
    ]
    
    name = models.CharField(max_length=200)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    provider = models.CharField(max_length=100, help_text="e.g., Stripe, SendGrid, AWS")
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='inactive')
    
    # Connection details
    api_url = models.URLField(blank=True)
    api_key_encrypted = models.BinaryField(blank=True)
    api_secret_encrypted = models.BinaryField(blank=True)
    
    # Additional configuration
    config_json = models.JSONField(default=dict, blank=True, help_text="Additional configuration parameters")
    
    # Webhook settings
    webhook_url = models.URLField(blank=True, help_text="URL for incoming webhooks from this service")
    webhook_secret = models.CharField(max_length=255, blank=True)
    
    # Health check
    last_health_check = models.DateTimeField(null=True, blank=True)
    health_status = models.CharField(max_length=50, blank=True)
    error_message = models.TextField(blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['service_type', 'name']
        verbose_name = "Service Integration"
        verbose_name_plural = "Service Integrations"
    
    def __str__(self):
        return f"{self.name} ({self.provider})"
    
    def encrypt_value(self, value):
        """Encrypt sensitive data"""
        if not value:
            return b''
        key = os.getenv('ENCRYPTION_KEY', Fernet.generate_key())
        f = Fernet(key)
        return f.encrypt(value.encode())
    
    def decrypt_value(self, encrypted_value):
        """Decrypt sensitive data"""
        if not encrypted_value:
            return ''
        key = os.getenv('ENCRYPTION_KEY', Fernet.generate_key())
        f = Fernet(key)
        return f.decrypt(encrypted_value).decode()
    
    def set_api_key(self, api_key):
        """Set and encrypt API key"""
        self.api_key_encrypted = self.encrypt_value(api_key)
    
    def get_api_key(self):
        """Get and decrypt API key"""
        return self.decrypt_value(self.api_key_encrypted)
    
    def set_api_secret(self, api_secret):
        """Set and encrypt API secret"""
        self.api_secret_encrypted = self.encrypt_value(api_secret)
    
    def get_api_secret(self):
        """Get and decrypt API secret"""
        return self.decrypt_value(self.api_secret_encrypted)


class ExternalAPI(models.Model):
    """External API endpoints for service integrations"""
    
    service = models.ForeignKey(ServiceIntegration, on_delete=models.CASCADE, related_name='endpoints')
    
    name = models.CharField(max_length=200)
    endpoint_url = models.URLField()
    method = models.CharField(max_length=10, choices=[
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
    ])
    
    description = models.TextField(blank=True)
    
    # Request configuration
    headers_template = models.JSONField(default=dict, blank=True)
    request_template = models.JSONField(default=dict, blank=True)
    
    # Response handling
    success_status_codes = models.CharField(max_length=50, default='200,201,204')
    response_mapping = models.JSONField(default=dict, blank=True, help_text="Map response fields to internal fields")
    
    # Retry configuration
    max_retries = models.IntegerField(default=3)
    retry_delay = models.IntegerField(default=1000, help_text="Delay in milliseconds")
    
    # Statistics
    total_calls = models.IntegerField(default=0)
    successful_calls = models.IntegerField(default=0)
    failed_calls = models.IntegerField(default=0)
    average_response_time = models.FloatField(default=0)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['service', 'name']
        verbose_name = "External API Endpoint"
        verbose_name_plural = "External API Endpoints"
    
    def __str__(self):
        return f"{self.service.name} - {self.name}"


class WebhookEvent(models.Model):
    """Incoming webhook events from external services"""
    
    service = models.ForeignKey(ServiceIntegration, on_delete=models.CASCADE, related_name='webhook_events')
    
    event_type = models.CharField(max_length=100)
    payload = models.JSONField()
    headers = models.JSONField(default=dict)
    
    received_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    processing_result = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    
    signature_valid = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-received_at']
        verbose_name = "Webhook Event"
        verbose_name_plural = "Webhook Events"
        indexes = [
            models.Index(fields=['-received_at']),
            models.Index(fields=['service', 'processed']),
        ]
    
    def __str__(self):
        return f"{self.service.name} - {self.event_type} ({self.received_at})"


class ServiceCredential(models.Model):
    """Secure storage for service credentials and secrets"""
    
    CREDENTIAL_TYPES = [
        ('api_key', 'API Key'),
        ('oauth_token', 'OAuth Token'),
        ('ssh_key', 'SSH Key'),
        ('certificate', 'Certificate'),
        ('password', 'Password'),
        ('connection_string', 'Connection String'),
    ]
    
    name = models.CharField(max_length=200)
    credential_type = models.CharField(max_length=20, choices=CREDENTIAL_TYPES)
    service = models.ForeignKey(ServiceIntegration, on_delete=models.CASCADE, related_name='credentials', null=True, blank=True)
    
    # Encrypted value
    value_encrypted = models.BinaryField()
    
    # Metadata
    description = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_rotated = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Service Credential"
        verbose_name_plural = "Service Credentials"
    
    def __str__(self):
        return f"{self.name} ({self.credential_type})"
