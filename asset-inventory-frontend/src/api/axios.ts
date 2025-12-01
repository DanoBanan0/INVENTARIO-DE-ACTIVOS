import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// 1. INTERCEPTOR DE REQUEST (Ya lo tenías, inyecta el token)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. INTERCEPTOR DE RESPONSE (NUEVO - Aquí estaba el problema)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el error es 401 (Token Vencido o Falso) -> SÍ cerramos sesión
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Si el error es 403 (Permisos) -> NO cerramos sesión, solo devolvemos el error
        // para que el componente muestre una alerta o mensaje.
        if (error.response && error.response.status === 403) {
            console.warn("Acceso denegado por permisos (403). No se cerrará la sesión.");
        }

        return Promise.reject(error);
    }
);

export default api;