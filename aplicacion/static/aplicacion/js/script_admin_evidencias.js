document.addEventListener('DOMContentLoaded', function () {
    // === BUSCADOR ===
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const inputBuscar = document.getElementById('buscadorEvidencias');
    const filas = document.querySelectorAll('table tbody tr');

    if (btnBuscar && inputBuscar && filas.length > 0) {
        btnBuscar.addEventListener('click', function () {
            const texto = inputBuscar.value.toLowerCase().trim();
            filas.forEach(fila => {
                const visible = fila.textContent.toLowerCase().includes(texto);
                fila.style.display = visible ? '' : 'none';
            });
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function () {
            inputBuscar.value = '';
            filas.forEach(fila => fila.style.display = '');
        });
    }

    // === MODAL ===
    const addBtn = document.getElementById('add-evidence-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            const modal = document.getElementById('add-evidence-modal');
            if (modal) modal.classList.add('show');
        });
    }

    const closeX = document.querySelector('.modal-close');
    if (closeX) {
        closeX.addEventListener('click', function () {
            const modal = document.getElementById('add-evidence-modal');
            if (modal) modal.classList.remove('show');
        });
    }

    const closeBtn = document.querySelector('.modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            const modal = document.getElementById('add-evidence-modal');
            if (modal) modal.classList.remove('show');
        });
    }

    // === TABS ===
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // === DESCARGA ===
    document.querySelectorAll('.download-btn').forEach(btn => {
        const dropdown = btn.nextElementSibling;
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-content').forEach(dc => {
                if (dc !== dropdown) dc.style.display = 'none';
            });
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    });

    document.addEventListener('click', function () {
        document.querySelectorAll('.dropdown-content').forEach(dc => {
            dc.style.display = 'none';
        });
    });

    // === AJUSTES DE UI (Sidebar y contenido) ===
    const menuToggle = document.querySelector('.sidebar-toggle, .navbar-toggler, [data-toggle="sidebar"]');
    if (menuToggle) menuToggle.style.display = 'none';

    const folderIcons = document.querySelectorAll('.fa-folder, .fas.fa-folder, i[class*="folder"]');
    folderIcons.forEach(icon => icon.style.display = 'none');

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
    }
});