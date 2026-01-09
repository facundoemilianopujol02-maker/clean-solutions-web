// productos-sync.js - Sistema de sincronización automática con GitHub

const GITHUB_RAW_URL_SCRIPT = 'https://raw.githubusercontent.com/facundoemilianopujol02-maker/clean-solutions-data/refs/heads/main/productos.json';
const PRODUCTOS_KEY = 'cleanSolutionsProductos_v1';
const ULTIMA_ACTUALIZACION_KEY = 'ultima_actualizacion';

// PRODUCTOS POR DEFECTO (solo si falla todo)
const PRODUCTOS_POR_DEFECTO = [
    {
        id: 'jabon-ariel',
        nombre: 'Jabón tipo Ariel - Limpieza Profunda',
        precio: '$8.000',
        imagen: 'jabonAriel.jpg', 
        descripcion: 'Jabón líquido tipo Ariel baja espuma.',
        caracteristicas: ['Precio por litro: $1.800']
    },
    {
        id: 'jabon-alaPan',
        nombre: 'Jabón blanco ala',
        precio: '$1.000',
        imagen: 'alapan.jpg', 
        descripcion: 'Jabón blanco ala x2 unidades.',
        caracteristicas: ['Pack de 2 unidades', 'Para blanqueo profundo']
    }
];

// ========== SISTEMA DE SINCRONIZACIÓN ==========

// Función PRINCIPAL para cargar productos (SIEMPRE usa esta)
async function cargarProductos() {
    console.log('🔍 Iniciando carga de productos...');
    
    try {
        // 1. Primero intentar desde GitHub (lo más actualizado)
        console.log('🌐 Intentando cargar desde GitHub...');
        const productosGitHub = await cargarDesdeGitHub();
        
        if (productosGitHub && productosGitHub.length > 0) {
            console.log(`✅ ${productosGitHub.length} productos cargados desde GitHub`);
            guardarEnLocalStorage(productosGitHub);
            return productosGitHub;
        }
        
        // 2. Si GitHub falla, usar localStorage
        console.log('📂 GitHub falló, usando localStorage...');
        const productosLocal = cargarDesdeLocalStorage();
        
        if (productosLocal && productosLocal.length > 0) {
            console.log(`✅ ${productosLocal.length} productos cargados desde localStorage`);
            return productosLocal;
        }
        
        // 3. Si todo falla, usar por defecto
        console.log('📦 Usando productos por defecto');
        guardarEnLocalStorage(PRODUCTOS_POR_DEFECTO);
        return PRODUCTOS_POR_DEFECTO;
        
    } catch (error) {
        console.error('Error crítico al cargar productos:', error);
        const productosLocal = cargarDesdeLocalStorage();
        return productosLocal || PRODUCTOS_POR_DEFECTO;
    }
}

// Cargar desde GitHub
async function cargarDesdeGitHub() {
    try {
        const timestamp = new Date().getTime();
        const url = `${GITHUB_RAW_URL_SCRIPT}?t=${timestamp}`; // Evitar cache
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`GitHub error: ${response.status}`);
        }
        
        const productos = await response.json();
        
        // Validar estructura
        if (Array.isArray(productos) && productos.length > 0) {
            // Guardar fecha de última actualización
            localStorage.setItem(ULTIMA_ACTUALIZACION_KEY, new Date().toISOString());
            return productos;
        }
        
        return null;
    } catch (error) {
        console.error('Error cargando desde GitHub:', error.message);
        return null;
    }
}

// Cargar desde localStorage
function cargarDesdeLocalStorage() {
    try {
        const productosGuardados = localStorage.getItem(PRODUCTOS_KEY);
        if (productosGuardados) {
            return JSON.parse(productosGuardados);
        }
    } catch (error) {
        console.error('Error cargando desde localStorage:', error);
    }
    return null;
}

// Guardar en localStorage
function guardarEnLocalStorage(productos) {
    try {
        localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
        console.log(`💾 ${productos.length} productos guardados en localStorage`);
        return true;
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return false;
    }
}

// Función para EXPORTAR (usada por admin)
function exportarParaGitHub(productos) {
    try {
        // Crear objeto con metadata
        const datosExportacion = {
            productos: productos,
            ultimaActualizacion: new Date().toISOString(),
            totalProductos: productos.length
        };
        
        // Convertir a JSON
        const jsonString = JSON.stringify(datosExportacion, null, 2);
        
        // Crear archivo para que el admin lo suba manualmente a GitHub
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'productos.json';
        
        return {
            datos: jsonString,
            archivo: blob,
            urlDescarga: url,
            elementoDescarga: a
        };
        
    } catch (error) {
        console.error('Error exportando para GitHub:', error);
        return null;
    }
}

// Función para verificar actualizaciones periódicamente
function iniciarVerificadorActualizaciones(intervalo = 60000) { // 60 segundos
    console.log(`🔄 Iniciando verificador de actualizaciones cada ${intervalo/1000} segundos`);
    
    setInterval(async () => {
        try {
            const productosGitHub = await cargarDesdeGitHub();
            
            if (productosGitHub && productosGitHub.length > 0) {
                const productosActuales = cargarDesdeLocalStorage() || [];
                
                // Verificar si hay cambios
                if (JSON.stringify(productosGitHub) !== JSON.stringify(productosActuales)) {
                    console.log('🔄 Cambios detectados desde GitHub, actualizando...');
                    guardarEnLocalStorage(productosGitHub);
                    
                    // Disparar evento para que la página se actualice
                    window.dispatchEvent(new CustomEvent('productosActualizados', {
                        detail: { productos: productosGitHub }
                    }));
                    
                    return true;
                }
            }
        } catch (error) {
            console.error('Error verificando actualizaciones:', error);
        }
        
        return false;
    }, intervalo);
}

// ========== EXPORTAR FUNCIONES ==========
window.ProductosSync = {
    cargar: cargarProductos,
    exportar: exportarParaGitHub,
    iniciarVerificador: iniciarVerificadorActualizaciones,
    obtenerUltimaActualizacion: () => localStorage.getItem(ULTIMA_ACTUALIZACION_KEY)
};