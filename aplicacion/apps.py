from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError

from django.apps import AppConfig

class AplicacionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aplicacion'

    def ready(self):
        import aplicacion.signals  # 👈 Se importan las signals
