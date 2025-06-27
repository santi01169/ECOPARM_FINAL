document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('add-evidence-btn').addEventListener('click', function () {
        document.getElementById('add-evidence-modal').classList.add('show');
    });

    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('add-evidence-modal').classList.remove('show');
            document.querySelector('#add-evidence-modal form').reset();
        });
    });

    document.querySelector('#add-evidence-modal form').addEventListener('submit', enviarEvidencia);

    document.querySelector('.btn-primary[onclick="obtenerUbicacion()"]')?.addEventListener('click', obtenerUbicacion);

    configurarBotonesEliminar();
    configurarBotonesEditar();

    // Bloquear ubicación siempre
    const ubicacionInput = document.querySelector('input[name="ubicacion"]');
    if (ubicacionInput) {
        ubicacionInput.readOnly = true;
    }
});

// ==================== FUNCIONES DE ALERTAS (ESTILO users_perfil) ====================

function showEcoparmAlert(title, message, options = {}) {
    const alert = document.getElementById('custom-alert');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const alertFooter = document.querySelector('.ecoparm-alert-footer');

    // Configurar contenido
    document.getElementById('alert-title').textContent = title;
    document.getElementById('alert-message').textContent = message;

    // Configurar progreso si se especifica
    if (options.progress !== undefined) {
        progressContainer.style.display = 'block';
        progressFill.style.width = options.progress + '%';
        progressText.textContent = options.progress + '%';
    } else {
        progressContainer.style.display = 'none';
    }

    // Configurar botones
    alertFooter.innerHTML = ''; // Limpiar botones anteriores

    if (options.showCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ecoparm-alert-button cancel';
        cancelBtn.textContent = options.cancelText || 'Cancelar';
        cancelBtn.onclick = function () {
            closeAlert();
            if (options.onCancel) options.onCancel();
        };
        alertFooter.appendChild(cancelBtn);
    }

    const okBtn = document.createElement('button');
    okBtn.className = 'ecoparm-alert-button confirm';
    okBtn.textContent = options.buttonText || 'Aceptar';
    okBtn.onclick = function () {
        closeAlert();
        if (options.onAccept) options.onAccept();
    };
    alertFooter.appendChild(okBtn);

    // Mostrar alerta
    alert.classList.remove('hidden');

    // Configurar autoclose si no es una confirmación
    const autocloseTime = options.autoclose === false ? null : (options.autocloseTime || 5000);

    if (autocloseTime && !options.showCancel) {
        // Limpiar timeout anterior si existe
        if (alert.timeoutId) {
            clearTimeout(alert.timeoutId);
        }

        alert.timeoutId = setTimeout(() => {
            closeAlert();
            if (options.onAccept) options.onAccept();
        }, autocloseTime);
    }

    function closeAlert() {
        alert.classList.add('hidden');
        if (alert.timeoutId) {
            clearTimeout(alert.timeoutId);
            alert.timeoutId = null;
        }
    }

    return {
        close: closeAlert,
        addButton: function(text, action, isPrimary = true) {
            const button = document.createElement('button');
            button.className = `ecoparm-alert-button ${isPrimary ? 'confirm' : 'cancel'}`;
            button.textContent = text;
            button.onclick = function() {
                if (action) action();
                closeAlert();
            };
            alertFooter.appendChild(button);
            return button;
        }
    };
}

function showConfirmationDialog(title, message, confirmCallback, options = {}) {
    return showEcoparmAlert(title, message, {
        buttonText: options.confirmText || 'Confirmar',
        autoclose: false,
        onAccept: confirmCallback,
        showCancel: true,
        cancelText: options.cancelText || 'Cancelar'
    });
}

function showInlineError(inputId, message, hint = '') {
    const inputElement = document.getElementById(inputId);
    const errorContainer = document.getElementById('inline-error');

    if (inputElement) {
        inputElement.classList.add('input-error');

        // Configurar mensajes
        document.getElementById('error-message-text').textContent = message;
        document.getElementById('error-hint-text').textContent = hint;

        // Posicionar después del campo
        inputElement.insertAdjacentElement('afterend', errorContainer);
        errorContainer.style.display = 'block';
    }
}

function hideInlineError(inputId) {
    const inputElement = document.getElementById(inputId);
    const errorContainer = document.getElementById('inline-error');

    if (inputElement) {
        inputElement.classList.remove('input-error');
    }
    errorContainer.style.display = 'none';
}

// ==================== FUNCIONES EXISTENTES ADAPTADAS ====================

