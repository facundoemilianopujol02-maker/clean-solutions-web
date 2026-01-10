// ============================================
// script.js - Adaptado para el nuevo diseño HTML
// ============================================

// Variables globales
let todosLosProductos = [];
let productosFiltrados = [];

// Función principal para inicializar todo
function inicializarAplicacion() {
    console.log('🚀 Inicializando aplicación...');
    
    // 1. Cargar productos
    cargarProductos();
    
    // 2. Configurar autenticación (como en la captura)
    configurarAutenticacion();
    
    // 3. Configurar búsqueda
    configurarBusqueda();
    
    // 4. Configurar modales
    configurarModales();
    
    // 5. Configurar eventos de productos
    setTimeout(configurarEventosProductos, 500);
}

// Función para cargar productos
async function cargarProductos() {
    console.log('📦 Cargando productos...');
    
    try {
        // 1. Intentar desde ProductosDB (productos.js)
        if (window.ProductosDB && window.ProductosDB.obtenerTodos) {
            todosLosProductos = window.ProductosDB.obtenerTodos();
            console.log(`✅ ${todosLosProductos.length} productos desde ProductosDB`);
        } 
        // 2. Intentar desde localStorage
        else if (localStorage.getItem('cleanSolutionsProductos_v1')) {
            todosLosProductos = JSON.parse(localStorage.getItem('cleanSolutionsProductos_v1'));
            console.log(`✅ ${todosLosProductos.length} productos desde localStorage`);
        }
        // 3. Usar productos de ejemplo
        else {
            console.warn('⚠️ No hay productos en DB, usando datos de ejemplo');
            todosLosProductos = generarProductosEjemplo();
        }
        
        // Guardar referencia global
        productosFiltrados = [...todosLosProductos];
        
        // Mostrar productos
        mostrarProductos(productosFiltrados);
        
        // Actualizar contador
        actualizarContador();
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        mostrarError('Error cargando productos');
    }
}

