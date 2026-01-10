// script.js - Archivo principal para mostrar productos
// USAR LA VARIABLE GLOBAL DE productos.js - YA DEFINIDA
// No redeclarar PLACEHOLDER_SVG aquí

// Variable global para GitHub (si no existe)
if (typeof GITHUB_RAM_URL_SCRIPT === 'undefined') {
    const GITHUB_RAM_URL_SCRIPT = "https://api.github.com/repos/tu-usuario/tu-repo/contents/productos.json";
}

// Función para cargar y mostrar productos
async function cargarProductos() {
    console.log('🔄 Cargando productos para mostrar...');
    
    try {
        // 1. Usar ProductosDB (ya cargado desde productos.js)
        let productos = [];
        
        if (window.ProductosDB && window.ProductosDB.obtenerTodos) {
            productos = window.ProductosDB.obtenerTodos();
            console.log(`📂 ${productos.length} productos cargados desde ProductosDB`);
        } else {
            console.warn('⚠️ ProductosDB no disponible, usando localStorage...');
            // 2. Intentar cargar desde localStorage como respaldo
            const productosGuardados = localStorage.getItem('cleanSolutionsProductos_v1');
            
            if (productosGuardados) {
                productos = JSON.parse(productosGuardados);
                console.log(`📂 ${productos.length} productos cargados desde localStorage`);
            }
        }
        
        if (productos.length === 0) {
            console.warn('⚠️ No hay productos disponibles');
        }
        
        // 3. Mostrar productos en la página
        mostrarProductosEnPagina(productos);
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        const container = document.getElementById('productos-container');
        if (container) {
            container.innerHTML = '<p style="color: red; text-align: center;">Error cargando productos</p>';
        }
    }
}

// Función para mostrar productos en el HTML
function mostrarProductosEnPagina(productos) {
    const container = document.getElementById('productos-container');
    
    if (!container) {
        console.error('No se encontró el contenedor de productos');
        return;
    }
    
    if (!productos || productos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No hay productos disponibles</p>';
        return;
    }
    
    container.innerHTML = '';
    
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Usar placeholder correcto (variable global de productos.js)
        const imagenSrc = producto.imagen || 
                         producto.image || 
                         (window.PLACEHOLDER_SVG || 'https://via.placeholder.com/250x200/cccccc/969696?text=Sin+imagen');
        
        card.innerHTML = `
            <img src="${imagenSrc}" 
                 alt="${producto.nombre || 'Producto'}" 
                 class="product-img"
                 onerror="this.src='${window.PLACEHOLDER_SVG || 'https://via.placeholder.com/250x200/cccccc/969696?text=Error'}'; this.onerror=null;">
            <h3 style="margin: 10px 0; color: #333;">${producto.nombre || 'Sin nombre'}</h3>
            <p style="color: #666; margin: 5px 0; flex-grow: 1;">${producto.descripcion || 'Sin descripción'}</p>
            <p style="margin: 10px 0;"><strong style="color: #000; font-size: 1.2rem;">${producto.precio || '$0'}</strong></p>
            ${producto.stock ? `<p style="color: #4CAF50; margin: 5px 0;">Stock: ${producto.stock}</p>` : ''}
        `;
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${productos.length} productos mostrados en la página`);
}

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    
    // Actualizar cuando se detecten cambios
    window.addEventListener('productosActualizados', function() {
        console.log('🔄 Evento de actualización recibido, recargando productos...');
        cargarProductos();
    });
    
    // Actualizar cada 30 segundos (por si acaso)
    setInterval(() => {
        cargarProductos();
    }, 30000);
});

// Función para forzar actualización desde GitHub
window.actualizarDesdeGitHub = async function() {
    console.log('🔄 Forzando actualización desde GitHub...');
    
    if (window.verificarYActualizarDesdeGitHub) {
        await window.verificarYActualizarDesdeGitHub();
    } else {
        console.warn('⚠️ Función de actualización GitHub no disponible');
        alert('Función de actualización no disponible');
    }
};

// Exportar funciones si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cargarProductos, mostrarProductosEnPagina };
}