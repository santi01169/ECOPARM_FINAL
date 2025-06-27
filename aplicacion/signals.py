from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Rol

@receiver(post_migrate)
def create_default_superuser(sender, **kwargs):
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
