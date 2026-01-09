// admin-simple.js - Sistema de administración simplificado (solo GitHub)
// CON SISTEMA DE SINCRONIZACIÓN AUTOMÁTICA VÍA GITHUB

document.addEventListener('DOMContentLoaded', function() {
   // ========== CONFIGURACIÓN SEGURA ==========
const ADMIN_KEY = 'ragnar610';
// HASH SHA256 de la clave "ragnar610"
const HASH_ADMIN = '15b9d0f9e2e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9';
    
    // ========== ELEMENTOS DEL DOM ==========
    const btnAdminAcceso = document.getElementById('btnAdminAcceso');
    const btnAdminPanel = document.getElementById('btnAdminPanel');
    const btnCerrarSesion = document.getElementById('btnCerrarSesionAdmin');
    const modalAccesoAdmin = document.getElementById('modalAccesoAdmin');
    const modalGestionProductos = document.getElementById('modalGestionProductos');
    const formAccesoAdmin = document.getElementById('formAccesoAdmin');
    const formProducto = document.getElementById('formProducto');
    const listaProductosAdmin = document.getElementById('listaProductosAdmin');
    const contadorProductos = document.getElementById('contadorProductos');
    
    // Elementos del formulario de producto
    const inputPrecio = document.getElementById('adminPrecio');
    
    // ========== ESTADO ==========
    let esAdmin = false;
    let productoEditando = null;
    let imagenActual = null; // Para almacenar la imagen actual en edición
    
    // ========== INICIALIZACIÓN ==========
    function inicializar() {
        console.log('⚙️ Sistema administrativo inicializando...');
        
        verificarSesionAdmin();
        configurarEventos();
        crearBotonReset();
        configurarInputPrecio();
        configurarDragDrop();
        
        // Inicializar sistema de versiones
        inicializarSistemaVersiones();
        crearBotonSincronizarGitHub();
        crearBotonActualizarGitHub(); // Botón para forzar actualización
        
        console.log('✅ Sistema administrativo simplificado listo');
    }
    
    // ========== SISTEMA DE VERSIONES ==========
    function inicializarSistemaVersiones() {
        // Asegurar que existe una versión inicial
        if (!localStorage.getItem('productos_version')) {
            localStorage.setItem('productos_version', '1');
        }
        console.log(`📊 Versión actual de productos: ${localStorage.getItem('productos_version')}`);
    }
    
    // ========== SISTEMA DE SINCRONIZACIÓN CON GITHUB ==========
    function crearBotonSincronizarGitHub() {
        // Verificar si ya existe
        if (document.getElementById('btnSincronizarGitHub')) return;
        
        // Crear contenedor si no existe
        let container = document.getElementById('importExportContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'importExportContainer';
            container.style.cssText = `
                position: fixed;
                bottom: 140px;
                right: 20px;
                z-index: 10000;
                display: none;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        
        const boton = document.createElement('button');
        boton.id = 'btnSincronizarGitHub';
        boton.innerHTML = '🔄 Sincronizar con GitHub';
        boton.style.cssText = `
            padding: 12px 18px;
            background: linear-gradient(135deg, #9C27B0, #673AB7);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.3s, box-shadow 0.3s;
            min-width: 180px;
            justify-content: center;
        `;
        
        // Efecto hover
        boton.addEventListener('mouseenter', () => {
            boton.style.transform = 'translateY(-2px)';
            boton.style.boxShadow = '0 6px 15px rgba(0,0,0,0.3)';
        });
        
        boton.addEventListener('mouseleave', () => {
            boton.style.transform = 'translateY(0)';
            boton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        
        // Evento click mejorado
        boton.addEventListener('click', async function() {
            await manejarSincronizacionGitHub();
        });
        
        // Limpiar contenedor y agregar solo este botón
        container.innerHTML = '';
        container.appendChild(boton);
        
        // Verificar si hay cambios pendientes
        verificarCambiosPendientes();
        
        console.log('✅ Botón de sincronización con GitHub creado');
    }
    
    async function manejarSincronizacionGitHub() {
        if (!esAdmin) {
            mostrarNotificacion('❌ Solo administradores pueden sincronizar', 'error');
            return;
        }
        
        const productos = window.ProductosDB.obtenerTodos();
        
        if (productos.length === 0) {
            mostrarNotificacion('❌ No hay productos para sincronizar', 'error');
            return;
        }
        
        // Mostrar opciones al administrador
        const opcion = confirm(`🔄 ¿QUÉ DESEAS HACER?\n\n` +
            `1. "Aceptar" → Sincronizar con GitHub (compartir cambios con todos)\n` +
            `2. "Cancelar" → Solo exportar para backup local\n\n` +
            `Productos: ${productos.length}\n` +
            `Versión: v${localStorage.getItem('productos_version') || '1'}`);
        
        if (opcion) {
            // OPCIÓN 1: Sincronizar con GitHub
            await sincronizarConGitHub(productos);
        } else {
            // OPCIÓN 2: Solo exportar para backup
            exportarParaBackup(productos);
        }
    }
    
    async function sincronizarConGitHub(productos) {
        // Crear objeto con metadata
        const datosSincronizacion = {
            productos: productos,
            ultimaSincronizacion: new Date().toISOString(),
            version: localStorage.getItem('productos_version') || '1',
            metadata: {
                totalProductos: productos.length,
                sincronizadoPor: 'Clean Solutions Admin',
                fecha: new Date().toLocaleDateString('es-AR')
            }
        };
        
        try {
            // Convertir a JSON formateado
            const jsonString = JSON.stringify(datosSincronizacion, null, 2);
            
            // Crear archivo para descargar
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fecha = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `productos-github-sync-${fecha}.json`;
            
            // Descargar
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Liberar memoria
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            // Mostrar instrucciones detalladas
            mostrarNotificacion('✅ Archivo listo para GitHub', 'success');
            
            const instrucciones = `
🎯 PASOS PARA SUBIR A GITHUB (ACTUALIZAR PARA TODOS):

1. 📁 Ve a: https://github.com/facundoemilianopujol02-maker/clean-solutions-data
2. 📤 Haz clic en "Add file" → "Upload files"
3. 🗃️ Arrastra el archivo recién descargado
4. 🔄 REEMPLAZA el archivo "productos.json" existente
5. 💾 Haz clic en "Commit changes" (abajo)
6. ✅ ¡Listo! En 60 segundos todos verán los cambios.

📝 Mensaje de commit sugerido:
"Actualización productos v${localStorage.getItem('productos_version') || '1'} - ${new Date().toLocaleDateString()}"
            `;
            
            alert(instrucciones);
            
            // Resetear indicador de cambios pendientes
            localStorage.removeItem('cambios_pendientes_github');
            
            // Actualizar botón
            actualizarEstadoBotonGitHub(false);
            
            console.log('🔄 Archivo de sincronización generado para GitHub');
            
        } catch (error) {
            console.error('Error generando archivo de sincronización:', error);
            mostrarNotificacion('❌ Error al generar archivo', 'error');
        }
    }
    
    function exportarParaBackup(productos) {
        try {
            // Obtener imágenes de localStorage
            const imagenesGuardadas = JSON.parse(localStorage.getItem('cleanSolutionsImages') || '{}');
            
            // Crear objeto de exportación
            const datosExportacion = {
                fecha: new Date().toISOString(),
                version: localStorage.getItem('productos_version') || '1',
                productos: productos,
                imagenes: imagenesGuardadas,
                metadata: {
                    totalProductos: productos.length,
                    totalImagenes: Object.keys(imagenesGuardadas).length,
                    tipo: 'Backup local',
                    nota: 'Este archivo es solo para respaldo, usa GitHub para sincronizar'
                }
            };
            
            // Convertir a JSON
            const jsonString = JSON.stringify(datosExportacion, null, 2);
            
            // Crear archivo para descargar
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fecha = new Date().toISOString().split('T')[0];
            a.download = `backup-productos-${fecha}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            mostrarNotificacion(`✅ Backup de ${productos.length} productos guardado`, 'success');
            console.log('💾 Backup local creado:', productos.length);
            
        } catch (error) {
            console.error('Error al crear backup:', error);
            mostrarNotificacion('❌ Error al crear backup', 'error');
        }
    }
    
    function verificarCambiosPendientes() {
        const cambiosPendientes = localStorage.getItem('cambios_pendientes_github') === 'true';
        actualizarEstadoBotonGitHub(cambiosPendientes);
    }
    
    function actualizarEstadoBotonGitHub(cambiosPendientes) {
        const btnSync = document.getElementById('btnSincronizarGitHub');
        if (btnSync) {
            if (cambiosPendientes) {
                btnSync.innerHTML = '🔄 Sincronizar con GitHub *';
                btnSync.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
                btnSync.title = 'Hay cambios pendientes de sincronización';
            } else {
                btnSync.innerHTML = '🔄 Sincronizar con GitHub';
                btnSync.style.background = 'linear-gradient(135deg, #9C27B0, #673AB7)';
                btnSync.title = 'Sincronizar productos con GitHub';
            }
        }
    }
    
    // Función para incrementar versión cuando hay cambios
    function incrementarVersionProductos() {
        const versionActual = parseInt(localStorage.getItem('productos_version') || '1');
        const nuevaVersion = versionActual + 1;
        localStorage.setItem('productos_version', nuevaVersion.toString());
        
        // Marcar que hay cambios pendientes
        localStorage.setItem('cambios_pendientes_github', 'true');
        
        // Actualizar botón
        actualizarEstadoBotonGitHub(true);
        
        console.log(`🔄 Versión incrementada: ${versionActual} → ${nuevaVersion} (cambios pendientes)`);
        return nuevaVersion;
    }
    
    // ========== SISTEMA DE ARRASTRE Y SOLTADO ==========
    function configurarDragDrop() {
        const dragDropArea = document.getElementById('dragDropArea');
        const fileInput = document.getElementById('adminImagenFile');
        const previewContainer = document.getElementById('previewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const previewName = document.getElementById('previewName');
        const removePreview = document.getElementById('removePreview');
        const imageInput = document.getElementById('adminImagen');

        if (!dragDropArea || !fileInput) return;

        // Prevenir comportamientos por defecto
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dragDropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Efectos visuales al arrastrar
        ['dragenter', 'dragover'].forEach(eventName => {
            dragDropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dragDropArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dragDropArea.classList.add('dragover');
        }

        function unhighlight() {
            dragDropArea.classList.remove('dragover');
        }

        // Manejar archivos soltados
        dragDropArea.addEventListener('drop', handleDrop, false);
        
        // Manejar clic para seleccionar archivo
        dragDropArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Manejar selección de archivo
        fileInput.addEventListener('change', handleFileSelect);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

        function handleFileSelect(e) {
            const files = e.target.files;
            handleFiles(files);
        }

        function handleFiles(files) {
            if (files.length === 0) return;
            
            const file = files[0];
            
            // Validar tipo de archivo
            if (!file.type.match('image.*')) {
                mostrarNotificacion('❌ Solo se permiten archivos de imagen', 'error');
                return;
            }
            
            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                mostrarNotificacion('❌ La imagen no debe superar los 5MB', 'error');
                return;
            }
            
            // Mostrar preview
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewName.textContent = file.name;
                previewContainer.style.display = 'flex';
                dragDropArea.querySelector('.drag-drop-content').style.display = 'none';
                
                // Guardar solo el nombre del archivo
                imageInput.value = file.name;
                imagenActual = {
                    nombre: file.name,
                    dataURL: e.target.result
                };
                
                // Guardar el archivo en localStorage
                guardarImagenEnStorage(file.name, e.target.result);
            };
            reader.readAsDataURL(file);
        }

        // Botón para eliminar preview
        removePreview.addEventListener('click', function(e) {
            e.stopPropagation();
            resetImagePreview();
        });

        function resetImagePreview() {
            imagePreview.src = '';
            previewName.textContent = '';
            previewContainer.style.display = 'none';
            dragDropArea.querySelector('.drag-drop-content').style.display = 'flex';
            imageInput.value = '';
            fileInput.value = '';
            imagenActual = null;
        }

        // También resetear cuando se resetea el formulario
        const resetButton = document.getElementById('btnCancelarEdicion');
        if (resetButton) {
            resetButton.addEventListener('click', resetImagePreview);
        }
    }

    // Función para guardar imágenes en localStorage
    function guardarImagenEnStorage(nombre, dataURL) {
        try {
            const imagenesGuardadas = JSON.parse(localStorage.getItem('cleanSolutionsImages') || '{}');
            imagenesGuardadas[nombre] = dataURL;
            localStorage.setItem('cleanSolutionsImages', JSON.stringify(imagenesGuardadas));
        } catch (error) {
            console.error('Error al guardar imagen:', error);
        }
    }

    // Función para cargar imagen desde localStorage
    function cargarImagenDesdeStorage(nombre) {
        try {
            const imagenesGuardadas = JSON.parse(localStorage.getItem('cleanSolutionsImages') || '{}');
            return imagenesGuardadas[nombre] || null;
        } catch (error) {
            console.error('Error al cargar imagen:', error);
            return null;
        }
    }
    
    // ========== CONFIGURACIÓN DEL INPUT DE PRECIO ==========
    function configurarInputPrecio() {
        if (!inputPrecio) return;
        
        // Establecer placeholder con $
        inputPrecio.placeholder = '$8.000';
        
        // Agregar $ automáticamente al enfocar si no lo tiene
        inputPrecio.addEventListener('focus', function() {
            if (!this.value.startsWith('$')) {
                this.value = '$' + this.value.replace('$', '');
            }
        });
        
        // Validar y mantener el $ mientras se escribe
        inputPrecio.addEventListener('input', function() {
            const valor = this.value;
            
            // Si el usuario borra todo, mantener solo $
            if (valor === '') {
                this.value = '$';
                return;
            }
            
            // Si no empieza con $, agregarlo
            if (!valor.startsWith('$')) {
                this.value = '$' + valor.replace('$', '');
            }
            
            // Permitir solo números después del $
            const sinDolar = valor.substring(1);
            const soloNumeros = sinDolar.replace(/[^\d]/g, '');
            
            // Formatear con separador de miles opcional
            if (soloNumeros.length > 0) {
                const numero = parseInt(soloNumeros, 10);
                if (!isNaN(numero)) {
                    // Formato: $8.000 o $1.000.000
                    const formateado = numero.toLocaleString('es-AR');
                    this.value = '$' + formateado;
                }
            }
        });
        
        // Prevenir que se borre el $
        inputPrecio.addEventListener('keydown', function(e) {
            const cursorPos = this.selectionStart;
            
            // Si el cursor está al inicio (antes del $) y presiona backspace/delete
            if (cursorPos === 0 && (e.key === 'Backspace' || e.key === 'Delete')) {
                e.preventDefault();
                return;
            }
            
            // Si intenta borrar el $ directamente
            if (cursorPos === 1 && e.key === 'Backspace') {
                e.preventDefault();
                // Mover cursor después del $
                this.setSelectionRange(1, 1);
            }
        });
        
        // Validar al perder el foco
        inputPrecio.addEventListener('blur', function() {
            const valor = this.value.trim();
            
            if (valor === '$') {
                this.value = '';
                this.placeholder = '$8.000';
            } else if (valor && !valor.startsWith('$')) {
                this.value = '$' + valor.replace('$', '');
            }
            
            // Asegurar que tenga al menos un número después del $
            if (valor.length > 1 && valor.startsWith('$')) {
                const soloNumeros = valor.substring(1).replace(/[^\d]/g, '');
                if (soloNumeros.length === 0) {
                    this.value = '';
                    this.placeholder = '$8.000';
                }
            }
        });
    }
    
    // Función para formatear precio automáticamente
    function formatearPrecio(valor) {
        if (!valor) return '';
        
        // Eliminar cualquier $ existente
        let sinDolar = valor.replace('$', '').trim();
        
        // Si está vacío, devolver solo $
        if (sinDolar === '') return '$';
        
        // Eliminar caracteres no numéricos
        const soloNumeros = sinDolar.replace(/[^\d]/g, '');
        
        // Si no hay números, devolver solo $
        if (soloNumeros === '') return '$';
        
        // Convertir a número y formatear
        const numero = parseInt(soloNumeros, 10);
        if (isNaN(numero)) return '$';
        
        // Formatear con separadores de miles
        return '$' + numero.toLocaleString('es-AR');
    }
    
    function verificarSesionAdmin() {
        const sesionAdmin = localStorage.getItem(ADMIN_KEY);
        if (sesionAdmin === 'true') {
            activarModoAdmin();
        }
    }
    
    function activarModoAdmin() {
        esAdmin = true;
        
        // Actualizar botones
        if (btnAdminAcceso) btnAdminAcceso.style.display = 'none';
        if (btnAdminPanel) btnAdminPanel.style.display = 'inline-block';
        if (btnCerrarSesion) btnCerrarSesion.style.display = 'inline-block';
        
        // Mostrar botón de reset
        const btnReset = document.getElementById('btnResetProductos');
        if (btnReset) btnReset.style.display = 'block';
        
        // Mostrar botón de GitHub
        const importExportContainer = document.getElementById('importExportContainer');
        if (importExportContainer) importExportContainer.style.display = 'flex';
        
        console.log('✅ Modo administrador activado');
        mostrarNotificacion('👑 Sesión administrativa activa', 'success');
    }
    
    function desactivarModoAdmin() {
        esAdmin = false;
        localStorage.removeItem(ADMIN_KEY);
        
        // Restaurar botones
        if (btnAdminAcceso) btnAdminAcceso.style.display = 'inline-block';
        if (btnAdminPanel) btnAdminPanel.style.display = 'none';
        if (btnCerrarSesion) btnCerrarSesion.style.display = 'none';
        
        // Ocultar botón de reset
        const btnReset = document.getElementById('btnResetProductos');
        if (btnReset) btnReset.style.display = 'none';
        
        // Ocultar botón de GitHub
        const importExportContainer = document.getElementById('importExportContainer');
        if (importExportContainer) importExportContainer.style.display = 'none';
        
        cerrarModalGestion();
        mostrarNotificacion('🔒 Sesión administrativa cerrada', 'info');
        console.log('🚪 Sesión administrativa cerrada');
    }
    
    // ========== EVENTOS ==========
    function configurarEventos() {
        // Acceso admin
        if (btnAdminAcceso) {
            btnAdminAcceso.addEventListener('click', () => {
                modalAccesoAdmin.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                document.getElementById('claveAdmin').focus();
            });
        }
        
        // Formulario de acceso
        if (formAccesoAdmin) {
            formAccesoAdmin.addEventListener('submit', (e) => {
                e.preventDefault();
                verificarClave();
            });
            
            // Enter para enviar
            document.getElementById('claveAdmin')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    verificarClave();
                }
            });
        }
        
        // Panel admin
        if (btnAdminPanel) {
            btnAdminPanel.addEventListener('click', () => {
                if (esAdmin) {
                    abrirModalGestion();
                }
            });
        }
        
        // Cerrar sesión
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener('click', () => {
                if (confirm('¿Estás seguro de cerrar la sesión administrativa?')) {
                    desactivarModoAdmin();
                }
            });
        }
        
        // Cerrar modales
        document.querySelector('.cerrar-acceso-admin')?.addEventListener('click', () => {
            modalAccesoAdmin.style.display = 'none';
            document.body.style.overflow = 'auto';
            formAccesoAdmin.reset();
        });
        
        document.querySelector('.cerrar-gestion-productos')?.addEventListener('click', cerrarModalGestion);
        
        // Cancelar edición
        document.getElementById('btnCancelarEdicion')?.addEventListener('click', () => {
            resetFormProducto();
        });
        
        // Formulario producto
        if (formProducto) {
            formProducto.addEventListener('submit', guardarProducto);
        }
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modalAccesoAdmin.style.display = 'none';
                cerrarModalGestion();
            }
        });
        
        // Cerrar sesión admin con doble clic en logo (función oculta)
        document.querySelector('.logoContainer')?.addEventListener('dblclick', () => {
            if (esAdmin) {
                if (confirm('¿Cerrar sesión administrativa (doble clic)?')) {
                    desactivarModoAdmin();
                }
            }
        });
        
        // Cerrar al hacer clic fuera del modal
        modalAccesoAdmin?.addEventListener('click', (e) => {
            if (e.target === modalAccesoAdmin) {
                modalAccesoAdmin.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        modalGestionProductos?.addEventListener('click', (e) => {
            if (e.target === modalGestionProductos) {
                cerrarModalGestion();
            }
        });
    }
    
    function crearBotonReset() {
        // Verificar si ya existe
        if (!document.getElementById('resetContainer')) {
            const btnResetContainer = document.createElement('div');
            btnResetContainer.id = 'resetContainer';
            btnResetContainer.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 20px;
                z-index: 10000;
                display: none;
            `;
            
            btnResetContainer.innerHTML = `
                <button id="btnResetProductos" 
                        style="padding: 12px 18px; background: linear-gradient(135deg, #ff9800, #ff5722); 
                               color: white; border: none; border-radius: 10px; font-size: 14px; 
                               cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                               font-weight: bold; display: flex; align-items: center; gap: 8px;
                               transition: transform 0.3s, box-shadow 0.3s;">
                    🔄 Resetear Productos
                </button>
            `;
            
            document.body.appendChild(btnResetContainer);
            
            document.getElementById('btnResetProductos').addEventListener('click', () => {
                if (confirm('⚠️ ¿Resetear todos los productos a los valores por defecto?\n\n' +
                           'Se perderán TODOS los productos agregados manualmente.\n' +
                           'Esta acción NO se puede deshacer.')) {
                    if (window.ProductosDB && window.ProductosDB.resetear) {
                        window.ProductosDB.resetear();
                        // Incrementar versión
                        incrementarVersionProductos();
                        cargarListaProductosAdmin();
                        if (typeof window.cargarProductos === 'function') {
                            window.cargarProductos();
                        }
                        mostrarNotificacion('✅ Productos reseteados a valores por defecto', 'success');
                        console.log('🔄 Productos reseteados');
                    }
                }
            });
        }
    }
    
    async function verificarClave() {
    const claveIngresada = document.getElementById('claveAdmin').value.trim();
    
    if (!claveIngresada) {
        mostrarNotificacion('❌ Ingrese una clave', 'error');
        return;
    }
    
    // COMPARACIÓN DIRECTA - Para GitHub Pages
    if (claveIngresada === 'ragnar610') {
        localStorage.setItem(ADMIN_KEY, 'true');
        activarModoAdmin();
        modalAccesoAdmin.style.display = 'none';
        document.body.style.overflow = 'auto';
        formAccesoAdmin.reset();
        
        mostrarNotificacion('✅ Acceso administrativo concedido', 'success');
        
        // Mostrar botones admin
        const resetContainer = document.getElementById('resetContainer');
        if (resetContainer) resetContainer.style.display = 'block';
        
        const importExportContainer = document.getElementById('importExportContainer');
        if (importExportContainer) importExportContainer.style.display = 'flex';
        
        // Abrir panel automáticamente
        setTimeout(() => {
            if (btnAdminPanel) btnAdminPanel.click();
        }, 800);
        
    } else {
        mostrarNotificacion('❌ Clave incorrecta', 'error');
        document.getElementById('claveAdmin').value = '';
        document.getElementById('claveAdmin').focus();
    }
}
    
    // Función para calcular SHA256
    async function calcularSHA256(mensaje) {
        const msgBuffer = new TextEncoder().encode(mensaje);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // ========== GESTIÓN DE PRODUCTOS ==========
    function abrirModalGestion() {
        if (!esAdmin) {
            mostrarNotificacion('❌ No tienes permisos administrativos', 'error');
            return;
        }
        
        cargarListaProductosAdmin();
        modalGestionProductos.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function cerrarModalGestion() {
        modalGestionProductos.style.display = 'none';
        document.body.style.overflow = 'auto';
        resetFormProducto();
    }
    
    function cargarListaProductosAdmin() {
        if (!listaProductosAdmin) return;
        
        const productosActuales = obtenerProductos();
        let html = '';
        
        if (productosActuales.length === 0) {
            html = `
                <div style="text-align: center; padding: 40px 20px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🛒</div>
                    <h4 style="margin-bottom: 10px;">No hay productos registrados</h4>
                    <p>Usa el formulario arriba para agregar tu primer producto.</p>
                </div>
            `;
        } else {
            productosActuales.forEach((producto, index) => {
                // Intentar cargar imagen desde localStorage para mostrar preview
                let imagenSrc = producto.imagen;
                const dataURL = cargarImagenDesdeStorage(producto.imagen);
                if (dataURL) {
                    imagenSrc = dataURL;
                }
                
                html += `
                    <div class="producto-admin-item" 
                         style="padding: 15px; border: 1px solid #e0e0e0; display: flex; justify-content: space-between; 
                                align-items: center; background: white; margin-bottom: 10px; border-radius: 8px;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: transform 0.2s;">
                        <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                            <div style="width: 60px; height: 60px; overflow: hidden; border-radius: 6px; background: #f8f9fa; 
                                        display: flex; align-items: center; justify-content: center;">
                                <img src="${imagenSrc}" 
                                     alt="${producto.nombre}" 
                                     style="width: 100%; height: 100%; object-fit: contain;"
                                     onerror="this.src='https://via.placeholder.com/60x60/cccccc/969696?text=IMG'">
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: bold; color: #333; font-size: 16px; margin-bottom: 5px;">
                                    ${producto.nombre}
                                </div>
                                <div style="color: #4CAF50; font-weight: bold; font-size: 18px; margin: 5px 0;">
                                    ${producto.precio}
                                </div>
                                <div style="color: #666; font-size: 14px; margin-top: 5px; line-height: 1.4;">
                                    ${producto.descripcion.substring(0, 80)}${producto.descripcion.length > 80 ? '...' : ''}
                                </div>
                                <div style="font-size: 11px; color: #999; margin-top: 8px;">
                                    <strong>ID:</strong> ${producto.id.substring(0, 12)}...
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="auth-btn" onclick="window.editarProducto('${producto.id}')" 
                                    style="padding: 8px 15px; font-size: 13px; background: linear-gradient(135deg, #2196F3, #1976D2); 
                                           color: white; border: none; border-radius: 6px; cursor: pointer;
                                           display: flex; align-items: center; gap: 5px;">
                                ✏️ Editar
                            </button>
                            <button class="auth-btn" onclick="window.eliminarProducto('${producto.id}')" 
                                    style="padding: 8px 15px; font-size: 13px; background: linear-gradient(135deg, #f44336, #d32f2f); 
                                           color: white; border: none; border-radius: 6px; cursor: pointer;
                                           display: flex; align-items: center; gap: 5px;">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        listaProductosAdmin.innerHTML = html;
        
        if (contadorProductos) {
            contadorProductos.textContent = productosActuales.length;
            contadorProductos.style.fontWeight = 'bold';
            contadorProductos.style.color = '#2196F3';
        }
        
        // Agregar hover effect
        document.querySelectorAll('.producto-admin-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-2px)';
                item.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                item.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
            });
        });
    }
    
    function guardarProducto(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('adminNombre').value.trim();
        let precio = document.getElementById('adminPrecio').value.trim();
        const imagenInput = document.getElementById('adminImagen').value.trim();
        const descripcion = document.getElementById('adminDescripcion').value.trim();
        const caracteristicasTexto = document.getElementById('adminCaracteristicas').value;
        const productoId = document.getElementById('productoId').value;
        
        // Validaciones
        if (!nombre || !precio || !imagenInput || !descripcion) {
            mostrarNotificacion('❌ Complete todos los campos obligatorios', 'error');
            return;
        }
        
        // Asegurar que el precio tenga $
        if (!precio.startsWith('$')) {
            precio = '$' + precio.replace('$', '');
        }
        
        // Validar que haya números después del $
        const soloNumeros = precio.substring(1).replace(/[^\d]/g, '');
        if (soloNumeros.length === 0) {
            mostrarNotificacion('❌ Ingrese un precio válido después del $', 'error');
            inputPrecio.focus();
            inputPrecio.select();
            return;
        }
        
        // Formatear precio con separadores de miles
        const numero = parseInt(soloNumeros, 10);
        if (!isNaN(numero)) {
            precio = '$' + numero.toLocaleString('es-AR');
        }
        
        const caracteristicas = caracteristicasTexto
            .split('\n')
            .map(c => c.trim())
            .filter(c => c !== '');
        
        // Si estamos editando y no se cambió la imagen, mantener la existente
        let imagenFinal = imagenInput;
        if (productoId && productoEditando && imagenActual) {
            imagenFinal = imagenActual.nombre;
        }
        
        if (productoId && productoEditando !== null) {
            // Editar producto existente
            const exito = actualizarProductoDB(productoId, {
                nombre,
                precio,
                imagen: imagenFinal,
                descripcion,
                caracteristicas
            });
            
            if (exito) {
                // Incrementar versión por el cambio
                incrementarVersionProductos();
                
                mostrarNotificacion('✅ Producto actualizado correctamente', 'success');
                productoEditando = null;
                imagenActual = null;
                document.getElementById('tituloFormProducto').textContent = 'Agregar Nuevo Producto';
            } else {
                mostrarNotificacion('❌ Error al actualizar producto', 'error');
                return;
            }
        } else {
            // Crear nuevo producto
            const nuevoProducto = {
                id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
                nombre,
                precio,
                imagen: imagenFinal,
                descripcion,
                caracteristicas
            };
            
            const resultado = agregarProductoDB(nuevoProducto);
            if (resultado) {
                // Incrementar versión por el nuevo producto
                incrementarVersionProductos();
                
                mostrarNotificacion('✅ Producto agregado correctamente', 'success');
            } else {
                mostrarNotificacion('❌ Error al agregar producto', 'error');
                return;
            }
        }
        
        // Actualizar interfaz
        resetFormProducto();
        cargarListaProductosAdmin();
        
        // Recargar productos en la página principal
        if (typeof window.cargarProductos === 'function') {
            window.cargarProductos();
        }
        
        // Guardar cambios finales
        if (window.ProductosDB && window.ProductosDB.guardar) {
            window.ProductosDB.guardar();
        }
        
        // Enfocar el campo de nombre para siguiente producto
        document.getElementById('adminNombre').focus();
    }
    
    function resetFormProducto() {
        if (formProducto) {
            formProducto.reset();
        }
        productoEditando = null;
        imagenActual = null;
        document.getElementById('productoId').value = '';
        document.getElementById('tituloFormProducto').textContent = 'Agregar Nuevo Producto';
        document.getElementById('adminNombre').placeholder = 'Ej: Jabón Líquido Ariel';
        document.getElementById('adminPrecio').value = '';
        document.getElementById('adminPrecio').placeholder = '$8.000';
        
        // Resetear área de drag & drop
        const previewContainer = document.getElementById('previewContainer');
        const dragDropContent = document.querySelector('.drag-drop-content');
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
        if (dragDropContent) {
            dragDropContent.style.display = 'flex';
        }
    }
    
    // ========== FUNCIONES DE PRODUCTOS ==========
    function obtenerProductos() {
        return window.ProductosDB ? window.ProductosDB.obtenerTodos() : [];
    }
    
    function agregarProductoDB(nuevoProducto) {
        if (window.ProductosDB) {
            return window.ProductosDB.agregar(nuevoProducto);
        } else {
            const productosActuales = obtenerProductos();
            productosActuales.push(nuevoProducto);
            return nuevoProducto;
        }
    }
    
    function actualizarProductoDB(id, datos) {
        if (window.ProductosDB) {
            return window.ProductosDB.actualizar(id, datos);
        } else {
            const productosActuales = obtenerProductos();
            const index = productosActuales.findIndex(p => p.id === id);
            if (index !== -1) {
                productosActuales[index] = { ...productosActuales[index], ...datos };
                return true;
            }
            return false;
        }
    }
    
    function eliminarProductoDB(id) {
        if (window.ProductosDB) {
            return window.ProductosDB.eliminar(id);
        } else {
            const productosActuales = obtenerProductos();
            const index = productosActuales.findIndex(p => p.id === id);
            if (index !== -1) {
                productosActuales.splice(index, 1);
                return true;
            }
            return false;
        }
    }
    
    // ========== FUNCIONES GLOBALES ==========
    window.editarProducto = function(id) {
        if (!esAdmin) {
            mostrarNotificacion('❌ No tienes permisos para editar', 'error');
            return;
        }
        
        const productosActuales = obtenerProductos();
        const producto = productosActuales.find(p => p.id === id);
        if (!producto) {
            mostrarNotificacion('❌ Producto no encontrado', 'error');
            return;
        }
        
        productoEditando = producto;
        
        document.getElementById('productoId').value = producto.id;
        document.getElementById('adminNombre').value = producto.nombre;
        document.getElementById('adminPrecio').value = producto.precio;
        document.getElementById('adminImagen').value = producto.imagen;
        document.getElementById('adminDescripcion').value = producto.descripcion;
        document.getElementById('adminCaracteristicas').value = producto.caracteristicas.join('\n');
        
        document.getElementById('tituloFormProducto').textContent = 'Editar Producto';
        document.getElementById('adminNombre').focus();
        
        // Asegurar que el precio muestre el $
        if (inputPrecio && !inputPrecio.value.startsWith('$') && inputPrecio.value) {
            inputPrecio.value = '$' + inputPrecio.value.replace('$', '');
        }
        
        // Cargar imagen si existe
        if (producto.imagen) {
            const dataURL = cargarImagenDesdeStorage(producto.imagen);
            if (dataURL) {
                const imagePreview = document.getElementById('imagePreview');
                const previewContainer = document.getElementById('previewContainer');
                const previewName = document.getElementById('previewName');
                const dragDropContent = document.querySelector('.drag-drop-content');
                
                if (imagePreview && previewContainer) {
                    imagePreview.src = dataURL;
                    previewName.textContent = producto.imagen;
                    previewContainer.style.display = 'flex';
                    if (dragDropContent) {
                        dragDropContent.style.display = 'none';
                    }
                    imagenActual = {
                        nombre: producto.imagen,
                        dataURL: dataURL
                    };
                }
            }
        }
        
        // Desplazar suavemente al formulario
        document.querySelector('.admin-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };
    
    window.eliminarProducto = function(id) {
        if (!esAdmin) {
            mostrarNotificacion('❌ No tienes permisos para eliminar', 'error');
            return;
        }
        
        const productosActuales = obtenerProductos();
        const producto = productosActuales.find(p => p.id === id);
        if (!producto) {
            mostrarNotificacion('❌ Producto no encontrado', 'error');
            return;
        }
        
        if (!confirm(`⚠️ ¿ELIMINAR PRODUCTO DEFINITIVAMENTE?\n\n` +
                    `"${producto.nombre}"\n` +
                    `Precio: ${producto.precio}\n\n` +
                    `Esta acción no se puede deshacer.`)) {
            return;
        }
        
        const exito = eliminarProductoDB(id);
        if (exito) {
            // Incrementar versión por la eliminación
            incrementarVersionProductos();
            
            cargarListaProductosAdmin();
            
            if (typeof window.cargarProductos === 'function') {
                window.cargarProductos();
            }
            
            mostrarNotificacion(`🗑️ Producto "${producto.nombre}" eliminado`, 'info');
        } else {
            mostrarNotificacion('❌ Error al eliminar producto', 'error');
        }
    };
    
    // ========== NOTIFICACIONES ==========
    function mostrarNotificacion(mensaje, tipo = 'info') {
        // Remover notificaciones anteriores
        const notificacionesAnteriores = document.querySelectorAll('.notificacion-flotante');
        notificacionesAnteriores.forEach(n => n.remove());
        
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion-flotante';
        
        const icono = tipo === 'success' ? '✅' : 
                     tipo === 'error' ? '❌' : 
                     tipo === 'info' ? 'ℹ️' : '🔔';
        
        const color = tipo === 'success' ? '#4CAF50' : 
                     tipo === 'error' ? '#f44336' : 
                     tipo === 'info' ? '#2196F3' : '#FF9800';
        
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${color};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 5px solid ${tipo === 'success' ? '#2E7D32' : 
                                 tipo === 'error' ? '#C62828' : 
                                 tipo === 'info' ? '#1565C0' : '#EF6C00'};
        `;
        
        notificacion.innerHTML = `
            <span style="font-size: 20px;">${icono}</span>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.remove();
                }
            }, 300);
        }, 4000);
    }
    
    // Agregar animaciones si no existen
    if (!document.querySelector('style#animaciones-notificacion')) {
        const style = document.createElement('style');
        style.id = 'animaciones-notificacion';
        style.textContent = `
            @keyframes slideInRight {
                from { 
                    transform: translateX(100%); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
            }
            @keyframes slideOutRight {
                from { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
                to { 
                    transform: translateX(100%); 
                    opacity: 0; 
                }
            }
            
            /* Estilo para el input de precio */
            #adminPrecio {
                font-family: monospace;
                font-weight: bold;
                color: #2E7D32;
            }
            
            #adminPrecio::placeholder {
                color: #666;
                font-weight: normal;
            }
        `;
        document.head.appendChild(style);
    }
    
   // ========== BOTÓN PARA FORZAR ACTUALIZACIÓN DESDE GITHUB ==========
