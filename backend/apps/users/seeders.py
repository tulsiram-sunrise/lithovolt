"""
Seeders for initial roles and permissions setup.
"""
from apps.users.models import Role, Permission


def seed_roles_and_permissions():
    """Seed initial roles and permissions."""
    
    # Create roles
    roles = {
        'MANAGER': Role.objects.create(
            name='MANAGER',
            description='Management staff role with full access to most resources',
            is_active=True
        ),
        'SUPPORT': Role.objects.create(
            name='SUPPORT',
            description='Support staff role focused on customer service and warranty claims',
            is_active=True
        ),
        'SALES': Role.objects.create(
            name='SALES',
            description='Sales staff role for orders and customer management',
            is_active=True
        ),
        'TECH': Role.objects.create(
            name='TECH',
            description='Technical staff role for inventory and product management',
            is_active=True
        ),
    }
    
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
    
    # Create permissions
    for role_name, permissions in role_permissions.items():
        role = roles[role_name]
        for resource, action in permissions:
            Permission.objects.create(
                role=role,
                resource=resource,
                action=action,
                description=f'{action} {resource}'
            )
    
    print(f"✅ Seeded {len(roles)} roles with {sum(len(p) for p in role_permissions.values())} permissions")
