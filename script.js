// script.js - VERSIÓN SIMPLIFICADA Y CORREGIDA
// Este archivo solo muestra los productos en la página

// Función para cargar y mostrar productos en la página
async function cargarProductos() {
    console.log('🔄 Cargando productos para mostrar...');
    
    const contenedor = document.getElementById('contenedorProductos');
    if (!contenedor) return;
    
    // Obtener productos desde ProductosDB
    const productos = window.ProductosDB ? window.ProductosDB.obtenerTodos() : [];
    
    if (productos.length === 0) {
        contenedor.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 20px;">🛒</div>
                <h3 style="margin-bottom: 10px;">No hay productos disponibles</h3>
                <p>Los productos se cargarán automáticamente desde el servidor.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    productos.forEach(producto => {
        // Intentar cargar imagen desde localStorage
        let imagenSrc = producto.imagen;
        
        // Si es una URL externa, usarla directamente
        if (producto.imagen.startsWith('http')) {
            imagenSrc = producto.imagen;
        } 
        // Si es un nombre de archivo, intentar cargar desde localStorage
        else {
            try {
                const imagenesGuardadas = JSON.parse(localStorage.getItem('cleanSolutionsImages') || '{}');
                if (imagenesGuardadas[producto.imagen]) {
                    imagenSrc = imagenesGuardadas[producto.imagen];
                }
            } catch (error) {
                console.warn('Error al cargar imagen:', error);
            }
        }
        
        html += `
            <div class="cardProducto">
                <div class="productoImagen">
                    <img src="${imagenSrc}" 
                         alt="${producto.nombre}" 
                         onerror="this.src='https://via.placeholder.com/250x200/cccccc/969696?text=Sin+imagen'">
                </div>
                <div class="productoInfo">
                    <h3 class="productoNombre">${producto.nombre}</h3>
                    <div class="productoPrecio">${producto.precio}</div>
                    <p style="color: #666; font-size: 14px; margin: 10px 0; line-height: 1.4;">
                        ${producto.descripcion.substring(0, 100)}${producto.descripcion.length > 100 ? '...' : ''}
                    </p>
                    <button class="botonVerDetalles" onclick="mostrarDetallesProducto('${producto.id}')">
                        Ver detalles
                    </button>
                </div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
    console.log(`✅ ${productos.length} productos mostrados en la página`);
}

// Función para mostrar detalles del producto
function mostrarDetallesProducto(id) {
    const productos = window.ProductosDB ? window.ProductosDB.obtenerTodos() : [];
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }
    
    // Cargar imagen desde localStorage si es necesario
    let imagenSrc = producto.imagen;
    if (!producto.imagen.startsWith('http')) {
        try {
            const imagenesGuardadas = JSON.parse(localStorage.getItem('cleanSolutionsImages') || '{}');
            if (imagenesGuardadas[producto.imagen]) {
                imagenSrc = imagenesGuardadas[producto.imagen];
            }
        } catch (error) {
            console.warn('Error al cargar imagen para detalles:', error);
        }
    }
    
    const modalCuerpo = document.getElementById('modalCuerpo');
    if (modalCuerpo) {
        modalCuerpo.innerHTML = `
            <div class="detalles-producto">
                <div class="detalles-imagen">
                    <img src="${imagenSrc}" 
                         alt="${producto.nombre}"
                         onerror="this.src='https://via.placeholder.com/300x300/cccccc/969696?text=Imagen+no+disponible'">
                </div>
                <div class="detalles-info">
                    <h2>${producto.nombre}</h2>
                    <div class="detalles-precio">${producto.precio}</div>
                    <div class="detalles-descripcion">
                        ${producto.descripcion}
                    </div>
                    
                    ${producto.caracteristicas && producto.caracteristicas.length > 0 ? `
                        <h3>Características:</h3>
                        <ul class="detalles-caracteristicas">
                            ${producto.caracteristicas.map(car => `<li>${car}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    <button class="boton-contactar" onclick="contactarPorProducto('${producto.nombre}')">
                        📲 Contactar por este producto
                    </button>
                </div>
            </div>
        `;
        
        // Mostrar el modal
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
}

// Función para contactar por producto
function contactarPorProducto(nombreProducto) {
    const mensaje = `Hola, estoy interesado en el producto: ${nombreProducto}`;
    const numeroWhatsApp = '3794034489';
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(urlWhatsApp, '_blank');
}

// Configurar búsqueda de productos
function configurarBusqueda() {
    const busquedaInput = document.querySelector('.busquedaInput');
    const busquedaForma = document.querySelector('.busquedaForma');
    const contadorResultados = document.querySelector('.contador-resultados');
    
    if (!busquedaInput || !busquedaForma) return;
    
    busquedaForma.addEventListener('submit', function(e) {
        e.preventDefault();
        buscarProductos();
    });
    
    busquedaInput.addEventListener('input', function() {
        buscarProductos();
    });
    
    function buscarProductos() {
        const termino = busquedaInput.value.trim().toLowerCase();
        const productos = window.ProductosDB ? window.ProductosDB.obtenerTodos() : [];
        const cards = document.querySelectorAll('.cardProducto');
        let resultados = 0;
        
        cards.forEach(card => {
            const nombre = card.querySelector('.productoNombre').textContent.toLowerCase();
            const descripcion = card.querySelector('p').textContent.toLowerCase();
            
            if (termino === '' || nombre.includes(termino) || descripcion.includes(termino)) {
                card.style.display = 'flex';
                resultados++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (contadorResultados) {
            if (termino === '') {
                contadorResultados.style.display = 'none';
            } else {
                contadorResultados.style.display = 'block';
                contadorResultados.textContent = `${resultados} producto${resultados !== 1 ? 's' : ''} encontrado${resultados !== 1 ? 's' : ''}`;
            }
        }
    }
}

// Cerrar modal de detalles
document.getElementById('modalCerrar')?.addEventListener('click', function() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Cerrar modal al hacer clic fuera
document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Escuchar evento de productos actualizados
window.addEventListener('productosActualizados', function() {
    console.log('🔄 Recibida notificación de productos actualizados');
    cargarProductos();
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏪 Inicializando tienda...');
    
    // Cargar productos después de un pequeño delay para asegurar que ProductosDB esté listo
    setTimeout(() => {
        cargarProductos();
        configurarBusqueda();
        
        // Actualizar versión en el footer
        const versionElement = document.getElementById('versionProductos');
        if (versionElement) {
            const version = localStorage.getItem('productos_version') || '1';
            versionElement.textContent = version;
        }
        
        // Actualizar última actualización
        const ultimaActualizacionElement = document.getElementById('ultimaActualizacion');
        if (ultimaActualizacionElement) {
            const ahora = new Date();
            ultimaActualizacionElement.textContent = ahora.toLocaleDateString('es-AR') + ' ' + ahora.toLocaleTimeString('es-AR');
        }
    }, 500);
});

// Exportar funciones globales
window.cargarProductos = cargarProductos;
window.mostrarDetallesProducto = mostrarDetallesProducto;
window.contactarPorProducto = contactarPorProducto;