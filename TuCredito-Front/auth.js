const API_URL = 'https://localhost:7224/api/prestamista';

/**
 * Función para iniciar sesión
 * @param {string} usuario 
 * @param {string} contrasenia 
 */
async function login(usuario, contrasenia) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, contrasenia })
        });

        if (!response.ok) {
            const errorData = await response.text(); // Puede ser texto plano o JSON
            throw new Error(errorData || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem('token', data.token);
            // También guardamos el usuario para mostrarlo si es necesario
            localStorage.setItem('usuario', usuario);
            return { success: true, token: data.token };
        } else {
            throw new Error('No se recibió el token de autenticación.');
        }

    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Función para registrarse
 * @param {Object} userData 
 * @param {string} userData.nombre
 * @param {string} userData.apellido
 * @param {string} userData.correo
 * @param {string} userData.usuario
 * @param {string} userData.contrasenia
 */
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `Error ${response.status}: ${response.statusText}`);
        }

        // Si el registro es exitoso, a veces devuelve el usuario creado o solo 200 OK.
        // Asumimos éxito si no hay error.
        return { success: true };

    } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Función para cerrar sesión
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

/**
 * Función auxiliar para obtener headers con autenticación
 */
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}
