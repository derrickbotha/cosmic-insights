"""
Management command to create superuser if none exists
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create a superuser if none exists'

    def handle(self, *args, **options):
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.WARNING('Superuser already exists'))
            return

        User.objects.create_superuser(
            username='admin',
            email='admin@cosmicinsights.com',
            password='admin123',  # Change this in production!
        )
        self.stdout.write(self.style.SUCCESS(
            'Superuser created successfully!\n'
            'Username: admin\n'
            'Password: admin123\n'
            '⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!'
        ))
