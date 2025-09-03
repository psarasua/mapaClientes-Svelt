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
		// Solo acceder a localStorage en el navegador
		if (browser) {
			const token = localStorage.getItem('token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		
		toast.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
		toast.success(`API Response: ${response.status} ${response.statusText}`);
		return response;
	},
	(error) => {
		const status = error.response?.status || 'Sin conexión';
		toast.error(`Error en response: ${status} - ${error.message}`);
		
		// Manejo de errores comunes
		if (error.response?.status === 401 && browser) {
			// Token expirado o no válido
			localStorage.removeItem('token');
			window.location.href = '/login';
		}
		
		return Promise.reject(error);
	}
);

export default api;
