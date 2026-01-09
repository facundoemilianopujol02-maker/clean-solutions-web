// productos.js - VERSIÓN CORREGIDA

// Variables de imágenes por defecto - TODAS CORREGIDAS
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="250" height="200"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3ESin%20imagen%3C/text%3E%3C/svg%3E';

// REEMPLAZAR ESTAS DOS LÍNEAS:
const IMAGEN_POR_DEFECTO = PLACEHOLDER_SVG;
const IMAGEN_POR_DEFECTO_CARD = PLACEHOLDER_SVG;

// PRODUCTOS POR DEFECTO (backup inicial) - CORREGIDO CON SVG
const PRODUCTOS_POR_DEFECTO = [
    {
        id: 'jabon-ariel',
        nombre: 'Jabón tipo Ariel - Limpieza Profunda',
        precio: '$8.000',
        imagen: PLACEHOLDER_SVG,  // ← CAMBIADO
        descripcion: 'Jabón líquido tipo Ariel baja espuma.',
        caracteristicas: ['Precio por litro: $1.800']
    },
    {
        id: 'jabon-alaPan',
        nombre: 'Jabón blanco ala',
        precio: '$1.000',
        imagen: PLACEHOLDER_SVG,  // ← CAMBIADO
        descripcion: 'Jabón blanco ala x2 unidades.',
        caracteristicas: ['Pack de 2 unidades', 'Para blanqueo profundo']
    },
    {
        id: 'toallita-always',
        nombre: 'Toallita Always',
        precio: '$1250',
        imagen: PLACEHOLDER_SVG,  // ← CAMBIADO
        descripcion: 'Toallitas Protectoras always.',
        caracteristicas: ['Tela suave', 'Ajuste perfecto', 'Nuevo pegamento']
    }
];

// CLAVE para localStorage
const PRODUCTOS_KEY = 'cleanSolutionsProductos_v1';

// URL de GitHub para sincronización
const GITHUB_PRODUCTOS_URL = 'https://raw.githubusercontent.com/facundoemilianopujol02-maker/clean-solutions-data/refs/heads/main/productos.json';

// Función para cargar desde GitHub
async function cargarProductosDesdeGitHub() {
    try {
        console.log('🌐 Intentando cargar desde GitHub...');
        const respuesta = await fetch(GITHUB_PRODUCTOS_URL);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datosGitHub = await respuesta.json();
        
        // ========== MODIFICACIÓN IMPORTANTE ==========
        let productosDesdeGitHub;
        
        // Si es el formato complejo (con metadata) - el que genera tu sistema
        if (datosGitHub.productos && Array.isArray(datosGitHub.productos)) {
            console.log('📦 Formato complejo detectado en carga inicial');
            productosDesdeGitHub = datosGitHub.productos;
        }
        // Si es el formato simple (array directo)
        else if (Array.isArray(datosGitHub)) {
            console.log('📦 Formato simple detectado en carga inicial');
            productosDesdeGitHub = datosGitHub;
        }
        else {
            throw new Error('Formato de datos inválido en GitHub');
        }
        // ========== FIN DE MODIFICACIÓN ==========
        
        console.log(`✅ ${productosDesdeGitHub.length} productos cargados desde GitHub`);
        
        // Función para asegurar que todos los productos tengan imagen válida
        function asegurarImagenesValidas(productosArray) {
            return productosArray.map(producto => {
                // Si no tiene imagen o usa placeholder.com, usar PLACEHOLDER_SVG
                if (!producto.imagen || 
                    producto.imagen.includes('via.placeholder.com') || 
                    producto.imagen.includes('placeholder.com')) {
                    return {
                        ...producto,
                        imagen: PLACEHOLDER_SVG
                    };
                }
                return producto;
            });
        }
        
        // Aplicar corrección de imágenes
        productosDesdeGitHub = asegurarImagenesValidas(productosDesdeGitHub);
        
        // Guardar en localStorage como respaldo
        guardarProductosEnStorage(productosDesdeGitHub);
        return productosDesdeGitHub;
        
    } catch (error) {
        console.warn('⚠️ No se pudo cargar desde GitHub:', error.message);
        return null;
    }
}

