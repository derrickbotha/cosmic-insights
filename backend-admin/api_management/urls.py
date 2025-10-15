"""
API Management URLs
"""
from django.urls import path
from . import views

app_name = 'api_management'

urlpatterns = [
    path('keys/', views.APIKeyListView.as_view(), name='key-list'),
    path('keys/create/', views.APIKeyCreateView.as_view(), name='key-create'),
    path('endpoints/', views.APIEndpointListView.as_view(), name='endpoint-list'),
    path('usage/', views.APIUsageStatsView.as_view(), name='usage-stats'),
]
