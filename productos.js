// productos.js - VERSIÓN CORREGIDA

// Variables de imágenes por defecto
const IMAGEN_POR_DEFECTO = 'https://via.placeholder.com/300x300/cccccc/969696?text=Imagen+no+disponible';
const IMAGEN_POR_DEFECTO_CARD = 'https://via.placeholder.com/250x200/cccccc/969696?text=Sin+imagen';

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

// CLAVE para localStorage
const PRODUCTOS_KEY = 'cleanSolutionsProductos_v1';

// URL de GitHub
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/facundoemilianopujol02-maker/clean-solutions-data/refs/heads/main/productos.json';

// Función para cargar desde GitHub
async function cargarProductosDesdeGitHub() {
    try {
        console.log('🌐 Intentando cargar desde GitHub...');
        const respuesta = await fetch(GITHUB_RAW_URL);
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const productosDesdeGitHub = await respuesta.json();
        console.log(`✅ ${productosDesdeGitHub.length} productos cargados desde GitHub`);
        
        // Validar que sea un array
        if (Array.isArray(productosDesdeGitHub) && productosDesdeGitHub.length > 0) {
            // Guardar en localStorage como respaldo
            guardarProductosEnStorage(productosDesdeGitHub);
            return productosDesdeGitHub;
        } else {
            throw new Error('Formato de datos inválido');
        }
        
    } catch (error) {
        console.warn('⚠️ No se pudo cargar desde GitHub:', error.message);
        return null; // Retornar null para indicar fallo
    }
}

// Cargar productos desde localStorage
function cargarProductosDesdeStorage() {
    try {
        const productosGuardados = localStorage.getItem(PRODUCTOS_KEY);
        if (productosGuardados) {
            const productos = JSON.parse(productosGuardados);
            console.log(`📂 ${productos.length} productos cargados desde localStorage`);
            return productos;
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
    
    // Si no hay productos guardados, usar los por defecto
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
    productos.push(nuevoProducto);
    guardarProductosEnStorage(productos);
    return nuevoProducto;
}

function actualizarProducto(id, datosActualizados) {
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
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

// Exportar funciones
window.ProductosDB = {
    obtenerTodos: () => [...productos],
    agregar: agregarProducto,
    actualizar: actualizarProducto,
    eliminar: eliminarProducto,
    resetear: resetearProductos,
    guardar: () => guardarProductosEnStorage(productos),
    // Propiedad privada para acceso interno
    _productos: productos
};