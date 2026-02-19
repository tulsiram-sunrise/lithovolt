"""
Enhance WarrantyClaim model with status workflow and staff assignment tracking.
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_role_permission_staffuser'),
        ('warranty', '0002_warrantyclaimattachment'),
    ]

    operations = [
        migrations.AddField(
            model_name='warrantyclaim',
            name='assigned_to',
            field=models.ForeignKey(
                blank=True,
                help_text='Staff member assigned to review this claim',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_warranty_claims',
                to='users.user'
            ),
        ),
        migrations.AddField(
            model_name='warrantyclaim',
            name='reviewed_by',
            field=models.ForeignKey(
                blank=True,
                help_text='Staff member who reviewed/approved/rejected this claim',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reviewed_warranty_claims',
                to='users.user'
            ),
        ),
        migrations.AddField(
            model_name='warrantyclaim',
            name='review_notes',
            field=models.TextField(blank=True, help_text='Notes from the reviewer'),
        ),
        migrations.AddField(
            model_name='warrantyclaim',
            name='resolution_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='warrantyclaim',
            name='status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending'),
                    ('UNDER_REVIEW', 'Under Review'),
                    ('APPROVED', 'Approved'),
                    ('REJECTED', 'Rejected'),
                    ('RESOLVED', 'Resolved'),
                ],
                default='PENDING',
                max_length=20
            ),
        ),
        migrations.CreateModel(
            name='ClaimStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('from_status', models.CharField(max_length=20)),
                ('to_status', models.CharField(max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.user')),
                ('claim', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='warranty.warrantyclaim')),
            ],
            options={
                'verbose_name': 'Claim Status History',
                'verbose_name_plural': 'Claim Status Histories',
                'db_table': 'warranty_claim_status_history',
                'ordering': ['-created_at'],
            },
        ),
    ]
