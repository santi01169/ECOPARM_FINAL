document.addEventListener('DOMContentLoaded', function () {
    const modals = {
        create: document.getElementById('create-backup-modal'),
        download: document.getElementById('download-modal'),
        restore: document.getElementById('restore-modal'),
        delete: document.getElementById('delete-modal')
    };

    const actionButtons = {
        create: document.getElementById('create-backup-btn'),
        download: document.querySelectorAll('.download-btn'),
        restore: document.querySelectorAll('.restore-btn'),
        delete: document.querySelectorAll('.delete-btn')
    };

    const confirmButtons = {
        create: document.querySelector('#create-backup-modal .btn-primary'),
        download: document.getElementById('confirm-download'),
        restore: document.getElementById('confirm-restore'),
        delete: document.getElementById('confirm-delete')
    };

    let currentBackupId = null;

    function initEvents() {
        // Botón "Nueva Copia"
        actionButtons.create?.addEventListener('click', () => openModal('create'));

        // Botones "Descargar"
        actionButtons.download?.forEach(btn => {
            // Elimina eventos previos
            btn.replaceWith(btn.cloneNode(true));
        });
        // Re-selecciona los botones después de clonar
        const downloadBtns = document.querySelectorAll('.download-btn');
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget || e.target.closest('button');
                const backupId = button?.dataset.backupId;

                if (!backupId) {
                    console.error("❌ Sin backupId");
                    return;
                }

                currentBackupId = backupId;

                const filename = button.closest('tr')?.querySelector('td:first-child')?.textContent || "Archivo";
                document.getElementById('download-filename').textContent = filename;

                openModal('download');
            });
        });

        // Botón "Confirmar descarga"
        // Elimina eventos previos
        const downloadConfirmBtn = document.getElementById('confirm-download');
        if (downloadConfirmBtn) {
            downloadConfirmBtn.replaceWith(downloadConfirmBtn.cloneNode(true));
        }
        const newDownloadConfirmBtn = document.getElementById('confirm-download');
        newDownloadConfirmBtn?.addEventListener('click', () => {
            if (!currentBackupId) {
                alert("ID de backup no válido.");
                return;
            }
            const includeMetadata = document.getElementById('include-metadata')?.checked ?? false;
            window.location.href = `/panel/copias-seguridad/${currentBackupId}/descargar/?metadata=${includeMetadata}`;
            currentBackupId = null;
        });

        // Botones Restaurar
        actionButtons.restore?.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        const restoreBtns = document.querySelectorAll('.restore-btn');
        restoreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget || e.target.closest('button');
                currentBackupId = button?.dataset.backupId;

                const filename = button.closest('tr')?.querySelector('td:first-child')?.textContent || "Archivo";
                document.getElementById('restore-filename').textContent = filename;

                openModal('restore');
            });
        });

        // Botones Eliminar
        actionButtons.delete?.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.currentTarget || e.target.closest('button');
                currentBackupId = button?.dataset.backupId;

                const filename = button.closest('tr')?.querySelector('td:first-child')?.textContent || "Archivo";
                document.getElementById('delete-filename').textContent = filename;

                openModal('delete');
            });
        });

        // Botones confirmar (crear, restaurar, eliminar)
        // Elimina eventos previos
        confirmButtons.create?.replaceWith(confirmButtons.create.cloneNode(true));
        confirmButtons.restore?.replaceWith(confirmButtons.restore.cloneNode(true));
        confirmButtons.delete?.replaceWith(confirmButtons.delete.cloneNode(true));
        // Re-selecciona
        const newCreateBtn = document.querySelector('#create-backup-modal .btn-primary');
        const newRestoreBtn = document.getElementById('confirm-restore');
        const newDeleteBtn = document.getElementById('confirm-delete');
        newCreateBtn?.addEventListener('click', createBackup);
        newRestoreBtn?.addEventListener('click', () => {
            restoreBackup(currentBackupId);
            currentBackupId = null;
        });
        newDeleteBtn?.addEventListener('click', () => {
            deleteBackup(currentBackupId);
            currentBackupId = null;
        });

        // Cerrar modales
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => closeAllModals());
        });

        // Cerrar al hacer clic fuera del modal
        Object.values(modals).forEach(modal => {
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) closeAllModals();
            });
        });
    }

    function openModal(modalType) {
        closeAllModals();
        const modal = modals[modalType];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeAllModals() {
        Object.values(modals).forEach(modal => {
            modal?.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function showLoader() {
        const loader = document.querySelector('.loader');
        if (loader) loader.style.display = 'flex';
    }

    function hideLoader() {
        const loader = document.querySelector('.loader');
        if (loader) loader.style.display = 'none';
    }

    function showAlert(type, message) {
        let alertTitle = '';
        switch (type) {
            case 'success':
                alertTitle = '¡Éxito!';
                break;
            case 'error':
                alertTitle = 'Error';
                break;
            case 'warning':
                alertTitle = 'Advertencia';
                break;
            default:
                alertTitle = 'Información';
        }

        showEcoparmAlert(alertTitle, message, {
            buttonText: 'Aceptar',
            autocloseTime: 3500
        });
    }

    async function createBackup() {
        const modal = document.getElementById('create-backup-modal');
        const formData = {
            nombre: modal.querySelector('input[type="text"]').value,
            tipo: modal.querySelector('select').value.toLowerCase(),
            incluye_db: document.getElementById('include-db').checked,
            incluye_archivos: document.getElementById('include-files').checked,
            incluye_config: document.getElementById('include-config').checked,
            descripcion: modal.querySelector('textarea').value
        };

        try {
            showLoader();
            const response = await fetch('/panel/copias-seguridad/crear/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.status === 'success') {
                addBackupToTable(data.backup);
                closeAllModals();
                showAlert('success', 'Copia de seguridad creada exitosamente');
                // Agregar recarga de página después de 2 segundos
                setTimeout(() => window.location.reload(), 2000);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            showAlert('error', `Error al crear la copia: ${error.message}`);
        } finally {
            hideLoader();
        }
    }

    async function restoreBackup(backupId) {
        const restoreOption = document.getElementById('restore-option')?.value;

        showConfirmationDialog(
            'Restaurar Copia de Seguridad',
            '¿Está seguro de restaurar el sistema? Esta acción no se puede deshacer.',
            async function () {
                try {
                    showLoader();
                    const response = await fetch(`/panel/copias-seguridad/${backupId}/restaurar/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({ restore_option: restoreOption })
                    });

                    let data;
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        throw new Error('Respuesta inesperada del servidor');
                    }

                    if (data.status === 'success') {
                        closeAllModals();
                        showAlert('success', 'Sistema restaurado exitosamente');
                        // Forzar recarga después de 2 segundos
                        setTimeout(() => {
                            window.location.reload(true); // El parámetro true fuerza recarga desde el servidor
                        }, 2000);
                    } else {
                        throw new Error(data.message || 'Error desconocido');
                    }
                } catch (error) {
                    showAlert('error', `Error al restaurar: ${error.message}`);
                } finally {
                    hideLoader();
                }
            },
            {
                confirmText: 'Sí, restaurar',
                cancelText: 'Cancelar'
            }
        );
    }



















    

    async function deleteBackup(backupId) {
        try {
            showLoader();
            const response = await fetch(`/panel/copias-seguridad/${backupId}/eliminar/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Respuesta inesperada del servidor');
            }

            if (data.status === 'success') {
                document.querySelector(`tr[data-backup-id="${backupId}"]`)?.remove();
                closeAllModals();
                showAlert('success', 'Copia de seguridad eliminada exitosamente');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            showAlert('error', `Error al eliminar: ${error.message}`);
        } finally {
            hideLoader();
        }
    }

    function addBackupToTable(backup) {
        const tbody = document.querySelector('table tbody');
        const row = document.createElement('tr');
        row.dataset.backupId = backup.id;

        row.innerHTML = `
            <td>${backup.nombre}</td>
            <td>${backup.fecha}</td>
            <td>${backup.tamano}</td>
            <td>${backup.creado_por || ''}</td>
            <td><span class="badge badge-success">${backup.estado}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn download-btn" title="Descargar" data-backup-id="${backup.id}">
                        <i class="fas fa-download"></i> 
                    </button>
                    <button class="action-btn restore-btn" title="Restaurar" data-backup-id="${backup.id}">
                        <i class="fas fa-undo"></i> 
                    </button>
                    <button class="action-btn delete-btn" title="Eliminar" data-backup-id="${backup.id}">
                        <i class="fas fa-trash"></i> 
                    </button>
                </div>
            </td>
        `;

        tbody.insertBefore(row, tbody.firstChild);

        // Asigna eventos SOLO a los botones de la nueva fila
        const downloadBtn = row.querySelector('.download-btn');
        const restoreBtn = row.querySelector('.restore-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        downloadBtn?.addEventListener('click', (e) => {
            const button = e.currentTarget || e.target.closest('button');
            const backupId = button?.dataset.backupId;
            if (!backupId) {
                console.error("❌ Sin backupId");
                return;
            }
            currentBackupId = backupId;
            const filename = button.closest('tr')?.querySelector('td:first-child')?.textContent || "Archivo";
            document.getElementById('download-filename').textContent = filename;
            openModal('download');
        });

        restoreBtn?.addEventListener('click', (e) => {
            const button = e.currentTarget || e.target.closest('button');
            currentBackupId = button?.dataset.backupId;
            const filename = button.closest('tr')?.querySelector('td:first-child')?.textContent || "Archivo";
            document.getElementById('restore-filename').textContent = filename;
            openModal('restore');
        });

        deleteBtn?.addEventListener('click', (e) => {
            const button = e.currentTarget || e.target.closest('button');
            currentBackupId = button?.dataset.backupId;
            const filename = button.closest('tr')?.querySelector('td:first-child')?.textContent || "Archivo";
            document.getElementById('delete-filename').textContent = filename;
            openModal('delete');
        });
    }

    // Inicia todo
    initEvents();

    function showConfirmationDialog(title, message, confirmCallback, options = {}) {
        showEcoparmAlert(title, message, {
            buttonText: options.confirmText || 'Confirmar',
            autoclose: false,
            onAccept: confirmCallback,
            showCancel: true,
            cancelText: options.cancelText || 'Cancelar'
        });
    }

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
        alertFooter.innerHTML = '';

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
    }
});