async function enviarEvidencia(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const evidenciaId = formData.get('evidencia_id');

    const url = evidenciaId ? `/evidencias/editar/${evidenciaId}/` : '/users_evidencias';
    const loadingAlert = showEcoparmAlert('Procesando', evidenciaId ? 'Actualizando evidencia...' : 'Subiendo evidencia...', {
        buttonText: '',
        autoclose: false,
        showProgress: true
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        loadingAlert.close();

        if (data.success) {
            showEcoparmAlert('Éxito', data.message || 'Evidencia guardada correctamente', {
                buttonText: 'Aceptar',
                autocloseTime: 2000,
                onAccept: function() {
                    form.reset();
                    document.getElementById('add-evidence-modal').classList.remove('show');
                    location.reload();
                }
            });
        } else {
            showEcoparmAlert('Error', 'Error al guardar evidencia: ' + (data.error || 'Error desconocido'), {
                buttonText: 'Entendido'
            });
        }
    } catch (error) {
        loadingAlert.close();
        showEcoparmAlert('Error', 'Error al enviar: ' + error.message, {
            buttonText: 'Entendido'
        });
        console.error("Error completo:", error);
    }
}

// Variable global para el contador
let contadorFilas = document.querySelectorAll('.table-responsive tbody tr').length;

// Función para agregar evidencia directamente a la tabla
function actualizarContadorFilas() {
    const filas = document.querySelectorAll('.table-responsive tbody tr');
    filas.forEach((fila, index) => {
        fila.querySelector('td:first-child').textContent = index + 1;
    });
}

// Función para agregar evidencia directamente a la tabla
function agregarEvidenciaTabla(actividad, ubicacion, observaciones, archivo_url, usuario_nombre) {
    const tbody = document.querySelector('.table-responsive tbody');
    const row = document.createElement('tr');

    // Validar y establecer valores por defecto si son undefined
    actividad = actividad || 'Sin actividad especificada';
    ubicacion = ubicacion || 'Ubicación no disponible';
    observaciones = observaciones || 'Sin observaciones';
    archivo_url = archivo_url || '#';
    usuario_nombre = usuario_nombre || 'Usuario desconocido';

    row.innerHTML = `
        <td></td>
        <td>${new Date().toISOString().slice(0, 16).replace('T', ' ')}</td>
        <td>${usuario_nombre}</td>
        <td>${actividad}</td>
        <td>${ubicacion}</td>
        <td>${observaciones}</td>
        <td><a href="${archivo_url}" target="_blank">Ver Evidencia</a></td>
        <td>
            <button class="btn btn-outline btn-edit">Editar</button>
            <button class="btn btn-danger btn-delete">Eliminar</button>
        </td>
    `;

    tbody.prepend(row);
    actualizarContadorFilas();
}

// Configurar el botón eliminar para actualizar el contador
function configurarBotonesEliminar() {
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.removeEventListener('click', handleEliminarClick);
        btn.addEventListener('click', handleEliminarClick);
    });
}

// Manejador para eliminar
async function handleEliminarClick() {
    const fila = this.closest('tr');
    const evidenciaId = fila.dataset.id;

    if (!evidenciaId) {
        showEcoparmAlert('Error', 'No se pudo identificar el ID de la evidencia', {
            buttonText: 'Entendido'
        });
        console.error('Fila sin ID:', fila);
        return;
    }

    showConfirmationDialog(
        'Eliminar evidencia',
        '¿Estás seguro de eliminar esta evidencia?',
        async () => {
            const loadingAlert = showEcoparmAlert('Eliminando', 'Eliminando evidencia...', {
                buttonText: '',
                autoclose: false,
                showProgress: true
            });
            
            try {
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                const formData = new FormData();
                formData.append('csrfmiddlewaretoken', csrfToken);

                const response = await fetch(`/evidencias/eliminar/${evidenciaId}/`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();
                loadingAlert.close();

                if (data.success) {
                    fila.remove();
                    actualizarContadorFilas();
                    showEcoparmAlert('Éxito', data.message || 'Evidencia eliminada correctamente', {
                        buttonText: 'Aceptar',
                        autocloseTime: 2000
                    });
                } else {
                    showEcoparmAlert('Error', 'Error: ' + (data.error || 'No se pudo eliminar la evidencia'), {
                        buttonText: 'Entendido'
                    });
                }
            } catch (error) {
                loadingAlert.close();
                showEcoparmAlert('Error', 'Error al eliminar: ' + error.message, {
                    buttonText: 'Entendido'
                });
                console.error('Error completo:', error);
            }
        },
        {
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        }
    );
}

// Función para obtener ubicación
function obtenerUbicacion() {
    if (navigator.geolocation) {
        const loadingAlert = showEcoparmAlert('Obteniendo ubicación', 'Por favor, espera mientras obtenemos tu ubicación...', {
            buttonText: '',
            autoclose: false
        });

        navigator.geolocation.getCurrentPosition(
            function (position) {
                loadingAlert.close();
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById("ubicacion").value = `${lat}, ${lon}`;
                showEcoparmAlert('Ubicación obtenida', 'Tu ubicación ha sido registrada correctamente', {
                    buttonText: 'Aceptar',
                    autocloseTime: 2000
                });
            },
            function (error) {
                loadingAlert.close();
                showEcoparmAlert('Error', "Error al obtener ubicación: " + error.message, {
                    buttonText: 'Entendido'
                });
            }
        );
    } else {
        showEcoparmAlert('Error', "Tu navegador no soporta geolocalización.", {
            buttonText: 'Entendido'
        });
    }
}

// Drag & drop imágenes
document.addEventListener('DOMContentLoaded', function () {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const removeImageBtn = document.getElementById('remove-image');

    // ✅ Verifica que todos los elementos existen
    if (!dropArea || !fileInput || !previewContainer || !previewImage || !removeImageBtn) {
        console.error('Uno o más elementos no existen en el DOM');
        return;
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
    });

    dropArea.addEventListener('drop', function (e) {
        const files = e.dataTransfer.files;
        handleFiles(files);
    }, false);

    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                    previewContainer.style.display = 'block';
                    dropArea.classList.add('uploaded'); // ✅ se oculta texto
                };
                reader.readAsDataURL(file);
                fileInput.files = files;
            } else {
                showEcoparmAlert('Error', 'Por favor, selecciona un archivo de imagen válido.', {
                    buttonText: 'Entendido'
                });
            }
        }
    }

    removeImageBtn.addEventListener('click', function () {
        previewImage.src = '#';
        previewContainer.style.display = 'none';
        fileInput.value = '';
        dropArea.classList.remove('uploaded'); // ✅ vuelve a mostrar texto
    });
});