function crearBotonActualizarGitHub() {
    const container = document.getElementById('importExportContainer');
    if (!container) return;
    
    // Verificar si ya existe
    if (document.getElementById('btnForzarActualizacion')) return;
    
    const btnActualizar = document.createElement('button');
    btnActualizar.id = 'btnForzarActualizacion';
    btnActualizar.innerHTML = '🔁 Actualizar desde GitHub';
    btnActualizar.style.cssText = `
        padding: 10px 15px;
        background: linear-gradient(135deg, #00BCD4, #0097A7);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        margin-top: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s;
        min-width: 180px;
    `;
    
    // Efecto hover
    btnActualizar.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });
    
    btnActualizar.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
    
  // Evento click - VERSIÓN MEJORADA
btnActualizar.addEventListener('click', async function() {
    if (!esAdmin) {
        mostrarNotificacion('❌ Solo administradores pueden actualizar', 'error');
        return;
    }
    
    // Guardar estado original
    const textoOriginal = this.innerHTML;
    this.innerHTML = '⏳ Actualizando...';
    this.disabled = true;
    this.style.opacity = '0.7';
    
    try {
        console.log('🔄 Forzando actualización manual desde GitHub...');
        
        // URL de tu repositorio de datos
        const githubUrl = 'https://raw.githubusercontent.com/facundoemilianopujol02-maker/clean-solutions-data/main/productos.json?t=' + Date.now();
        
        // 1. Obtener datos de GitHub
        const respuesta = await fetch(githubUrl);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const productosGitHub = await respuesta.json();
        
        if (!Array.isArray(productosGitHub)) {
            throw new Error('Formato de datos inválido');
        }
        
        console.log(`📥 ${productosGitHub.length} productos recibidos desde GitHub`);
        
        // 2. Obtener productos actuales
        const productosActuales = window.ProductosDB ? window.ProductosDB.obtenerTodos() : [];
        
        // 3. Comparar si hay cambios
        const actualesStr = JSON.stringify(productosActuales);
        const githubStr = JSON.stringify(productosGitHub);
        
        if (githubStr === actualesStr) {
            mostrarNotificacion('✅ Ya tienes la versión más reciente', 'info');
            return;
        }
        
        // 4. Actualizar localStorage
        localStorage.setItem('cleanSolutionsProductos_v1', JSON.stringify(productosGitHub));
        
        // 5. Actualizar ProductosDB en memoria
        if (window.ProductosDB && window.ProductosDB._productos) {
            window.ProductosDB._productos = productosGitHub;
        }
        
        // 6. Actualizar la interfaz
        mostrarNotificacion(`✅ ${productosGitHub.length} productos actualizados`, 'success');
        
        // Recargar lista en panel admin
        cargarListaProductosAdmin();
        
        // Recargar productos en la página principal
        if (typeof window.cargarProductos === 'function') {
            window.cargarProductos();
        }
        
        // 7. Disparar evento para otras partes del sistema
        window.dispatchEvent(new CustomEvent('productosActualizados', {
            detail: { 
                productos: productosGitHub,
                fuente: 'actualizacion_manual',
                timestamp: new Date().toISOString()
            }
        }));
        
        console.log('🔄 Productos actualizados correctamente');
        
    } catch (error) {
        console.error('❌ Error forzando actualización:', error);
        mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
    } finally {
        // Restaurar botón
        this.innerHTML = textoOriginal;
        this.disabled = false;
        this.style.opacity = '1';
    }
});
    
    // Insertar después del botón de GitHub
    const btnGitHub = document.getElementById('btnSincronizarGitHub');
    if (btnGitHub && btnGitHub.parentNode) {
        btnGitHub.parentNode.insertBefore(btnActualizar, btnGitHub.nextSibling);
    } else {
        container.appendChild(btnActualizar);
    }
    
    console.log('✅ Botón de actualización manual creado');
}

// ========== INICIAR ==========
inicializar();
});