// github-sync.js - Sistema de sincronización automática
const GITHUB_PRODUCTOS_URL = 'https://raw.githubusercontent.com/facundoemilianopujol02-maker/clean-solutions-data/refs/heads/main/productos.json';
const LOCAL_STORAGE_KEY = 'cleanSolutionsProductos_v1';

// Verificar si GitHub tiene datos más recientes
async function verificarYActualizarDesdeGitHub() {
    console.log('🔍 Verificando actualizaciones en GitHub...');
    
    try {
        // Evitar cache del navegador
        const timestamp = new Date().getTime();
        const respuesta = await fetch(`${GITHUB_PRODUCTOS_URL}?t=${timestamp}`);
        
        if (!respuesta.ok) {
            console.warn('⚠️ No se pudo conectar a GitHub:', respuesta.status);
            return false;
        }
        
        const datosGitHub = await respuesta.json();
        
        // ========== MODIFICACIÓN IMPORTANTE ==========
        let productosGitHub;
        
        // Si es el formato complejo (con metadata) - el que genera tu sistema
        if (datosGitHub.productos && Array.isArray(datosGitHub.productos)) {
            console.log('📦 Formato complejo detectado, extrayendo productos...');
            productosGitHub = datosGitHub.productos;
        }
        // Si es el formato simple (array directo)
        else if (Array.isArray(datosGitHub)) {
            console.log('📦 Formato simple detectado (array directo)');
            productosGitHub = datosGitHub;
        }
        else {
            console.warn('⚠️ Formato inválido en GitHub');
            return false;
        }
        // ========== FIN DE MODIFICACIÓN ==========
        
        // Validar que hay productos
        if (productosGitHub.length === 0) {
            console.warn('⚠️ No hay productos en GitHub');
            return false;
        }
        
        console.log(`📥 ${productosGitHub.length} productos recibidos desde GitHub`);
        
        // Obtener productos actuales
        const productosActuales = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        
        // Comparar si hay cambios
        const hayCambios = JSON.stringify(productosGitHub) !== JSON.stringify(productosActuales);
        
        if (hayCambios) {
            console.log(`🔄 Cambios detectados: ${productosGitHub.length} productos`);
            
            // Guardar en localStorage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(productosGitHub));
            
            // Actualizar ProductosDB en memoria
            if (window.ProductosDB) {
                window.ProductosDB._productos = productosGitHub;
                
                // Si tiene función para recargar
                if (window.ProductosDB.cargarDesdeStorage) {
                    window.ProductosDB.cargarDesdeStorage();
                }
            }
            
            // Notificar a la página para que se recargue
            window.dispatchEvent(new CustomEvent('productosActualizados', {
                detail: { 
                    productos: productosGitHub,
                    fuente: 'github',
                    timestamp: new Date().toISOString()
                }
            }));
            
            // Mostrar notificación al usuario
            mostrarNotificacionGitHub(`🔄 Productos actualizados (${productosGitHub.length} items)`);
            
            return true;
        } else {
            console.log('✅ Ya estás actualizado con GitHub');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error verificando GitHub:', error.message);
        return false;
    }
}

function mostrarNotificacionGitHub(mensaje) {
    // Crear notificación sutil
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideInLeft 0.3s ease;
    `;
    notif.innerHTML = `✅ ${mensaje}`;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutLeft 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Sistema de sincronización periódica
function iniciarSincronizacionAutomatica() {
    console.log('⏰ Iniciando sincronización automática cada 30 segundos');
    
    // 1. Verificar inmediatamente
    setTimeout(verificarYActualizarDesdeGitHub, 2000);
    
    // 2. Luego cada 30 segundos
    setInterval(verificarYActualizarDesdeGitHub, 30000);
    
    // 3. Cuando la página se hace visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('👁️ Página visible, verificando GitHub...');
            verificarYActualizarDesdeGitHub();
        }
    });
    
    // 4. También al hacer foco en la ventana
    window.addEventListener('focus', () => {
        verificarYActualizarDesdeGitHub();
    });
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', iniciarSincronizacionAutomatica);

// Función pública para forzar actualización manual
window.actualizarDesdeGitHub = verificarYActualizarDesdeGitHub;

// Agregar estilos CSS para animación
if (!document.querySelector('#github-sync-styles')) {
    const style = document.createElement('style');
    style.id = 'github-sync-styles';
    style.textContent = `
        @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}