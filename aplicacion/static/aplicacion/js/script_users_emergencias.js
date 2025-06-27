document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('emergencia-modal');
    const form = document.getElementById('emergencia-form');
    const addBtn = document.getElementById('add-evidence-btn');
    const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const fechaInput = document.getElementById('fecha-input');
    const tipoInput = document.getElementById('tipo-input');
    const gravedadInput = document.getElementById('gravedad-input');
    const observacionesInput = document.getElementById('observaciones-input');
    const imagenInput = document.getElementById('imagen-input');
    const registroIdInput = document.getElementById('registro-id-input');
    const imagenPreview = document.getElementById('imagen-preview');
    const uploadTextContainer = document.getElementById('upload-text-container');

    // Función para obtener la fecha actual en formato YYYY-MM-DD
    function getFechaActual() {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    }

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

    // ==================== FUNCIONES DE ALERTAS ====================
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

    // Abrir modal para agregar
    addBtn.addEventListener('click', function () {
        modal.style.display = ''; // Asegura que el modal esté visible
        modal.classList.add('show');
        modalTitle.textContent = 'Agregar Emergencia';
        submitBtn.textContent = 'Subir';
        form.action = window.location.pathname; // POST a la misma URL
        registroIdInput.value = '';
        fechaInput.value = getFechaActual(); // Establece la fecha actual por defecto
        tipoInput.value = '';
        gravedadInput.value = '';
        observacionesInput.value = '';
        imagenInput.value = '';
        imagenPreview.innerHTML = '';
        if (uploadTextContainer) uploadTextContainer.style.display = '';
        imagenInput.required = true;
    });

    // Abrir modal para editar
    document.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.style.display = ''; // Asegura que el modal esté visible
            modal.classList.add('show');
            modalTitle.textContent = 'Editar Emergencia';
            submitBtn.textContent = 'Actualizar';
            fechaInput.value = btn.getAttribute('data-fecha');
            tipoInput.value = btn.getAttribute('data-tipo');
            gravedadInput.value = btn.getAttribute('data-gravedad');
            observacionesInput.value = btn.getAttribute('data-observaciones');
            registroIdInput.value = btn.getAttribute('data-id');
            form.action = `/emergencias/editar/${btn.getAttribute('data-id')}/`;
            imagenInput.value = '';
            imagenInput.required = false;
            // Mostrar preview de imagen actual
            const imgUrl = btn.getAttribute('data-imagen-url');
            if (imgUrl) {
                imagenPreview.innerHTML = `
                <div style="text-align:center;">
                    <img src="${imgUrl}" alt="Imagen actual" style="max-width:100%; max-height:200px; border-radius:6px; margin-bottom:10px;">
                    <br>
                    <button type="button" class="btn btn-outline" id="btn-eliminar-preview">Cambiar imagen</button>
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

    // Cerrar modal
    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.classList.remove('show');
            modal.style.display = ''; // Restablece el display
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

    // Validación adicional para el formulario
    form.addEventListener('submit', function(e) {
        const fecha = fechaInput.value;
        const hoy = getFechaActual();
        
        if (fecha > hoy) {
            e.preventDefault();
            showEcoparmAlert('Error', 'La fecha de la emergencia no puede ser futura.', {
                buttonText: 'Entendido'
            });
            return false;
        }

        // Mostrar mensaje de carga mientras se procesa el formulario
        const isEdit = registroIdInput.value !== '';
        const loadingMessage = isEdit ? 'Actualizando emergencia...' : 'Creando registro de emergencia...';
        
        const loadingAlert = showEcoparmAlert('Procesando', loadingMessage, {
            buttonText: '',
            autoclose: false,
            progress: 0
        });
        
        // Simular progreso (opcional)
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if (progress > 90) clearInterval(progressInterval);
            loadingAlert.progress = progress;
        }, 100);
        
        // Manejar el envío exitoso del formulario
        const handleSuccess = () => {
            clearInterval(progressInterval);
            loadingAlert.close();
            
            const successMessage = isEdit 
                ? '¡Emergencia actualizada correctamente!' 
                : '¡Emergencia registrada correctamente!';
                
            showEcoparmAlert('Éxito', successMessage, {
                buttonText: 'Aceptar',
                autoclose: true,
                autocloseTime: 3000,
                onAccept: function() {
                    modal.classList.remove('show');
                    modal.style.display = 'none';
                    if (!isEdit) {
                        // Recargar la página solo para nuevas emergencias
                        window.location.reload();
                    }
                }
            });
        };
        
        // Manejar errores en el envío del formulario
        const handleError = () => {
            clearInterval(progressInterval);
            loadingAlert.close();
            showEcoparmAlert('Error', 'Ocurrió un error al procesar la solicitud.', {
                buttonText: 'Entendido'
            });
        };
        
        // Si estás usando fetch para enviar el formulario:
        if (typeof fetch === 'function') {
            e.preventDefault();
            const formData = new FormData(form);
            
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    handleSuccess();
                } else {
                    handleError();
                }
            })
            .catch(() => {
                handleError();
            });
        } else {
            // Si estás usando envío tradicional de formulario
            // Necesitarás implementar otra forma de capturar la respuesta
            // Esto es solo un ejemplo básico
            setTimeout(() => {
                // Asume que el envío fue exitoso
                // En una implementación real necesitarías capturar la respuesta del servidor
                handleSuccess();
            }, 1500);
        }
    });

    // Configurar botones de eliminación
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('form');
            
            showConfirmationDialog(
                'Eliminar Emergencia',
                '¿Estás seguro de que deseas eliminar este registro de emergencia?',
                function() {
                    const loadingAlert = showEcoparmAlert('Eliminando', 'Eliminando registro de emergencia...', {
                        buttonText: '',
                        autoclose: false
                    });
                    
                    // Enviar el formulario después de la confirmación
                    form.submit();
                },
                {
                    confirmText: 'Eliminar',
                    cancelText: 'Cancelar'
                }
            );
        });
    });
});