// Cargar productos desde localStorage
function cargarProductosDesdeStorage() {
    try {
        const productosGuardados = localStorage.getItem(PRODUCTOS_KEY);
        if (productosGuardados) {
            const productos = JSON.parse(productosGuardados);
            
            // CORREGIR imágenes de productos existentes
            const productosCorregidos = productos.map(producto => {
                if (!producto.imagen || 
                    producto.imagen.includes('via.placeholder.com') || 
                    producto.imagen.includes('placeholder.com')) {
                    return {
                        ...producto,
                        imagen: PLACEHOLDER_SVG
                    };
                }
                return producto;
            });
            
            console.log(`📂 ${productosCorregidos.length} productos cargados desde localStorage`);
            return productosCorregidos;
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
    
    // Si no hay productos guardados, usar los por defecto (ya corregidos)
    console.log('📦 Usando productos por defecto');
    guardarProductosEnStorage(PRODUCTOS_POR_DEFECTO);
    return PRODUCTOS_POR_DEFECTO;
}

// Guardar productos en localStorage
function guardarProductosEnStorage(productosArray) {
    try {
        localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productosArray));
        console.log(`💾 ${productosArray.length} productos guardados en localStorage`);
        return true;
    } catch (error) {
        console.error('Error al guardar productos:', error);
        return false;
    }
}

// INICIALIZAR PRODUCTOS
// Primero cargar desde localStorage (inmediato)
let productos = cargarProductosDesdeStorage();

// Luego intentar actualizar desde GitHub (asíncrono)
cargarProductosDesdeGitHub().then(productosGitHub => {
    if (productosGitHub && productosGitHub.length > 0) {
        // Actualizar solo si hay cambios
        const productosActuales = cargarProductosDesdeStorage();
        if (JSON.stringify(productosGitHub) !== JSON.stringify(productosActuales)) {
            productos = productosGitHub;
            guardarProductosEnStorage(productos);
            console.log('🔄 Productos actualizados desde GitHub');
            
            // Notificar a la página para que se recargue
            if (window.ProductosDB) {
                window.ProductosDB._productos = productos;
            }
            
            // Disparar evento para recargar
            window.dispatchEvent(new CustomEvent('productosActualizados', {
                detail: { productos: productos }
            }));
        }
    }
}).catch(error => {
    console.warn('Error en carga asíncrona:', error);
});

// Funciones para modificar productos
function agregarProducto(nuevoProducto) {
    // Asegurar que tenga imagen válida
    if (!nuevoProducto.imagen || 
        nuevoProducto.imagen.includes('via.placeholder.com')) {
        nuevoProducto.imagen = PLACEHOLDER_SVG;
    }
    
    productos.push(nuevoProducto);
    guardarProductosEnStorage(productos);
    return nuevoProducto;
}

function actualizarProducto(id, datosActualizados) {
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
        // Asegurar imagen válida
        if (datosActualizados.imagen && 
            datosActualizados.imagen.includes('via.placeholder.com')) {
            datosActualizados.imagen = PLACEHOLDER_SVG;
        }
        
        productos[index] = { ...productos[index], ...datosActualizados };
        guardarProductosEnStorage(productos);
        return true;
    }
    return false;
}

function eliminarProducto(id) {
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
        productos.splice(index, 1);
        guardarProductosEnStorage(productos);
        return true;
    }
    return false;
}

function resetearProductos() {
    productos = [...PRODUCTOS_POR_DEFECTO];
    guardarProductosEnStorage(productos);
    return productos;
}

// Función auxiliar para obtener imagen segura
function obtenerImagenSegura(producto) {
    if (!producto.imagen || 
        producto.imagen.includes('via.placeholder.com') || 
        producto.imagen.includes('placeholder.com')) {
        return PLACEHOLDER_SVG;
    }
    return producto.imagen;
}

// Exportar funciones
window.ProductosDB = {
    obtenerTodos: () => [...productos],
    obtenerTodosConImagenesSeguras: () => productos.map(p => ({
        ...p,
        imagen: obtenerImagenSegura(p)
    })),
    agregar: agregarProducto,
    actualizar: actualizarProducto,
    eliminar: eliminarProducto,
    resetear: resetearProductos,
    guardar: () => guardarProductosEnStorage(productos),
    obtenerPlaceholder: () => PLACEHOLDER_SVG,
    // Propiedad privada para acceso interno
    _productos: productos
};

// Exportar constantes para uso global
window.PLACEHOLDER_SVG = PLACEHOLDER_SVG;

console.log('✅ productos.js inicializado correctamente');
console.log(`📊 Productos cargados: ${productos.length}`);