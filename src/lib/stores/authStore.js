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

// Inicializar store desde storage si está en el navegador
if (browser) {
	// Intentar obtener token y usuario de localStorage o sessionStorage
	const token = localStorage.getItem('token') || sessionStorage.getItem('token');
	const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
	
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
			// Si hay error al parsear, limpiar ambos storages
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			sessionStorage.removeItem('token');
			sessionStorage.removeItem('user');
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

	// Logout - limpia completamente la sesión
	logout: () => {
		// Limpiar storage usando el servicio
		authService.logout();
		
		// Limpiar el store
		authStore.set({
			user: null,
			token: null,
			isAuthenticated: false,
			loading: false,
			error: null
		});
		
		// Redirigir al login si no estamos ya ahí
		if (browser && window.location.pathname !== '/login') {
			window.location.href = '/login';
		}
	},

	// Logout silencioso (sin redirección ni toast)
	logoutSilent: () => {
		if (browser) {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			sessionStorage.removeItem('token');
			sessionStorage.removeItem('user');
		}
		
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
		
		// Intentar obtener token y usuario de ambos storages
		const token = localStorage.getItem('token') || sessionStorage.getItem('token');
		const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
		
		if (!token || !userStr) {
			authActions.logoutSilent();
			return;
		}
		
		try {
			// Verificar si el token sigue siendo válido
			const isValid = await authService.verifyToken();
			if (!isValid) {
				authActions.logoutSilent();
			}
		} catch (error) {
			// Si hay error en verificación, hacer logout silencioso
			console.warn('Error verificando token:', error.message);
			authActions.logoutSilent();
		}
	},

	// Verificar autenticación sin hacer petición al servidor
	checkAuthLocal: () => {
		if (!browser) return false;
		
		const token = localStorage.getItem('token') || sessionStorage.getItem('token');
		const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
		
		if (!token || !userStr) {
			authActions.logoutSilent();
			return false;
		}
		
		try {
			const user = JSON.parse(userStr);
			authStore.update(store => ({
				...store,
				user,
				token,
				isAuthenticated: true,
				loading: false,
				error: null
			}));
			return true;
		} catch (error) {
			authActions.logoutSilent();
			return false;
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
