"""
API Management App
Manages API keys, rate limits, and access control for Backend API
"""
from django.apps import AppConfig


class ApiManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api_management'
    verbose_name = 'API Management'
