"""
Creates Role, Permission, and StaffUser models for role-based permission system.
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_wholesalerapplication'),
    ]

    operations = [
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(
                    choices=[
                        ('MANAGER', 'Manager'),
                        ('SUPPORT', 'Support'),
                        ('SALES', 'Sales'),
                        ('TECH', 'Technical'),
                    ],
                    max_length=50,
                    unique=True
                )),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Role',
                'verbose_name_plural': 'Roles',
                'db_table': 'roles',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Permission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resource', models.CharField(
                    choices=[
                        ('INVENTORY', 'Inventory'),
                        ('ORDERS', 'Orders'),
                        ('WARRANTY_CLAIMS', 'Warranty Claims'),
                        ('USERS', 'Users'),
                        ('REPORTS', 'Reports'),
                        ('SETTINGS', 'Settings'),
                    ],
                    max_length=50
                )),
                ('action', models.CharField(
                    choices=[
                        ('VIEW', 'View'),
                        ('CREATE', 'Create'),
                        ('UPDATE', 'Update'),
                        ('DELETE', 'Delete'),
                        ('APPROVE', 'Approve'),
                        ('ASSIGN', 'Assign'),
                    ],
                    max_length=20
                )),
                ('description', models.TextField(blank=True)),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='permissions', to='users.role')),
            ],
            options={
                'verbose_name': 'Permission',
                'verbose_name_plural': 'Permissions',
                'db_table': 'permissions',
                'ordering': ['role', 'resource', 'action'],
                'unique_together': {('role', 'resource', 'action')},
            },
        ),
        migrations.CreateModel(
            name='StaffUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('hire_date', models.DateField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('notes', models.TextField(blank=True)),
                ('role', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='staff_users', to='users.role')),
                ('supervisor', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='supervised_staff',
                    to='users.user'
                )),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='staff_profile', to='users.user')),
            ],
            options={
                'verbose_name': 'Staff User',
                'verbose_name_plural': 'Staff Users',
                'db_table': 'staff_users',
                'ordering': ['user__first_name'],
            },
        ),
    ]
