"""
Utility functions for the project.
"""
import random
import string
from django.utils import timezone


def generate_random_code(length=6, digits_only=False):
    """Generate a random code."""
    if digits_only:
        return ''.join(random.choices(string.digits, k=length))
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


def generate_serial_number(prefix='LV', length=10):
    """Generate a unique serial number for batteries."""
    random_part = ''.join(random.choices(string.digits, k=length))
    return f'{prefix}{random_part}'


def generate_warranty_number(prefix='WR', length=12):
    """Generate a unique warranty number."""
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    return f'{prefix}{random_part}'


def calculate_warranty_expiry(start_date, months):
    """Calculate warranty expiry date."""
    from dateutil.relativedelta import relativedelta
    return start_date + relativedelta(months=months)


def format_phone_number(phone):
    """Format phone number to standard format."""
    # Remove all non-digit characters
    phone = ''.join(filter(str.isdigit, phone))
    
    # Add country code if not present
    if len(phone) == 10:
        phone = f'+91{phone}'
    elif not phone.startswith('+'):
        phone = f'+{phone}'
    
    return phone
