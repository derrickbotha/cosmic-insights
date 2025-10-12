"""
Config package for Django ML Service
"""
from .celery import app as celery_app

__all__ = ('celery_app',)
