import api from './api.js';
import { toast } from '$lib/stores/toastStore.js';
import { browser } from '$app/environment';

// Servicio de autenticación
export const authService = {
	// Login usando endpoint específico /api/usuarios/login
	login: async (credentials) => {
		try {
			// Intentar login con el endpoint específico /api/usuarios/login
			const response = await api.post('/api/usuarios/login', {
				username: credentials.username || credentials.email,
				password: credentials.password
			});
			
			// Extraer token y datos del usuario de la respuesta
			// La respuesta tiene la estructura: { success: true, message: "...", data: { usuario: {...}, token: "..." } }
			const { data } = response.data;
			
			if (!data || !data.token) {
				throw new Error('No se recibió token de autenticación');
			}
			
			const token = data.token;
			const usuario = data.usuario;
			
			// Mapear la estructura del usuario para consistencia
			const user = {
				id: usuario.id,
				username: usuario.username,
				email: usuario.email || `${usuario.username}@empresa.com`,
				name: usuario.name || usuario.username.charAt(0).toUpperCase() + usuario.username.slice(1)
			};
			
			// Guardar token y usuario usando el método centralizado
			authService.saveToken(token, user, true); // true = localStorage (persistente)
			
			toast.success(`¡Bienvenido, ${user.name}!`);
			return { token, user };
			
		} catch (error) {
			// Manejo específico de errores de autenticación
			let errorMessage = 'Error de autenticación';
			
			if (error.response?.status === 401) {
				errorMessage = 'Credenciales inválidas';
			} else if (error.response?.status === 404) {
				errorMessage = 'Endpoint de login no encontrado';
			} else if (error.response?.status >= 500) {
				errorMessage = 'Error del servidor. Intenta más tarde';
			} else if (error.message) {
				errorMessage = error.message;
			}
			
			toast.error(errorMessage);
			throw new Error(errorMessage);
		}
	},

	// Logout - limpia token y datos del usuario
	logout: () => {
		if (browser) {
			// Limpiar tanto localStorage como sessionStorage por seguridad
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			sessionStorage.removeItem('token');
			sessionStorage.removeItem('user');
		}
		toast.info('Sesión cerrada exitosamente');
	},

	// Obtener usuario actual
	getCurrentUser: () => {
		if (browser) {
			// Intentar primero localStorage, luego sessionStorage
			let userStr = localStorage.getItem('user');
			if (!userStr) {
				userStr = sessionStorage.getItem('user');
			}
			return userStr ? JSON.parse(userStr) : null;
		}
		return null;
	},

	// Verificar si está autenticado
	isAuthenticated: () => {
		if (browser) {
			// Verificar en localStorage y sessionStorage
			return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
		}
		return false;
	},

	// Obtener token
	getToken: () => {
		if (browser) {
			// Intentar primero localStorage, luego sessionStorage
			return localStorage.getItem('token') || sessionStorage.getItem('token');
		}
		return null;
	},

	// Guardar token con opción de persistencia
	saveToken: (token, user, persistent = true) => {
		if (browser) {
			const storage = persistent ? localStorage : sessionStorage;
			storage.setItem('token', token);
			storage.setItem('user', JSON.stringify(user));
		}
	},

	// Verificar token válido - usando endpoint de usuarios como verificación
	verifyToken: async () => {
		try {
			// Usar el endpoint de usuarios para verificar si el token es válido
			const response = await api.get('/api/usuarios');
			return response.data ? true : false;
		} catch (error) {
			// Si falla la verificación (401, 403, etc.), el token no es válido
			if (error.response?.status === 401 || error.response?.status === 403) {
				// Token expirado o no válido - limpiar datos
				if (browser) {
					localStorage.removeItem('token');
					localStorage.removeItem('user');
					sessionStorage.removeItem('token');
					sessionStorage.removeItem('user');
				}
				return false;
			}
			// Para otros errores (red, servidor), asumir que el token es válido
			return true;
		}
	},

	// Obtener todos los usuarios (para verificación manual)
	getUsuarios: async () => {
		try {
			const response = await api.get('/api/usuarios');
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener usuarios: ${error.message}`);
			throw error;
		}
	}
};

export default authService;
