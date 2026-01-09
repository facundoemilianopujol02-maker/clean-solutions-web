// script.js - Archivo principal para mostrar productos
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="250" height="200"%3E%3Crect width="100%25" height="100%25" fill="%23f0f0f0"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3ESin%20imagen%3C/text%3E%3C/svg%3E';

// Variable global para GitHub (si no existe)
if (typeof GITHUB_RAM_URL_SCRIPT === 'undefined') {
    const GITHUB_RAM_URL_SCRIPT = "https://api.github.com/repos/tu-usuario/tu-repo/contents/productos.json";
}

// Función para cargar y mostrar productos
async function cargarProductos() {
    console.log('🔄 Cargando productos para mostrar...');
    
    try {
        // 1. Intentar cargar desde localStorage
        const productosGuardados = localStorage.getItem('productos');
        let productos = [];
        
        if (productosGuardados) {
            productos = JSON.parse(productosGuardados);
            console.log(`📂 ${productos.length} productos cargados desde localStorage`);
        } else {
            // 2. Si no hay en localStorage, cargar desde GitHub
            console.log('Intentando cargar desde GitHub...');
            try {
                const response = await fetch(GITHUB_RAM_URL_SCRIPT);
                if (!response.ok) throw new Error('Error en GitHub');
                
                const data = await response.json();
                const contenido = JSON.parse(atob(data.content));
                productos = contenido.productos || contenido;
                console.log(`📥 ${productos.length} productos recibidos desde GitHub`);
                
                // Guardar en localStorage
                localStorage.setItem('productos', JSON.stringify(productos));
                console.log(`💾 ${productos.length} productos guardados en localStorage`);
            } catch (error) {
                console.error('No se pudo cargar desde GitHub:', error);
            }
        }
        
        // 3. Mostrar productos en la página
        mostrarProductosEnPagina(productos);
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        document.getElementById('productos-container').innerHTML = 
            '<p style="color: red; text-align: center;">Error cargando productos</p>';
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
        container.innerHTML = '<p style="text-align: center;">No hay productos disponibles</p>';
        return;
    }
    
    container.innerHTML = '';
    
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Usar PLACEHOLDER_SVG si no hay imagen
        const imagenSrc = producto.imagen || producto.image || PLACEHOLDER_SVG;
        
        card.innerHTML = `
            <img src="${imagenSrc}" 
                 alt="${producto.nombre || 'Producto'}" 
                 class="product-img"
                 onerror="this.src='${PLACEHOLDER_SVG}'; this.onerror=null;">
            <h3>${producto.nombre || 'Sin nombre'}</h3>
            <p>${producto.descripcion || 'Sin descripción'}</p>
            <p><strong>Precio: $${producto.precio || '0'}</strong></p>
            ${producto.stock ? `<p>Stock: ${producto.stock}</p>` : ''}
        `;
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${productos.length} productos mostrados en la página`);
}

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    
    // Actualizar cada 30 segundos
    setInterval(() => {
        console.log('🔄 Actualizando productos...');
        cargarProductos();
    }, 30000);
});

// Función para forzar actualización desde GitHub
window.actualizarDesdeGitHub = async function() {
    console.log('🔄 Forzando actualización desde GitHub...');
    localStorage.removeItem('productos');
    await cargarProductos();
    alert('Productos actualizados desde GitHub');
};

// Exportar funciones si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cargarProductos, mostrarProductosEnPagina };
}