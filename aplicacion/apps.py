from django.apps import AppConfig
from django.db.utils import OperationalError, ProgrammingError

class AplicacionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aplicacion'

    def ready(self):
        from django.contrib.auth import get_user_model
        from .models import Rol

        try:
            User = get_user_model()
            if not User.objects.filter(cedula="0000000000").exists():
                rol_admin, _ = Rol.objects.get_or_create(rol='Administrador')
                User.objects.create_superuser(
                    cedula="0000000000",
                    nombre="Admin",
                    apellido="Principal",
                    telefono="0000000000",
                    email="admin@1.com",
                    password="admin123",
                    rol=rol_admin
                )
                print("✅ Usuario administrador predeterminado creado.")
        except (OperationalError, ProgrammingError):
            # Esto evita errores si las tablas aún no existen (por ejemplo durante las migraciones iniciales)
            pass
