import axios from 'axios';
import { browser } from '$app/environment';
import { toast } from '$lib/stores/toastStore.js';

// Configuración base de Axios
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'https://managerial-teresa-pablo-sarasua-df7cefa1.koyeb.app',
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para requests
api.interceptors.request.use(
	(config) => {
		// Solo acceder a storage en el navegador
		if (browser) {
			// Intentar obtener token de localStorage o sessionStorage
			const token = localStorage.getItem('token') || sessionStorage.getItem('token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		
		// No mostrar toasts informativos para requests
		return config;
	},
	(error) => {
		toast.error(`Error en request: ${error.message}`);
		return Promise.reject(error);
	}
);

// Interceptor para responses
api.interceptors.response.use(
	(response) => {
		// No mostrar toasts informativos para responses exitosas
		return response;
	},
	(error) => {
		const status = error.response?.status || 'Sin conexión';
		
		// Manejo de errores comunes
		if (error.response?.status === 401 && browser) {
			// Token expirado o no válido - limpiar ambos storages
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			sessionStorage.removeItem('token');
			sessionStorage.removeItem('user');
			
			// Redirigir al login solo si no estamos ya en la página de login
			if (window.location.pathname !== '/login') {
				toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
				window.location.href = '/login';
			}
		} else if (error.response?.status >= 500) {
			toast.error(`Error del servidor (${status}). Intenta más tarde.`);
		} else if (error.response?.status === 404) {
			toast.error(`Recurso no encontrado (${status})`);
		} else if (error.response?.status >= 400) {
			toast.error(`Error en la petición (${status}): ${error.message}`);
		} else {
			toast.error(`Error de conexión: ${error.message}`);
		}
		
		return Promise.reject(error);
	}
);

export default api;
