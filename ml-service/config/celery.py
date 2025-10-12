"""
Celery configuration for ML Service
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('ml_service')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Periodic tasks
app.conf.beat_schedule = {
    'sync-journal-entries': {
        'task': 'app.tasks.sync_journal_entries',
        'schedule': crontab(minute=0),  # Every hour
    },
    'cleanup-old-logs': {
        'task': 'app.tasks.cleanup_old_logs',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    },
}
