document.addEventListener('DOMContentLoaded', function () {
    console.log("⚙️ Script validar_usuario.js cargado");

    // Función para mostrar/ocultar campo zona según el rol seleccionado
    function toggleZonaVisibility() {
        const rolSelect = document.getElementById('rol');
        const zonaField = document.getElementById('zona').closest('.form-col');

        if (rolSelect.value === 'Guardaparamo') {
            zonaField.style.display = 'block';
        } else {
            zonaField.style.display = 'none';
            document.getElementById('zona').value = ''; // Limpiar valor si no es Guardaparamo
        }
    }

    // Agregar listeners para cambio de rol
    const rolSelect = document.getElementById('rol');
    if (rolSelect) {
        rolSelect.addEventListener('change', toggleZonaVisibility);
        // Ocultar zona inicialmente
        document.getElementById('zona').closest('.form-col').style.display = 'none';
    }

    const editRolSelect = document.getElementById('edit-rol');
    if (editRolSelect) {
        editRolSelect.addEventListener('change', toggleEditZonaVisibility);
    }

    // Versión para el modal de edición
    function toggleEditZonaVisibility() {
        const rolSelect = document.getElementById('edit-rol');
        const zonaField = document.getElementById('edit-zona').closest('.form-group');

        if (rolSelect.value === 'Guardaparamo') {
            zonaField.style.display = 'block';
        } else {
            zonaField.style.display = 'none';
        }
    }

    // 1. Funciones auxiliares
    function getCSRFToken() {
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfInput ? csrfInput.value : '';
    }

    // Función de alertas mejorada (similar a modal_login.js)
    function showAlert(type, message, duration = 4000) {
        const alertOverlay = document.getElementById('custom-alert');
        const alertContainer = alertOverlay.querySelector('.ecoparm-alert');
        const alertTitle = document.getElementById('alert-title');
        const alertMessage = document.getElementById('alert-message');
        const alertFooter = document.querySelector('.ecoparm-alert-footer');
        const progressContainer = document.getElementById('progress-container');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        // Configurar el tipo de alerta
        alertContainer.className = 'ecoparm-alert';
        alertContainer.classList.add(`alert-${type}`);

        // Configurar icono según el tipo
        let iconClass, titleText;
        switch (type) {
            case 'success':
                iconClass = 'fas fa-check-circle';
                titleText = 'Éxito';
                break;
            case 'error':
                iconClass = 'fas fa-times-circle';
                titleText = 'Error';
                break;
            case 'warning':
                iconClass = 'fas fa-exclamation-triangle';
                titleText = 'Advertencia';
                break;
            case 'info':
            default:
                iconClass = 'fas fa-info-circle';
                titleText = 'Información';
        }

        // Configurar contenido
        alertTitle.textContent = titleText;
        alertMessage.textContent = message;

        // Ocultar barra de progreso por defecto
        progressContainer.style.display = 'none';

        // Limpiar botones anteriores
        alertFooter.innerHTML = '';

        // Añadir botón OK por defecto
        const okBtn = document.createElement('button');
        okBtn.className = 'ecoparm-alert-button confirm';
        okBtn.textContent = 'Aceptar';
        okBtn.onclick = function () {
            closeAlert();
        };
        alertFooter.appendChild(okBtn);

        // Mostrar alerta
        alertOverlay.classList.remove('hidden');

        // Configurar autoclose
        if (duration) {
            setTimeout(() => {
                closeAlert();
            }, duration);
        }

        function closeAlert() {
            alertOverlay.classList.add('hidden');
        }

        return {
            close: closeAlert,
            addButton: (text, action, isPrimary = true) => {
                const button = document.createElement('button');
                button.className = `ecoparm-alert-button ${isPrimary ? 'confirm' : 'cancel'}`;
                button.textContent = text;
                button.onclick = function () {
                    if (action) action();
                    closeAlert();
                };

                // Reemplazar el botón por defecto si es el primero
                if (alertFooter.children.length === 1 && alertFooter.firstChild.textContent === 'Aceptar') {
                    alertFooter.replaceChild(button, alertFooter.firstChild);
                } else {
                    alertFooter.appendChild(button);
                }
            }
        };
    }

    // Función para mostrar confirmaciones
    function showConfirm(message, confirmCallback, cancelCallback) {
        const alert = showAlert('warning', message, null);

        // Limpiar botones existentes
        const alertFooter = document.querySelector('.ecoparm-alert-footer');
        alertFooter.innerHTML = '';

        // Añadir botón Cancelar
        alert.addButton('Cancelar', () => {
            if (cancelCallback) cancelCallback();
        }, false);

        // Añadir botón Confirmar
        alert.addButton('Confirmar', () => {
            if (confirmCallback) confirmCallback();
        });
    }

    // Función para mostrar errores en campos específicos
    function mostrarError(campo, mensaje) {
        campo.classList.add('input-error');
        const errorFeedback = campo.nextElementSibling;
        if (errorFeedback && errorFeedback.classList.contains('invalid-feedback')) {
            errorFeedback.textContent = mensaje;
            errorFeedback.style.display = 'block';
        }
    }

    function limpiarErrores() {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    // 2. Validación de formulario de creación
    function validarFormularioCreacion() {
        limpiarErrores();
        let valido = true;

        const campos = {
            nombre: document.getElementById('nombre'),
            apellidos: document.getElementById('apellidos'),
            telefono: document.getElementById('telefono'),
            identificacion: document.getElementById('identificacion'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirm-password'),
            rol: document.getElementById('rol'),
            zona: document.getElementById('zona')
        };

        // Validación de nombre
        if (!campos.nombre.value.trim()) {
            mostrarError(campos.nombre, 'El nombre es obligatorio');
            valido = false;
        }

        // Validación de apellidos
        if (!campos.apellidos.value.trim()) {
            mostrarError(campos.apellidos, 'Los apellidos son obligatorios');
            valido = false;
        }

        // Validación de teléfono
        if (!campos.telefono.value.trim()) {
            mostrarError(campos.telefono, 'El teléfono es obligatorio');
            valido = false;
        } else if (!/^\d{10}$/.test(campos.telefono.value)) {
            mostrarError(campos.telefono, 'El teléfono debe tener 10 dígitos');
            valido = false;
        }

        // Validación de identificación
        if (!campos.identificacion.value.trim()) {
            mostrarError(campos.identificacion, 'La identificación es obligatoria');
            valido = false;
        } else if (!/^\d{6,12}$/.test(campos.identificacion.value)) {
            mostrarError(campos.identificacion, 'La identificación debe tener entre 6 y 12 dígitos');
            valido = false;
        }

        // Validación de email
        if (!campos.email.value.trim()) {
            mostrarError(campos.email, 'El email es obligatorio');
            valido = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email.value)) {
            mostrarError(campos.email, 'Ingrese un email válido');
            valido = false;
        }

        // Validación de contraseña
        if (!campos.password.value) {
            mostrarError(campos.password, 'La contraseña es obligatoria');
            valido = false;
        } else if (campos.password.value.length < 8) {
            mostrarError(campos.password, 'La contraseña debe tener al menos 8 caracteres');
            valido = false;
        }

        // Validación de confirmación de contraseña
        if (!campos.confirmPassword.value) {
            mostrarError(campos.confirmPassword, 'Confirme la contraseña');
            valido = false;
        } else if (campos.password.value !== campos.confirmPassword.value) {
            mostrarError(campos.confirmPassword, 'Las contraseñas no coinciden');
            valido = false;
        }

        // Validación de rol
        if (!campos.rol.value) {
            mostrarError(campos.rol, 'Seleccione un rol');
            valido = false;
        }

        if (!valido) {
            showAlert('error', 'Por favor corrija los errores en el formulario');
        }

        return valido;
    }

    // 3. Crear usuario (manteniendo la lógica original)
    const saveBtn = document.getElementById('guardar-usuario');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            if (!validarFormularioCreacion()) return;

            const guardarText = document.getElementById('guardar-text');
            const guardarSpinner = document.getElementById('guardar-spinner');
            guardarText.style.display = 'none';
            guardarSpinner.style.display = 'inline-block';
            saveBtn.disabled = true;

            const loadingAlert = showAlert('info', 'Creando usuario...', null);

            const formData = new FormData();
            formData.append('nombre', document.getElementById('nombre').value.trim());
            formData.append('apellido', document.getElementById('apellidos').value.trim());
            formData.append('telefono', document.getElementById('telefono').value.trim());
            formData.append('identificacion', document.getElementById('identificacion').value.trim());
            formData.append('email', document.getElementById('email').value.trim().toLowerCase());
            formData.append('password', document.getElementById('password').value);
            formData.append('confirmPassword', document.getElementById('confirm-password').value);
            formData.append('rol', document.getElementById('rol').value);
            formData.append('zona', document.getElementById('zona').value);
            formData.append('csrfmiddlewaretoken', getCSRFToken());

            try {
                const response = await fetch('', {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.error || 'Error del servidor');

                loadingAlert.close();
                showAlert('success', data.message || "Usuario creado correctamente", 2000);
                setTimeout(() => window.location.reload(), 2000);

            } catch (error) {
                loadingAlert.close();
                showAlert('error', error.message.includes('cedula')
                    ? 'La cédula ya está registrada'
                    : error.message);
            } finally {
                guardarText.style.display = 'inline-block';
                guardarSpinner.style.display = 'none';
                saveBtn.disabled = false;
            }
        });
    }

    // 4. Eliminar usuario (con confirmación estilo admin_perfil)
    function eliminarUsuario(userId) {
        showConfirm(
            '¿Estás seguro de eliminar este usuario?',
            () => {
                const csrfToken = getCSRFToken();
                const loadingAlert = showAlert('info', 'Eliminando usuario...', null);

                fetch(`/usuarios/${userId}/eliminar/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        csrfmiddlewaretoken: csrfToken
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => { throw new Error(err.error || 'Error del servidor'); });
                        }
                        return response.json();
                    })
                    .then(data => {
                        loadingAlert.close();
                        if (!data.success) {
                            throw new Error(data.error || 'Error al eliminar usuario');
                        }

                        const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                        if (row) {
                            row.style.transition = 'opacity 0.3s ease';
                            row.style.opacity = '0';
                            setTimeout(() => row.remove(), 300);
                        }
                        showAlert('success', data.message || 'Usuario eliminado correctamente');
                    })
                    .catch(error => {
                        loadingAlert.close();
                        showAlert('error', error.message);
                        console.error('Error:', error);
                    });
            }
        );
    }

    // 5. Validación de formulario de edición
    function validarFormularioEdicion() {
        limpiarErrores();
        let valido = true;

        const campos = {
            nombre: document.getElementById('edit-nombre'),
            apellidos: document.getElementById('edit-apellidos'),
            telefono: document.getElementById('edit-telefono'),
            identificacion: document.getElementById('edit-identificacion'),
            email: document.getElementById('edit-email'),
            rol: document.getElementById('edit-rol'),
            zona: document.getElementById('edit-zona')
        };

        // Validación de nombre
        if (!campos.nombre.value.trim()) {
            mostrarError(campos.nombre, 'El nombre es obligatorio');
            valido = false;
        }

        // Validación de apellidos
        if (!campos.apellidos.value.trim()) {
            mostrarError(campos.apellidos, 'Los apellidos son obligatorios');
            valido = false;
        }

        // Validación de teléfono
        if (!campos.telefono.value.trim()) {
            mostrarError(campos.telefono, 'El teléfono es obligatorio');
            valido = false;
        } else if (!/^\d{10}$/.test(campos.telefono.value)) {
            mostrarError(campos.telefono, 'El teléfono debe tener 10 dígitos');
            valido = false;
        }

        // Validación de identificación
        if (!campos.identificacion.value.trim()) {
            mostrarError(campos.identificacion, 'La identificación es obligatoria');
            valido = false;
        } else if (!/^\d{6,12}$/.test(campos.identificacion.value)) {
            mostrarError(campos.identificacion, 'La identificación debe tener entre 6 y 12 dígitos');
            valido = false;
        }

        // Validación de email
        if (!campos.email.value.trim()) {
            mostrarError(campos.email, 'El email es obligatorio');
            valido = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email.value)) {
            mostrarError(campos.email, 'Ingrese un email válido');
            valido = false;
        }

        // Validación de rol
        if (!campos.rol.value) {
            mostrarError(campos.rol, 'Seleccione un rol');
            valido = false;
        }

        // Validación de zona solo si el rol es Guardaparamo
        if (campos.rol.value === 'Guardaparamo' && !campos.zona.value) {
            mostrarError(campos.zona, 'Seleccione una zona');
            valido = false;
        }

        if (!valido) {
            showAlert('error', 'Por favor corrija los errores en el formulario');
        }

        return valido;
    }
    // 6. Actualizar usuario (manteniendo la lógica original)
    function actualizarUsuario() {
        if (!validarFormularioEdicion()) return;

        const userId = document.getElementById('edit-usuario-id').value;
        const csrfToken = getCSRFToken();
        const spinner = document.getElementById('actualizar-spinner');
        const text = document.getElementById('actualizar-text');
        const btn = document.getElementById('actualizar-usuario');

        spinner.style.display = 'inline-block';
        text.style.display = 'none';
        btn.disabled = true;

        const loadingAlert = showAlert('info', 'Actualizando usuario...', null);

        const formData = new FormData();
        formData.append('nombre', document.getElementById('edit-nombre').value.trim());
        formData.append('apellido', document.getElementById('edit-apellidos').value.trim());
        formData.append('telefono', document.getElementById('edit-telefono').value.trim());
        formData.append('identificacion', document.getElementById('edit-identificacion').value.trim());
        formData.append('email', document.getElementById('edit-email').value.trim().toLowerCase());
        formData.append('rol', document.getElementById('edit-rol').value);
        formData.append('zona', document.getElementById('edit-zona').value);
        formData.append('csrfmiddlewaretoken', csrfToken);

        fetch(`/usuarios/${userId}/actualizar/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || 'Error del servidor'); });
                }
                return response.json();
            })
            .then(data => {
                loadingAlert.close();
                if (!data.success) throw new Error(data.error || 'Error al actualizar usuario');

                showAlert('success', data.message || 'Usuario actualizado correctamente');
                setTimeout(() => {
                    document.getElementById('edit-user-modal').style.display = 'none';
                    document.body.classList.remove('modal-open');
                    window.location.reload();
                }, 1500);
            })
            .catch(error => {
                loadingAlert.close();
                showAlert('error', error.message.includes('cedula')
                    ? 'La cédula ya está registrada'
                    : error.message);
            })
            .finally(() => {
                spinner.style.display = 'none';
                text.style.display = 'inline-block';
                btn.disabled = false;
            });
    }

    // 7. Listeners (manteniendo la lógica original)
    const botonesEditar = document.querySelectorAll('.btn-icon.edit');
    botonesEditar.forEach(boton => {
        boton.addEventListener('click', function () {
            const userId = this.dataset.id;
            console.log("🔧 Clic en botón editar con ID:", userId);
            if (userId) abrirModalEdicion(userId);
        });
    });

    // Listener para botón actualizar
    const actualizarBtn = document.getElementById('actualizar-usuario');
    if (actualizarBtn) {
        actualizarBtn.addEventListener('click', actualizarUsuario);
    }

    // Listener para eliminar
    document.querySelectorAll('.btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', function () {
            const userId = this.dataset.id;
            if (userId) eliminarUsuario(userId);
        });
    });

    // Cierre de modales
    document.addEventListener('click', function (e) {
        if (e.target.closest('.modal-close, .modal-close-btn')) {
            document.querySelectorAll('.modal-backdrop').forEach(modal => {
                modal.classList.remove('show');
            });
            document.body.classList.remove('modal-open');
        }
    });

    // Función para abrir modal de edición (manteniendo la lógica original)
    function abrirModalEdicion(userId) {
        console.log("🔧 Clic en botón editar con ID:", userId);

        const modal = document.getElementById('edit-user-modal');
        const spinner = document.getElementById('actualizar-spinner');
        const text = document.getElementById('actualizar-text');
        const mensaje = document.getElementById('edit-mensaje-usuario');

        if (spinner) spinner.style.display = 'inline-block';
        if (text) text.style.display = 'none';
        if (mensaje) mensaje.textContent = '';
        limpiarErrores();

        fetch(`/usuarios/${userId}/editar/`, {
            headers: {
                'X-CSRFToken': getCSRFToken(),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener datos');
                return response.json();
            })
            .then(data => {
                if (!data.success) throw new Error(data.error);

                document.getElementById('edit-usuario-id').value = data.usuario.id;
                document.getElementById('edit-nombre').value = data.usuario.nombre || '';
                document.getElementById('edit-apellidos').value = data.usuario.apellido || '';
                document.getElementById('edit-telefono').value = data.usuario.telefono || '';
                document.getElementById('edit-identificacion').value = data.usuario.cedula || '';
                document.getElementById('edit-email').value = data.usuario.email || '';
                document.getElementById('edit-rol').value = data.usuario.rol || 'Usuario';

                // Manejar la zona según el rol
                const zonaField = document.getElementById('edit-zona').closest('.form-group');
                if (data.usuario.rol === 'Guardaparamo') {
                    document.getElementById('edit-zona').value = data.usuario.zona || '3';
                    zonaField.style.display = 'block';
                } else {
                    zonaField.style.display = 'none';
                }

                modal.classList.add('show');
                document.body.classList.add('modal-open');
            })
            .catch(error => {
                showAlert('error', 'Error al cargar datos: ' + error.message);
            })
            .finally(() => {
                if (spinner) spinner.style.display = 'none';
                if (text) text.style.display = 'inline-block';
            });
    }
});
