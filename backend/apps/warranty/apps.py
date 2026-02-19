from django.apps import AppConfig

class WarrantyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.warranty'
    
    def ready(self):
        """Register signals when app is ready."""
        import apps.warranty.signals  # noqa
