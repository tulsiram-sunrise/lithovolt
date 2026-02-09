from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.users.models import User
from apps.inventory.models import BatteryModel, Accessory, SerialNumber, StockAllocation


class Command(BaseCommand):
    help = 'Seed initial data for development.'

    def add_arguments(self, parser):
        parser.add_argument('--admin-email', default='admin@lithovolt.com')
        parser.add_argument('--admin-password', default='Admin@123')
        parser.add_argument('--wholesaler-count', type=int, default=2)
        parser.add_argument('--consumer-count', type=int, default=3)
        parser.add_argument('--battery-models', type=int, default=2)
        parser.add_argument('--accessories', type=int, default=2)
        parser.add_argument('--serials-per-model', type=int, default=10)
        parser.add_argument('--allocate-per-model', type=int, default=5)

    def handle(self, *args, **options):
        admin_email = options['admin_email']
        admin_password = options['admin_password']

        admin, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'first_name': 'Admin',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password(admin_password)
            admin.save()
            self.stdout.write(self.style.SUCCESS('Admin user created'))
        else:
            self.stdout.write('Admin user already exists')

        wholesalers = []
        for idx in range(options['wholesaler_count']):
            email = f'wholesaler{idx + 1}@lithovolt.com'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': f'Wholesaler{idx + 1}',
                    'role': 'WHOLESALER',
                }
            )
            if created:
                user.set_password('Wholesaler@123')
                user.save()
            wholesalers.append(user)
        self.stdout.write(self.style.SUCCESS(f'Wholesalers ready: {len(wholesalers)}'))

        consumers = []
        for idx in range(options['consumer_count']):
            email = f'consumer{idx + 1}@lithovolt.com'
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': f'Consumer{idx + 1}',
                    'role': 'CONSUMER',
                }
            )
            if created:
                user.set_password('Consumer@123')
                user.save()
            consumers.append(user)
        self.stdout.write(self.style.SUCCESS(f'Consumers ready: {len(consumers)}'))

        battery_models = []
        for idx in range(options['battery_models']):
            sku = f'LV-12V-{100 + idx}'
            model, _ = BatteryModel.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': f'Lithovolt 12V {100 + idx}Ah',
                    'model_number': f'LV12-{100 + idx}',
                    'capacity_ah': 100 + idx,
                    'voltage': 12,
                    'warranty_months': 18,
                    'description': 'Lead-acid battery',
                    'is_active': True,
                }
            )
            battery_models.append(model)
        self.stdout.write(self.style.SUCCESS(f'Battery models ready: {len(battery_models)}'))

        accessories = []
        for idx in range(options['accessories']):
            sku = f'LV-ACC-{idx + 1:02d}'
            accessory, _ = Accessory.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': f'Accessory {idx + 1}',
                    'description': 'Sample accessory',
                    'price': 99 + idx * 10,
                    'is_active': True,
                }
            )
            accessories.append(accessory)
        self.stdout.write(self.style.SUCCESS(f'Accessories ready: {len(accessories)}'))

        for model in battery_models:
            existing = SerialNumber.objects.filter(battery_model=model).count()
            to_create = max(options['serials_per_model'] - existing, 0)
            if to_create > 0:
                SerialNumber.create_batch(model, to_create)
            self.stdout.write(f'Serials ready for {model.sku}: {SerialNumber.objects.filter(battery_model=model).count()}')

        wholesaler = wholesalers[0] if wholesalers else None
        if wholesaler:
            for model in battery_models:
                available = SerialNumber.objects.filter(
                    battery_model=model,
                    status=SerialNumber.Status.AVAILABLE
                ).order_by('created_at')
                allocate_qty = min(options['allocate_per_model'], available.count())
                if allocate_qty == 0:
                    continue
                allocate_ids = list(available[:allocate_qty].values_list('id', flat=True))
                SerialNumber.objects.filter(id__in=allocate_ids).update(
                    status=SerialNumber.Status.ALLOCATED,
                    allocated_to=wholesaler,
                    allocated_at=timezone.now()
                )
                StockAllocation.objects.create(
                    battery_model=model,
                    wholesaler=wholesaler,
                    allocated_by=admin,
                    quantity=allocate_qty,
                    notes='Seed allocation'
                )
                self.stdout.write(self.style.SUCCESS(
                    f'Allocated {allocate_qty} serials of {model.sku} to {wholesaler.email}'
                ))

        self.stdout.write(self.style.SUCCESS('Seed data complete'))
