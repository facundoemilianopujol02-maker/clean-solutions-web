const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/facundoemilianopujol02-maker/clean-solutions-data/main/productos.json';
const LOCAL_KEY = 'cleanSolutionsProductos';

async function cargarProductos() {
    // 1. Primero intentar desde GitHub
    try {
        const respuesta = await fetch(`${GITHUB_DATA_URL}?t=${Date.now()}`);
        if (respuesta.ok) {
            const productos = await respuesta.json();
            localStorage.setItem(LOCAL_KEY, JSON.stringify(productos));
            return productos;
        }
    } catch (error) {
        console.warn('No se pudo cargar desde GitHub');
    }
    
    // 2. Si GitHub falla, usar localStorage
    const productosLocal = localStorage.getItem(LOCAL_KEY);
    if (productosLocal) {
        return JSON.parse(productosLocal);
    }
    
    // 3. Si no hay nada, array vacío
    return [];
}