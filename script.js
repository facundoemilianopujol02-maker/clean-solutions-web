// productos.js - VERSIÓN MEJORADA (GitHub primero)

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/facundoemilianopujol02-maker/clean-solutions-data/refs/heads/main/productos.json';
const PRODUCTOS_KEY = 'cleanSolutionsProductos_v1';

// PRODUCTOS POR DEFECTO (backup inicial)
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
    },
    {
        id: 'toallita-always',
        nombre: 'Toallita Always',
        precio: '$1250',
        imagen: 'alwaysToallita.jpg',  
        descripcion: 'Toallitas Protectoras always.',
        caracteristicas: ['Tela suave', 'Ajuste perfecto', 'Nuevo pegamento']
    }
];

// ========== NUEVA FUNCIÓN PRINCIPAL ==========
async function cargarProductosMejorado() {
    console.log('🔄 Cargando productos (estrategia mejorada)...');
    
    // PRIMERO: Intentar desde localStorage (más rápido)
    const productosLocal = cargarDesdeLocalStorage();
    
    // MOSTRAR productos locales inmediatamente
    if (productosLocal && productosLocal.length > 0) {
        console.log(`📂 Mostrando ${productosLocal.length} productos locales`);
        
        // En segundo plano, verificar GitHub para actualizaciones
        verificarGitHubEnSegundoPlano(productosLocal);
        
        return productosLocal;
    }
    
    // SEGUNDO: Si no hay locales, intentar GitHub
    try {
        console.log('🌐 Intentando cargar desde GitHub...');
        const respuesta = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`);
        
        if (respuesta.ok) {
            const productosGitHub = await respuesta.json();
            
            if (Array.isArray(productosGitHub) && productosGitHub.length > 0) {
                console.log(`✅ ${productosGitHub.length} productos desde GitHub`);
                guardarEnLocalStorage(productosGitHub);
                return productosGitHub;
            }
        }
    } catch (error) {
        console.warn('⚠️ Falló GitHub:', error.message);
    }
    
    // TERCERO: Usar por defecto
    console.log('📦 Usando productos por defecto');
    guardarEnLocalStorage(PRODUCTOS_POR_DEFECTO);
    return PRODUCTOS_POR_DEFECTO;
}

// ========== FUNCIÓN EN SEGUNDO PLANO ==========
async function verificarGitHubEnSegundoPlano(productosActuales) {
    setTimeout(async () => {
        try {
            const respuesta = await fetch(`${GITHUB_RAW_URL}?t=${Date.now()}`);
            if (respuesta.ok) {
                const productosGitHub = await respuesta.json();
                
                if (Array.isArray(productosGitHub) && productosGitHub.length > 0) {
                    // Comparar si son diferentes
                    const actualesStr = JSON.stringify(productosActuales);
                    const githubStr = JSON.stringify(productosGitHub);
                    
                    if (githubStr !== actualesStr) {
                        console.log('🔄 GitHub tiene datos más recientes, actualizando...');
                        guardarEnLocalStorage(productosGitHub);
                        
                        // Actualizar ProductosDB en memoria
                        if (window.ProductosDB && window.ProductosDB._productos) {
                            window.ProductosDB._productos = productosGitHub;
                        }
                        
                        // Disparar evento para recargar
                        window.dispatchEvent(new CustomEvent('productosActualizados', {
                            detail: { 
                                productos: productosGitHub,
                                fuente: 'github_background',
                                timestamp: new Date().toISOString()
                            }
                        }));
                        
                        // Mostrar notificación suave
                        mostrarNotificacionBackground('🔄 Productos actualizados');
                    }
                }
            }
        } catch (error) {
            // Silencioso - no mostrar error al usuario
            console.log('🌐 No se pudo verificar GitHub en segundo plano');
        }
    }, 2000); // Esperar 2 segundos después de cargar la página
}

function mostrarNotificacionBackground(mensaje) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(76, 175, 80, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 5px;
        z-index: 9999;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    notif.innerHTML = mensaje;
    document.body.appendChild(notif);
    
    // Aparecer
    setTimeout(() => notif.style.opacity = '1', 100);
    
    // Desaparecer después de 3 segundos
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ========== FUNCIONES AUXILIARES ==========
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

function guardarEnLocalStorage(productos) {
    try {
        localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
        return true;
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return false;
    }
}

// ========== CÓDIGO EXISTENTE (MANTENER) ==========
// INICIALIZAR PRODUCTOS
// Usar la nueva función mejorada
let productos = [];

// Cargar inicialmente
cargarProductosMejorado().then(productosCargados => {
    productos = productosCargados;
    console.log(`📊 ${productos.length} productos cargados inicialmente`);
}).catch(error => {
    console.error('Error cargando productos:', error);
    productos = PRODUCTOS_POR_DEFECTO;
});

// Funciones para modificar productos (MANTENER TAL CUAL)
function agregarProducto(nuevoProducto) {
    productos.push(nuevoProducto);
    guardarEnLocalStorage(productos);
    return nuevoProducto;
}

function actualizarProducto(id, datosActualizados) {
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
        productos[index] = { ...productos[index], ...datosActualizados };
        guardarEnLocalStorage(productos);
        return true;
    }
    return false;
}

function eliminarProducto(id) {
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
        productos.splice(index, 1);
        guardarEnLocalStorage(productos);
        return true;
    }
    return false;
}

function resetearProductos() {
    productos = [...PRODUCTOS_POR_DEFECTO];
    guardarEnLocalStorage(productos);
    return productos;
}

// Exportar funciones (MANTENER TAL CUAL)
window.ProductosDB = {
    obtenerTodos: () => [...productos],
    agregar: agregarProducto,
    actualizar: actualizarProducto,
    eliminar: eliminarProducto,
    resetear: resetearProductos,
    guardar: () => guardarEnLocalStorage(productos),
    // Propiedad privada para acceso interno
    _productos: productos
};