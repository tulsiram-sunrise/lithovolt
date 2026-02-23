"""
Seeders for initial roles and permissions setup.
"""
from apps.users.models import Role, Permission


def seed_roles_and_permissions():
    """Seed initial roles and permissions."""

    role_defaults = {
        'MANAGER': {
            'description': 'Management staff role with full access to most resources',
            'is_active': True,
        },
        'SUPPORT': {
            'description': 'Support staff role focused on customer service and warranty claims',
            'is_active': True,
        },
        'SALES': {
            'description': 'Sales staff role for orders and customer management',
            'is_active': True,
        },
        'TECH': {
            'description': 'Technical staff role for inventory and product management',
            'is_active': True,
        },
    }

    roles = {}
    created_roles = 0
    for role_name, defaults in role_defaults.items():
        role, created = Role.objects.update_or_create(
            name=role_name,
            defaults=defaults,
        )
        roles[role_name] = role
        if created:
            created_roles += 1
    
    # Define permissions per role
    role_permissions = {
        'MANAGER': [
            ('INVENTORY', 'VIEW'), ('INVENTORY', 'CREATE'), ('INVENTORY', 'UPDATE'), 
            ('INVENTORY', 'DELETE'),
            ('ORDERS', 'VIEW'), ('ORDERS', 'CREATE'), ('ORDERS', 'UPDATE'), 
            ('ORDERS', 'APPROVE'), ('ORDERS', 'ASSIGN'),
            ('WARRANTY_CLAIMS', 'VIEW'), ('WARRANTY_CLAIMS', 'APPROVE'), 
            ('WARRANTY_CLAIMS', 'ASSIGN'),
        ],
        'SUPPORT': [
            ('WARRANTY_CLAIMS', 'VIEW'), ('WARRANTY_CLAIMS', 'UPDATE'), 
            ('WARRANTY_CLAIMS', 'APPROVE'), ('WARRANTY_CLAIMS', 'ASSIGN'),
            ('ORDERS', 'VIEW'),
            ('USERS', 'VIEW'),
            ('REPORTS', 'VIEW'),
        ],
        'SALES': [
            ('ORDERS', 'VIEW'), ('ORDERS', 'CREATE'), ('ORDERS', 'UPDATE'), 
            ('ORDERS', 'APPROVE'),
            ('USERS', 'VIEW'), ('USERS', 'CREATE'), ('USERS', 'UPDATE'),
            ('INVENTORY', 'VIEW'),
        ],
        'TECH': [
            ('INVENTORY', 'VIEW'), ('INVENTORY', 'CREATE'), ('INVENTORY', 'UPDATE'), 
            ('INVENTORY', 'DELETE'),
            ('SETTINGS', 'VIEW'), ('SETTINGS', 'UPDATE'),
            ('REPORTS', 'VIEW'),
            ('WARRANTY_CLAIMS', 'VIEW'),
            ('ORDERS', 'VIEW'),
        ],
    }
    
    created_permissions = 0
    for role_name, permissions in role_permissions.items():
        role = roles[role_name]
        for resource, action in permissions:
            _, created = Permission.objects.update_or_create(
                role=role,
                resource=resource,
                action=action,
                defaults={
                    'description': f'{action} {resource}',
                },
            )
            if created:
                created_permissions += 1

    total_permissions = sum(len(p) for p in role_permissions.values())
    print(
        f"✅ Seeded {len(roles)} roles ({created_roles} new) "
        f"with {total_permissions} permissions ({created_permissions} new)"
    )
