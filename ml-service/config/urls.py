"""
URL configuration for ML Service
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from app import views

router = routers.DefaultRouter()
router.register(r'documents', views.DocumentViewSet, basename='document')
router.register(r'embeddings', views.EmbeddingViewSet, basename='embedding')
router.register(r'experiments', views.ExperimentViewSet, basename='experiment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/search/', views.SemanticSearchView.as_view(), name='semantic-search'),
    path('api/v1/sync/', views.SyncJournalEntriesView.as_view(), name='sync-journals'),
    path('api/v1/health/', views.HealthCheckView.as_view(), name='health-check'),
]
