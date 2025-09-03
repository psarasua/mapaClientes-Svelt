import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { authService } from '../services/authService.js';

// Store para autenticación [[memory:7706467]]
export const authStore = writable({
	user: null,
	token: null,
	isAuthenticated: false,
	loading: false,
	error: null
});

// Inicializar store desde localStorage si está en el navegador
if (browser) {
	const token = localStorage.getItem('token');
	const userStr = localStorage.getItem('user');
	
	if (token && userStr) {
		try {
			const user = JSON.parse(userStr);
			authStore.set({
				user,
				token,
				isAuthenticated: true,
				loading: false,
				error: null
			});
		} catch (error) {
			// Si hay error al parsear, limpiar localStorage
			localStorage.removeItem('token');
			localStorage.removeItem('user');
		}
	}
}

// Acciones de autenticación
export const authActions = {
	// Login
	login: async (credentials) => {
		authStore.update(store => ({ ...store, loading: true, error: null }));
		
		try {
			const { token, user } = await authService.login(credentials);
			
			authStore.update(store => ({
				...store,
				user,
				token,
				isAuthenticated: true,
				loading: false,
				error: null
			}));
			
			return { success: true, user };
		} catch (error) {
			authStore.update(store => ({
				...store,
				loading: false,
				error: error.message,
				isAuthenticated: false,
				user: null,
				token: null
			}));
			throw error;
		}
	},

	// Logout
	logout: () => {
		authService.logout();
		authStore.set({
			user: null,
			token: null,
			isAuthenticated: false,
			loading: false,
			error: null
		});
	},

	// Limpiar errores
	clearError: () => {
		authStore.update(store => ({ ...store, error: null }));
	},

	// Verificar autenticación al cargar la app
	checkAuth: async () => {
		if (!browser) return;
		
		const token = localStorage.getItem('token');
		const userStr = localStorage.getItem('user');
		
		if (!token || !userStr) {
			authActions.logout();
			return;
		}
		
		try {
			// Verificar si el token sigue siendo válido
			const isValid = await authService.verifyToken();
			if (!isValid) {
				authActions.logout();
			}
		} catch (error) {
			// Si hay error en verificación, hacer logout silencioso
			authActions.logout();
		}
	},

	// Obtener datos del usuario actual
	getCurrentUser: () => {
		return authService.getCurrentUser();
	},

	// Verificar si está autenticado
	isAuthenticated: () => {
		return authService.isAuthenticated();
	}
};

// Store derivado para verificar autenticación
export const isAuthenticated = writable(false);

// Actualizar store derivado cuando cambie authStore
authStore.subscribe(store => {
	isAuthenticated.set(store.isAuthenticated);
});
