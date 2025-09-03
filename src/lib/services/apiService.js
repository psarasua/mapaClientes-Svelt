import api from './api.js';

// Funciones de utilidad para manejar respuestas [[memory:7706467]]
const handleResponse = (response) => {
	return response.data;
};

const handleError = (error) => {
	const message = error.response?.data?.message || error.message || 'Error desconocido';
	throw new Error(message);
};

// Servicios de ejemplo - personaliza según tu API
export const apiService = {
	// Ejemplo: obtener todos los elementos
	getAll: async (endpoint) => {
		try {
			const response = await api.get(`/${endpoint}`);
			return handleResponse(response);
		} catch (error) {
			handleError(error);
		}
	},

	// Ejemplo: obtener un elemento por ID
	getById: async (endpoint, id) => {
		try {
			const response = await api.get(`/${endpoint}/${id}`);
			return handleResponse(response);
		} catch (error) {
			handleError(error);
		}
	},

	// Ejemplo: crear un nuevo elemento
	create: async (endpoint, data) => {
		try {
			const response = await api.post(`/${endpoint}`, data);
			return handleResponse(response);
		} catch (error) {
			handleError(error);
		}
	},

	// Ejemplo: actualizar un elemento
	update: async (endpoint, id, data) => {
		try {
			const response = await api.put(`/${endpoint}/${id}`, data);
			return handleResponse(response);
		} catch (error) {
			handleError(error);
		}
	},

	// Ejemplo: eliminar un elemento
	delete: async (endpoint, id) => {
		try {
			const response = await api.delete(`/${endpoint}/${id}`);
			return handleResponse(response);
		} catch (error) {
			handleError(error);
		}
	},

	// Ejemplo: búsqueda con parámetros
	search: async (endpoint, params = {}) => {
		try {
			const response = await api.get(`/${endpoint}/search`, { params });
			return handleResponse(response);
		} catch (error) {
			handleError(error);
		}
	}
};

// Servicios específicos de ejemplo - personaliza según tu aplicación
export const userService = {
	getUsers: () => apiService.getAll('users'),
	getUserById: (id) => apiService.getById('users', id),
	createUser: (userData) => apiService.create('users', userData),
	updateUser: (id, userData) => apiService.update('users', id, userData),
	deleteUser: (id) => apiService.delete('users', id),
};

export const authService = {
	login: async (credentials) => {
		try {
			const response = await api.post('/auth/login', credentials);
			const { token, user } = handleResponse(response);
			
			// Solo acceder a localStorage en el navegador
			if (typeof window !== 'undefined') {
				localStorage.setItem('token', token);
				localStorage.setItem('user', JSON.stringify(user));
			}
			
			return { token, user };
		} catch (error) {
			handleError(error);
		}
	},

	logout: () => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('token');
			localStorage.removeItem('user');
		}
	},

	getCurrentUser: () => {
		if (typeof window !== 'undefined') {
			const userStr = localStorage.getItem('user');
			return userStr ? JSON.parse(userStr) : null;
		}
		return null;
	},

	isAuthenticated: () => {
		if (typeof window !== 'undefined') {
			return !!localStorage.getItem('token');
		}
		return false;
	}
};

export default apiService;