// Función para mostrar productos en el grid
function mostrarProductos(productos) {
    const grid = document.getElementById('productosGrid');
    
    if (!grid) {
        console.error('❌ No se encontró #productosGrid');
        return;
    }
    
    // Limpiar grid
    grid.innerHTML = '';
    
    // Si no hay productos
    if (!productos || productos.length === 0) {
        grid.innerHTML = `
            <div class="no-resultados" style="grid-column: 1 / -1;">
                <p><i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i></p>
                <p>No hay productos disponibles</p>
            </div>
        `;
        return;
    }
    
    // Crear tarjetas para cada producto
    productos.forEach((producto, index) => {
        const card = document.createElement('div');
        card.className = 'cardProducto';
        card.dataset.id = producto.id || `prod-${index + 1}`;
        
        // Preparar datos del producto
        const id = producto.id || index + 1;
        const nombre = producto.nombre || `Producto ${index + 1}`;
        const descripcion = producto.descripcion || 'Producto de limpieza profesional';
        const precio = producto.precio || '$0.00';
        const imagen = producto.imagen || producto.image || 
                      `https://via.placeholder.com/250x180/${getColorHex(index)}/FFFFFF?text=${encodeURIComponent(nombre.substring(0, 15))}`;
        
        card.innerHTML = `
            <div class="productoImagen">
                <img src="${imagen}" 
                     alt="${nombre}"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/250x180/cccccc/969696?text=Imagen+no+disponible'">
            </div>
            <div class="productoInfo">
                <h3 class="productoNombre">${nombre}</h3>
                <p class="productoDescripcion" style="display: none;">${descripcion}</p>
                ${producto.categoria ? `<p class="productoCategoria" style="display: none;">${producto.categoria}</p>` : ''}
                <div class="productoPrecio">${precio}</div>
                ${producto.stock ? `<p style="color: #4CAF50; font-size: 14px; margin: 5px 0;">Stock: ${producto.stock}</p>` : ''}
                <button class="botonVerDetalles" data-id="${id}">
                    <i class="fas fa-eye"></i> Ver Detalles
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    console.log(`✅ ${productos.length} productos mostrados`);
}

// Función para configurar búsqueda
function configurarBusqueda() {
    const input = document.getElementById('busquedaSimpleInput');
    
    if (!input) {
        console.warn('⚠️ No se encontró #busquedaSimpleInput');
        return;
    }
    
    input.addEventListener('input', function(e) {
        const termino = e.target.value.toLowerCase().trim();
        
        if (termino === '') {
            productosFiltrados = [...todosLosProductos];
        } else {
            productosFiltrados = todosLosProductos.filter(producto => {
                const nombre = (producto.nombre || '').toLowerCase();
                const descripcion = (producto.descripcion || '').toLowerCase();
                const categoria = (producto.categoria || '').toLowerCase();
                
                return nombre.includes(termino) || 
                       descripcion.includes(termino) || 
                       categoria.includes(termino);
            });
        }
        
        mostrarProductos(productosFiltrados);
        actualizarContador();
    });
}

// Función para actualizar contador
function actualizarContador() {
    const contadorNumero = document.getElementById('contadorNumero');
    const totalProductos = document.getElementById('totalProductos');
    
    if (contadorNumero) {
        contadorNumero.textContent = productosFiltrados.length;
    }
    
    if (totalProductos) {
        totalProductos.textContent = todosLosProductos.length;
    }
}

// Función para configurar autenticación
function configurarAutenticacion() {
    console.log('🔐 Configurando autenticación...');
    
    // Como en la captura: mostrar usuario logueado
    setTimeout(() => {
        const noAuthState = document.getElementById('noAuthState');
        const authState = document.getElementById('authState');
        
        if (noAuthState && authState) {
            noAuthState.style.display = 'none';
            authState.style.display = 'flex';
            
            // Establecer nombre de usuario
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = 'npamaciel';
            }
        }
    }, 100);
    
    // Configurar botones de autenticación
    const btnIniciarSesion = document.getElementById('btnIniciarSesion');
    const btnRegistrarse = document.getElementById('btnRegistrarse');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    
    if (btnIniciarSesion) {
        btnIniciarSesion.addEventListener('click', () => {
            document.getElementById('modalLogin').style.display = 'flex';
        });
    }
    
    if (btnRegistrarse) {
        btnRegistrarse.addEventListener('click', () => {
            document.getElementById('modalRegistro').style.display = 'flex';
        });
    }
    
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            document.getElementById('noAuthState').style.display = 'flex';
            document.getElementById('authState').style.display = 'none';
        });
    }
}

// Función para configurar eventos de productos
function configurarEventosProductos() {
    // Eventos para botones "Ver Detalles"
    document.addEventListener('click', function(e) {
        if (e.target.closest('.botonVerDetalles')) {
            const button = e.target.closest('.botonVerDetalles');
            const productId = button.getAttribute('data-id');
            mostrarDetallesProducto(productId);
        }
    });
    
    // También configurar para productos existentes al inicio
    document.querySelectorAll('.botonVerDetalles').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            mostrarDetallesProducto(productId);
        });
    });
}

// Función para mostrar detalles del producto en modal
function mostrarDetallesProducto(productId) {
    console.log(`🔍 Mostrando detalles producto: ${productId}`);
    
    // Buscar producto
    let producto;
    
    // Buscar en productos filtrados
    producto = productosFiltrados.find(p => 
        p.id === productId || 
        p.id === parseInt(productId) || 
        p.id === `prod-${productId}`
    );
    
    // Si no se encuentra, buscar en todos los productos
    if (!producto) {
        producto = todosLosProductos.find(p => 
            p.id === productId || 
            p.id === parseInt(productId) || 
            p.id === `prod-${productId}`
        );
    }
    
    // Si aún no se encuentra, usar datos del DOM
    if (!producto) {
        const card = document.querySelector(`[data-id="${productId}"]`);
        if (card) {
            producto = {
                nombre: card.querySelector('.productoNombre')?.textContent || 'Producto',
                precio: card.querySelector('.productoPrecio')?.textContent || '$0.00',
                descripcion: card.querySelector('.productoDescripcion')?.textContent || 'Sin descripción',
                imagen: card.querySelector('img')?.src
            };
        }
    }
    
    // Preparar datos para modal
    const nombre = producto?.nombre || 'Producto';
    const precio = producto?.precio || '$0.00';
    const descripcion = producto?.descripcion || 'Producto de limpieza profesional.';
    const imagen = producto?.imagen || producto?.image || 
                  'https://via.placeholder.com/300x200/cccccc/969696?text=Imagen+no+disponible';
    
    // Actualizar modal
    const modalCuerpo = document.getElementById('modalProductoCuerpo');
    if (modalCuerpo) {
        modalCuerpo.innerHTML = `
            <div class="detalles-producto">
                <div class="detalles-imagen">
                    <img src="${imagen}" alt="${nombre}">
                </div>
                <div class="detalles-info">
                    <h2>${nombre}</h2>
                    <div class="detalles-precio">${precio}</div>
                    <div class="detalles-descripcion">${descripcion}</div>
                    <h3>Características principales:</h3>
                    <ul class="detalles-caracteristicas">
                        <li>Alta calidad y durabilidad</li>
                        <li>Eficiencia comprobada</li>
                        <li>Fórmula concentrada</li>
                        <li>Seguro para el medio ambiente</li>
                        <li>Garantía de satisfacción</li>
                    </ul>
                    <button class="boton-contactar">
                        <i class="fas fa-phone-alt"></i> Contactar para compra
                    </button>
                </div>
            </div>
        `;
    }
    
    // Mostrar modal
    const modal = document.getElementById('modalProducto');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Función para configurar modales
function configurarModales() {
    // Cerrar modales al hacer clic en X
    document.querySelectorAll('.modal-cerrar').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal-overlay').style.display = 'none';
        });
    });
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Inicio de sesión simulado');
            document.getElementById('modalLogin').style.display = 'none';
            document.getElementById('noAuthState').style.display = 'none';
            document.getElementById('authState').style.display = 'flex';
            document.getElementById('userName').textContent = 'Usuario';
        });
    }
    
    // Formulario de registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Registro simulado');
            document.getElementById('modalRegistro').style.display = 'none';
            document.getElementById('noAuthState').style.display = 'none';
            document.getElementById('authState').style.display = 'flex';
            document.getElementById('userName').textContent = 
                document.getElementById('registroNombre').value.split(' ')[0] || 'Usuario';
        });
    }
    
    // Enlaces entre modales
    const linkRegistro = document.getElementById('linkRegistro');
    const linkLogin = document.getElementById('linkLogin');
    
    if (linkRegistro) {
        linkRegistro.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('modalLogin').style.display = 'none';
            document.getElementById('modalRegistro').style.display = 'flex';
        });
    }
    
    if (linkLogin) {
        linkLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('modalRegistro').style.display = 'none';
            document.getElementById('modalLogin').style.display = 'flex';
        });
    }
}

// Funciones auxiliares
function generarProductosEjemplo() {
    return [
        {
            id: 1,
            nombre: "Detergente Líquido Concentrado",
            descripcion: "Detergente líquido concentrado para ropa, elimina manchas difíciles.",
            precio: "$24.99",
            categoria: "Detergentes",
            stock: 50
        },
        {
            id: 2,
            nombre: "Desinfectante Multiusos",
            descripcion: "Elimina el 99.9% de bacterias y virus. Aroma fresco a limón.",
            precio: "$18.50",
            categoria: "Desinfectantes",
            stock: 35
        },
        {
            id: 3,
            nombre: "Jabón Líquido para Manos",
            descripcion: "Jabón antibacterial suave con vitaminas para el cuidado de la piel.",
            precio: "$12.75",
            categoria: "Jabones",
            stock: 80
        },
        {
            id: 4,
            nombre: "Lavandina Concentrada",
            descripcion: "Blanqueador y desinfectante profesional para todo tipo de superficies.",
            precio: "$15.99",
            categoria: "Blanqueadores",
            stock: 45
        }
    ];
}

function getColorHex(index) {
    const colors = ['4CAF50', '2196F3', 'FF9800', '9C27B0', '00BCD4', '8BC34A', 'E91E63', '795548'];
    return colors[index % colors.length];
}

function mostrarError(mensaje) {
    console.error(`❌ ${mensaje}`);
    const grid = document.getElementById('productosGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="no-resultados" style="grid-column: 1 / -1;">
                <p style="color: #f44336;"><i class="fas fa-exclamation-triangle"></i> ${mensaje}</p>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarAplicacion);

// También inicializar cuando la página esté completamente cargada
window.addEventListener('load', function() {
    console.log('✅ Página completamente cargada');
    // Re-configurar eventos por si acaso
    configurarEventosProductos();
});

// Exportar funciones principales si es necesario
window.mostrarProductos = mostrarProductos;
window.cargarProductos = cargarProductos;
window.actualizarContador = actualizarContador;

console.log('📄 script.js cargado correctamente');
