"""Celery tasks for warranty assets."""
from celery import shared_task


@shared_task
def generate_warranty_assets_task(warranty_id, verify_url):
    from .models import Warranty

    warranty = Warranty.objects.filter(id=warranty_id).first()
    if not warranty:
        return None
    warranty.generate_assets(verify_url)
    warranty.save()
    return warranty.id
