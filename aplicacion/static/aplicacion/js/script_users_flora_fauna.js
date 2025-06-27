document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('flora-fauna-modal');
    const form = document.getElementById('flora-fauna-form');
    const addBtn = document.getElementById('add-evidence-btn');
    const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const tipoInput = document.getElementById('tipo-input');
    const nombreInput = document.getElementById('nombre-input');
    const descripcionInput = document.getElementById('descripcion-input');
    const imagenInput = document.getElementById('imagen-input');
    const registroIdInput = document.getElementById('registro-id-input');
    const imagenPreview = document.getElementById('imagen-preview');
    const uploadTextContainer = document.getElementById('upload-text-container');

    // Función para mostrar la vista previa de la imagen seleccionada
    function mostrarVistaPreviaImagen(file) {
        if (file && file.type.startsWith('image/')) {
            if (uploadTextContainer) uploadTextContainer.style.display = 'none';
            const reader = new FileReader();
            reader.onload = function (e) {
                imagenPreview.innerHTML = `
                    <div style="text-align:center;">
                        <img src="${e.target.result}" alt="Vista previa" style="max-width:100%; max-height:200px; border-radius:6px; margin-bottom:10px;">
                        <br>
                        <button type="button" class="btn btn-outline" id="btn-eliminar-preview">Eliminar imagen</button>
                    </div>
                `;
                // Botón para eliminar la vista previa y volver a mostrar el texto
                const btnEliminar = document.getElementById('btn-eliminar-preview');
                if (btnEliminar) {
                    btnEliminar.onclick = function () {
                        imagenPreview.innerHTML = '';
                        if (uploadTextContainer) uploadTextContainer.style.display = '';
                        imagenInput.value = '';
                    };
                }
            };
            reader.readAsDataURL(file);
        } else {
            imagenPreview.innerHTML = '';
            if (uploadTextContainer) uploadTextContainer.style.display = '';
        }
    }

    // Abrir modal para agregar
    addBtn.addEventListener('click', function () {
        modal.style.display = '';
        modal.classList.add('show');
        modalTitle.textContent = 'Agregar Flora o Fauna';
        submitBtn.textContent = 'Subir';
        form.action = window.location.pathname; // POST a la misma URL
        registroIdInput.value = '';
        tipoInput.value = '';
        nombreInput.value = '';
        descripcionInput.value = '';
        imagenInput.value = '';
        imagenPreview.innerHTML = '';
        if (uploadTextContainer) uploadTextContainer.style.display = '';
        imagenInput.required = true;
    });

    // Abrir modal para editar
    document.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.style.display = '';
            modal.classList.add('show');
            modalTitle.textContent = 'Editar Flora o Fauna';
            submitBtn.textContent = 'Actualizar';
            tipoInput.value = btn.getAttribute('data-tipo');
            nombreInput.value = btn.getAttribute('data-nombre');
            descripcionInput.value = btn.getAttribute('data-descripcion');
            registroIdInput.value = btn.getAttribute('data-id');
            form.action = `/flora-fauna/editar/${btn.getAttribute('data-id')}/`;
            imagenInput.value = '';
            imagenInput.required = false;
            // Mostrar preview de imagen actual
            const imgUrl = btn.getAttribute('data-imagen-url');
            if (imgUrl) {
                imagenPreview.innerHTML = `
                <div style="text-align:center;">
                    <img src="${imgUrl}" alt="Imagen actual" style="max-width:100%; max-height:200px; border-radius:6px; margin-bottom:10px;">
                    <br>
                    <button type="button" class="btn btn-outline" id="btn-eliminar-preview">Eliminar imagen</button>
                </div>
                `;
                if (uploadTextContainer) uploadTextContainer.style.display = 'none';
                // Botón para eliminar la vista previa y volver a mostrar el texto
                const btnEliminar = document.getElementById('btn-eliminar-preview');
                if (btnEliminar) {
                    btnEliminar.onclick = function () {
                        imagenPreview.innerHTML = '';
                        if (uploadTextContainer) uploadTextContainer.style.display = '';
                        imagenInput.value = '';
                    };
                }
            } else {
                imagenPreview.innerHTML = '';
                if (uploadTextContainer) uploadTextContainer.style.display = '';
            }
        });
    });

    // Configurar botones de eliminar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function () {
            const registroId = this.getAttribute('data-id');
            showConfirm(
                '¿Estás seguro de que deseas eliminar este registro?',
                async () => {
                    const loadingAlert = showAlert('info', 'Eliminando registro...', null);
                    try {
                        const response = await fetch(`/flora-fauna/eliminar/${registroId}/`, {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        });

                        const data = await response.json();
                        loadingAlert.close();

                        if (data.success) {
                            showAlert('success', data.message || 'Registro eliminado correctamente');
                            // Eliminar la fila de la tabla
                            document.querySelector(`tr[data-id="${registroId}"]`).remove();
                            // Actualizar números de fila
                            actualizarNumerosFilas();
                        } else {
                            showAlert('error', data.error || 'Error al eliminar el registro');
                        }
                    } catch (error) {
                        loadingAlert.close();
                        showAlert('error', 'Error al eliminar: ' + error.message);
                        console.error("Error completo:", error);
                    }
                }
            );
        });
    });

    // Función para actualizar números de fila
    function actualizarNumerosFilas() {
        document.querySelectorAll('.table-responsive tbody tr').forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }

    // Cerrar modal
    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.classList.remove('show');
            modal.style.display = '';
        });
    });

    // Opcional: Cerrar modal al hacer click fuera
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            modal.style.display = '';
        }
    });

    // Mostrar vista previa al seleccionar nueva imagen (tanto al agregar como al editar)
    imagenInput.addEventListener('change', function () {
        mostrarVistaPreviaImagen(this.files[0]);
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const loadingAlert = showAlert('info', 'Guardando registro...', null);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            // Verificar el tipo de contenido antes de parsear
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Respuesta inesperada del servidor: ${text.substring(0, 100)}...`);
            }

            const data = await response.json();
            loadingAlert.close();

            if (data.success) {
                showAlert('success', data.message || 'Registro guardado correctamente', 2000);
                modal.classList.remove('show');
                modal.style.display = '';
                location.reload();
            } else {
                showAlert('error', data.error || 'Error al guardar el registro');
            }
        } catch (error) {
            loadingAlert.close();
            showAlert('error', 'Error al enviar: ' + error.message);
            console.error("Error completo:", error);
        }
    });

    // Funciones para mostrar alertas (copiadas de script_users_evidencias.js)
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
        alertTitle.innerHTML = `<i class="${iconClass}"></i> ${titleText}`;
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
});