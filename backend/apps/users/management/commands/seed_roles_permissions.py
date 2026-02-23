from django.core.management.base import BaseCommand

from apps.users.seeders import seed_roles_and_permissions


class Command(BaseCommand):
    help = 'Seed staff roles and resource permissions.'

    def handle(self, *args, **options):
        seed_roles_and_permissions()
        self.stdout.write(self.style.SUCCESS('Role and permission seeding complete'))