// Editar evidencia
function configurarBotonesEditar() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            if (!row) {
                console.error('No se encontró la fila padre');
                return;
            }

            const evidenciaId = row.dataset.id;
            const celdas = row.cells;

            // Verificar que tenemos suficientes celdas
            if (celdas.length < 7) {
                console.error('La fila no tiene suficientes celdas', celdas);
                return;
            }

            const actividad = celdas[3].textContent.trim();
            const ubicacion = celdas[4].textContent.trim();
            const observaciones = celdas[5].textContent.trim();
            const linkEvidencia = celdas[6].querySelector('a');
            const archivoUrl = linkEvidencia ? linkEvidencia.getAttribute('href') : '#';

            console.log('Datos a editar:', { actividad, ubicacion, observaciones, archivoUrl });

            const modal = document.getElementById('add-evidence-modal');
            if (!modal) {
                console.error('No se encontró el modal con ID add-evidence-modal');
                return;
            }

            const form = modal.querySelector('form');
            if (!form) {
                console.error('No se encontró el formulario en el modal');
                return;
            }

            // Configurar el modal para edición
            const tituloModal = modal.querySelector('.modal-title');
            if (tituloModal) {
                tituloModal.textContent = 'Editar Evidencia';
            }

            // Limpiar formulario para nueva edición
            form.reset();

            // Llenar los campos del formulario
            form.querySelector('input[name="actividad"]').value = actividad;
            form.querySelector('textarea[name="observaciones"]').value = observaciones;
            form.querySelector('input[name="ubicacion"]').value = ubicacion;
            form.querySelector('input[name="ubicacion"]').readOnly = true;

            // Agregar ID de la evidencia al formulario
            let inputId = form.querySelector('input[name="evidencia_id"]');
            if (!inputId) {
                inputId = document.createElement('input');
                inputId.type = 'hidden';
                inputId.name = 'evidencia_id';
                form.appendChild(inputId);
            }
            inputId.value = evidenciaId;

            // Mostrar la imagen existente
            const previewContainer = document.getElementById('preview-container');
            const previewImage = document.getElementById('preview-image');
            if (previewContainer && previewImage) {
                previewImage.src = archivoUrl;
                previewContainer.style.display = 'block';
            }

            // Ocultar el botón de obtener ubicación en edición
            const btnUbicacion = document.querySelector('.btn-primary[onclick="obtenerUbicacion()"]');
            if (btnUbicacion) {
                btnUbicacion.style.display = 'none';
            }

            // Mostrar el modal
            modal.classList.add('show');
        });
    });
}

// Configurar el modal para nueva evidencia
document.getElementById('add-evidence-btn').addEventListener('click', function () {
    const modal = document.getElementById('add-evidence-modal');
    const form = modal.querySelector('form');

    // Limpiar formulario
    form.reset();

    // Configurar el modal para nueva evidencia
    const tituloModal = modal.querySelector('.modal-title');
    if (tituloModal) {
        tituloModal.textContent = 'Nueva Evidencia';
    }

    // Limpiar imagen previa
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    if (previewContainer && previewImage) {
        previewImage.src = '#';
        previewContainer.style.display = 'none';
    }

    // Habilitar el botón de obtener ubicación para nueva evidencia
    const btnUbicacion = document.querySelector('.btn-primary[onclick="obtenerUbicacion()"]');
    if (btnUbicacion) {
        btnUbicacion.style.display = 'block';
    }

    // Eliminar campo de evidencia_id para nueva evidencia
    const inputId = form.querySelector('input[name="evidencia_id"]');
    if (inputId) {
        inputId.remove();
    }

    // Mostrar el modal
    modal.classList.add('show');
});